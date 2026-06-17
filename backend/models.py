from pydantic import BaseModel, Field
from typing import List, Literal

class ResumeData(BaseModel):
    skills: List[str] = Field(description="List of technical and soft skills found in resume")
    experience_summary: str = Field(description="1-2 line summary of work experience")
    education_summary: str = Field(description="1-2 line summary of education")

class JDSkill(BaseModel):
    skill: str = Field(description="Name of the skill/technology")
    priority: Literal["required", "preferred", "nice_to_have"] = Field(
        description="Priority level of this skill based on JD language"
    )

class JDData(BaseModel):
    required_skills: List[JDSkill] = Field(
        description="List of skills/technologies required by the job description, each tagged with a priority level"
    )

class AnalyzeRequest(BaseModel):
    resume_text: str
    jd_text: str

class AnalysisResult(BaseModel):
    match_score: int
    matched_skills: List[str]
    missing_skills: List[dict]  # [{"skill": "...", "priority": "..."}]
    resume_skills: List[str]
    jd_skills: List[dict]  # [{"skill": "...", "priority": "..."}]
    suggestions: List[str]
    experience_summary: str
    education_summary: str