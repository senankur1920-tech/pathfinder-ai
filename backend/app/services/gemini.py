import json
import logging
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger("app.services.gemini")

# Try to import and initialize Gemini client
genai_available = False
try:
    if settings.GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        genai_available = True
        logger.info("Gemini API configured successfully.")
    else:
        logger.warning("GEMINI_API_KEY not found in configuration. Operating in Mock Mode.")
except Exception as e:
    logger.error(f"Failed to load or configure Gemini API: {str(e)}. Operating in Mock Mode.")

class GeminiService:
    @staticmethod
    def get_model():
        if not genai_available:
            return None
        import google.generativeai as genai
        # Using the standard gemini-1.5-flash for fast and cost-effective responses
        return genai.GenerativeModel("gemini-1.5-flash")

    @classmethod
    def generate_career_recommendations(cls, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Takes student profile metrics and uses Gemini to generate a tailored list of 5 careers.
        """
        prompt = f"""
        You are an expert AI Career Guidance Counselor specializing in the Indian education landscape.
        Analyze the following student profile:
        - Stream: {profile.get('stream', 'PCM')}
        - Current Level: {profile.get('current_level', 'Class 12')}
        - Academic Scores: Class 10: {profile.get('class_10_score', 'N/A')}%, Class 12: {profile.get('class_12_score', 'N/A')}%
        - Interests: {", ".join(profile.get('interests', []))}
        - Income Level: {profile.get('income_range', 'General')}
        - Exam Scores: {json.dumps(profile.get('exam_scores', {}))}
        - Target Career Goals: {profile.get('career_goal', 'N/A')}
        - Preferred Work Style: {profile.get('preferred_work_style', 'collaborative')}

        Based on this profile, recommend exactly 5 viable, high-quality career paths suitable for the Indian job market.
        Provide your response as a JSON array of objects. Do not include any markdown format tags or extra explanations. The response must be pure parseable JSON matching this schema:
        [
          {{
            "id": "unique-slug-like-software-developer",
            "title": "Official Career Name",
            "matchPercentage": 85, // integer percentage 0-100
            "description": "Short description of the career path.",
            "matchReasons": [
              "Reason 1 matching their interests or academic stream",
              "Reason 2 matching their exams or scores"
            ],
            "salaryEntry": "₹X - Y LPA", // entry salary in Indian Rupees LPA
            "salarySenior": "₹A - B LPA", // senior salary
            "demand": "High / Medium / Very High",
            "growth": "+X% YoY",
            "pathway": "Short academic route (e.g. B.Tech CS followed by specialization)",
            "skills": ["Skill 1", "Skill 2", "Skill 3"],
            "category": "tech / medical / commerce / humanities / other"
          }}
        ]
        """

        if genai_available:
            try:
                model = cls.get_model()
                if model:
                    response = model.generate_content(
                        prompt,
                        generation_config={"response_mime_type": "application/json"}
                    )
                    data = json.loads(response.text)
                    if isinstance(data, list):
                        return data
            except Exception as e:
                logger.error(f"Gemini career recommendation failed: {str(e)}. Falling back to mock generator.")

        # Fallback Mock Generator
        return cls._generate_mock_careers(profile)

    @classmethod
    def generate_skill_roadmap(cls, target_career: str, current_skills: List[str]) -> Dict[str, Any]:
        """
        Generates a week-by-week timeline roadmap for a target career and skills list.
        """
        prompt = f"""
        You are a technical mentor and career roadmap designer.
        Design a structured skill roadmap for a student wanting to transition into the career: "{target_career}".
        Their current known skills are: {", ".join(current_skills)}.

        Structure the learning path into 3 phases:
        - Foundations (Weeks 1-4)
        - Core Concepts (Weeks 5-8)
        - Advanced & Projects (Weeks 9-12)

        Return a JSON object exactly matching this schema. The output must be valid, raw JSON without markdown markers:
        {{
          "target_career": "{target_career}",
          "skill_gaps": {{
            "labels": ["Skill A", "Skill B", "Skill C", "Skill D", "Skill E"],
            "current": [20, 30, 10, 40, 50], // scores 0-100 matching current level
            "target": [80, 85, 90, 80, 95]   // target scores for the role
          }},
          "roadmap": {{
            "foundations": {{
              "title": "Phase 1: Foundations",
              "duration": "Weeks 1-4",
              "milestone": "Master core basic tools and architecture",
              "steps": [
                {{
                  "id": "step-1",
                  "title": "Topic Title",
                  "description": "Short explanation of what to learn.",
                  "resources": ["Course link 1 (free)", "Documentation site 2"]
                }}
              ]
            }},
            "core": {{
              "title": "Phase 2: Core Concepts",
              "duration": "Weeks 5-8",
              "milestone": "Build practical projects and deploy structures",
              "steps": []
            }},
            "advanced": {{
              "title": "Phase 3: Advanced & Portfolio",
              "duration": "Weeks 9-12",
              "milestone": "Final portfolio project and interview prep",
              "steps": []
            }}
          }}
        }}
        """

        if genai_available:
            try:
                model = cls.get_model()
                if model:
                    response = model.generate_content(
                        prompt,
                        generation_config={"response_mime_type": "application/json"}
                    )
                    return json.loads(response.text)
            except Exception as e:
                logger.error(f"Gemini skill roadmap generation failed: {str(e)}. Falling back to mock generator.")

        # Fallback Mock Generator
        return cls._generate_mock_roadmap(target_career, current_skills)

    @classmethod
    def get_coach_reply(cls, session_messages: List[Dict[str, str]], student_profile: Optional[Dict[str, Any]] = None) -> str:
        """
        Interacts with the student as a career mentor, using their profile to enrich replies.
        """
        profile_context = ""
        if student_profile:
            profile_context = f"""
            You are speaking with a student named {student_profile.get('name', 'Student')} who is studying in the {student_profile.get('stream', 'PCM')} stream.
            Their interests are {", ".join(student_profile.get('interests', []))}, and they are located in {student_profile.get('state', 'India')}.
            """

        system_instruction = f"""
        You are "PathFinder AI Coach", an empathetic, highly knowledgeable career counselor helping Indian students.
        {profile_context}
        Guide the student politely, discuss entrance exams (JEE, NEET, CUET, etc.), study roadmaps, colleges, and scholarships.
        Keep answers helpful, encouraging, and structured (use bullet points where appropriate).
        """

        # Format conversation messages for Gemini
        chat_contents = []
        chat_contents.append({"role": "user", "parts": [system_instruction]})
        
        # Translate role assistant/user into model/user structure
        for msg in session_messages[-8:]: # Pass last 8 messages for context
            role = "user" if msg["role"] == "user" else "model"
            chat_contents.append({"role": role, "parts": [msg["content"]]})

        if genai_available:
            try:
                model = cls.get_model()
                if model:
                    # Let the model generate response
                    response = model.generate_content(chat_contents)
                    return response.text
            except Exception as e:
                logger.error(f"Gemini chat interaction failed: {str(e)}. Falling back to mock responder.")

        # Fallback Mock Responder
        last_msg = session_messages[-1]["content"].lower() if session_messages else ""
        if "exam" in last_msg or "jee" in last_msg or "neet" in last_msg:
            return "Preparing for entrance exams requires consistency. I suggest focusing on clarifying core NCERT concepts first, practicing previous years' papers, and taking timed mock tests. What specific subject is giving you trouble?"
        return f"That sounds interesting! Based on your profile in the {student_profile.get('stream', 'PCM') if student_profile else 'science'} stream, you have several great opportunities. Would you like to explore specific career paths, colleges, or scholarship options?"

    # MOCK DATA GENERATION FALLBACKS
    @staticmethod
    def _generate_mock_careers(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        stream = profile.get("stream", "pcm").lower()
        if stream == "pcb":
            return [
                {
                    "id": "medical-practitioner",
                    "title": "Medical Practitioner (Doctor)",
                    "matchPercentage": 95,
                    "description": "Diagnose and treat patient illnesses. Work in clinical settings, hospitals, or private practice.",
                    "matchReasons": ["Aligned with PCB stream", "High score in NEET preparations", "Matches interest in biology"],
                    "salaryEntry": "₹8 - 12 LPA",
                    "salarySenior": "₹24 - 50 LPA",
                    "demand": "Very High",
                    "growth": "+15% YoY",
                    "pathway": "MBBS followed by MD/MS specialization",
                    "skills": ["Clinical Diagnosis", "Patient Care", "Medical Ethics", "Pharmacology"],
                    "category": "medical"
                },
                {
                    "id": "biotechnologist",
                    "title": "Biotechnology Researcher",
                    "matchPercentage": 88,
                    "description": "Utilize cellular and biomolecular processes to develop technologies that help improve health and society.",
                    "matchReasons": ["Great match for PCB background", "Interest in laboratory sciences", "Rising market demand in India"],
                    "salaryEntry": "₹4 - 7 LPA",
                    "salarySenior": "₹15 - 30 LPA",
                    "demand": "High",
                    "growth": "+18% YoY",
                    "pathway": "B.Sc/B.Tech Biotechnology followed by M.Sc/M.Tech",
                    "skills": ["Molecular Biology", "Genetic Engineering", "Cell Culture", "Bioinformatics"],
                    "category": "medical"
                }
            ]
        elif stream == "commerce":
            return [
                {
                    "id": "chartered-accountant",
                    "title": "Chartered Accountant (CA)",
                    "matchPercentage": 96,
                    "description": "Handle audit, taxation, financial planning, and corporate strategy for businesses and individuals.",
                    "matchReasons": ["Matches Commerce stream", "Fits strong interest in numbers and finance", "High professional stability"],
                    "salaryEntry": "₹7 - 12 LPA",
                    "salarySenior": "₹25 - 60 LPA",
                    "demand": "Very High",
                    "growth": "+12% YoY",
                    "pathway": "Register with ICAI, clear Foundation, Intermediate, and Final exams",
                    "skills": ["Auditing", "Financial Accounting", "Income Tax Laws", "GST", "Corporate Finance"],
                    "category": "commerce"
                }
            ]
        else: # PCM or NA
            return [
                {
                    "id": "software-engineer",
                    "title": "Software Engineer (Full Stack)",
                    "matchPercentage": 96,
                    "description": "Develop and deploy end-to-end web applications, manage servers, databases, and client interfaces.",
                    "matchReasons": ["Matches interest in coding/software", "Aligned with strong PCM math grades", "Excellent hiring outlook"],
                    "salaryEntry": "₹6 - 12 LPA",
                    "salarySenior": "₹25 - 55 LPA",
                    "demand": "Very High",
                    "growth": "+22% YoY",
                    "pathway": "B.Tech in Computer Science / BCA + MCA",
                    "skills": ["JavaScript/TypeScript", "React", "Node.js", "SQL/NoSQL", "Git"],
                    "category": "tech"
                },
                {
                    "id": "data-scientist",
                    "title": "Data Scientist",
                    "matchPercentage": 90,
                    "description": "Analyze large datasets to discover patterns, build predictive models, and guide corporate strategy.",
                    "matchReasons": ["Matches mathematical stream", "Strong interest in statistics and data systems", "High-paying opportunities"],
                    "salaryEntry": "₹7 - 14 LPA",
                    "salarySenior": "₹30 - 65 LPA",
                    "demand": "Very High",
                    "growth": "+25% YoY",
                    "pathway": "B.Tech CS/Data Science or B.Sc Statistics + MS in Data Science",
                    "skills": ["Python", "SQL", "Machine Learning", "Statistics", "Data Visualization"],
                    "category": "tech"
                }
            ]

    @staticmethod
    def _generate_mock_roadmap(target_career: str, current_skills: List[str]) -> Dict[str, Any]:
        return {
            "target_career": target_career,
            "skill_gaps": {
                "labels": ["System Design", "Cloud Computing", "Testing", "Core Coding", "Frameworks"],
                "current": [30, 20, 40, 70, 50],
                "target": [80, 75, 85, 90, 85]
            },
            "roadmap": {
                "foundations": {
                    "title": "Phase 1: Foundations",
                    "duration": "Weeks 1-4",
                    "milestone": "Master core syntax, OOP rules, and simple algorithms",
                    "steps": [
                        {
                            "id": "step-1",
                            "title": "Fundamentals of Programming",
                            "description": "Understand core structures: variables, loops, conditionals, and standard library methods.",
                            "resources": ["W3Schools Free Classes", "GeeksforGeeks Programming Hub"]
                        },
                        {
                            "id": "step-2",
                            "title": "Object-Oriented Programming (OOP)",
                            "description": "Learn encapsulation, inheritance, polymorphism, and modular architectures.",
                            "resources": ["MDN Documentation", "YouTube CS50 Lectures"]
                        }
                    ]
                },
                "core": {
                    "title": "Phase 2: Core Concepts",
                    "duration": "Weeks 5-8",
                    "milestone": "Build CRUD APIs and connect with database architectures",
                    "steps": [
                        {
                            "id": "step-3",
                            "title": "Database Schema & SQL",
                            "description": "Learn relations, tables, primary keys, index matching, and SELECT queries.",
                            "resources": ["SQLBolt Interactive Course", "Supabase Docs"]
                        }
                    ]
                },
                "advanced": {
                    "title": "Phase 3: Advanced & Portfolio",
                    "duration": "Weeks 9-12",
                    "milestone": "Complete and host a full scale capstone project",
                    "steps": [
                        {
                            "id": "step-4",
                            "title": "Hosting and CI/CD Pipelines",
                            "description": "Configure serverless hooks, connect GitHub Actions, and deploy to Vercel/Railway.",
                            "resources": ["Vercel Deployment Guide", "GitHub Actions Documentation"]
                        }
                    ]
                }
            }
        }
