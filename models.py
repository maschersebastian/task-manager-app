from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False)
    priority = Column(Enum('low', 'medium', 'high', name='priority_enum'), nullable=False, default='medium')
    repeat_type = Column(String, nullable=True)  # daily, weekly, monthly, yearly, custom
    repeat_interval = Column(Integer, nullable=True)  # for custom repeats
    repeat_unit = Column(String, nullable=True)  # days, weeks, months, years
