"""故事引擎 - 根据创意生成故事大纲、角色和分镜"""
import json
from pathlib import Path

class StoryEngine:
    def __init__(self, mode="local"):
        self.mode = mode

    def generate(self, idea: str, target_duration: int = 60):
        if self.mode == "local":
            return self._generate_local(idea, target_duration)
        elif self.mode in ("hybrid", "production"):
            return self._generate_with_llm(idea, target_duration)

    def _generate_local(self, idea: str, target_duration: int):
        return {
            "title": idea[:20],
            "genre": "短剧",
            "theme": idea,
            "logline": idea,
            "episodes": 1,
            "target_duration_seconds": target_duration,
        }

    def _generate_with_llm(self, idea: str, target_duration: int):
        # TODO: 接入 GPT / DeepSeek / Claude API 生成 story.json
        return self._generate_local(idea, target_duration)
