"""Image Provider - Midjourney / ComfyUI 适配"""

import os

class ImageProvider:
    def __init__(self):
        self.provider = os.getenv("IMAGE_PROVIDER", "comfyui")
        self.comfyui_url = os.getenv("COMFYUI_BASE_URL", "http://127.0.0.1:8188")
        self.mj_key = os.getenv("MIDJOURNEY_API_KEY", "")

    def generate_character(self, visual_prompt: str, negative_prompt: str) -> str:
        raise NotImplementedError("接入图像生成 API 后实现")

    def generate_frame(self, image_prompt: str) -> str:
        raise NotImplementedError("接入图像生成 API 后实现")
