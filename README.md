# SwiftUI Task Manager

A simple task management application built with SwiftUI that helps you organize and track your tasks.

## Features

- Create, read, update, and delete tasks
- Set task priorities (Low, Medium, High)
- Add due dates and descriptions
- Mark tasks as completed
- Filter tasks by status (All, Active, Completed, Overdue)
- Persistent storage using UserDefaults
- Modern SwiftUI interface

## Requirements

- macOS 12.0+ or iOS 15.0+
- Xcode 13.0+
- Swift 5.5+

## Installation

1. Clone this repository
2. Open SwiftUITaskManager.swift in Xcode
3. Build and run the project

## Usage

### Adding a Task
1. Click the "+" button in the toolbar
2. Fill in the task details:
   - Title (required)
   - Description (optional)
   - Due Date
   - Priority (Low, Medium, High)
3. Click "Save"

### Managing Tasks
- Mark tasks as complete by clicking the circle button
- Edit a task by tapping on it
- Delete a task by swiping left
- Filter tasks using the segmented control at the top

### Task Properties
- Title: The name or brief description of the task
- Description: Additional details about the task
- Due Date: When the task needs to be completed
- Priority: Low, Medium, or High
- Status: Complete or Incomplete

## Converting from Python Version

This SwiftUI version is a direct conversion of the original Python/FastAPI task manager. Key changes include:

1. Replaced SQLite with UserDefaults for persistence
2. Converted REST API endpoints to direct method calls
3. Implemented native SwiftUI views instead of HTML/JS frontend
4. Maintained the same data model structure and functionality

The app provides the same core features as the Python version but with a native macOS/iOS interface.
