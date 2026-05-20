"""角色引擎 — 生成角色设定、视觉描述和音色绑定"""

import json
import random
from pathlib import Path
from .prompt_templates import CHARACTER_PROMPT, LOCAL_STORY_TEMPLATES

DATA_DIR = Path(__file__).parent.parent / "data"


class CharacterEngine:
    def __init__(self, mode="local"):
        self.mode = mode

    def generate(self, story: dict) -> list:
        if self.mode == "local":
            characters = self._generate_local(story)
        else:
            characters = self._generate_with_llm(story)

        path = DATA_DIR / "characters.json"
        path.write_text(json.dumps(characters, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  [CharacterEngine] {len(characters)} 个角色 → {path}")
        return characters

    def _generate_local(self, story: dict) -> list:
        for t in LOCAL_STORY_TEMPLATES:
            if t["title"] == story.get("title"):
                return [
                    {
                        "id": c["id"],
                        "name": c["name"],
                        "role": c["role"],
                        "visual_prompt": c["visual"],
                        "negative_prompt": "extra fingers, distorted face, low quality, blurry",
                        "voice": c["voice"],
                        "reference_image": f"assets/characters/{c['id']}.png",
                    }
                    for c in t["characters"]
                ]
        return [{"id": "default", "name": "主角", "role": story.get("theme", ""),
                 "visual_prompt": "young Chinese professional, cinematic lighting",
                 "negative_prompt": "", "voice": "zh-CN-XiaoxiaoNeural",
                 "reference_image": "assets/characters/default.png"}]

    def _generate_with_llm(self, story: dict) -> list:
        from providers.llm_provider import LLMProvider
        llm = LLMProvider()
        prompt = CHARACTER_PROMPT.format(story_json=json.dumps(story, ensure_ascii=False))
        return llm.json_chat(prompt)
