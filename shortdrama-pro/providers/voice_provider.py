"""Voice Provider - ElevenLabs / MiniMax / Azure / edge-tts 适配"""

import os
import asyncio

class VoiceProvider:
    def __init__(self):
        self.provider = os.getenv("VOICE_PROVIDER", "edge-tts")
        self.elevenlabs_key = os.getenv("ELEVENLABS_API_KEY", "")
        self.minimax_key = os.getenv("MINIMAX_API_KEY", "")
        self.azure_key = os.getenv("AZURE_SPEECH_KEY", "")

    async def generate_voice(self, text: str, voice_id: str, output_path: str):
        if self.provider == "edge-tts":
            import edge_tts
            communicate = edge_tts.Communicate(text=text, voice=voice_id, rate="+0%", volume="+0%")
            await communicate.save(output_path)
        else:
            raise NotImplementedError(f"Voice provider {self.provider} not yet implemented")
