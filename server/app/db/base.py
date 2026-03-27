import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL environment variable is missing!")
    sys.exit(1)

# Ensure psycopg (v3) compatibility
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Mask password for debug logging
masked_url = DATABASE_URL
if "@" in masked_url:
    protocol, rest = masked_url.split("://", 1)
    creds, host_info = rest.split("@", 1)
    if ":" in creds:
        user, _ = creds.split(":", 1)
        masked_url = f"{protocol}://{user}:***@{host_info}"

print(f"🔗 Starting DB setup. Connecting to: {masked_url}")

# Create engine with pool settings
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass
