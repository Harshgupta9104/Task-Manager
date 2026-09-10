"""FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import tasks

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan."""
    logger.info(
        "Starting %s v%s with CORS allowed origins: %s",
        settings.APP_NAME,
        settings.APP_VERSION,
        settings.ALLOWED_ORIGINS,
    )
    yield


def _build_app(settings_obj=None) -> FastAPI:
    """Build the FastAPI application.

    Extracted so tests can rebuild the app with a different ``settings``
    object (e.g. a temporary ALLOWED_ORIGINS) without mutating module state
    in a way that survives between tests.
    """
    if settings_obj is None:
        from app.config import settings as _settings
        settings_obj = _settings

    app = FastAPI(
        title=settings_obj.APP_NAME,
        version=settings_obj.APP_VERSION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Catch-all handler that prevents stack traces from leaking to clients."""
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred. Please try again later."},
        )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings_obj.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(tasks.router, prefix="/api/v1")
    return app


app = _build_app()


@app.get("/", tags=["health"])
def health_check() -> dict:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/health", tags=["health"])
def health_detail() -> dict:
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "debug": settings.DEBUG,
    }
