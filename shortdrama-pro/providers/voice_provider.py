"""Voice Provider — ElevenLabs / MiniMax / Azure / edge-tts 适配"""

import os
import asyncio
from pathlib import Path


class VoiceProvider:
    def __init__(self):
        self.provider = os.getenv("VOICE_PROVIDER", "edge-tts")
        self.elevenlabs_key = os.getenv("ELEVENLABS_API_KEY", "")
        self.minimax_key = os.getenv("MINIMAX_API_KEY", "")
        self.azure_key = os.getenv("AZURE_SPEECH_KEY", "")
        self.azure_region = os.getenv("AZURE_SPEECH_REGION", "eastasia")

    async def generate_voice(self, text: str, voice_id: str, output_path: str):
        if self.provider == "elevenlabs":
            await self._elevenlabs_tts(text, voice_id, output_path)
        elif self.provider == "azure":
            await self._azure_tts(text, voice_id, output_path)
        elif self.provider == "minimax":
            await self._minimax_tts(text, voice_id, output_path)
        else:
            await self._edge_tts(text, voice_id, output_path)

    async def _edge_tts(self, text: str, voice_id: str, output_path: str):
        import edge_tts
        communicate = edge_tts.Communicate(text=text, voice=voice_id, rate="+0%", volume="+0%")
        await communicate.save(output_path)

    async def _elevenlabs_tts(self, text: str, voice_id: str, output_path: str):
        import aiohttp
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {"xi-api-key": self.elevenlabs_key, "Content-Type": "application/json"}
        body = {"text": text, "model_id": "eleven_multilingual_v2"}
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=body, headers=headers) as resp:
                if resp.status == 200:
                    Path(output_path).write_bytes(await resp.read())
                else:
                    raise RuntimeError(f"ElevenLabs API error: {resp.status}")

    async def _azure_tts(self, text: str, voice_id: str, output_path: str):
        import aiohttp
        url = f"https://{self.azure_region}.tts.speech.microsoft.com/cognitiveservices/v1"
        headers = {"Ocp-Apim-Subscription-Key": self.azure_key,
                   "Content-Type": "application/ssml+xml",
                   "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3"}
        ssml = f"""<speak version='1.0' xml:lang='zh-CN'>
            <voice name='{voice_id}'>{text}</voice></speak>"""
        async with aiohttp.ClientSession() as session:
            async with session.post(url, data=ssml, headers=headers) as resp:
                if resp.status == 200:
                    Path(output_path).write_bytes(await resp.read())
                else:
                    raise RuntimeError(f"Azure TTS error: {resp.status}")

    async def _minimax_tts(self, text: str, voice_id: str, output_path: str):
        # MiniMax TTS API (兼容 OpenAI TTS 格式)
        import aiohttp
        url = "https://api.minimax.chat/v1/t2a_v2"
        headers = {"Authorization": f"Bearer {self.minimax_key}", "Content-Type": "application/json"}
        body = {"model": "speech-01", "text": text, "voice_setting": {"voice_id": voice_id}}
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=body, headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    audio_url = data.get("audio_file", "")
                    if audio_url:
                        import aiohttp
                        async with session.get(audio_url) as ar:
                            Path(output_path).write_bytes(await ar.read())
                else:
                    raise RuntimeError(f"MiniMax API error: {resp.status}")
