/**
 * Client-side ATS (Applicant Tracking System) Score Engine
 * 
 * Evaluates a resume draft JSON across 7 weighted criteria and returns
 * section-level scores, feedback tips, and an overall weighted score.
 * Runs entirely in the browser — no API calls needed.
 */

const ACTION_VERBS = [
  'achieved', 'accomplished', 'accelerated', 'administered', 'analyzed', 'built',
  'championed', 'collaborated', 'consolidated', 'contributed', 'coordinated', 'created',
  'delivered', 'designed', 'developed', 'directed', 'drove', 'engineered', 'established',
  'executed', 'expanded', 'facilitated', 'formulated', 'generated', 'grew', 'headed',
  'identified', 'implemented', 'improved', 'increased', 'influenced', 'initiated',
  'innovated', 'integrated', 'launched', 'led', 'managed', 'mentored', 'modernized',
  'negotiated', 'optimized', 'orchestrated', 'organized', 'overhauled', 'oversaw',
  'partnered', 'pioneered', 'planned', 'produced', 'reduced', 'reengineered',
  'resolved', 'restructured', 'revamped', 'scaled', 'simplified', 'spearheaded',
  'streamlined', 'strengthened', 'supervised', 'surpassed', 'transformed', 'utilized',
];

const QUANTIFIABLE_PATTERNS = /\d+%|\$[\d,]+|\d+\+?\s*(users|clients|team|members|projects|people|customers|employees|reports|applications|years|months)/i;

const SECTION_WEIGHTS = {
  contact_info: 0.10,
  summary: 0.15,
  experience: 0.25,
  education: 0.10,
  skills: 0.15,
  projects: 0.10,
  formatting: 0.15,
};

/**
 * Evaluate the entire resume draft and return scores.
 * @param {Object} draft - The resume draft JSON object
 * @param {string} targetRole - The target role for keyword matching
 * @returns {Object} { overall, sections: { [name]: { score, status, tips, label } } }
 */
export function evaluateResume(draft, targetRole = '') {
  if (!draft) {
    return getEmptyScore();
  }

  const sections = {
    contact_info: evaluateContactInfo(draft.personal_info),
    summary: evaluateSummary(draft.summary, targetRole),
    experience: evaluateExperience(draft.experience, targetRole),
    education: evaluateEducation(draft.education),
    skills: evaluateSkills(draft.skills, targetRole),
    projects: evaluateProjects(draft.projects),
    formatting: evaluateFormatting(draft),
  };

  // Weighted overall score
  let overall = 0;
  for (const [key, section] of Object.entries(sections)) {
    overall += section.score * (SECTION_WEIGHTS[key] || 0);
  }
  overall = Math.round(overall);

  return { overall, sections };
}

function getEmptyScore() {
  const emptySection = (label) => ({ score: 0, status: 'poor', tips: ['Section is empty'], label });
  return {
    overall: 0,
    sections: {
      contact_info: emptySection('Contact Info'),
      summary: emptySection('Summary'),
      experience: emptySection('Experience'),
      education: emptySection('Education'),
      skills: emptySection('Skills'),
      projects: emptySection('Projects'),
      formatting: emptySection('Formatting'),
    },
  };
}

function getStatus(score) {
  if (score >= 71) return 'good';
  if (score >= 41) return 'fair';
  return 'poor';
}

// ─── CONTACT INFO (10%) ─────────────────────────────────────────
function evaluateContactInfo(info) {
  const tips = [];
  let score = 0;

  if (!info) {
    return { score: 0, status: 'poor', tips: ['Add your contact information'], label: 'Contact Info' };
  }

  const fields = [
    { key: 'name', label: 'Full name', weight: 30 },
    { key: 'email', label: 'Email address', weight: 25 },
    { key: 'phone', label: 'Phone number', weight: 20 },
    { key: 'location', label: 'Location', weight: 15 },
    { key: 'linkedin', label: 'LinkedIn URL', weight: 10 },
  ];

  for (const field of fields) {
    if (info[field.key] && info[field.key].trim()) {
      score += field.weight;
    } else {
      tips.push(`Add your ${field.label}`);
    }
  }

  if (info.email && !info.email.includes('@')) {
    tips.push('Email appears invalid — ensure it contains @');
    score = Math.max(score - 10, 0);
  }

  if (tips.length === 0) tips.push('Contact info is complete ✓');

  return { score, status: getStatus(score), tips, label: 'Contact Info' };
}

