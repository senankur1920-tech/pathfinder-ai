import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./pathfinder.db"
    SUPABASE_URL: str = "https://rrvisqesjvtixncigrmg.supabase.co"
    SUPABASE_ANON_KEY: str = "sb_publishable_2L_Xf33WTZQ1iJDSEs6-4A_wJl7Q9S2"
    GEMINI_API_KEY: Optional[str] = None
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Email notification config
    SMTP_EMAIL: Optional[str] = None
    SMTP_APP_PASSWORD: Optional[str] = None
    NOTIFY_EMAIL: Optional[str] = None

    # SettingsConfigDict specifies where the env file is loaded from
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
