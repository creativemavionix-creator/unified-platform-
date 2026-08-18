from typing import Literal

from pydantic import BaseModel


class ImageResponse(BaseModel):
    url: str
    filename: str


class HealthResponse(BaseModel):
    status: Literal["ok"]
    device: Literal["cuda", "cpu"]


class GeneratedImageRecord(BaseModel):
    filename: str
    url: str
    operation: Literal[
        "generate",
        "inpaint",
        "outpaint",
        "remove-background",
        "background-replace",
        "face-enhance",
        "upscale",
        "magic-eraser",
        "style-transfer",
        "image-variations",
    ]
    prompt: str
    created_at: str
    width: int
    height: int


class PromptEnhanceRequest(BaseModel):
    prompt: str


class PromptEnhanceResponse(BaseModel):
    prompt: str


class BrandKitSuggestRequest(BaseModel):
    brand_name: str
    brand_type: str
    description: str | None = None


class BrandKitSuggestResponse(BaseModel):
    colors: list[str]
    fonts: list[str]
    logo_prompt: str
    asset_prompts: list[str]


class BrandKitSaveRequest(BaseModel):
    colors: list[str]
    fonts: list[str]
    logos: list[str]
    assets: list[str]


class BrandKitResponse(BaseModel):
    colors: list[str]
    fonts: list[str]
    logos: list[str]
    assets: list[str]