// ─── SUMMARY (15%) ──────────────────────────────────────────────
function evaluateSummary(summary, targetRole) {
  const tips = [];
  let score = 0;

  if (!summary || !summary.trim()) {
    return { score: 0, status: 'poor', tips: ['Add a professional summary'], label: 'Summary' };
  }

  const len = summary.trim().length;

  // Length check (50-300 chars ideal)
  if (len >= 50 && len <= 400) {
    score += 30;
  } else if (len < 50) {
    tips.push('Summary is too short — aim for 50–300 characters');
    score += 10;
  } else {
    tips.push('Summary is too long — keep it concise (under 300 characters)');
    score += 15;
  }

  // Action verbs
  const lowerSummary = summary.toLowerCase();
  const verbCount = ACTION_VERBS.filter(v => lowerSummary.includes(v)).length;
  if (verbCount >= 2) {
    score += 25;
  } else if (verbCount === 1) {
    score += 15;
    tips.push('Use more action verbs in your summary');
  } else {
    tips.push('Add action verbs (e.g., "developed", "led", "optimized")');
    score += 5;
  }

  // Keyword match with target role
  if (targetRole) {
    const roleWords = targetRole.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const matchedWords = roleWords.filter(w => lowerSummary.includes(w));
    const matchRatio = roleWords.length > 0 ? matchedWords.length / roleWords.length : 0;

    if (matchRatio >= 0.5) {
      score += 25;
    } else if (matchRatio > 0) {
      score += 15;
      tips.push('Include more keywords from your target role in the summary');
    } else {
      tips.push('Mention your target role keywords in the summary');
      score += 5;
    }
  } else {
    score += 15; // No target role to match against
  }

  // Completeness bonus
  if (len > 20) score += 20;

  score = Math.min(score, 100);
  if (tips.length === 0) tips.push('Summary is well-written ✓');

  return { score, status: getStatus(score), tips, label: 'Summary' };
}

// ─── EXPERIENCE (25%) ───────────────────────────────────────────
function evaluateExperience(experience, targetRole) {
  const tips = [];
  let score = 0;

  if (!experience || experience.length === 0) {
    return { score: 0, status: 'poor', tips: ['Add at least one work experience entry'], label: 'Experience' };
  }

  // Has entries
  score += 15;

  let totalBullets = 0;
  let actionVerbBullets = 0;
  let quantifiedBullets = 0;
  let filledEntries = 0;

  for (const exp of experience) {
    const hasTitle = exp.title && exp.title.trim();
    const hasCompany = exp.company && exp.company.trim();
    const hasDate = exp.date && exp.date.trim();
    const hasBullets = exp.bullets && exp.bullets.length > 0;

    if (hasTitle && hasCompany) filledEntries++;
    if (!hasTitle) tips.push('Fill in job title for all experience entries');
    if (!hasCompany) tips.push('Fill in company name for all experience entries');
    if (!hasDate) tips.push('Add dates to all experience entries');

    if (hasBullets) {
      for (const bullet of exp.bullets) {
        if (!bullet || !bullet.trim()) continue;
        totalBullets++;
        const lowerBullet = bullet.toLowerCase();
        if (ACTION_VERBS.some(v => lowerBullet.startsWith(v))) {
          actionVerbBullets++;
        }
        if (QUANTIFIABLE_PATTERNS.test(bullet)) {
          quantifiedBullets++;
        }
      }
    }
  }

  // Filled entries
  if (filledEntries === experience.length) {
    score += 15;
  } else {
    score += Math.round((filledEntries / experience.length) * 15);
  }

  // Bullet points
  if (totalBullets >= 3) {
    score += 15;
  } else if (totalBullets > 0) {
    score += 8;
    tips.push('Add more bullet points — aim for 3+ per role');
  } else {
    tips.push('Add bullet points describing your achievements');
  }

  // Action verbs in bullets
  if (totalBullets > 0) {
    const actionRatio = actionVerbBullets / totalBullets;
    if (actionRatio >= 0.6) {
      score += 20;
    } else if (actionRatio >= 0.3) {
      score += 12;
      tips.push('Start more bullets with strong action verbs');
    } else {
      score += 5;
      tips.push('Begin each bullet point with an action verb (e.g., "Developed", "Led")');
    }
  }

  // Quantifiable results
  if (totalBullets > 0) {
    const quantRatio = quantifiedBullets / totalBullets;
    if (quantRatio >= 0.4) {
      score += 20;
    } else if (quantRatio > 0) {
      score += 10;
      tips.push('Add more quantifiable results (numbers, percentages, dollar amounts)');
    } else {
      tips.push('Include measurable achievements (e.g., "Increased revenue by 20%")');
      score += 3;
    }
  }

  // Multiple entries bonus
  if (experience.length >= 2) score += 15;
  else tips.push('Consider adding more work experience entries');

  score = Math.min(score, 100);
  // De-duplicate tips
  const uniqueTips = [...new Set(tips)];
  if (uniqueTips.length === 0) uniqueTips.push('Experience section is strong ✓');

  return { score, status: getStatus(score), tips: uniqueTips, label: 'Experience' };
}

