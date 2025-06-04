from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
import crud
import models

# Create FastAPI app instance
app = FastAPI(
    title="Task Manager API",
    description="A FastAPI-based Task Manager API",
    version="1.0.0"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include routes from crud module
app.include_router(crud.router, prefix="/api")

# Mount static files directory
app.mount("/", StaticFiles(directory="static", html=True), name="static")

# Startup event
@app.on_event("startup")
async def startup():
    # Create database tables (if they don't exist)
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
