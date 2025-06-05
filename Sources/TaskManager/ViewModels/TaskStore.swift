import SwiftUI

@MainActor
class TaskStore: ObservableObject {
    // Import TodoTask from Models
    @Published private(set) var tasks: [Models.TodoTask] = []
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
