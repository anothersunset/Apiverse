"""Video Provider - Kling / Veo / Runway 适配"""

import os

class VideoProvider:
    def __init__(self):
        self.provider = os.getenv("VIDEO_PROVIDER", "kling")
        self.kling_key = os.getenv("KLING_API_KEY", "")
        self.veo_key = os.getenv("VEO_API_KEY", "")
        self.runway_key = os.getenv("RUNWAY_API_KEY", "")

    def generate_clip(self, video_prompt: str, duration: int = 6) -> str:
        raise NotImplementedError("接入视频生成 API 后实现")
