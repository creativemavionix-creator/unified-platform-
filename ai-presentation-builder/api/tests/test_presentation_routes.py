from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.routers import presentation_routes


client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_outline_requires_content() -> None:
    response = client.post("/api/outline", json={"source": "prompt", "content": "", "slide_count": 8})
    assert response.status_code == 422


def test_outline_fallback_when_ollama_down(monkeypatch) -> None:
    def boom(_prompt: str) -> str:
        raise presentation_routes.HTTPException(status_code=503, detail="down")

    # Force the inner try to fail into fallback by raising a generic error after "success" path fails
    def bad_ollama(*_args, **_kwargs) -> str:
        return "not-json"

    monkeypatch.setattr(presentation_routes, "_ollama_generate", bad_ollama)
    response = client.post(
        "/api/outline",
        json={
            "source": "prompt",
            "content": "Pitch deck for an AI tutoring startup",
            "slide_count": 6,
            "speaker_notes": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["slides"]) == 6
    assert data["slides"][0]["title"]
    assert data["design_suggestions"]


def test_generate_slides_fallback(monkeypatch) -> None:
    monkeypatch.setattr(presentation_routes, "_ollama_generate", lambda *_a, **_k: "not-json")
    outline = [
        {"id": "o1", "title": "Cover", "bullets": ["Hook"]},
        {"id": "o2", "title": "Problem", "bullets": ["Pain"]},
    ]
    response = client.post(
        "/api/generate-slides",
        json={"source": "prompt", "content": "AI tutoring", "speaker_notes": True, "outline": outline},
    )
    assert response.status_code == 200
    data = response.json()
    slides = data["slides"]
    assert len(slides) == 2
    assert slides[0]["image_prompt"]
    assert slides[0]["notes"]
    assert slides[0]["notes"].lower() not in {"true", "false"}
    assert slides[0]["subtitle"]
    assert slides[0]["body"]
    assert "expand each point" not in slides[0]["body"].lower()
    assert "audience-ready" not in slides[0]["body"].lower()
    assert len(slides[0]["bullets"]) >= 3
    assert all(len(b.split()) > 4 for b in slides[0]["bullets"])
    assert data.get("generation_source") in {"fallback", "ollama", "mixed"}


def test_generate_slides_sanitizes_boolean_notes(monkeypatch) -> None:
    payload = {
        "slides": [
            {
                "title": "Agenda",
                "subtitle": "What we will cover",
                "body": "A short narrative about the session.",
                "layout": "Agenda",
                "bullets": [
                    "We will map the problem space for AI tutoring.",
                    "Then we will show the product approach and differentiators.",
                    "Finally we will close with next steps and asks.",
                ],
                "notes": True,
                "image_prompt": "agenda visual",
            }
        ]
    }
    monkeypatch.setattr(
        presentation_routes,
        "_ollama_generate",
        lambda *_a, **_k: __import__("json").dumps(payload),
    )
    outline = [{"id": "o1", "title": "Agenda", "bullets": ["What we'll cover", "Expected outcomes"]}]
    response = client.post(
        "/api/generate-slides",
        json={"source": "prompt", "content": "AI tutoring", "speaker_notes": True, "outline": outline},
    )
    assert response.status_code == 200
    notes = response.json()["slides"][0]["notes"]
    assert notes
    assert str(notes).strip().lower() != "true"
    assert isinstance(notes, str)


def test_extract_topic_ignores_theme_instructions() -> None:
    content = (
        "Topic: AI tutoring for high school math\n"
        "Visual theme: Aurora (style only — do not paste into slide text)\n"
        "Visual/style guidance: Aurora visual style — bold, modern, on-brand"
    )
    topic = presentation_routes._extract_topic(content)
    assert "Aurora" not in topic
    assert "on-brand" not in topic.lower()
    assert "tutoring" in topic.lower() or "math" in topic.lower()


def test_fallback_outline_does_not_leak_style_prompt() -> None:
    slides = presentation_routes._fallback_outline(
        "Create a presentation using the Aurora visual theme — bold, modern, on-brand.",
        3,
    )
    blob = " ".join(s.title + " " + " ".join(s.bullets) for s in slides)
    assert "Aurora" not in blob
    assert "on-brand" not in blob.lower()
    assert "Create a presentation" not in blob
