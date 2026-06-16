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
        income = profile.get("income_range", "3_6").lower()

        if stream == "pcb":
            return [
                {
                    "id": "govt-pharmacist",
                    "title": "Government Pharmacist",
                    "matchPercentage": 92,
                    "description": "Work in government hospitals or Primary Health Centres (PHCs) dispensing medicines. Stable government job with pension benefits. Very achievable with D.Pharm or B.Pharm degree.",
                    "matchReasons": ["PCB stream is perfect fit", "Government job security with pension", "Affordable D.Pharm course available in every state"],
                    "salaryEntry": "Rs 2.5 - 4 LPA",
                    "salarySenior": "Rs 6 - 10 LPA (with govt increments)",
                    "demand": "High",
                    "growth": "+10% YoY",
                    "pathway": "D.Pharm (2 years) or B.Pharm (4 years) -> Govt Pharmacist Exam -> Posting",
                    "skills": ["Pharmacology", "Drug Dispensing", "Patient Counseling", "Inventory Management"],
                    "category": "medical"
                },
                {
                    "id": "lab-technician",
                    "title": "Medical Lab Technician (DMLT)",
                    "matchPercentage": 88,
                    "description": "Conduct blood tests, X-rays, and pathology work in hospitals and diagnostic labs. High demand in tier-2/3 cities. Short course, quick job placement.",
                    "matchReasons": ["Biology background ideal", "Short 2-year diploma course", "Can start earning quickly", "Growing demand in every city"],
                    "salaryEntry": "Rs 1.8 - 3 LPA",
                    "salarySenior": "Rs 5 - 8 LPA",
                    "demand": "Very High",
                    "growth": "+14% YoY",
                    "pathway": "DMLT Diploma (2 years) -> Hospital/Lab placement -> B.Sc MLT for growth",
                    "skills": ["Blood Testing", "Microscopy", "Sample Collection", "Report Generation"],
                    "category": "medical"
                },
                {
                    "id": "nursing-officer",
                    "title": "Nursing Officer (Staff Nurse)",
                    "matchPercentage": 90,
                    "description": "Work in government/private hospitals as a nursing professional. One of the most in-demand healthcare jobs in India. Can also work abroad (Gulf, UK, Australia) for higher pay.",
                    "matchReasons": ["PCB stream direct entry", "Huge demand in India and abroad", "Government nursing jobs available through AIIMS, Railway exams"],
                    "salaryEntry": "Rs 2.5 - 4.5 LPA",
                    "salarySenior": "Rs 6 - 15 LPA (abroad: Rs 20-40 LPA)",
                    "demand": "Very High",
                    "growth": "+18% YoY",
                    "pathway": "B.Sc Nursing (4 years) -> AIIMS/State Nursing Exam -> Government or Private Hospital",
                    "skills": ["Patient Care", "Clinical Skills", "Emergency Response", "Medical Documentation"],
                    "category": "medical"
                },
                {
                    "id": "medical-representative",
                    "title": "Medical Representative (MR)",
                    "matchPercentage": 85,
                    "description": "Promote medicines to doctors and hospitals on behalf of pharma companies. Great entry-level job for PCB students. Good incentives and travel allowances.",
                    "matchReasons": ["Biology knowledge gives edge", "No entrance exam needed", "Quick hiring after B.Sc/B.Pharm", "Good incentive-based earnings"],
                    "salaryEntry": "Rs 2.5 - 4 LPA + incentives",
                    "salarySenior": "Rs 8 - 15 LPA (as Area Manager)",
                    "demand": "High",
                    "growth": "+12% YoY",
                    "pathway": "Any Science Graduate -> Join pharma company as MR -> Grow to Area/Regional Manager",
                    "skills": ["Product Knowledge", "Doctor Relationship", "Sales Skills", "Territory Management"],
                    "category": "medical"
                },
                {
                    "id": "mbbs-doctor",
                    "title": "Doctor (MBBS)",
                    "matchPercentage": 95,
                    "description": "Become a qualified doctor through NEET. Government medical college fees are very affordable (Rs 10K-50K/year). High respect and earning potential. Long course but lifetime career.",
                    "matchReasons": ["Highest career path for PCB", "Govt medical college is affordable", "Lifetime job security", "Very high social respect"],
                    "salaryEntry": "Rs 8 - 12 LPA",
                    "salarySenior": "Rs 25 - 80 LPA (specialist)",
                    "demand": "Very High",
                    "growth": "+15% YoY",
                    "pathway": "NEET -> MBBS (5.5 years) -> MD/MS specialization -> Practice/Hospital",
                    "skills": ["Clinical Diagnosis", "Patient Care", "Medical Ethics", "Research"],
                    "category": "medical"
                }
            ]
        elif stream == "commerce":
            return [
                {
                    "id": "bank-clerk",
                    "title": "Bank Clerk (IBPS/SBI)",
                    "matchPercentage": 90,
                    "description": "Work in public sector banks handling deposits, withdrawals, and customer service. Stable government job with fixed hours, pension, and regular promotions. Lakhs of students appear for this exam every year.",
                    "matchReasons": ["Commerce background is ideal", "Government job with pension", "No coaching needed - self-study works", "Promotion path to PO and Manager"],
                    "salaryEntry": "Rs 2.5 - 3.5 LPA",
                    "salarySenior": "Rs 6 - 12 LPA (as Branch Manager)",
                    "demand": "Very High",
                    "growth": "+8% YoY",
                    "pathway": "Graduate -> Prepare for IBPS Clerk/SBI Clerk -> Clear exam -> Bank posting",
                    "skills": ["Banking Operations", "Customer Service", "Basic Accounting", "Computer Skills"],
                    "category": "commerce"
                },
                {
                    "id": "gst-tax-consultant",
                    "title": "GST & Tax Consultant",
                    "matchPercentage": 88,
                    "description": "Help small businesses and shopkeepers file GST returns and income tax. Huge demand in every city and town. Can work independently from home or a small office.",
                    "matchReasons": ["Commerce knowledge directly applies", "Can start with short course", "Work independently - be your own boss", "Every business needs GST help"],
                    "salaryEntry": "Rs 2 - 4 LPA (employed) / Rs 3-6 LPA (freelance)",
                    "salarySenior": "Rs 8 - 20 LPA (own practice)",
                    "demand": "Very High",
                    "growth": "+20% YoY",
                    "pathway": "B.Com -> GST Practitioner Certificate -> Start practice or join CA firm",
                    "skills": ["GST Filing", "Income Tax", "Tally/Busy Software", "TDS Returns"],
                    "category": "commerce"
                },
                {
                    "id": "accountant",
                    "title": "Accountant / Accounts Executive",
                    "matchPercentage": 86,
                    "description": "Maintain financial records, handle payroll, and manage books for companies. Every company from small shops to MNCs needs accountants. Quick to get hired after B.Com.",
                    "matchReasons": ["Direct match with commerce stream", "Jobs available in every city", "Tally knowledge gets quick placement", "Stable desk job"],
                    "salaryEntry": "Rs 1.8 - 3.5 LPA",
                    "salarySenior": "Rs 6 - 12 LPA (as Finance Manager)",
                    "demand": "High",
                    "growth": "+10% YoY",
                    "pathway": "B.Com -> Learn Tally + Excel -> Join as Accounts Executive -> Grow to Finance Manager",
                    "skills": ["Tally ERP", "Excel", "Financial Statements", "Bank Reconciliation", "Payroll"],
                    "category": "commerce"
                },
                {
                    "id": "insurance-advisor",
                    "title": "Insurance Advisor / Financial Planner",
                    "matchPercentage": 82,
                    "description": "Sell insurance policies (LIC, health insurance) and help families plan their finances. Commission-based but can earn very well with good network. No fixed office needed.",
                    "matchReasons": ["Commerce knowledge helps explain policies", "Low investment to start", "Flexible working hours", "Unlimited earning potential with commissions"],
                    "salaryEntry": "Rs 1.5 - 3 LPA (initial)",
                    "salarySenior": "Rs 8 - 25 LPA (top performers)",
                    "demand": "High",
                    "growth": "+15% YoY",
                    "pathway": "Any Graduate -> IRDA License Exam -> Join LIC/Private Insurer -> Build client base",
                    "skills": ["Sales", "Financial Planning", "Customer Relationship", "Policy Knowledge"],
                    "category": "commerce"
                },
                {
                    "id": "chartered-accountant",
                    "title": "Chartered Accountant (CA)",
                    "matchPercentage": 95,
                    "description": "The gold standard for commerce students. Handle audit, taxation, and financial planning for businesses. Tough exam but very rewarding career. Can be done alongside B.Com to save time.",
                    "matchReasons": ["Best career for commerce toppers", "Extremely high earning potential", "Respected profession", "Can start own practice"],
                    "salaryEntry": "Rs 7 - 12 LPA",
                    "salarySenior": "Rs 25 - 60 LPA",
                    "demand": "Very High",
                    "growth": "+12% YoY",
                    "pathway": "CA Foundation after 12th -> Intermediate -> 3 years Articleship -> CA Final",
                    "skills": ["Auditing", "Taxation", "Financial Accounting", "Corporate Law", "GST"],
                    "category": "commerce"
                }
            ]
        elif stream == "arts":
            return [
                {
                    "id": "ssc-govt-clerk",
                    "title": "SSC Government Clerk (CGL/CHSL)",
                    "matchPercentage": 92,
                    "description": "Work in central government ministries and departments. SSC exams are open to all graduates. Stable job with DA, HRA, pension, and regular promotions.",
                    "matchReasons": ["Open to all graduates including Arts", "Government job security", "Can prepare while studying BA", "Promotions to Section Officer level"],
                    "salaryEntry": "Rs 2.5 - 3.5 LPA",
                    "salarySenior": "Rs 6 - 10 LPA (as Section Officer)",
                    "demand": "Very High",
                    "growth": "+8% YoY",
                    "pathway": "BA/B.Com/B.Sc -> Prepare for SSC CGL/CHSL -> Clear exam -> Central Govt posting",
                    "skills": ["General Knowledge", "English", "Reasoning", "Computer Basics", "Maths"],
                    "category": "humanities"
                },
                {
                    "id": "content-writer",
                    "title": "Content Writer / Copywriter",
                    "matchPercentage": 88,
                    "description": "Write articles, blogs, social media posts, and marketing copy for companies and startups. Can work from home. English skills from Arts stream give a strong advantage.",
                    "matchReasons": ["Arts students have strong language skills", "Work from home possible", "Freelancing potential on Fiverr/Upwork", "Growing digital content demand"],
                    "salaryEntry": "Rs 2 - 4 LPA",
                    "salarySenior": "Rs 8 - 15 LPA (as Content Manager)",
                    "demand": "High",
                    "growth": "+18% YoY",
                    "pathway": "BA English/Journalism -> Build portfolio on Medium/LinkedIn -> Apply to agencies or freelance",
                    "skills": ["Writing", "SEO Basics", "Research", "Social Media", "WordPress"],
                    "category": "humanities"
                },
                {
                    "id": "primary-teacher",
                    "title": "Government School Teacher (TGT/PGT)",
                    "matchPercentage": 90,
                    "description": "Teach in government schools with excellent job security, summer vacations, and pension. Clear CTET/State TET exam after B.Ed. Very respected career especially in smaller towns.",
                    "matchReasons": ["BA + B.Ed is the standard path", "Government job with vacations", "Pension and job security", "High social respect"],
                    "salaryEntry": "Rs 3 - 4.5 LPA",
                    "salarySenior": "Rs 7 - 12 LPA (PGT level)",
                    "demand": "High",
                    "growth": "+10% YoY",
                    "pathway": "BA -> B.Ed (2 years) -> Clear CTET/State TET -> Government school posting",
                    "skills": ["Subject Knowledge", "Classroom Management", "Communication", "Patience"],
                    "category": "humanities"
                },
                {
                    "id": "digital-marketing",
                    "title": "Digital Marketing Executive",
                    "matchPercentage": 85,
                    "description": "Run social media campaigns, Google Ads, and email marketing for businesses. No coding needed. Short certification courses can get you started. Every business is going digital.",
                    "matchReasons": ["No science background needed", "Short 3-6 month course enough", "High demand from small businesses", "Can freelance or work from home"],
                    "salaryEntry": "Rs 2 - 4 LPA",
                    "salarySenior": "Rs 8 - 18 LPA (as Marketing Manager)",
                    "demand": "Very High",
                    "growth": "+25% YoY",
                    "pathway": "Any Graduate -> Google/HubSpot free certifications -> Internship -> Full-time role",
                    "skills": ["Social Media Marketing", "Google Ads", "SEO", "Email Marketing", "Canva"],
                    "category": "humanities"
                },
                {
                    "id": "upsc-civil-services",
                    "title": "UPSC Civil Services (IAS/IPS)",
                    "matchPercentage": 80,
                    "description": "The most prestigious government job in India. Arts/Humanities students historically do very well in UPSC. Requires 1-3 years of dedicated preparation but the reward is unmatched.",
                    "matchReasons": ["Arts subjects are popular UPSC optionals", "Highest government position", "District Collector/SP level authority", "Lifetime respect and security"],
                    "salaryEntry": "Rs 8 - 10 LPA (+ government perks)",
                    "salarySenior": "Rs 18 - 30 LPA (Secretary level)",
                    "demand": "Medium (limited seats)",
                    "growth": "Stable",
                    "pathway": "Any Graduate -> 1-3 years UPSC preparation -> Prelims -> Mains -> Interview -> Training at LBSNAA",
                    "skills": ["Current Affairs", "Essay Writing", "Ethics", "General Studies", "Optional Subject"],
                    "category": "humanities"
                }
            ]
        else:  # PCM or NA
            return [
                {
                    "id": "railway-technician",
                    "title": "Railway Technician / Loco Pilot (RRB)",
                    "matchPercentage": 88,
                    "description": "Work in Indian Railways as a technician or train driver. One of the most popular government jobs for PCM/ITI students. Excellent salary with railway quarters, free travel pass, and medical benefits.",
                    "matchReasons": ["PCM/ITI background qualifies directly", "Government job with full benefits", "Free housing and rail travel", "Huge recruitment drives every year"],
                    "salaryEntry": "Rs 2.5 - 4 LPA",
                    "salarySenior": "Rs 6 - 10 LPA (Senior Loco Pilot)",
                    "demand": "Very High",
                    "growth": "+8% YoY",
                    "pathway": "10th/12th PCM or ITI -> RRB ALP/Technician Exam -> Training -> Posting",
                    "skills": ["Technical Knowledge", "Safety Procedures", "Mechanical Aptitude", "Physical Fitness"],
                    "category": "tech"
                },
                {
                    "id": "electrician-contractor",
                    "title": "Electrical Contractor / Technician",
                    "matchPercentage": 85,
                    "description": "Do electrical wiring, solar panel installation, and maintenance work. With ITI/Diploma, you can get government jobs or start your own contracting business. Solar energy is booming in India.",
                    "matchReasons": ["Physics knowledge directly useful", "ITI/Diploma is affordable", "Can become self-employed", "Solar sector creating new opportunities"],
                    "salaryEntry": "Rs 1.8 - 3 LPA (employed)",
                    "salarySenior": "Rs 6 - 15 LPA (own contractor business)",
                    "demand": "High",
                    "growth": "+15% YoY",
                    "pathway": "ITI Electrician (2 years) or Diploma EE -> Govt job or start own business with contractor license",
                    "skills": ["Wiring", "Circuit Design", "Solar Installation", "Safety Standards", "Estimation"],
                    "category": "tech"
                },
                {
                    "id": "web-developer",
                    "title": "Web Developer / Freelancer",
                    "matchPercentage": 90,
                    "description": "Build websites and apps for businesses. Can learn from free YouTube courses and start freelancing within 6 months. No expensive degree needed - skills matter more than certificates in this field.",
                    "matchReasons": ["Maths background helps with logic", "Can learn for free online", "Work from home possible", "Freelancing on Fiverr/Upwork can start early"],
                    "salaryEntry": "Rs 2.5 - 5 LPA (or Rs 15-30K/month freelancing)",
                    "salarySenior": "Rs 8 - 20 LPA (Full Stack Developer)",
                    "demand": "Very High",
                    "growth": "+22% YoY",
                    "pathway": "Learn HTML/CSS/JS (free) -> Build projects -> Freelance or BCA/B.Tech -> Company placement",
                    "skills": ["HTML/CSS", "JavaScript", "React", "Basic Backend", "GitHub"],
                    "category": "tech"
                },
                {
                    "id": "govt-engineer",
                    "title": "Government Engineer (SSC JE / State PSC)",
                    "matchPercentage": 87,
                    "description": "Work as Junior Engineer in PWD, CPWD, Railways, or State Electricity Board. Stable government job with promotions to Executive Engineer. Diploma holders can also apply for SSC JE.",
                    "matchReasons": ["PCM stream + Diploma/B.Tech qualifies", "Government job with pension", "Diploma holders eligible for SSC JE", "Work-life balance"],
                    "salaryEntry": "Rs 3.5 - 5 LPA",
                    "salarySenior": "Rs 8 - 15 LPA (Executive Engineer)",
                    "demand": "High",
                    "growth": "+10% YoY",
                    "pathway": "Diploma/B.Tech -> SSC JE or State PSC JE Exam -> Government department posting",
                    "skills": ["Engineering Drawing", "Technical Knowledge", "AutoCAD", "Project Management"],
                    "category": "tech"
                },
                {
                    "id": "software-engineer",
                    "title": "Software Engineer (IT Company)",
                    "matchPercentage": 95,
                    "description": "Work at TCS, Infosys, Wipro, or startups building software products. Mass recruitment drives hire thousands of freshers every year. B.Tech CS or BCA + MCA both work. Highest paying field for PCM students.",
                    "matchReasons": ["Best career for PCM toppers", "Mass hiring by TCS/Infosys/Wipro", "BCA+MCA is affordable alternative to B.Tech", "Remote work options available"],
                    "salaryEntry": "Rs 3.5 - 8 LPA (mass hiring) / Rs 12-25 LPA (product companies)",
                    "salarySenior": "Rs 15 - 50 LPA",
                    "demand": "Very High",
                    "growth": "+22% YoY",
                    "pathway": "B.Tech CS or BCA+MCA -> Campus placement or off-campus drive -> IT company",
                    "skills": ["Java/Python", "Data Structures", "SQL", "Problem Solving", "Communication"],
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
