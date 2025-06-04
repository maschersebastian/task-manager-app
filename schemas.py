from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: datetime
    is_completed: bool = False
    priority: PriorityEnum = PriorityEnum.medium

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    priority: Optional[PriorityEnum] = None

class Task(TaskBase):
    id: int

    class Config:
        orm_mode = True
