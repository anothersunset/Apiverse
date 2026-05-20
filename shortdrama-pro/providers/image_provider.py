"""Image Provider — Midjourney / ComfyUI / PIL 本地适配"""

import os
import json
from pathlib import Path


class ImageProvider:
    def __init__(self):
        self.provider = os.getenv("IMAGE_PROVIDER", "local")
        self.comfyui_url = os.getenv("COMFYUI_BASE_URL", "http://127.0.0.1:8188")
        self.mj_key = os.getenv("MIDJOURNEY_API_KEY", "")

    def generate_character(self, visual_prompt: str, negative_prompt: str = "") -> str:
        """生成角色参考图"""
        if self.provider == "comfyui":
            return self._comfyui_generate(visual_prompt, negative_prompt)
        elif self.provider == "midjourney":
            return self._midjourney_generate(visual_prompt)
        else:
            return self._local_generate(visual_prompt)

    def generate_frame(self, image_prompt: str) -> str:
        """生成镜头首帧图"""
        return self.generate_character(image_prompt)

    def _local_generate(self, prompt: str) -> str:
        """本地占位模式：返回空字符串让 render engine 走 PIL 绘制"""
        return ""

    def _comfyui_generate(self, prompt: str, negative_prompt: str = "") -> str:
        """调用 ComfyUI API 生成图像"""
        import requests
        workflow = {
            "3": {"class_type": "KSampler", "inputs": {"seed": 42, "steps": 20, "cfg": 7,
                   "sampler_name": "euler", "scheduler": "normal", "denoise": 1,
                   "model": ["4", 0], "positive": ["6", 0], "negative": ["7", 0],
                   "latent_image": ["5", 0]}},
            "4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "sd_xl_base_1.0.safetensors"}},
            "5": {"class_type": "EmptyLatentImage", "inputs": {"width": 1080, "height": 1920, "batch_size": 1}},
            "6": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["4", 1]}},
            "7": {"class_type": "CLIPTextEncode", "inputs": {"text": negative_prompt or "low quality, blurry", "clip": ["4", 1]}},
            "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]}},
            "9": {"class_type": "SaveImage", "inputs": {"filename_prefix": "shortdrama", "images": ["8", 0]}},
        }
        try:
            resp = requests.post(f"{self.comfyui_url}/prompt", json={"prompt": workflow}, timeout=60)
            if resp.status_code == 200:
                return f"comfyui://{resp.json().get('prompt_id', '')}"
        except Exception as e:
            print(f"  [ImageProvider] ComfyUI 调用失败: {e}")
        return ""

    def _midjourney_generate(self, prompt: str) -> str:
        """调用 Midjourney API"""
        import requests
        try:
            resp = requests.post("https://api.midjourney.com/v1/imagine",
                                 headers={"Authorization": f"Bearer {self.mj_key}"},
                                 json={"prompt": prompt}, timeout=120)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("image_url", "")
        except Exception as e:
            print(f"  [ImageProvider] Midjourney 调用失败: {e}")
        return ""
