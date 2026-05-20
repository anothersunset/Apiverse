"""LLM Provider — OpenAI / DeepSeek / Claude 统一适配"""

import json
import os
import re


class LLMProvider:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "openai")
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.api_base = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
        self.model = os.getenv("LLM_MODEL", "gpt-4.1-mini")
        self.deepseek_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")

    def chat(self, prompt: str, system: str = "You are a helpful assistant.") -> str:
        """调用 LLM 返回文本"""
        if self.provider == "deepseek":
            return self._deepseek_chat(prompt, system)
        elif self.provider == "anthropic":
            return self._anthropic_chat(prompt, system)
        else:
            return self._openai_chat(prompt, system)

    def json_chat(self, prompt: str, system: str = "You are a JSON-only API. Output valid JSON only.") -> dict:
        """调用 LLM 返回 JSON"""
        text = self.chat(prompt, system)
        return self._parse_json(text)

    def _openai_chat(self, prompt: str, system: str) -> str:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key, base_url=self.api_base)
            resp = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
                temperature=0.8, max_tokens=4096,
            )
            return resp.choices[0].message.content
        except Exception as e:
            print(f"  [LLMProvider] OpenAI 调用失败: {e}")
            return "{}"

    def _deepseek_chat(self, prompt: str, system: str) -> str:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.deepseek_key, base_url="https://api.deepseek.com/v1")
            resp = client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
                temperature=0.8, max_tokens=4096,
            )
            return resp.choices[0].message.content
        except Exception as e:
            print(f"  [LLMProvider] DeepSeek 调用失败: {e}")
            return "{}"

    def _anthropic_chat(self, prompt: str, system: str) -> str:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.anthropic_key)
            resp = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4096,
                system=system,
                messages=[{"role": "user", "content": prompt}],
            )
            return resp.content[0].text
        except Exception as e:
            print(f"  [LLMProvider] Anthropic 调用失败: {e}")
            return "{}"

    @staticmethod
    def _parse_json(text: str) -> dict:
        """鲁棒 JSON 解析：处理 LLM 返回的非纯 JSON"""
        text = text.strip()
        # 去除 markdown 代码块
        if text.startswith("```"):
            lines = text.split("\n")
            lines = lines[1:] if len(lines) > 1 else lines
            if lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines)
        # 尝试提取 JSON 数组或对象
        for pattern in [r"\[.*\]", r"\{.*\}"]:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    continue
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            print(f"  [LLMProvider] JSON 解析失败，返回空对象: {text[:200]}")
            return {}
