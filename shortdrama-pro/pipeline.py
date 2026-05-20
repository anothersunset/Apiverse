from engine.story_engine import StoryEngine
from engine.character_engine import CharacterEngine
from engine.shot_engine import ShotEngine
from engine.render_engine import RenderEngine
from engine.subtitle_engine import SubtitleEngine
from engine.compose_engine import ComposeEngine
from engine.qa_engine import QAEngine

class ShortDramaPipeline:
    def __init__(self, mode="local"):
        self.mode = mode
        self.story_engine = StoryEngine(mode=mode)
        self.character_engine = CharacterEngine(mode=mode)
        self.shot_engine = ShotEngine(mode=mode)
        self.render_engine = RenderEngine(mode=mode)
        self.subtitle_engine = SubtitleEngine(mode=mode)
        self.compose_engine = ComposeEngine(mode=mode)
        self.qa_engine = QAEngine(mode=mode)

    def run(self, idea: str, target_duration: int = 60):
        story = self.story_engine.generate(idea, target_duration)
        characters = self.character_engine.generate(story)
        shots = self.shot_engine.generate(story, characters)

        rendered_shots = []
        for shot in shots:
            rendered = self.render_engine.render_shot(
                story=story,
                characters=characters,
                shot=shot,
            )
            rendered_shots.append(rendered)

        subtitles = self.subtitle_engine.generate(shots)
        final_video = self.compose_engine.compose(
            story=story,
            shots=rendered_shots,
            subtitles=subtitles,
        )

        qa_report = self.qa_engine.inspect(final_video, rendered_shots)
        retry_list = qa_report.get("retry_shots", [])

        if retry_list:
            for shot_id in retry_list:
                target = next(s for s in shots if s["shot_id"] == shot_id)
                self.render_engine.render_shot(story, characters, target, force=True)
            final_video = self.compose_engine.compose(story, rendered_shots, subtitles)
            qa_report = self.qa_engine.inspect(final_video, rendered_shots)

        return {
            "final_video": final_video,
            "report": qa_report.get("report_path", "output/report.md"),
        }
