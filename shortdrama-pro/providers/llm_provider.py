"""LLM Provider - GPT / Claude / DeepSeek 适配"""

import os

class LLMProvider:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "openai")
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.deepseek_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")

    def generate_story(self, idea: str) -> dict:
        raise NotImplementedError("接入具体 LLM API 后实现")

    def generate_characters(self, story: dict) -> list:
        raise NotImplementedError("接入具体 LLM API 后实现")

    def generate_shots(self, story: dict, characters: list) -> list:
        raise NotImplementedError("接入具体 LLM API 后实现")
