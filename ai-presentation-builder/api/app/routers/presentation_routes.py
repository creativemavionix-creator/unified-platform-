from __future__ import annotations

import json
import os
import re
import uuid
from urllib.error import URLError
from urllib.request import Request as UrlRequest, urlopen

from fastapi import APIRouter, HTTPException

from app.schemas import (
    GenerateSlidesRequest,
    GenerateSlidesResponse,
    GeneratedSlide,
    HealthResponse,
    OutlineRequest,
    OutlineResponse,
    OutlineSlide,
)

router = APIRouter()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3:8b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "90"))
OLLAMA_SLIDES_TIMEOUT = float(os.getenv("OLLAMA_SLIDES_TIMEOUT", "180"))

LAYOUTS = ["Title", "Text + Image", "Two Column", "Chart", "Quote", "Agenda"]


class OllamaUnavailable(Exception):
    """Soft failure so endpoints can fall back instead of 504'ing the client."""


def _clean_json_response(text: str) -> dict | list:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    # Try to extract JSON object/array if model added prose
    for opener, closer in (("{", "}"), ("[", "]")):
        start = text.find(opener)
        end = text.rfind(closer)
        if start != -1 and end != -1 and end > start:
            text = text[start : end + 1]
            break
    return json.loads(text)


def _ollama_generate(
    prompt: str,
    timeout: float | None = None,
    *,
    num_predict: int = 2048,
    temperature: float = 0.65,
    json_mode: bool = True,
) -> str:
    payload: dict = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": temperature, "num_predict": num_predict},
    }
    # Ask Ollama to constrain output to JSON when supported (llama3+).
    if json_mode:
        payload["format"] = "json"
    body = json.dumps(payload).encode("utf-8")
    request = UrlRequest(OLLAMA_URL, data=body, headers={"Content-Type": "application/json"})
    wait = timeout if timeout is not None else OLLAMA_TIMEOUT
    try:
        with urlopen(request, timeout=wait) as response:
            result = json.loads(response.read().decode("utf-8"))
    except URLError as exc:
        raise OllamaUnavailable(f"Ollama unavailable at {OLLAMA_URL}: {exc}") from exc
    except TimeoutError as exc:
        raise OllamaUnavailable("Ollama timed out while generating presentation content") from exc
    except OSError as exc:
        # socket.timeout on some Python/Windows combos
        raise OllamaUnavailable(f"Ollama request failed: {exc}") from exc
    return str(result.get("response", "")).strip()


def _clean_notes(value: object, speaker_notes: bool, title: str, body: str = "") -> str:
    if not speaker_notes:
        return ""
    if isinstance(value, bool) or value is None:
        return f"Spend 20–30 seconds on “{title}”. Cover the key points, then transition."
    text = str(value).strip()
    if not text or text.lower() in {"true", "false", "none", "null", "1", "0"}:
        hint = body[:120].rstrip(".") if body else title
        return f"Explain: {hint}. Pause for questions, then move on."
    return text[:400]


def _clean_text(value: object, fallback: str = "") -> str:
    if value is None or isinstance(value, bool):
        return fallback
    text = str(value).strip()
    if not text or text.lower() in {"true", "false", "none", "null"}:
        return fallback
    return text



