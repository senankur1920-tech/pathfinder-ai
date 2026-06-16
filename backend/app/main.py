from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import users, careers, colleges, scholarships, skills, coach, resume

from sqlalchemy import text

# Initialize database tables on startup (creates local SQLite pathfinder.db if absent)
Base.metadata.create_all(bind=engine)

def run_migrations():
    try:
        dialect = engine.dialect.name
        with engine.begin() as conn:
            if dialect == "sqlite":
                result = conn.execute(text("PRAGMA table_info(student_profiles)"))
                columns = [row[1] for row in result.fetchall()]
            else:
                result = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns "
                    "WHERE table_name = 'student_profiles'"
                ))
                columns = [row[0] for row in result.fetchall()]
            
            if columns:
                if "email" not in columns:
                    conn.execute(text("ALTER TABLE student_profiles ADD COLUMN email VARCHAR(255)"))
                    print("Migration: Added email column to student_profiles")
                if "phone" not in columns:
                    conn.execute(text("ALTER TABLE student_profiles ADD COLUMN phone VARCHAR(50)"))
                    print("Migration: Added phone column to student_profiles")
    except Exception as e:
        print(f"Migration warning or check failed: {e}")

run_migrations()

app = FastAPI(
    title="PathFinder AI API",
    description="Python FastAPI backend serving AI career recommendations, college predictions, and scholarship matching.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup CORS to allow Next.js client interactions
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Allow production urls or wildcard for testing
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under version v1 prefix
app.include_router(users.router, prefix="/api/v1")
app.include_router(careers.router, prefix="/api/v1")
app.include_router(colleges.router, prefix="/api/v1")
app.include_router(scholarships.router, prefix="/api/v1")
app.include_router(skills.router, prefix="/api/v1")
app.include_router(coach.router, prefix="/api/v1")
app.include_router(resume.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "PathFinder AI Backend",
        "documentation": "/docs"
    }
