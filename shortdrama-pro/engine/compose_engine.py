"""合成引擎 - 拼接视频、对齐配音、叠加字幕和BGM"""

class ComposeEngine:
    def __init__(self, mode="local"):
        self.mode = mode

    def compose(self, story: dict, shots: list, subtitles: dict):
        return "output/final_short_drama.mp4"