def _extract_topic(content: str, max_len: int = 72) -> str:
    """Pull a short human topic out of user input — never treat style instructions as the topic."""
    text = (content or "").strip()
    if not text:
        return "this topic"

    # Explicit markers
    for pattern in (
        r"(?im)^topic\s*:\s*(.+)$",
        r"(?im)^subject\s*:\s*(.+)$",
        r'(?i)titled\s+[“"]([^”"]+)[”"]',
        r"(?i)about\s+[“']([^”']+)[”']",
    ):
        m = re.search(pattern, text)
        if m:
            candidate = m.group(1).strip().strip(" .")
            if candidate and len(candidate) >= 3:
                return candidate[:max_len]

    # Drop meta / style / template instruction lines
    drop = re.compile(
        r"(?i)("
        r"create a presentation|"
        r"build a .+ presentation|"
        r"using the .+ (visual )?theme|"
        r"visual theme|"
        r"bold,? modern,? on-brand|"
        r"aim for about \d+ slides|"
        r"concrete talking points|"
        r"format/template\s*:|"
        r"visual/style guidance\s*:|"
        r"aligned to our brand kit|"
        r"llama3:?\s*\d*b?|"
        r"speaker-?notes|"
        r"num_predict|"
        r"ollama"
        r").*"
    )

    lines = []
    for raw in re.split(r"[\n\r]+", text):
        line = raw.strip()
        if not line or drop.search(line):
            continue
        # Strip leading labels
        line = re.sub(r"(?i)^(topic|subject|prompt)\s*:\s*", "", line).strip()
        if line:
            lines.append(line)

    candidate = lines[0] if lines else ""
    if not candidate:
        # Last resort: first few words that aren't instruction-y
        scrubbed = drop.sub(" ", text)
        scrubbed = re.sub(r"\s+", " ", scrubbed).strip(" -—,.")
        candidate = scrubbed

    if not candidate or len(candidate) < 3:
        return "this topic"

    # Prefer a short noun phrase (up to first sentence / comma clause)
    candidate = re.split(r"[.!?\n]", candidate)[0].strip()
    if len(candidate) > max_len:
        candidate = candidate[: max_len - 1].rsplit(" ", 1)[0] + "…"
    return candidate


def _sanitize_slide_text(value: str, topic: str) -> str:
    """Remove leaked prompt/instruction fragments from model or fallback copy."""
    text = (value or "").strip()
    if not text:
        return text
    banned = [
        r"(?i)create a presentation using the .+ theme[^.]*\.?",
        r"(?i)create a presentation\b[^.]*\.?",
        r"(?i)build a .+ presentation\b[^.]*\.?",
        r"(?i)bold,? modern,? on-brand\.?",
        r"(?i)the topic is\s*llama3:?\s*\d*b?",
        r"(?i)llama3:?\s*\d*b?",
        r"(?i)aim for about \d+ slides[^.]*\.?",
        r"(?i)visual/style guidance\s*:[^.]*\.?",
        r"(?i)format/template\s*:[^.]*\.?",
    ]
    cleaned = text
    for pat in banned:
        cleaned = re.sub(pat, "", cleaned)
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip(" -—,.")
    if not cleaned or len(cleaned) < 3:
        return topic
    # If the whole string is still basically the long instruction, replace
    if len(cleaned) > 90 and re.search(r"(?i)presentation using|visual theme|on-brand", cleaned):
        return topic
    return cleaned


def _topic_from_outline(outline: list[OutlineSlide], content: str = "") -> str:
    topic = _extract_topic(content)
    if topic != "this topic":
        return topic
    if outline:
        title = outline[0].title.replace("Cover — ", "").replace("Cover - ", "").strip()
        return _sanitize_slide_text(title, "this topic")[:72]
    return "this topic"


def _is_meta_copy(text: str) -> bool:
    t = (text or "").lower()
    markers = (
        "expand each point",
        "keep language concrete",
        "audience-ready",
        "use this slide to",
        "define what",
        "talking points your audience",
        "concrete talking points",
        "do not paste",
        "style only",
    )
    return any(m in t for m in markers)


