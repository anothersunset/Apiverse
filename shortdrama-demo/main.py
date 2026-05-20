import asyncio
import json
import os
import textwrap
from pathlib import Path

import edge_tts
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from moviepy.editor import AudioFileClip, ImageClip, concatenate_videoclips

BASE_DIR = Path(__file__).parent
ASSET_DIR = BASE_DIR / "assets"
FRAME_DIR = ASSET_DIR / "frames"
AUDIO_DIR = ASSET_DIR / "audio"
OUTPUT_DIR = BASE_DIR / "output"

VIDEO_W = 1080
VIDEO_H = 1920
FPS = 24

FONT_CANDIDATES = [
    "C:/Windows/Fonts/msyh.ttc",
    "C:/Windows/Fonts/simhei.ttf",
    "C:/Windows/Fonts/simsun.ttc",
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Light.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
]

def ensure_dirs():
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def load_font(size: int):
    for font_path in FONT_CANDIDATES:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size=size)
            except Exception:
                continue
    return ImageFont.load_default()

def wrap_text(text: str, width: int = 18):
    lines = []
    for paragraph in text.split("\n"):
        lines.extend(textwrap.wrap(paragraph, width=width))
    return lines

def gradient_background(seed: int):
    np.random.seed(seed)
    color_a = np.array([20 + seed * 17 % 80, 30 + seed * 23 % 70, 80 + seed * 13 % 100])
    color_b = np.array([90 + seed * 11 % 100, 40 + seed * 7 % 70, 120 + seed * 19 % 90])
    y = np.linspace(0, 1, VIDEO_H)[:, None]
    gradient = (color_a * (1 - y) + color_b * y).astype(np.uint8)
    img = np.tile(gradient[:, None, :], (1, VIDEO_W, 1))
    return Image.fromarray(img, "RGB")

def draw_character(draw: ImageDraw.ImageDraw, character_name: str, x: int, y: int, color):
    draw.ellipse((x - 130, y - 130, x + 130, y + 130), fill=color, outline=(255, 255, 255), width=6)
    draw.ellipse((x - 45, y - 30, x - 20, y - 5), fill=(30, 30, 30))
    draw.ellipse((x + 20, y - 30, x + 45, y - 5), fill=(30, 30, 30))
    draw.arc((x - 55, y - 5, x + 55, y + 70), 0, 180, fill=(30, 30, 30), width=5)
    font = load_font(42)
    draw.text((x, y + 160), character_name, font=font, fill=(255, 255, 255), anchor="mm")

