"""分镜引擎 - 生成镜头列表、对白和拍摄指令"""

class ShotEngine:
    def __init__(self, mode="local"):
        self.mode = mode

    def generate(self, story: dict, characters: list):
        if self.mode in ("hybrid", "production"):
            return self._generate_with_llm(story, characters)
        return self._generate_local(story, characters)

    def _generate_local(self, story: dict, characters: list):
        return [{"shot_id": "s01", "duration": 6, "scene": "开场", "characters": ["default"], "dialogue": story.get("theme", "")}]

    def _generate_with_llm(self, story: dict, characters: list):
        # TODO: 接入 GPT 生成 shots.json
        return self._generate_local(story, characters)