// ─── EDUCATION (10%) ────────────────────────────────────────────
function evaluateEducation(education) {
  const tips = [];
  let score = 0;

  if (!education || education.length === 0) {
    return { score: 0, status: 'poor', tips: ['Add at least one education entry'], label: 'Education' };
  }

  score += 30; // Has entries

  for (const edu of education) {
    const hasDegree = edu.degree && edu.degree.trim();
    const hasInstitution = edu.institution && edu.institution.trim();
    const hasDate = edu.date && edu.date.trim();
    const hasDetails = edu.details && edu.details.trim();

    if (hasDegree) score += 20;
    else tips.push('Add degree name');

    if (hasInstitution) score += 20;
    else tips.push('Add institution name');

    if (hasDate) score += 15;
    else tips.push('Add graduation date');

    if (hasDetails) score += 15;
    else tips.push('Add GPA, honors, or relevant coursework');
  }

  score = Math.min(score, 100);
  const uniqueTips = [...new Set(tips)];
  if (uniqueTips.length === 0) uniqueTips.push('Education section is complete ✓');

  return { score, status: getStatus(score), tips: uniqueTips, label: 'Education' };
}

// ─── SKILLS (15%) ───────────────────────────────────────────────
function evaluateSkills(skills, targetRole) {
  const tips = [];
  let score = 0;

  if (!skills) {
    return { score: 0, status: 'poor', tips: ['Add a skills section'], label: 'Skills' };
  }

  const technical = skills.technical || [];
  const soft = skills.soft || [];

  // Technical skills
  if (technical.length >= 5) {
    score += 35;
  } else if (technical.length >= 3) {
    score += 25;
    tips.push('Add more technical skills (aim for 5+)');
  } else if (technical.length > 0) {
    score += 15;
    tips.push('Add more technical skills relevant to your target role');
  } else {
    tips.push('Add technical skills');
  }

  // Soft skills
  if (soft.length >= 3) {
    score += 25;
  } else if (soft.length > 0) {
    score += 15;
    tips.push('Add more soft skills (e.g., Leadership, Communication)');
  } else {
    tips.push('Add soft skills');
    score += 0;
  }

  // Non-empty skills
  const filledTechnical = technical.filter(s => s && s.trim()).length;
  const filledSoft = soft.filter(s => s && s.trim()).length;
  if (filledTechnical + filledSoft > 0) {
    score += 15;
  }

  // Target role keyword match
  if (targetRole && technical.length > 0) {
    const roleWords = targetRole.toLowerCase().split(/\s+/);
    const techLower = technical.map(s => s.toLowerCase());
    const matched = roleWords.filter(w => techLower.some(t => t.includes(w)));
    if (matched.length > 0) {
      score += 25;
    } else {
      tips.push('Add skills that match your target role keywords');
      score += 5;
    }
  } else {
    score += 10;
  }

  score = Math.min(score, 100);
  if (tips.length === 0) tips.push('Skills section is strong ✓');

  return { score, status: getStatus(score), tips, label: 'Skills' };
}

