
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set"
    )

# Use PyMySQL instead of the default MySQLdb driver
if DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "mysql://", "mysql+pymysql://", 1
    )

# Configure SSL CA certificate if available
CA_PATH = Path(__file__).resolve().parent / "ca.pem"

connect_args = {}

if DATABASE_URL.startswith("mysql+pymysql://"):
    if CA_PATH.exists():
        connect_args["ssl"] = {
            "ca": str(CA_PATH),
            "check_hostname": True,
        }

# Create database engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
