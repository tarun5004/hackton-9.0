from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, student, teacher

app = FastAPI(title="College Productivity Dashboard", version="1.0.0")

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(student.router)
app.include_router(teacher.router)


@app.get("/health")
def health():
    return {"status": "ok"}
