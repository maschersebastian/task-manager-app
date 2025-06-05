# SwiftUI Task Manager

A simple task management application built with SwiftUI that helps you organize and track your tasks.

## App Design Preview
```
┌─────────────────────────────────────┐
│           Task Manager              │
├─────────────────────────────────────┤
│ [All│Active│Completed│Overdue]      │
├─────────────────────────────────────┤
│ ⭕️ Complete SwiftUI Project       │
│   Due: Tomorrow                     │
│   Priority: High                    │
└─────────────────────────────────────┘
```

[View detailed design documentation](app_screenshots/README.md)

To see an interactive preview of the app design:
1. Open `app_design_preview.html` in your web browser
2. Try clicking the filter buttons, task checkboxes, and add task button
3. This preview demonstrates the look and feel of the actual SwiftUI app

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

## Installation & Testing

1. Create a new Xcode project:
   - Open Xcode
   - Create a new project (File > New > Project)
   - Choose "App" under iOS or macOS
   - Set the interface to "SwiftUI"
   - Choose your target platform (iOS or macOS)

2. Replace the default ContentView.swift with the contents of SwiftUITaskManager.swift

3. Build and run the project in Xcode (⌘R)

## Testing Instructions

To test the key functionality:

1. Launch the app in Xcode's simulator
2. Test adding a new task:
   - Tap the "+" button
   - Fill in task details
   - Save the task
   - Verify it appears in the list

3. Test editing a task:
   - Tap on an existing task
   - Modify its details
   - Save changes
   - Verify changes are reflected

4. Test task completion:
   - Tap the circle button next to a task
   - Verify it's marked as completed
   - Check if it appears in the "Completed" filter

5. Test deleting a task:
   - Swipe left on a task
   - Tap delete
   - Verify it's removed from the list

6. Test persistence:
   - Add some tasks
   - Close and reopen the app
   - Verify tasks are still there

## Converting from Python Version

This SwiftUI version is a direct conversion of the original Python/FastAPI task manager. Key changes include:

1. Replaced SQLite with UserDefaults for persistence
2. Converted REST API endpoints to direct method calls
3. Implemented native SwiftUI views instead of HTML/JS frontend
4. Maintained the same data model structure and functionality

The app provides the same core features as the Python version but with a native macOS/iOS interface.

## Note for Testing

Since this is a SwiftUI app, it needs to be run through Xcode to properly test the functionality. The provided SwiftUITaskManager.swift contains all the necessary code, but it needs to be integrated into an Xcode project for testing and running on simulators or devices.
