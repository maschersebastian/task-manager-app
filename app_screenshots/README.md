# SwiftUI Task Manager - App Design

Here's a visual guide to the SwiftUI Task Manager app design:

## Main Screen
```
┌─────────────────────────────────────┐
│           Task Manager              │
├─────────────────────────────────────┤
│ [All│Active│Completed│Overdue]      │
├─────────────────────────────────────┤
│ ⭕️ Complete SwiftUI Project       │
│   Due: Tomorrow                     │
│   Priority: High                    │
├─────────────────────────────────────┤
│ ✓ Buy Groceries                    │
│   Due: Today                        │
│   Priority: Medium                  │
├─────────────────────────────────────┤
│ ⭕️ Call Mom                       │
│   Due: 3 hours                      │
│   Priority: Low                     │
└─────────────────────────────────────┘
              [+ Add Task]

## Add/Edit Task Screen
┌─────────────────────────────────────┐
│           Add New Task              │
├─────────────────────────────────────┤
│ Title:                              │
│ [________________________]          │
│                                     │
│ Description:                        │
│ [________________________]          │
│                                     │
│ Due Date:                          │
│ [Date Picker_________________]      │
│                                     │
│ Priority:                          │
│ [Low│Medium│High]                   │
│                                     │
│ [Cancel]                [Save]      │
└─────────────────────────────────────┘

Features shown in the design:
1. Task List Features:
   - Task completion toggle (⭕️/✓)
   - Task title and description
   - Due date with overdue warning
   - Priority indicator with color
   - Swipe-to-delete gesture

2. Filter Bar:
   - All tasks view
   - Active tasks only
   - Completed tasks
   - Overdue tasks

3. Add/Edit Task Form:
   - Title input field
   - Optional description field
   - Due date picker
   - Priority selector
   - Save/Cancel buttons

4. Visual Elements:
   - Priority colors:
     * High: Red
     * Medium: Orange
     * Low: Blue
   - Completion status:
     * Incomplete: Empty circle
     * Complete: Green checkmark
   - Overdue tasks: Red text
```

To see this design in action:
1. Create a new Xcode project
2. Copy the SwiftUITaskManager.swift content into your project
3. Run the app in the iOS Simulator or on a device

The actual app will follow native iOS/macOS design patterns and include smooth animations, proper spacing, and platform-specific UI adjustments.
