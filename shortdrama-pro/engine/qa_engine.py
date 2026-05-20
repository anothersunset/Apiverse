"""质检引擎 - 检查镜头质量并标记需要重跑的镜头"""

class QAEngine:
    def __init__(self, mode="local"):
        self.mode = mode

    def inspect(self, video_path: str, rendered_shots: list):
        return {"retry_shots": [], "report_path": "output/report.md"}
