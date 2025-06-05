, sfrom typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import Task
from schemas import TaskCreate, TaskUpdate, Task as TaskSchema

# Create FastAPI router
router = APIRouter(tags=["tasks"])

# CRUD Functions

def get_tasks(db: Session) -> List[Task]:
    """Get all tasks from the database."""
    return db.query(Task).all()

def get_task_by_id(db: Session, task_id: int) -> Task:
    """Get a single task by ID. Raises HTTPException if not found."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    return task

def create_task(db: Session, task_data: TaskCreate) -> Task:
    """Create a new task in the database."""
    db_task = Task(**task_data.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_update: TaskUpdate) -> Task:
    """Update an existing task. Raises HTTPException if not found."""
    task = get_task_by_id(db, task_id)  # This will raise HTTPException if not found
    
    # Update only the fields that are provided (not None)
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int) -> Task:
    """Delete a task by ID. Raises HTTPException if not found."""
    task = get_task_by_id(db, task_id)  # This will raise HTTPException if not found
    db.delete(task)
    db.commit()
    return task

# API Routes

@router.get("/tasks", response_model=List[TaskSchema])
def read_tasks(db: Session = Depends(get_db)):
    """Get all tasks."""
    return get_tasks(db)

@router.get("/tasks/{task_id}", response_model=TaskSchema)
def read_task(task_id: int, db: Session = Depends(get_db)):
    """Get a single task by ID."""
    return get_task_by_id(db, task_id)

@router.post("/tasks", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
def create_new_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task."""
    return create_task(db, task)

@router.put("/tasks/{task_id}", response_model=TaskSchema)
def update_existing_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """Update an existing task."""
    return update_task(db, task_id, task_update)

@router.delete("/tasks/{task_id}", response_model=TaskSchema)
def delete_existing_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task."""
    return delete_task(db, task_id)