def _enrich_slide_copy(title: str, bullets: list[str], topic: str, index: int) -> tuple[str, str, list[str], str]:
    """Produce real slide copy about the topic — never instructional/meta filler."""
    topic = _sanitize_slide_text(topic, "this topic")[:72]
    title = _sanitize_slide_text(title, topic)
    cleaned = [
        _sanitize_slide_text(b, "")
        for b in bullets
        if b and str(b).lower() not in {"true", "false"} and not _is_meta_copy(str(b))
    ]
    cleaned = [b for b in cleaned if b and len(b.split()) >= 4]

    generic = {
        "introduce",
        "one-line pitch",
        "what we'll cover",
        "expected outcomes",
        "customer pain point",
        "why it matters now",
        "product / approach overview",
        "key differentiator",
        "step-by-step flow",
        "simple example",
    }
    is_sparse = len(cleaned) < 2 or all(b.lower().strip() in generic or len(b.split()) <= 5 for b in cleaned)

    subtitle_bank = [
        f"Why {topic} matters right now",
        f"What we will cover on {topic}",
        f"The friction holding {topic} back",
        f"A practical path for {topic}",
        f"How teams put {topic} to work",
        f"Proof that {topic} delivers",
        f"Where {topic} creates value",
        f"What to do next with {topic}",
    ]
    body_bank = [
        f"{topic} is changing how people decide, build, and compete. This opening sets the stakes for the room.",
        f"We will move from the problem behind {topic} to a clear approach and the outcomes you should expect.",
        f"Teams feel the cost of weak {topic} every week — in speed, quality, and trust.",
        f"Here is a concrete approach to {topic} that is simple to explain and realistic to ship.",
        f"This walkthrough shows how {topic} works day to day for the people who use it.",
        f"Results beat slogans: here is what good {topic} looks like in practice.",
        f"The upside of getting {topic} right shows up in better decisions and faster cycles.",
        f"Leave with owners, timelines, and a next step you can take on {topic} this week.",
    ]
    bullets_bank = [
        [
            f"{topic} is no longer optional for teams that want to stay competitive.",
            f"This session focuses on practical decisions, not abstract theory.",
            f"By the end, you will know what to prioritize first.",
        ],
        [
            f"We start with the real problem around {topic}.",
            f"Then we show the approach and how it works.",
            f"We close with impact, proof, and clear next steps.",
        ],
        [
            f"People closest to the work feel gaps in {topic} first.",
            f"Delay creates cost in time, money, and customer trust.",
            f"Current tools and habits are not closing that gap fast enough.",
        ],
        [
            f"Our approach to {topic} is designed to be understandable and usable.",
            f"It differs by focusing on outcomes people can measure.",
            f"Early signals already show the approach can work in the field.",
        ],
        [
            f"Users move through a simple flow when applying {topic}.",
            f"Each step has clear inputs, owners, and outputs.",
            f"A short example shows how this looks in a real scenario.",
        ],
        [
            f"Strong {topic} improves speed and quality of decisions.",
            f"The first wins appear with the teams closest to the customer.",
            f"We track success with a small set of honest metrics.",
        ],
        [
            f"Comparable teams have already seen momentum with {topic}.",
            f"Adoption and quality signals are improving over time.",
            f"Key risks have been identified and reduced.",
        ],
        [
            f"Start with one focused pilot for {topic} this month.",
            f"Assign owners and dates before leaving the room.",
            f"Review progress on a fixed cadence so the work stays aligned.",
        ],
    ]

    i = index % len(subtitle_bank)
    subtitle = subtitle_bank[i]
    body = body_bank[i]
    notes = (
        f"Spend 30–45 seconds on “{title}”. Restate the point in plain language, "
        f"tie it to {topic}, then advance."
    )

    if is_sparse:
        return subtitle, body, bullets_bank[i], notes
    return subtitle, body, cleaned[:5], notes


def _usable_copy(text: object, fallback: str = "") -> str:
    """Keep model copy only when it is real slide text, not meta instructions."""
    cleaned = _sanitize_slide_text(_clean_text(text, ""), fallback)
    if not cleaned or _is_meta_copy(cleaned):
        return fallback
    return cleaned


def _materialize_ollama_slide(
    item: dict,
    outline_item: OutlineSlide | None,
    topic: str,
    index: int,
    speaker_notes: bool,
) -> GeneratedSlide:
    title = _usable_copy(
        item.get("title"),
        outline_item.title if outline_item else f"Slide {index + 1}",
    )
    title = _sanitize_slide_text(title, topic)

    bullets_raw = item.get("bullets") or (outline_item.bullets if outline_item else [])
    if not isinstance(bullets_raw, list):
        bullets_raw = [str(bullets_raw)]
    bullets = [
        _usable_copy(b, "")
        for b in bullets_raw
        if _clean_text(b)
    ]
    bullets = [b for b in bullets if b][:5]

    layout = str(item.get("layout") or LAYOUTS[index % len(LAYOUTS)])
    if layout not in LAYOUTS:
        layout = LAYOUTS[index % len(LAYOUTS)]

    subtitle = _usable_copy(item.get("subtitle"), "")
    body = _usable_copy(item.get("body"), "")
    fb_sub, fb_body, fb_bullets, fb_notes = _enrich_slide_copy(title, bullets, topic, index)

    # Prefer outline / model bullets; only fill gaps from enrichment.
    if len(bullets) < 2:
        bullets = fb_bullets
    if not subtitle or subtitle == topic:
        subtitle = fb_sub
    if not body:
        body = fb_body

    notes = _clean_notes(item.get("notes"), speaker_notes, title, body) or fb_notes
    notes = _sanitize_slide_text(notes, f"Cover the key points on {title}.")

    image_prompt = _clean_text(
        item.get("image_prompt"),
        f"cinematic presentation visual for {title} about {topic}, professional lighting, no text",
    )
    return GeneratedSlide(
        id=f"s{index + 1}-{uuid.uuid4().hex[:8]}",
        title=title,
        layout=layout,
        subtitle=subtitle,
        body=body,
        bullets=bullets or fb_bullets,
        notes=notes if speaker_notes else "",
        image_prompt=image_prompt,
    )


