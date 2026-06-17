import sys
import pdfplumber
from io import BytesIO
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import AnalyzeRequest, AnalysisResult
from skill_extractor import extract_resume_data, extract_jd_data
from matcher import compute_match

app = FastAPI(title="Resume Matcher API")

# Multiprocessing guard for Python 3.14+ reload compatibility
if __name__ != "__main__" and sys.platform == "win32":
    from multiprocessing import set_start_method
    try:
        set_start_method("spawn", force=True)
    except RuntimeError:
        pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        contents = await file.read()
        text = ""
        with pdfplumber.open(BytesIO(contents)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        if not text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from PDF")

        return {"text": text.strip()}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")


@app.post("/analyze", response_model=AnalysisResult)
async def analyze(payload: AnalyzeRequest):
    if not payload.resume_text.strip() or not payload.jd_text.strip():
        raise HTTPException(status_code=400, detail="resume_text and jd_text are required")

    try:
        resume_data = extract_resume_data(payload.resume_text)
        jd_data = extract_jd_data(payload.jd_text)

        match_result = compute_match(resume_data.skills, jd_data.required_skills)

        suggestions = generate_suggestions(match_result["missing_skills"])

        return AnalysisResult(
            match_score=match_result["match_score"],
            matched_skills=match_result["matched_skills"],
            missing_skills=match_result["missing_skills"],
            resume_skills=resume_data.skills,
            jd_skills=match_result["jd_skills"],
            suggestions=suggestions,
            experience_summary=resume_data.experience_summary,
            education_summary=resume_data.education_summary,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


def generate_suggestions(missing_skills: list) -> list:
    if not missing_skills:
        return ["Great match! Your resume covers all key requirements from this job description."]

    # Prioritize suggestions: required first, then preferred, then nice_to_have
    priority_order = {"required": 0, "preferred": 1, "nice_to_have": 2}
    sorted_missing = sorted(missing_skills, key=lambda x: priority_order.get(x["priority"], 3))

    suggestions = []
    top_missing = sorted_missing[:5]
    for item in top_missing:
        skill = item["skill"]
        priority = item["priority"]
        if priority == "required":
            suggestions.append(f"⚠ '{skill}' is a required skill missing from your resume — consider adding relevant experience or projects.")
        elif priority == "preferred":
            suggestions.append(f"'{skill}' is preferred for this role — adding it could strengthen your application.")
        else:
            suggestions.append(f"'{skill}' is a nice-to-have — mention it if you have any exposure.")

    if len(sorted_missing) > 5:
        suggestions.append(f"There are {len(sorted_missing) - 5} more skills in the JD not found in your resume — review the full list above.")

    return suggestions