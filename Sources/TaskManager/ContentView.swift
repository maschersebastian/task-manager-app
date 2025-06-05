import SwiftUI

struct ContentView: View {
    @StateObject private var taskStore = TaskStore()
    @State private var showingAddTask = false
    @State private var selectedFilter: TaskFilter = .all
    
    enum TaskFilter: String, CaseIterable {
        case all = "All"
        case incomplete = "Active"
        case completed = "Completed"
        case overdue = "Overdue"
    }
    
    var filteredTasks: [TodoTask] {
        switch selectedFilter {
        case .all:
            return taskStore.tasks.sorted { $0.dueDate < $1.dueDate }
        case .incomplete:
            return taskStore.incompleteTasks
        case .completed:
            return taskStore.completedTasks
        case .overdue:
            return taskStore.overdueTasks
        }
    }
    
    var body: some View {
        NavigationView {
            VStack {
                // Filter Picker
                Picker("Filter", selection: $selectedFilter) {
                    ForEach(TaskFilter.allCases, id: \.self) { filter in
                        Text(filter.rawValue).tag(filter)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                // Task List
                List {
                    ForEach(filteredTasks) { task in
                        TaskRowView(task: task, taskStore: taskStore)
                    }
                    .onDelete(perform: deleteTasks)
                }
                .listStyle(PlainListStyle())
            }
            .navigationTitle("Task Manager")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: {
                        showingAddTask = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddTask) {
                AddTaskView(taskStore: taskStore)
            }
        }
    }
    
    func deleteTasks(offsets: IndexSet) {
        for index in offsets {
            taskStore.deleteTask(filteredTasks[index])
        }
    }
}

struct TaskRowView: View {
    let task: TodoTask
    let taskStore: TaskStore
    @State private var showingEditTask = false
    
    var body: some View {
        HStack {
            // Completion Toggle
            Button(action: {
                taskStore.toggleCompletion(for: task)
            }) {
                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(task.isCompleted ? .green : .gray)
                    .font(.title2)
            }
            .buttonStyle(PlainButtonStyle())
            
            VStack(alignment: .leading, spacing: 4) {
                // Title
                Text(task.title)
                    .font(.headline)
                    .strikethrough(task.isCompleted)
                    .foregroundColor(task.isCompleted ? .gray : .primary)
                
                // Description
                if let description = task.description, !description.isEmpty {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                
                // Due Date and Priority
                HStack {
                    Text(task.dueDate, style: .date)
                        .font(.caption)
                        .foregroundColor(task.isOverdue ? .red : .secondary)
                    
                    if task.isOverdue {
                        Text("(Overdue)")
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                    
                    Spacer()
                    
                    Text(task.priority.displayName)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(task.priority.color.opacity(0.2))
                        .foregroundColor(task.priority.color)
                        .cornerRadius(8)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
        .onTapGesture {
            showingEditTask = true
        }
        .sheet(isPresented: $showingEditTask) {
            EditTaskView(task: task, taskStore: taskStore)
        }
    }
}

struct AddTaskView: View {
    @Environment(\.presentationMode) var presentationMode
    let taskStore: TaskStore
    
    @State private var title = ""
    @State private var description = ""
    @State private var dueDate = Date()
    @State private var priority: Priority = .medium
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Task Details")) {
                    TextField("Title", text: $title)
                    TextField("Description (Optional)", text: $description)
                }
                
                Section(header: Text("Due Date")) {
                    DatePicker("Due Date", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                }
                
                Section(header: Text("Priority")) {
                    Picker("Priority", selection: $priority) {
                        ForEach(Priority.allCases, id: \.self) { priority in
                            Text(priority.displayName).tag(priority)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
            }
            .navigationTitle("Add Task")
            .toolbar {
                ToolbarItemGroup(placement: .automatic) {
                    HStack {
                        Button("Cancel") {
                            presentationMode.wrappedValue.dismiss()
                        }
                        Spacer()
                        Button("Save") {
                            saveTask()
                        }
                        .disabled(title.isEmpty)
                    }
                }
            }
        }
    }
    
    private func saveTask() {
        let newTask = TodoTask(
            title: title,
            description: description.isEmpty ? nil : description,
            dueDate: dueDate,
            priority: priority
        )
        taskStore.addTask(newTask)
        presentationMode.wrappedValue.dismiss()
    }
}

struct EditTaskView: View {
    @Environment(\.presentationMode) var presentationMode
    let task: TodoTask
    let taskStore: TaskStore
    
    @State private var title: String
    @State private var description: String
    @State private var dueDate: Date
    @State private var priority: Priority
    @State private var isCompleted: Bool
    
    init(task: TodoTask, taskStore: TaskStore) {
        self.task = task
        self.taskStore = taskStore
        self._title = State(initialValue: task.title)
        self._description = State(initialValue: task.description ?? "")
        self._dueDate = State(initialValue: task.dueDate)
        self._priority = State(initialValue: task.priority)
        self._isCompleted = State(initialValue: task.isCompleted)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Task Details")) {
                    TextField("Title", text: $title)
                    TextField("Description (Optional)", text: $description)
                }
                
                Section(header: Text("Due Date")) {
                    DatePicker("Due Date", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                }
                
                Section(header: Text("Priority")) {
                    Picker("Priority", selection: $priority) {
                        ForEach(Priority.allCases, id: \.self) { priority in
                            Text(priority.displayName).tag(priority)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section(header: Text("Status")) {
                    Toggle("Completed", isOn: $isCompleted)
                }
            }
            .navigationTitle("Edit Task")
            .toolbar {
                ToolbarItemGroup(placement: .automatic) {
                    HStack {
                        Button("Cancel") {
                            presentationMode.wrappedValue.dismiss()
                        }
                        Spacer()
                        Button("Save") {
                            saveTask()
                        }
                        .disabled(title.isEmpty)
                    }
                }
            }
        }
    }
    
    private func saveTask() {
        let updatedTask = TodoTask(
            id: task.id,
            title: title,
            description: description.isEmpty ? nil : description,
            dueDate: dueDate,
            isCompleted: isCompleted,
            priority: priority
        )
        taskStore.updateTask(updatedTask)
        presentationMode.wrappedValue.dismiss()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
