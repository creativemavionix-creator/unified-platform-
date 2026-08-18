from __future__ import annotations

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    ollama: str = "unknown"


class OutlineRequest(BaseModel):
    source: str = "prompt"
    content: str
    slide_count: int = Field(default=10, ge=4, le=40)
    speaker_notes: bool = True


class OutlineSlide(BaseModel):
    id: str
    title: str
    bullets: list[str]


class OutlineResponse(BaseModel):
    slides: list[OutlineSlide]
    design_suggestions: list[str] = []
    generation_source: str = "fallback"  # "ollama" | "fallback" | "mixed"


class GenerateSlidesRequest(BaseModel):
    source: str = "prompt"
    content: str = ""
    speaker_notes: bool = True
    outline: list[OutlineSlide]


class GeneratedSlide(BaseModel):
    id: str
    title: str
    layout: str
    subtitle: str = ""
    body: str = ""
    bullets: list[str]
    notes: str = ""
    image_prompt: str = ""
    thumb: str | None = None


class GenerateSlidesResponse(BaseModel):
    slides: list[GeneratedSlide]
    generation_source: str = "fallback"  # "ollama" | "fallback" | "mixed"
