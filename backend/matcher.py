from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

_model = SentenceTransformer("all-MiniLM-L6-v2")

PRIORITY_WEIGHTS = {
    "required": 1.0,
    "preferred": 0.6,
    "nice_to_have": 0.3,
}


def normalize(skill: str) -> str:
    return skill.strip().lower()


def compute_match(resume_skills: list, jd_skills: list):
    """
    resume_skills: List[str]
    jd_skills: List[JDSkill] (objects with .skill and .priority)
    """
    if not jd_skills:
        return {
            "match_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "jd_skills": [],
        }

    resume_set = {normalize(s) for s in resume_skills}

    # Map normalized skill -> (original_name, priority)
    jd_map = {}
    for item in jd_skills:
        norm = normalize(item.skill)
        # if duplicate skill appears with different priority, keep the higher one
        if norm in jd_map:
            existing_priority = jd_map[norm][1]
            if PRIORITY_WEIGHTS.get(item.priority, 0) > PRIORITY_WEIGHTS.get(existing_priority, 0):
                jd_map[norm] = (item.skill, item.priority)
        else:
            jd_map[norm] = (item.skill, item.priority)

    jd_set = set(jd_map.keys())

    # --- Exact keyword match ---
    exact_matches = resume_set & jd_set
    exact_missing = jd_set - resume_set

    # --- Semantic match for non-exact ones ---
    semantic_matched = set()
    if exact_missing and resume_set:
        jd_remaining = list(exact_missing)
        resume_list = list(resume_set)

        jd_embeddings = _model.encode(jd_remaining)
        resume_embeddings = _model.encode(resume_list)

        sims = cosine_similarity(jd_embeddings, resume_embeddings)

        for i, jd_skill in enumerate(jd_remaining):
            max_sim = np.max(sims[i])
            if max_sim >= 0.75:
                semantic_matched.add(jd_skill)

    matched_set = exact_matches | semantic_matched
    missing_set = jd_set - matched_set

    matched_skills = [jd_map[s][0] for s in matched_set]
    missing_skills = [
        {"skill": jd_map[s][0], "priority": jd_map[s][1]} for s in missing_set
    ]
    all_jd_skills = [
        {"skill": jd_map[s][0], "priority": jd_map[s][1]} for s in jd_set
    ]

    # --- Priority-weighted score ---
    total_weight = sum(PRIORITY_WEIGHTS.get(jd_map[s][1], 0.5) for s in jd_set)
    matched_weight = sum(PRIORITY_WEIGHTS.get(jd_map[s][1], 0.5) for s in matched_set)

    final_score = round((matched_weight / total_weight) * 100) if total_weight else 0
    final_score = max(0, min(100, final_score))

    return {
        "match_score": final_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "jd_skills": all_jd_skills,
    }