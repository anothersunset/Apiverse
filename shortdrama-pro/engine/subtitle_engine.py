"""字幕引擎 - 生成和对齐字幕"""

class SubtitleEngine:
    def __init__(self, mode="local"):
        self.mode = mode

    def generate(self, rendered_shots: list):
        return {"subtitles": [], "srt_path": ""}
