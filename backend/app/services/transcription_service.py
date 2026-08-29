import base64

import httpx

from app.core.config import settings
from app.core.logging import logger
from app.exceptions.custom_exceptions import DatabaseException


class TranscriptionService:
    """Transcribe interview audio using Cloudflare Workers AI."""

    MODEL = "@cf/openai/whisper-large-v3-turbo"

    @staticmethod
    def transcribe_audio(audio_bytes: bytes) -> str:
        logger.info(
            "Starting audio transcription with Cloudflare Workers AI."
        )

        try:
            if not audio_bytes:
                raise ValueError("Audio data is empty.")

            encoded_audio = base64.b64encode(
                audio_bytes
            ).decode("utf-8")

            url = (
                "https://api.cloudflare.com/client/v4/accounts/"
                f"{settings.CLOUDFLARE_ACCOUNT_ID}"
                "/ai/run/"
                f"{TranscriptionService.MODEL}"
            )

            headers = {
                "Authorization": (
                    f"Bearer {settings.CLOUDFLARE_API_TOKEN}"
                ),
                "Content-Type": "application/json",
            }

            payload = {
                "audio": encoded_audio,
                "task": "transcribe",
                "language": "en",
                "vad_filter": True,
            }

            response = httpx.post(
                url,
                headers=headers,
                json=payload,
                timeout=120.0,
            )

            response.raise_for_status()

            data = response.json()

            if not data.get("success"):
                raise RuntimeError(
                    f"Cloudflare transcription failed: "
                    f"{data.get('errors')}"
                )

            result = data.get("result", {})

            transcript = result.get("text", "").strip()

            if not transcript:
                raise RuntimeError(
                    "Cloudflare returned an empty transcript."
                )

            logger.info(
                "Audio transcription completed successfully."
            )

            return transcript

        except Exception as exc:
            logger.exception(
                "Audio transcription failed."
            )

            raise DatabaseException(
                "Failed to transcribe audio."
            ) from exc