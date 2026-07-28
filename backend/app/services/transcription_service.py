import tempfile
import os

import whisper # type: ignore[import-untyped] 

from app.core.logging import logger
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
)


class TranscriptionService:

    _model = whisper.load_model("base")

    @staticmethod
    def transcribe_audio(
        audio_bytes: bytes,
    ) -> str:
        
        """Transcribe audio bytes using Whisper model."""

        logger.info("Starting audio transcription.")

        temp_audio_file_path: str | None = None

        try:
            with tempfile.NamedTemporaryFile(
                delete=False, 
                suffix=".webm"
            ) as temp_audio_file:
                
                temp_audio_file.write(audio_bytes)
                temp_audio_file.flush()

                temp_audio_file_path = temp_audio_file.name

            result = TranscriptionService._model.transcribe(
                temp_audio_file_path
            )

            transcription = result["text"].strip()
            
            logger.info("Audio transcription completed successfully.")

            return transcription

        except InterviewIQException:
            raise

        except Exception:
            logger.exception("Audio transcription failed.")
            
            raise DatabaseException(
                "Failed to transcribe audio."
            )


        finally:
            # Clean up the temporary audio file
            if (
                temp_audio_file_path
                and os.path.exists(temp_audio_file_path)
            ):
                os.remove(temp_audio_file_path)
