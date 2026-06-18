from loguru import logger
import sys

logger.remove()

logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
    "<level>{message}</level>",
    level="INFO",
    colorize=True,
)

logger.add(
    "logs/interviewiq.log",
    rotation="10 MB",
    retention="30 days",
    compression="zip",
    level="INFO",
)

__all__ = ["logger"]