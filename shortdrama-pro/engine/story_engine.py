"""故事引擎 — 根据创意生成故事大纲、角色和分镜"""

import json
import random
from pathlib import Path
from .prompt_templates import STORY_PROMPT, LOCAL_STORY_TEMPLATES

DATA_DIR = Path(__file__).parent.parent / "data"


class StoryEngine:
    def __init__(self, mode="local"):
        self.mode = mode
        DATA_DIR.mkdir(parents=True, exist_ok=True)

    def generate(self, idea: str, target_duration: int = 60) -> dict:
        if self.mode == "local":
            story = self._generate_local(idea, target_duration)
        else:
            story = self._generate_with_llm(idea, target_duration)

        path = DATA_DIR / "story.json"
        path.write_text(json.dumps(story, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  [StoryEngine] story.json → {path}")
        return story

    def _generate_local(self, idea: str, target_duration: int) -> dict:
        template = random.choice(LOCAL_STORY_TEMPLATES)
        return {
            "title": template["title"],
            "genre": template["genre"],
            "theme": idea or template["theme"],
            "logline": template["logline"],
            "episodes": 1,
            "target_duration_seconds": target_duration,
        }

    def _generate_with_llm(self, idea: str, target_duration: int) -> dict:
        from providers.llm_provider import LLMProvider
        llm = LLMProvider()
        prompt = STORY_PROMPT.format(idea=idea, target_duration=target_duration)
        return llm.json_chat(prompt)
