
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set"
    )

# Parse the database URL safely
url = make_url(DATABASE_URL)

# Use PyMySQL instead of the default MySQLdb driver
if url.drivername == "mysql":
    url = url.set(drivername="mysql+pymysql")

# Remove SSL parameters that PyMySQL cannot accept as URL query arguments
query_params = dict(url.query)
query_params.pop("ssl-mode", None)
query_params.pop("ssl_mode", None)

url = url.set(query=query_params)

# Configure SSL using the CA certificate, if available
CA_PATH = Path(__file__).resolve().parent / "ca.pem"

connect_args = {}

if url.drivername == "mysql+pymysql" and CA_PATH.exists():
    connect_args["ssl"] = {
        "ca": str(CA_PATH),
        "check_hostname": True,
    }

# Create database engine
engine = create_engine(
    url,
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
