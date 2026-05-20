"""分镜引擎 — 生成镜头列表、对白和拍摄指令"""

import json
from pathlib import Path
from .prompt_templates import SHOT_PROMPT, LOCAL_STORY_TEMPLATES

DATA_DIR = Path(__file__).parent.parent / "data"


class ShotEngine:
    def __init__(self, mode="local"):
        self.mode = mode

    def generate(self, story: dict, characters: list) -> list:
        shot_count = max(3, story.get("target_duration_seconds", 60) // 10)

        if self.mode == "local":
            shots = self._generate_local(story, shot_count)
        else:
            shots = self._generate_with_llm(story, characters, shot_count)

        path = DATA_DIR / "shots.json"
        path.write_text(json.dumps(shots, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  [ShotEngine] {len(shots)} 个镜头 → {path}")
        return shots

    @staticmethod
    def _normalize(shots: list) -> list:
        for s in shots:
            if "id" in s and "shot_id" not in s:
                s["shot_id"] = s.pop("id")
            s.setdefault("status", "pending")
            s.setdefault("image_prompt", s.get("scene", ""))
            s.setdefault("video_prompt", s.get("action", ""))
        return shots

    def _generate_local(self, story: dict, shot_count: int) -> list:
        for t in LOCAL_STORY_TEMPLATES:
            if t["title"] == story.get("title"):
                return self._normalize(t["shots"][:shot_count])

        theme = story.get("theme", "一个故事")
        character_name = "主角"
        return [
            {
                "shot_id": f"s{i + 1:02d}", "duration": 6,
                "scene": f"场景 {i + 1}", "character": character_name,
                "camera": ["中景", "近景", "特写", "远景", "手持镜头"][i % 5],
                "action": f"{theme} 第 {i + 1} 幕",
                "dialogue": f"这是关于{theme}的故事。",
                "image_prompt": f"cinematic scene {i + 1}, drama",
                "video_prompt": f"cinematic shot {i + 1}",
                "status": "pending"
            }
            for i in range(min(shot_count, 5))
        ]

    def _generate_with_llm(self, story: dict, characters: list, shot_count: int) -> list:
        from providers.llm_provider import LLMProvider
        llm = LLMProvider()
        prompt = SHOT_PROMPT.format(
            story_json=json.dumps(story, ensure_ascii=False),
            characters_json=json.dumps(characters, ensure_ascii=False),
            shot_count=shot_count,
        )
        shots = llm.json_chat(prompt)
        for s in shots:
            s.setdefault("status", "pending")
        return shots
