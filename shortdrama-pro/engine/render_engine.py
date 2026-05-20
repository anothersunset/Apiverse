"""渲染引擎 — 渲染每个镜头的画面、配音"""

import asyncio
import os
import textwrap
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = Path(__file__).parent.parent
ASSET_DIR = BASE_DIR / "assets"
FRAME_DIR = ASSET_DIR / "frames"
AUDIO_DIR = ASSET_DIR / "voices"
VIDEO_W = 1080
VIDEO_H = 1920

FONT_CANDIDATES = [
    "C:/Windows/Fonts/msyh.ttc",
    "C:/Windows/Fonts/simhei.ttf",
    "C:/Windows/Fonts/simsun.ttc",
    "/System/Library/Fonts/PingFang.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
]


class RenderEngine:
    def __init__(self, mode="local"):
        self.mode = mode
        FRAME_DIR.mkdir(parents=True, exist_ok=True)
        AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    def _load_font(self, size: int):
        for font_path in FONT_CANDIDATES:
            if os.path.exists(font_path):
                try:
                    return ImageFont.truetype(font_path, size=size)
                except Exception:
                    continue
        return ImageFont.load_default()

    def _wrap_text(self, text: str, width: int = 18):
        lines = []
        for paragraph in text.split("\n"):
            lines.extend(textwrap.wrap(paragraph, width=width))
        return lines

    def _gradient_background(self, seed: int):
        np.random.seed(seed)
        color_a = np.array([20 + seed * 17 % 80, 30 + seed * 23 % 70, 80 + seed * 13 % 100])
        color_b = np.array([90 + seed * 11 % 100, 40 + seed * 7 % 70, 120 + seed * 19 % 90])
        y = np.linspace(0, 1, VIDEO_H)[:, None]
        gradient = (color_a * (1 - y) + color_b * y).astype(np.uint8)
        img = np.tile(gradient[:, None, :], (1, VIDEO_W, 1))
        return Image.fromarray(img, "RGB")

    def _draw_character(self, draw, name: str, x: int, y: int, color):
        draw.ellipse((x - 130, y - 130, x + 130, y + 130), fill=color, outline=(255, 255, 255), width=6)
        draw.ellipse((x - 45, y - 30, x - 20, y - 5), fill=(30, 30, 30))
        draw.ellipse((x + 20, y - 30, x + 45, y - 5), fill=(30, 30, 30))
        draw.arc((x - 55, y - 5, x + 55, y + 70), 0, 180, fill=(30, 30, 30), width=5)
        font = self._load_font(42)
        draw.text((x, y + 160), name, font=font, fill=(255, 255, 255), anchor="mm")

    def _create_frame(self, story_title: str, shot: dict, idx: int, total: int) -> Path:
        img = self._gradient_background(idx + 3).filter(ImageFilter.GaussianBlur(radius=0.3))
        draw = ImageDraw.Draw(img, "RGBA")

        title_font = self._load_font(58)
        scene_font = self._load_font(46)
        body_font = self._load_font(44)
        subtitle_font = self._load_font(54)
        small_font = self._load_font(32)

        # 顶部标题栏
        draw.rounded_rectangle((60, 70, VIDEO_W - 60, 210), radius=30, fill=(0, 0, 0, 110))
        draw.text((90, 100), story_title, font=title_font, fill=(255, 255, 255))
        draw.text((VIDEO_W - 90, 122), f"{idx + 1}/{total}", font=small_font, fill=(230, 230, 230), anchor="ra")

        # 场景信息
        draw.rounded_rectangle((70, 260, VIDEO_W - 70, 470), radius=28, fill=(255, 255, 255, 45))
        draw.text((100, 295), f"场景：{shot.get('scene', '')}", font=scene_font, fill=(255, 255, 255))
        draw.text((100, 365), f"镜头：{shot.get('camera', '')}", font=small_font, fill=(235, 235, 235))
        draw.text((100, 410), f"动作：{shot.get('action', '')}", font=small_font, fill=(235, 235, 235))

        # 角色视觉占位
        char_color = (255, 185 - idx * 15 % 90, 120 + idx * 20 % 90, 255)
        self._draw_character(draw, shot.get("character", ""), VIDEO_W // 2, 850, char_color)

        # 动作描述卡片
        draw.rounded_rectangle((80, 1120, VIDEO_W - 80, 1380), radius=36, fill=(0, 0, 0, 95))
        action_lines = self._wrap_text(shot.get("action", ""), width=19)
        y = 1160
        for line in action_lines[:4]:
            draw.text((120, y), line, font=body_font, fill=(255, 255, 255))
            y += 58

        # 字幕区
        draw.rounded_rectangle((60, 1500, VIDEO_W - 60, 1800), radius=36, fill=(0, 0, 0, 150))
        subtitle_lines = self._wrap_text(shot.get("dialogue", ""), width=14)
        y = 1560
        for line in subtitle_lines[:3]:
            draw.text((VIDEO_W // 2, y), line, font=subtitle_font, fill=(255, 245, 180), anchor="ma")
            y += 70

        # 底部水印
        draw.text((VIDEO_W // 2, 1860), "AI Short Drama Pro · Auto Generated",
                  font=small_font, fill=(230, 230, 230), anchor="mm")

        frame_path = FRAME_DIR / f"{shot['shot_id']}.png"
        img.save(frame_path)
        return frame_path

    def render_shot(self, story: dict, characters: list, shot: dict, force: bool = False) -> dict:
        shot_id = shot["shot_id"]

        # 1. 生成首帧图
        frame_path = FRAME_DIR / f"{shot_id}.png"
        if force or not frame_path.exists():
            if self.mode == "production":
                frame_path = self._render_frame_with_provider(story, shot)
            else:
                frame_path = self._create_frame(story.get("title", ""), shot,
                                                int(shot_id[1:]) - 1, 5)

        # 2. 生成配音
        audio_path = AUDIO_DIR / f"{shot_id}.mp3"
        if force or not audio_path.exists():
            self._render_voice(shot, audio_path)

        # 3. 视频片段（production 模式走 Kling/Veo；local 用静态帧）
        video_path = str(frame_path)
        if self.mode == "production":
            video_path = self._render_video_with_provider(shot)

        shot["status"] = "rendered"
        return {
            "shot_id": shot_id,
            "frame_path": str(frame_path),
            "audio_path": str(audio_path),
            "video_path": str(video_path),
            "status": "rendered",
        }

    def _render_voice(self, shot: dict, output_path: Path):
        from providers.voice_provider import VoiceProvider
        voice = VoiceProvider()
        dialogue = shot.get("dialogue", "")
        voice_id = "zh-CN-XiaoxiaoNeural"
        try:
            asyncio.run(voice.generate_voice(dialogue, voice_id, str(output_path)))
        except Exception as e:
            print(f"  [离线模式] TTS 不可用: {e}")
            self._create_silent_audio(output_path, 3.0)

    def _create_silent_audio(self, output_path: Path, duration: float = 3.0):
        from moviepy.audio.AudioClip import AudioArrayClip
        sample_rate = 44100
        samples = int(sample_rate * duration)
        silent = np.zeros((1, samples), dtype=np.float64)
        clip = AudioArrayClip(silent.T, fps=sample_rate)
        clip.write_audiofile(str(output_path), logger=None)

    def _render_frame_with_provider(self, story: dict, shot: dict) -> Path:
        from providers.image_provider import ImageProvider
        img = ImageProvider()
        prompt = shot.get("image_prompt", f"cinematic scene, {shot.get('scene', 'drama')}")
        result = img.generate_frame(prompt)
        if result and Path(result).exists():
            return Path(result)
        return self._create_frame(story.get("title", ""), shot, 0, 1)

    def _render_video_with_provider(self, shot: dict) -> str:
        from providers.video_provider import VideoProvider
        video = VideoProvider()
        prompt = shot.get("video_prompt", "cinematic")
        duration = shot.get("duration", 6)
        return video.generate_clip(prompt, duration)
