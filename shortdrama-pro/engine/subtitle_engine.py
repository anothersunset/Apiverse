"""字幕引擎 — 生成和对齐字幕"""

from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "output"


class SubtitleEngine:
    def __init__(self, mode="local"):
        self.mode = mode

    def generate(self, rendered_shots: list) -> dict:
        """生成 SRT 字幕，从 shot 的对白中提取"""
        subtitles = []
        srt_lines = []
        seq = 1
        time_offset = 0.0

        for shot in rendered_shots:
            dialogue = ""
            if isinstance(shot, dict):
                dialogue = shot.get("dialogue", "")
                duration = float(shot.get("duration", 6))
            else:
                duration = 6.0

            if dialogue:
                start = time_offset
                end = time_offset + duration
                subtitles.append({
                    "seq": seq, "start": start, "end": end,
                    "text": dialogue, "shot_id": shot.get("shot_id", ""),
                })
                srt_lines.append(f"{seq}")
                srt_lines.append(f"{self._fmt_time(start)} --> {self._fmt_time(end)}")
                srt_lines.append(dialogue)
                srt_lines.append("")
                seq += 1

            time_offset += duration

        srt_path = OUTPUT_DIR / "final_short_drama.srt"
        srt_path.parent.mkdir(parents=True, exist_ok=True)
        srt_path.write_text("\n".join(srt_lines), encoding="utf-8")
        print(f"  [SubtitleEngine] {seq - 1} 条字幕 → {srt_path}")

        return {"subtitles": subtitles, "srt_path": str(srt_path)}

    @staticmethod
    def _fmt_time(seconds: float) -> str:
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        ms = int((seconds % 1) * 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