def create_frame(story_title: str, shot: dict, idx: int, total: int) -> Path:
    img = gradient_background(idx + 3).filter(ImageFilter.GaussianBlur(radius=0.3))
    draw = ImageDraw.Draw(img, "RGBA")

    title_font = load_font(58)
    scene_font = load_font(46)
    body_font = load_font(44)
    subtitle_font = load_font(54)
    small_font = load_font(32)

    # 顶部标题栏
    draw.rounded_rectangle((60, 70, VIDEO_W - 60, 210), radius=30, fill=(0, 0, 0, 110))
    draw.text((90, 100), story_title, font=title_font, fill=(255, 255, 255))
    draw.text((VIDEO_W - 90, 122), f"{idx + 1}/{total}", font=small_font, fill=(230, 230, 230), anchor="ra")

    # 场景信息
    draw.rounded_rectangle((70, 260, VIDEO_W - 70, 470), radius=28, fill=(255, 255, 255, 45))
    draw.text((100, 295), f"场景：{shot['scene']}", font=scene_font, fill=(255, 255, 255))
    draw.text((100, 365), f"镜头：{shot['camera']}", font=small_font, fill=(235, 235, 235))
    draw.text((100, 410), f"动作：{shot['action']}", font=small_font, fill=(235, 235, 235))

    # 角色视觉占位
    char_color = (255, 185 - idx * 15 % 90, 120 + idx * 20 % 90, 255)
    draw_character(draw, shot["character"], VIDEO_W // 2, 850, char_color)

    # 动作描述卡片
    draw.rounded_rectangle((80, 1120, VIDEO_W - 80, 1380), radius=36, fill=(0, 0, 0, 95))
    action_lines = wrap_text(shot["action"], width=19)
    y = 1160
    for line in action_lines[:4]:
        draw.text((120, y), line, font=body_font, fill=(255, 255, 255))
        y += 58

    # 字幕区
    draw.rounded_rectangle((60, 1500, VIDEO_W - 60, 1800), radius=36, fill=(0, 0, 0, 150))
    subtitle_lines = wrap_text(shot["dialogue"], width=14)
    y = 1560
    for line in subtitle_lines[:3]:
        draw.text((VIDEO_W // 2, y), line, font=subtitle_font, fill=(255, 245, 180), anchor="ma")
        y += 70

    # 底部水印
    draw.text((VIDEO_W // 2, 1860), "AI Short Drama Demo · Auto Generated", font=small_font, fill=(230, 230, 230), anchor="mm")

    frame_path = FRAME_DIR / f"{shot['id']}.png"
    img.save(frame_path)
    return frame_path

def create_silent_audio(output_path: Path, duration: float = 3.0):
    """离线降级：当 edge-tts 不可用时，生成静默音频占位"""
    import numpy as np
    from moviepy.audio.AudioClip import AudioArrayClip
    sample_rate = 44100
    samples = int(sample_rate * duration)
    silent = np.zeros((1, samples), dtype=np.float64)
    clip = AudioArrayClip(silent.T, fps=sample_rate)
    clip.write_audiofile(str(output_path), logger=None)

async def create_voice(text: str, voice: str, output_path: Path):
    try:
        communicate = edge_tts.Communicate(text=text, voice=voice, rate="+0%", volume="+0%")
        await communicate.save(str(output_path))
    except Exception as e:
        print(f"  [离线模式] edge-tts 不可用，使用静默音频: {output_path.name} ({e})")
        create_silent_audio(output_path, duration=3.0)

async def create_all_voices(story: dict):
    character_voice = {c["name"]: c.get("voice", "zh-CN-XiaoxiaoNeural") for c in story["characters"]}
    tasks = []
    for shot in story["shots"]:
        speaker = shot["character"].split("与")[0]
        voice = character_voice.get(speaker, "zh-CN-XiaoxiaoNeural")
        audio_path = AUDIO_DIR / f"{shot['id']}.mp3"
        tasks.append(create_voice(shot["dialogue"], voice, audio_path))
    await asyncio.gather(*tasks)

def build_video(story: dict):
    clips = []
    total = len(story["shots"])

    for idx, shot in enumerate(story["shots"]):
        frame_path = create_frame(story["title"], shot, idx, total)
        audio_path = AUDIO_DIR / f"{shot['id']}.mp3"

        audio = AudioFileClip(str(audio_path))
        duration = max(float(shot.get("duration", 6)), audio.duration + 0.4)

        clip = (
            ImageClip(str(frame_path))
            .set_duration(duration)
            .set_audio(audio)
            .set_position("center")
        )
        clips.append(clip)

    final = concatenate_videoclips(clips, method="compose")
    output_path = OUTPUT_DIR / "final_short_drama.mp4"
    final.write_videofile(
        str(output_path),
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        preset="medium",
        threads=4,
    )
    return output_path

def main():
    ensure_dirs()

    with open(BASE_DIR / "story.json", "r", encoding="utf-8") as f:
        story = json.load(f)

    print("[1/3] 生成角色配音...")
    asyncio.run(create_all_voices(story))

    print("[2/3] 生成镜头画面并合成视频...")
    output_path = build_video(story)

    print("[3/3] 完成：", output_path)

if __name__ == "__main__":
    main()
