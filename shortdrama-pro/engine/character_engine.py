"""角色引擎 - 生成角色设定、视觉描述和音色绑定"""

class CharacterEngine:
    def __init__(self, mode="local"):
        self.mode = mode

    def generate(self, story: dict):
        if self.mode in ("hybrid", "production"):
            return self._generate_with_llm(story)
        return self._generate_local(story)

    def _generate_local(self, story: dict):
        return [{"id": "default", "name": "主角", "role": story.get("theme", ""), "voice": "zh-CN-XiaoxiaoNeural"}]

    def _generate_with_llm(self, story: dict):
        # TODO: 接入 GPT 根据 story 生成 characters.json
        return self._generate_local(story)