// ─── PROJECTS (10%) ─────────────────────────────────────────────
function evaluateProjects(projects) {
  const tips = [];
  let score = 0;

  if (!projects || projects.length === 0) {
    return { score: 30, status: 'poor', tips: ['Consider adding projects to showcase your work'], label: 'Projects' };
  }

  score += 30; // Has entries

  for (const proj of projects) {
    const hasName = proj.name && proj.name.trim();
    const hasDesc = proj.description && proj.description.trim();
    const hasTech = proj.technologies && proj.technologies.length > 0;
    const hasUrl = proj.url && proj.url.trim();

    if (hasName) score += 15;
    else tips.push('Add project names');

    if (hasDesc) score += 20;
    else tips.push('Add project descriptions');

    if (hasTech) score += 15;
    else tips.push('List technologies used in projects');

    if (hasUrl) score += 10;
  }

  score = Math.min(score, 100);
  const uniqueTips = [...new Set(tips)];
  if (uniqueTips.length === 0) uniqueTips.push('Projects section is well-documented ✓');

  return { score, status: getStatus(score), tips: uniqueTips, label: 'Projects' };
}

// ─── FORMATTING (15%) ───────────────────────────────────────────
function evaluateFormatting(draft) {
  const tips = [];
  let score = 0;

  // Section completeness — how many major sections are present
  const sections = ['personal_info', 'summary', 'experience', 'education', 'skills'];
  let presentSections = 0;
  for (const section of sections) {
    const val = draft[section];
    if (val && (typeof val === 'string' ? val.trim() : (Array.isArray(val) ? val.length > 0 : Object.keys(val).length > 0))) {
      presentSections++;
    }
  }

  const sectionRatio = presentSections / sections.length;
  if (sectionRatio === 1) {
    score += 40;
  } else if (sectionRatio >= 0.6) {
    score += 25;
    tips.push('Add all core sections (Contact, Summary, Experience, Education, Skills)');
  } else {
    score += 10;
    tips.push('Your resume is missing several important sections');
  }

  // Check for empty strings in experience bullets
  let hasEmptyBullets = false;
  if (draft.experience) {
    for (const exp of draft.experience) {
      if (exp.bullets) {
        for (const b of exp.bullets) {
          if (!b || !b.trim()) {
            hasEmptyBullets = true;
            break;
          }
        }
      }
    }
  }

  if (hasEmptyBullets) {
    tips.push('Remove or fill in empty bullet points');
    score += 5;
  } else {
    score += 20;
  }

  // Date consistency
  let hasDates = true;
  if (draft.experience) {
    for (const exp of draft.experience) {
      if (!exp.date || !exp.date.trim()) hasDates = false;
    }
  }
  if (hasDates) {
    score += 20;
  } else {
    tips.push('Ensure all entries have dates for consistency');
    score += 5;
  }

  // Resume length indicator
  const textLength = JSON.stringify(draft).length;
  if (textLength > 500 && textLength < 8000) {
    score += 20;
  } else if (textLength <= 500) {
    tips.push('Resume content seems too short — add more details');
    score += 5;
  } else {
    tips.push('Resume may be too long — consider condensing');
    score += 10;
  }

  score = Math.min(score, 100);
  if (tips.length === 0) tips.push('Formatting looks ATS-friendly ✓');

  return { score, status: getStatus(score), tips, label: 'Formatting' };
}

export default evaluateResume;
