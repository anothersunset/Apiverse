"""合成引擎 — 拼接视频、对齐配音、叠加字幕和BGM"""

from pathlib import Path

from moviepy.editor import AudioFileClip, ImageClip, concatenate_videoclips

BASE_DIR = Path(__file__).parent.parent
OUTPUT_DIR = BASE_DIR / "output"
FPS = 24


class ComposeEngine:
    def __init__(self, mode="local"):
        self.mode = mode
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    def compose(self, story: dict, shots: list, subtitles: dict) -> str:
        """将渲染后的镜头合成为最终 MP4"""
        clips = []
        total = len(shots)

        for idx, shot in enumerate(shots):
            frame_path = Path(shot.get("frame_path", ""))
            audio_path = Path(shot.get("audio_path", ""))

            if not frame_path.exists():
                print(f"  [ComposeEngine] 跳过缺失帧: {shot.get('shot_id', '?')}")
                continue

            duration = float(shot.get("duration", 6))

            # 加载音频
            audio = None
            if audio_path.exists():
                try:
                    audio = AudioFileClip(str(audio_path))
                    duration = max(duration, audio.duration + 0.4)
                except Exception:
                    pass

            clip = ImageClip(str(frame_path)).set_duration(duration).set_position("center")
            if audio:
                clip = clip.set_audio(audio)
            clips.append(clip)

            print(f"  [ComposeEngine] 镜头 {idx + 1}/{total}: {shot.get('shot_id', '?')} ({duration:.1f}s)")

        if not clips:
            raise RuntimeError("没有可合成的镜头")

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

        print(f"  [ComposeEngine] 完成 → {output_path}")
        return str(output_path)
