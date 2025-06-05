import SwiftUI

// MARK: - Models

enum Priority: String, Codable, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    
    var color: Color {
        switch self {
        case .low:
            return .blue
        case .medium:
            return .orange
        case .high:
            return .red
        }
    }
    
    var displayName: String {
        return rawValue.capitalized
    }
}

struct TodoTask: Identifiable, Codable, Equatable {
    let id: UUID
    var title: String
    var description: String?
    var dueDate: Date
    var isCompleted: Bool
    var priority: Priority
    
    init(id: UUID = UUID(), title: String, description: String? = nil, dueDate: Date, isCompleted: Bool = false, priority: Priority = .medium) {
        self.id = id
        self.title = title
        self.description = description
        self.dueDate = dueDate
        self.isCompleted = isCompleted
        self.priority = priority
    }
    
    var isOverdue: Bool {
        return dueDate < Date() && !isCompleted
    }
    
    static func == (lhs: TodoTask, rhs: TodoTask) -> Bool {
        return lhs.id == rhs.id
    }
}

extension TodoTask {
    static let sampleTasks = [
        TodoTask(title: "Complete SwiftUI Project", description: "Finish the task manager app", dueDate: Calendar.current.date(byAdding: .day, value: 2, to: Date()) ?? Date(), priority: .high),
        TodoTask(title: "Buy Groceries", description: "Milk, Bread, Eggs", dueDate: Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date(), priority: .medium),
        TodoTask(title: "Call Mom", dueDate: Calendar.current.date(byAdding: .hour, value: 3, to: Date()) ?? Date(), priority: .low)
    ]
}

// MARK: - TaskStore

class TaskStore: ObservableObject {
    @Published private(set) var tasks: [TodoTask] = []
    private let saveKey = "SavedTasks"
    
    init() {
        loadTasks()
    }
    
    // MARK: - Task Operations
    
    func addTask(_ task: TodoTask) {
        tasks.append(task)
        saveTasks()
    }
    
    func updateTask(_ task: TodoTask) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index] = task
            saveTasks()
        }
    }
    
    func deleteTask(_ task: TodoTask) {
        tasks.removeAll { $0.id == task.id }
        saveTasks()
    }
    
    func toggleCompletion(for task: TodoTask) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            var updatedTask = task
            updatedTask.isCompleted.toggle()
            tasks[index] = updatedTask
            saveTasks()
        }
    }
    
    // MARK: - Persistence
    
    private func saveTasks() {
        if let encoded = try? JSONEncoder().encode(tasks) {
            UserDefaults.standard.set(encoded, forKey: saveKey)
        }
    }
    
    private func loadTasks() {
        if let data = UserDefaults.standard.data(forKey: saveKey),
           let decoded = try? JSONDecoder().decode([TodoTask].self, from: data) {
            tasks = decoded
        } else {
            // Load sample tasks if no saved data
            tasks = TodoTask.sampleTasks
        }
    }
    
    // MARK: - Filtering and Sorting
    
    var incompleteTasks: [TodoTask] {
        tasks.filter { !$0.isCompleted }.sorted { $0.dueDate < $1.dueDate }
    }
    
    var completedTasks: [TodoTask] {
        tasks.filter { $0.isCompleted }.sorted { $0.dueDate < $1.dueDate }
    }
    
    var overdueTasks: [TodoTask] {
        tasks.filter { $0.isOverdue }.sorted { $0.dueDate < $1.dueDate }
    }
}

// MARK: - Views

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
