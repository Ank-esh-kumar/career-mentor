import re
from typing import List, Optional


def calculate_profile_completion(profile: dict) -> int:
    """Calculate profile completion percentage."""
    fields_weights = {
        "full_name": 10,
        "phone": 5,
        "location": 5,
        "bio": 10,
        "photo_url": 5,
        "education": 15,
        "skills": 15,
        "interests": 5,
        "experience": 15,
        "projects": 5,
        "certifications": 5,
        "career_preferences": 5,
    }

    total = 0
    for field, weight in fields_weights.items():
        value = profile.get(field)
        if value:
            if isinstance(value, list) and len(value) > 0:
                total += weight
            elif isinstance(value, str) and value.strip():
                total += weight

    return min(total, 100)


def sanitize_input(text: str) -> str:
    """Basic input sanitization."""
    if not text:
        return text

    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)

    text = re.sub(r"<[^>]+>", "", text)
    return text.strip()


def validate_url(url: str) -> bool:
    """Validate a URL format."""
    pattern = re.compile(
        r"^https?://"
        r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"
        r"localhost|"
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"
        r"(?::\d+)?"
        r"(?:/?|[/?]\S+)$",
        re.IGNORECASE,
    )
    return bool(pattern.match(url))
