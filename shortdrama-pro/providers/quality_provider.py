"""Quality Provider - 质检适配"""

class QualityProvider:
    def __init__(self):
        pass

    def inspect_shot(self, shot: dict) -> dict:
        return {"pass": True, "issues": []}

    def inspect_video(self, video_path: str) -> dict:
        return {"pass": True, "retry_shots": []}