def _ollama_generate_slide_batch(
    topic: str,
    content: str,
    batch: list[OutlineSlide],
    start_index: int,
    speaker_notes: bool,
) -> list[GeneratedSlide]:
    """Generate a small batch of slides — more reliable for llama3:8b than full decks."""
    outline_blob = json.dumps(
        [{"title": s.title, "bullets": s.bullets[:4]} for s in batch],
        ensure_ascii=False,
    )
    system = (
        "Return ONLY valid JSON. "
        "Schema: {\"slides\":[{\"title\":string,\"subtitle\":string,\"body\":string,"
        "\"layout\":string,\"bullets\":[string,string,string],\"notes\":string,\"image_prompt\":string}]}. "
        f"Exactly {len(batch)} slides. TOPIC: {topic}. "
        "Write finished presentation copy about the topic — never writing instructions. "
        "Never say 'expand each point', 'audience-ready', or 'use this slide to'. "
        "subtitle: one short line. body: 1–2 concrete sentences. "
        "bullets: 3 full sentences specific to the topic. "
        "notes: speaker notes as a STRING. "
        "layout one of: Title, Text + Image, Two Column, Chart, Quote, Agenda. "
        "image_prompt: short visual, no text in image."
    )
    user = (
        f"TOPIC: {topic}\n"
        f"Brief (ignore style notes for copy):\n{content[:400]}\n"
        f"Need speaker notes: {'yes' if speaker_notes else 'no'}\n"
        f"Outline batch starting at slide {start_index + 1}: {outline_blob}"
    )
    raw = _ollama_generate(
        f"{system}\n\n{user}",
        timeout=min(OLLAMA_SLIDES_TIMEOUT, 120.0),
        num_predict=1800,
        temperature=0.7,
        json_mode=True,
    )
    parsed = _clean_json_response(raw)
    if not isinstance(parsed, dict):
        raise ValueError("Expected JSON object")
    slides_raw = parsed.get("slides") or []
    if not isinstance(slides_raw, list) or not slides_raw:
        raise ValueError("No slides in batch response")

    out: list[GeneratedSlide] = []
    for i, item in enumerate(slides_raw[: len(batch)]):
        if not isinstance(item, dict):
            continue
        outline_item = batch[i] if i < len(batch) else None
        out.append(
            _materialize_ollama_slide(
                item,
                outline_item,
                topic,
                start_index + i,
                speaker_notes,
            )
        )
    if len(out) < len(batch):
        raise ValueError(f"Batch returned {len(out)}/{len(batch)} slides")
    return out


def _slides_from_outline(
    outline: list[OutlineSlide],
    speaker_notes: bool,
    content: str = "",
) -> list[GeneratedSlide]:
    topic = _topic_from_outline(outline, content)
    slides: list[GeneratedSlide] = []
    for i, item in enumerate(outline):
        title = _sanitize_slide_text(item.title, topic)
        subtitle, body, bullets, notes = _enrich_slide_copy(title, item.bullets, topic, i)
        slides.append(
            GeneratedSlide(
                id=f"s{i + 1}-{uuid.uuid4().hex[:8]}",
                title=title,
                layout=LAYOUTS[i % len(LAYOUTS)],
                subtitle=subtitle,
                body=body,
                bullets=bullets,
                notes=notes if speaker_notes else "",
                image_prompt=(
                    f"cinematic presentation background for '{title}' about {topic}, "
                    "photoreal atmosphere, professional lighting, no text, no watermark"
                ),
            )
        )
    return slides


