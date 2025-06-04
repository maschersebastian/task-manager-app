const API_BASE_URL = 'http://localhost:8000/api';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    taskForm.addEventListener('submit', handleAddTask);
});

// Load all tasks from the API
async function loadTasks() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/tasks`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        showError('Failed to load tasks. Please try again.');
    }
}

// Display tasks in the UI
function displayTasks(tasks) {
    if (tasks.length === 0) {
        taskList.innerHTML = '<p class="loading">No tasks found. Add your first task above!</p>';
        return;
    }

    const tasksHTML = tasks.map(task => createTaskHTML(task)).join('');
    taskList.innerHTML = tasksHTML;
}

// Create HTML for a single task
function createTaskHTML(task) {
    const dueDate = new Date(task.due_date);
    const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();
    const isOverdue = dueDate < new Date() && !task.is_completed;
    
    return `
        <div class="task-item ${task.is_completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-header">
                <h3 class="task-title ${task.is_completed ? 'completed' : ''}">${escapeHtml(task.title)}</h3>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            
            <div class="checkbox-container">
                <input type="checkbox" ${task.is_completed ? 'checked' : ''} 
                       onchange="toggleTaskCompletion(${task.id}, this.checked)">
                <label>Mark as ${task.is_completed ? 'incomplete' : 'complete'}</label>
            </div>
            
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            
            <p class="task-due-date ${isOverdue ? 'text-danger' : ''}">
                Due: ${formattedDate} ${isOverdue ? '(Overdue!)' : ''}
            </p>
            
            <div class="task-actions">
                <button class="btn-secondary" onclick="editTask(${task.id})">Edit</button>
                <button class="btn-danger" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `;
}

// Handle form submission for adding new task
async function handleAddTask(event) {
    event.preventDefault();
    
    const formData = new FormData(taskForm);
    const dueDateValue = document.getElementById('dueDate').value;
    const taskData = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim() || null,
        due_date: dueDateValue ? new Date(dueDateValue).toISOString() : null,
        priority: document.getElementById('priority').value,
        is_completed: false
    };

    if (!taskData.title) {
        showError('Task title is required.');
        return;
    }

    if (!taskData.due_date) {
        showError('Due date is required.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const newTask = await response.json();
        showSuccess('Task added successfully!');
        taskForm.reset();
        loadTasks(); // Reload tasks to show the new one
    } catch (error) {
        console.error('Error adding task:', error);
        showError('Failed to add task: ' + error.message);
    }
}

// Toggle task completion status
async function toggleTaskCompletion(taskId, isCompleted) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                is_completed: isCompleted
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        loadTasks(); // Reload tasks to reflect the change
        showSuccess(`Task marked as ${isCompleted ? 'completed' : 'incomplete'}!`);
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Failed to update task status.');
        loadTasks(); // Reload to revert the checkbox state
    }
}

// Delete a task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showSuccess('Task deleted successfully!');
        loadTasks(); // Reload tasks to remove the deleted one
    } catch (error) {
        console.error('Error deleting task:', error);
        showError('Failed to delete task.');
    }
}

// Edit task (simplified version - just prompts for new title)
async function editTask(taskId) {
    const newTitle = prompt('Enter new task title:');
    if (!newTitle || !newTitle.trim()) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: newTitle.trim()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showSuccess('Task updated successfully!');
        loadTasks(); // Reload tasks to show the updated title
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Failed to update task.');
    }
}

// Utility functions
function showLoading() {
    taskList.innerHTML = '<p class="loading">Loading tasks...</p>';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error');
    existingErrors.forEach(error => error.remove());
    
    // Insert error message at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    
    // Remove existing success messages
    const existingSuccess = document.querySelectorAll('.success');
    existingSuccess.forEach(success => success.remove());
    
    // Insert success message at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(successDiv, container.firstChild);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
