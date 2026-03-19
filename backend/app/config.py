from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://dev818:dev818pass@localhost:5432/capital818"
    DATABASE_URL_SYNC: str = "postgresql://dev818:dev818pass@localhost:5432/capital818"
    OPENAI_API_KEY: str = ""
    MONDAY_API_TOKEN: str = ""
    MONDAY_PIPELINE_BOARD_ID: str = "18402100042"
    MONDAY_CHECKLIST_BOARD_ID: str = "18402744907"
    SLACK_WEBHOOK_URL: str = ""
    BREVO_API_KEY: str = ""
    BACKEND_PORT: int = 3001
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