def _fallback_outline(content: str, slide_count: int) -> list[OutlineSlide]:
    topic = _extract_topic(content)
    templates = [
        (
            f"Cover — {topic}",
            [
                f"{topic} is reshaping how modern teams create advantage.",
                f"This deck explains the problem, the approach, and the ask.",
                f"The goal is a shared decision the room can act on.",
            ],
        ),
        (
            "Agenda",
            [
                f"Frame the challenge around {topic}.",
                f"Walk through the proposed approach and how it works.",
                f"Align on impact, proof, and next steps.",
            ],
        ),
        (
            "The Problem",
            [
                f"Teams lose time and quality when {topic} is weak or missing.",
                f"Customers and operators feel that friction every week.",
                f"Existing habits and tools are not closing the gap.",
            ],
        ),
        (
            "Our Solution",
            [
                f"A clear, usable approach to {topic} for this audience.",
                f"It prioritizes outcomes over buzzwords.",
                f"Early use shows the approach can stick in real workflows.",
            ],
        ),
        (
            "How It Works",
            [
                f"People follow a simple flow to apply {topic}.",
                f"Each stage has owners, inputs, and visible outputs.",
                f"A short example makes the process concrete.",
            ],
        ),
        (
            "Impact & Opportunity",
            [
                f"Better {topic} improves speed, quality, and confidence.",
                f"The first gains show up with frontline teams.",
                f"Success is measured with a few honest metrics.",
            ],
        ),
        (
            "Proof & Traction",
            [
                f"Comparable efforts around {topic} already show momentum.",
                f"Adoption and quality signals are moving in the right direction.",
                f"Major risks have been identified and reduced.",
            ],
        ),
        (
            "Plan & Investment",
            [
                f"Roll out {topic} in focused phases with clear milestones.",
                f"Resource needs map to expected return.",
                f"Ownership and governance stay explicit.",
            ],
        ),
        (
            "Roadmap",
            [
                f"A 30/60/90 day plan for {topic}.",
                f"Dependencies and decision gates are listed up front.",
                f"Phase one has a clear definition of done.",
            ],
        ),
        (
            "Next Steps",
            [
                f"Agree on the immediate ask for {topic}.",
                f"Assign owners and dates before leaving.",
                f"Set a follow-up so progress stays visible.",
            ],
        ),
    ]
    slides: list[OutlineSlide] = []
    for i in range(slide_count):
        title, bullets = templates[i % len(templates)]
        slides.append(OutlineSlide(id=f"o{i + 1}", title=title, bullets=list(bullets)))
    return slides


def _fallback_design_suggestions(content: str) -> list[str]:
    return [
        "Aurora theme — gradient purple accents for a modern creative feel",
        "Bold sans headings with generous whitespace between sections",
        "Use one strong visual per slide; keep body copy to 3 bullets max",
    ]


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    ollama_status = "unreachable"
    try:
        tags_url = OLLAMA_URL.replace("/api/generate", "/api/tags")
        req = UrlRequest(tags_url)
        with urlopen(req, timeout=2) as response:
            if response.status == 200:
                ollama_status = "ok"
    except Exception:
        ollama_status = "unreachable"
    return HealthResponse(status="ok", ollama=ollama_status)


