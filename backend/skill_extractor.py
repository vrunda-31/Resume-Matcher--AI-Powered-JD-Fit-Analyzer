import os
import json
from langchain_groq import ChatGroq
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from models import ResumeData, JDData
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",
    temperature=0,
    model_kwargs={"seed": 42}  # pass seed via model_kwargs for consistency
)

resume_parser = PydanticOutputParser(pydantic_object=ResumeData)
jd_parser = PydanticOutputParser(pydantic_object=JDData)

resume_prompt = PromptTemplate(
    template=(
        "Extract structured information from the following resume text.\n"
        "{format_instructions}\n\n"
        "Resume:\n{resume_text}\n\n"
        "Return ONLY valid JSON, no extra commentary."
    ),
    input_variables=["resume_text"],
    partial_variables={"format_instructions": resume_parser.get_format_instructions()},
)

jd_prompt = PromptTemplate(
    template=(
        "You are analyzing a job description to extract ONLY concrete, testable technical "
        "skills and tools — not benefits, responsibilities, program structure, or soft skills.\n\n"
        "EXTRACT ONLY:\n"
        "- Programming languages (Python, JavaScript, SQL)\n"
        "- Frameworks and libraries (FastAPI, React, LangChain, Next.js)\n"
        "- Tools and platforms (Git, Supabase, Firebase, Replit, Cursor, Lovable)\n"
        "- AI/ML concepts (LLM APIs, RAG, embeddings, vector databases, prompt engineering)\n"
        "- Infrastructure (REST APIs, backend development, databases, CRUD)\n\n"
        "DO NOT EXTRACT:\n"
        "- Job benefits ('mentorship', 'networking', 'workshops', 'full-time roles')\n"
        "- Program structure ('orientation', 'weekly check-ins', 'final presentation')\n"
        "- Generic phrases ('real-world experience', 'best practices', 'problem solving')\n"
        "- Anything with the word 'tools' appended to a non-tool phrase\n"
        "- Soft skills ('communication', 'collaboration', 'ownership mindset')\n\n"
        "PRIORITY RULES:\n"
        "- \"required\": listed under 'Selection Criteria', 'Technical Skills', 'Requirements', "
        "or described as 'must have', 'essential', 'mandatory'\n"
        "- \"preferred\": described as 'preferred', 'should have', or central to daily work\n"
        "- \"nice_to_have\": listed under 'Bonus Skills', 'Good to Have', 'Nice to Have', "
        "or described as 'exposure to', 'familiarity with', 'not mandatory'\n\n"
        "{format_instructions}\n\n"
        "Job Description:\n{jd_text}\n\n"
        "Return ONLY valid JSON, no extra commentary."
    ),
    input_variables=["jd_text"],
    partial_variables={"format_instructions": jd_parser.get_format_instructions()},
)


def _safe_parse(parser, raw_text, fallback):
    try:
        return parser.parse(raw_text)
    except Exception:
        try:
            start = raw_text.find("{")
            end = raw_text.rfind("}") + 1
            cleaned = raw_text[start:end]
            return parser.parse(cleaned)
        except Exception:
            return fallback


def extract_resume_data(resume_text: str) -> ResumeData:
    chain = resume_prompt | llm
    response = chain.invoke({"resume_text": resume_text})
    return _safe_parse(
        resume_parser,
        response.content,
        ResumeData(skills=[], experience_summary="Not available", education_summary="Not available")
    )


def extract_jd_data(jd_text: str) -> JDData:
    chain = jd_prompt | llm
    response = chain.invoke({"jd_text": jd_text})
    return _safe_parse(
        jd_parser,
        response.content,
        JDData(required_skills=[])
    )