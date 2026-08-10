import re
from typing import Dict, Any, List, Optional


def extract_text_from_pdf(filepath: str) -> str:
    """Extract text from a PDF file."""
    try:
        import pdfplumber # type: ignore
        text = ""
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        # Fallback to PyPDF2
        try:
            from PyPDF2 import PdfReader # type: ignore
            reader = PdfReader(filepath)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        except Exception:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")


def extract_text_from_docx(filepath: str) -> str:
    """Extract text from a DOCX file."""
    try:
        from docx import Document # type: ignore
        doc = Document(filepath)
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")


def extract_text(filepath: str, file_type: str) -> str:
    """Extract text from a resume file based on its type."""
    if file_type == "application/pdf":
        return extract_text_from_pdf(filepath)
    elif file_type in [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ]:
        return extract_text_from_docx(filepath)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def extract_email(text: str) -> Optional[str]:
    """Extract email from text."""
    match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text."""
    patterns = [
        r"\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}",
        r"\(\d{3}\)\s*\d{3}[-.\s]?\d{4}",
        r"\d{10,12}",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0).strip()
    return None


def extract_skills(text: str) -> List[str]:
    """Extract skills from resume text using keyword matching."""
    skill_keywords = [
        "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go",
        "rust", "swift", "kotlin", "php", "scala", "r", "matlab", "sql",
        "react", "angular", "vue", "next.js", "node.js", "express", "django",
        "flask", "fastapi", "spring", "rails", "laravel",
        "html", "css", "tailwind", "bootstrap", "sass", "less",
        "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "firebase",
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
        "git", "github", "gitlab", "ci/cd", "jenkins",
        "machine learning", "deep learning", "nlp", "computer vision",
        "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
        "data analysis", "data science", "data engineering",
        "rest api", "graphql", "microservices", "system design",
        "agile", "scrum", "jira", "figma", "sketch",
        "linux", "bash", "powershell",
        "blockchain", "web3", "solidity",
        "unity", "unreal engine",
        "tableau", "power bi", "excel",
        "photoshop", "illustrator", "after effects",
        "communication", "leadership", "problem solving", "teamwork",
        "project management", "critical thinking", "analytical skills",
    ]

    text_lower = text.lower()
    found_skills = []
    for skill in skill_keywords:
        if skill.lower() in text_lower:
            found_skills.append(skill.title() if len(skill) > 2 else skill.upper())

    return list(set(found_skills))


def parse_sections(text: str) -> Dict[str, str]:
    """Split resume text into named sections."""
    section_headers = [
        "summary", "objective", "profile", "about",
        "experience", "work experience", "employment", "work history",
        "education", "academic", "qualifications",
        "skills", "technical skills", "core competencies",
        "projects", "personal projects",
        "certifications", "certificates", "licenses",
        "achievements", "awards", "honors",
        "languages", "interests", "hobbies",
        "references", "publications",
    ]

    sections = {}
    lines = text.split("\n")
    current_section = "header"
    current_content = []

    for line in lines:
        clean_line = line.strip().lower().rstrip(":")
        is_header = any(header in clean_line for header in section_headers) and len(clean_line) < 50

        if is_header:
            if current_content:
                sections[current_section] = "\n".join(current_content).strip()
            current_section = clean_line
            current_content = []
        else:
            current_content.append(line)

    if current_content:
        sections[current_section] = "\n".join(current_content).strip()

    return sections


def parse_resume(filepath: str, file_type: str) -> Dict[str, Any]:
    """Parse a resume and extract structured data."""
    text = extract_text(filepath, file_type)

    if not text or len(text.strip()) < 50:
        raise ValueError("Could not extract sufficient text from the resume")

    sections = parse_sections(text)
    header = sections.get("header", "")

    # Extract name (first non-empty line, likely the name)
    lines = header.split("\n")
    name = None
    for line in lines:
        clean = line.strip()
        if clean and len(clean) > 2 and not re.match(r"[\w.+-]+@", clean) and not re.match(r"\d", clean):
            name = clean
            break

    parsed = {
        "name": name,
        "email": extract_email(text),
        "phone": extract_phone(text),
        "summary": sections.get("summary") or sections.get("objective") or sections.get("profile") or sections.get("about"),
        "skills": extract_skills(text),
        "technologies": extract_skills(text),
        "raw_text": text,
        "education": [],
        "experience": [],
        "projects": [],
        "certifications": [],
        "achievements": [],
        "languages": [],
    }

    # Extract education section
    edu_text = ""
    for key in sections:
        if "education" in key or "academic" in key or "qualification" in key:
            edu_text = sections[key]
            break
    if edu_text:
        parsed["education"] = [{"raw": edu_text}]

    # Extract experience section
    exp_text = ""
    for key in sections:
        if "experience" in key or "employment" in key or "work" in key:
            exp_text = sections[key]
            break
    if exp_text:
        parsed["experience"] = [{"raw": exp_text}]

    # Extract projects
    proj_text = ""
    for key in sections:
        if "project" in key:
            proj_text = sections[key]
            break
    if proj_text:
        parsed["projects"] = [{"raw": proj_text}]

    # Extract certifications
    cert_text = ""
    for key in sections:
        if "certif" in key or "license" in key:
            cert_text = sections[key]
            break
    if cert_text:
        parsed["certifications"] = [cert_text]

    # Extract achievements
    ach_text = ""
    for key in sections:
        if "achieve" in key or "award" in key or "honor" in key:
            ach_text = sections[key]
            break
    if ach_text:
        parsed["achievements"] = [ach_text]

    return parsed
