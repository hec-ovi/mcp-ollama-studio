from fastapi import APIRouter

from src.models.chat import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health() -> HealthResponse:
    """Return a simple health check response."""
    return HealthResponse()
