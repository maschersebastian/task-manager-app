import SwiftUI

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
