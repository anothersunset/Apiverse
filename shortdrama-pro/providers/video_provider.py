"""Video Provider — Kling / Veo / Runway / 本地静态帧适配"""

import os
from pathlib import Path


class VideoProvider:
    def __init__(self):
        self.provider = os.getenv("VIDEO_PROVIDER", "local")
        self.kling_key = os.getenv("KLING_API_KEY", "")
        self.veo_key = os.getenv("VEO_API_KEY", "")
        self.runway_key = os.getenv("RUNWAY_API_KEY", "")

    def generate_clip(self, video_prompt: str, duration: int = 6) -> str:
        """生成视频片段，返回路径或空"""
        if self.provider == "kling":
            return self._kling_generate(video_prompt, duration)
        elif self.provider == "veo":
            return self._veo_generate(video_prompt, duration)
        elif self.provider == "runway":
            return self._runway_generate(video_prompt, duration)
        else:
            # local 模式：返回空，render engine 使用静态帧
            return ""

    def _kling_generate(self, prompt: str, duration: int) -> str:
        """Kling AI 视频生成"""
        import requests
        import time
        try:
            # 创建任务
            resp = requests.post(
                "https://api.klingai.com/v1/videos/text2video",
                headers={"Authorization": f"Bearer {self.kling_key}", "Content-Type": "application/json"},
                json={"model": "kling-v1", "prompt": prompt, "duration": str(duration),
                      "mode": "std", "cfg_scale": 0.5},
                timeout=30,
            )
            if resp.status_code != 200:
                print(f"  [VideoProvider] Kling 创建失败: {resp.text}")
                return ""

            task_id = resp.json().get("data", {}).get("task_id", "")

            # 轮询结果
            for _ in range(30):
                time.sleep(2)
                poll = requests.get(
                    f"https://api.klingai.com/v1/videos/text2video/{task_id}",
                    headers={"Authorization": f"Bearer {self.kling_key}"},
                )
                if poll.status_code == 200:
                    data = poll.json().get("data", {})
                    if data.get("task_status") == "succeed":
                        return data.get("task_result", {}).get("videos", [{}])[0].get("url", "")
        except Exception as e:
            print(f"  [VideoProvider] Kling 调用失败: {e}")
        return ""

    def _veo_generate(self, prompt: str, duration: int) -> str:
        """Google Veo 视频生成 (placeholder)"""
        print(f"  [VideoProvider] Veo 尚未接入 API")
        return ""

    def _runway_generate(self, prompt: str, duration: int) -> str:
        """Runway Gen-3 视频生成"""
        import requests
        try:
            resp = requests.post(
                "https://api.runwayml.com/v1/generate",
                headers={"Authorization": f"Bearer {self.runway_key}", "Content-Type": "application/json"},
                json={"prompt": prompt, "seconds": duration, "model": "gen3"},
                timeout=60,
            )
            if resp.status_code == 200:
                return resp.json().get("output", {}).get("video_url", "")
        except Exception as e:
            print(f"  [VideoProvider] Runway 调用失败: {e}")
        return ""