@router.post("/outline", response_model=OutlineResponse)
def generate_outline(payload: OutlineRequest) -> OutlineResponse:
    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=422, detail="content is required")

    system = (
        "You are an expert presentation strategist. Return ONLY valid JSON (no markdown). "
        "Schema: {\"slides\":[{\"title\":string,\"bullets\":[string,string,string]}],"
        "\"design_suggestions\":[string,string,string]}. "
        f"Create exactly {payload.slide_count} slides. "
        "Each bullet must be a full sentence (12–22 words) specific to the user's TOPIC — "
        "never generic labels like 'Customer pain point' or 'Key differentiator'. "
        "Never write instructions like 'expand each point' or 'keep language concrete'. "
        "Never copy style/template instructions into titles or bullets. "
        "Never mention model names (llama, gpt, etc). "
        "Titles should be presentation-ready and concrete."
    )
    topic = _extract_topic(content)
    user = (
        f"Source type: {payload.source}\n"
        f"Speaker-notes intent: {'on' if payload.speaker_notes else 'off'}\n"
        f"TOPIC (use this as the subject of every slide): {topic}\n"
        f"Full user brief (may include style notes — do NOT paste these into slide text):\n{content}"
    )

    try:
        raw = _ollama_generate(
            f"{system}\n\n{user}",
            num_predict=min(512 + payload.slide_count * 180, 4096),
            temperature=0.65,
            json_mode=True,
        )
        parsed = _clean_json_response(raw)
        if not isinstance(parsed, dict):
            raise ValueError("Expected JSON object")
        slides_raw = parsed.get("slides") or []
        slides: list[OutlineSlide] = []
        for i, item in enumerate(slides_raw[: payload.slide_count]):
            if not isinstance(item, dict):
                continue
            title = _sanitize_slide_text(_clean_text(item.get("title"), f"Slide {i + 1}"), topic)
            bullets_raw = item.get("bullets") or []
            if not isinstance(bullets_raw, list):
                bullets_raw = [str(bullets_raw)]
            bullets = [
                _usable_copy(b, "")
                for b in bullets_raw
                if _clean_text(b)
            ]
            bullets = [b for b in bullets if b][:5]
            _, _, bullets, _ = _enrich_slide_copy(title, bullets, topic, i)
            slides.append(OutlineSlide(id=f"o{i + 1}", title=title, bullets=bullets))

        source = "ollama"
        if len(slides) < payload.slide_count:
            slides.extend(_fallback_outline(content, payload.slide_count - len(slides)))
            slides = slides[: payload.slide_count]
            source = "mixed"

        suggestions = parsed.get("design_suggestions") or []
        if not isinstance(suggestions, list) or not suggestions:
            suggestions = _fallback_design_suggestions(content)
        suggestions = [str(s) for s in suggestions][:5]

        if not slides:
            raise ValueError("No slides parsed")
        return OutlineResponse(
            slides=slides,
            design_suggestions=suggestions,
            generation_source=source,
        )
    except Exception as exc:
        print(f"Outline Ollama failed ({exc}); using fallback outline.")
        return OutlineResponse(
            slides=_fallback_outline(content, payload.slide_count),
            design_suggestions=_fallback_design_suggestions(content),
            generation_source="fallback",
        )


@router.post("/generate-slides", response_model=GenerateSlidesResponse)
def generate_slides(payload: GenerateSlidesRequest) -> GenerateSlidesResponse:
    if not payload.outline:
        raise HTTPException(status_code=422, detail="outline is required")

    topic = _topic_from_outline(payload.outline, payload.content)
    content = payload.content or topic
    batch_size = 3
    slides: list[GeneratedSlide] = []
    ollama_count = 0
    fallback_count = 0

    for start in range(0, len(payload.outline), batch_size):
        batch = payload.outline[start : start + batch_size]
        try:
            batch_slides = _ollama_generate_slide_batch(
                topic=topic,
                content=content,
                batch=batch,
                start_index=start,
                speaker_notes=payload.speaker_notes,
            )
            slides.extend(batch_slides)
            ollama_count += len(batch_slides)
        except Exception as exc:
            print(f"Generate-slides batch {start // batch_size + 1} failed ({exc}); using outline fallback for batch.")
            extras = _slides_from_outline(batch, payload.speaker_notes, content)
            # Re-id with correct global indices
            for i, s in enumerate(extras):
                s.id = f"s{start + i + 1}-{uuid.uuid4().hex[:8]}"
            slides.extend(extras)
            fallback_count += len(extras)

    if not slides:
        return GenerateSlidesResponse(
            slides=_slides_from_outline(payload.outline, payload.speaker_notes, content),
            generation_source="fallback",
        )

    if fallback_count == 0:
        source = "ollama"
    elif ollama_count == 0:
        source = "fallback"
    else:
        source = "mixed"

    return GenerateSlidesResponse(
        slides=slides[: len(payload.outline)],
        generation_source=source,
    )
