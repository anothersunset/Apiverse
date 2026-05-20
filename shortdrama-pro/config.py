"""环境变量与模型配置"""
import os
from dotenv import load_dotenv

load_dotenv()

RUN_MODE = os.getenv("RUN_MODE", "local")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")
IMAGE_PROVIDER = os.getenv("IMAGE_PROVIDER", "comfyui")
VIDEO_PROVIDER = os.getenv("VIDEO_PROVIDER", "kling")
VOICE_PROVIDER = os.getenv("VOICE_PROVIDER", "elevenlabs")

VIDEO_WIDTH = int(os.getenv("VIDEO_WIDTH", "1080"))
VIDEO_HEIGHT = int(os.getenv("VIDEO_HEIGHT", "1920"))
FPS = int(os.getenv("FPS", "24"))
DEFAULT_SHOT_SECONDS = int(os.getenv("DEFAULT_SHOT_SECONDS", "6"))
