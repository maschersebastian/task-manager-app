const API_BASE_URL = 'http://localhost:8000/api';

// Global variables
let allTasks = [];
let currentFilter = 'all';
let currentSort = 'date';
let editingTaskId = null;

// DOM Elements
const taskList = document.getElementById('taskList');
const taskForm = document.getElementById('taskForm');
const taskModal = document.getElementById('taskModal');
const addTaskFab = document.getElementById('addTaskFab');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');
const submitBtn = document.getElementById('submitBtn');
const sortSelect = document.getElementById('sortBy');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setActiveFilter(e.target.dataset.filter);
        });
    });

    // Sort dropdown
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        displayTasks();
    });

    // FAB button
    addTaskFab.addEventListener('click', () => {
        openModal();
    });

    // Modal controls
    closeModal.addEventListener('click', closeModalHandler);
    cancelBtn.addEventListener('click', closeModalHandler);
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModalHandler();
        }
    });

    // Form submission
    taskForm.addEventListener('submit', handleFormSubmit);

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && taskModal.classList.contains('show')) {
            closeModalHandler();
        }
    });
}

// Set active filter
function setActiveFilter(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    displayTasks();
}

// Load all tasks from the API
async function loadTasks() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/tasks`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allTasks = await response.json();
        displayTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        showError('Fehler beim Laden der Erinnerungen. Bitte versuchen Sie es erneut.');
        taskList.innerHTML = '<div class="loading">Fehler beim Laden der Erinnerungen</div>';
    }
}

// Display tasks based on current filter and sort
function displayTasks() {
    let filteredTasks = filterTasks(allTasks);
    let sortedTasks = sortTasks(filteredTasks);
    
    if (sortedTasks.length === 0) {
        taskList.innerHTML = getEmptyStateHTML();
        return;
    }

    const tasksHTML = sortedTasks.map(task => createTaskHTML(task)).join('');
    taskList.innerHTML = tasksHTML;
}

// Filter tasks based on current filter
function filterTasks(tasks) {
    switch (currentFilter) {
        case 'open':
            return tasks.filter(task => !task.is_completed);
        case 'completed':
            return tasks.filter(task => task.is_completed);
        default:
            return tasks;
    }
}

// Sort tasks based on current sort option
function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
        if (currentSort === 'date') {
            return new Date(a.due_date) - new Date(b.due_date);
        } else if (currentSort === 'priority') {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return 0;
    });
}

// Get empty state HTML
function getEmptyStateHTML() {
    const messages = {
        'all': 'Keine Erinnerungen vorhanden',
        'open': 'Keine offenen Erinnerungen',
        'completed': 'Keine abgeschlossenen Erinnerungen'
    };
    
    return `
        <div class="empty-state">
            <i class="fas fa-tasks"></i>
            <h3>${messages[currentFilter]}</h3>
            <p>Erstellen Sie Ihre erste Erinnerung mit dem + Button</p>
        </div>
    `;
}

// Create HTML for a single task
function createTaskHTML(task) {
    const dueDate = new Date(task.due_date);
    const formattedDate = dueDate.toLocaleDateString('de-DE') + ' ' + dueDate.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
    const isOverdue = dueDate < new Date() && !task.is_completed;
    
    const priorityLabels = {
        'low': 'Niedrig',
        'medium': 'Mittel',
        'high': 'Hoch'
    };
    
    return `
        <div class="task-item ${task.is_completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-completion ${task.is_completed ? 'completed' : ''}" 
                 onclick="toggleTaskCompletion(${task.id}, ${!task.is_completed})">
            </div>
            
            <div class="task-content">
                <div class="task-header">
                    <h3 class="task-title ${task.is_completed ? 'completed' : ''}">${escapeHtml(task.title)}</h3>
                    <span class="task-priority priority-${task.priority}">${priorityLabels[task.priority]}</span>
                </div>
                
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                
                <p class="task-due-date ${isOverdue ? 'overdue' : ''}">
                    Fällig: ${formattedDate} ${isOverdue ? '(Überfällig!)' : ''}
                </p>
            </div>
            
            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="editTask(${task.id})" title="Bearbeiten">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})" title="Löschen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
}

// Open modal for adding or editing task
function openModal(task = null) {
    editingTaskId = task ? task.id : null;
    
    if (task) {
        modalTitle.textContent = 'Erinnerung bearbeiten';
        submitBtn.textContent = 'Aktualisieren';
        
        // Fill form with task data
        document.getElementById('title').value = task.title;
        document.getElementById('description').value = task.description || '';
        document.getElementById('priority').value = task.priority;
        
        // Format date for datetime-local input
        const dueDate = new Date(task.due_date);
        const formattedDate = dueDate.toISOString().slice(0, 16);
        document.getElementById('dueDate').value = formattedDate;
    } else {
        modalTitle.textContent = 'Neue Erinnerung';
        submitBtn.textContent = 'Erstellen';
        taskForm.reset();
    }
    
    taskModal.classList.add('show');
    document.getElementById('title').focus();
}

// Close modal
function closeModalHandler() {
    taskModal.classList.remove('show');
    taskForm.reset();
    editingTaskId = null;
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const dueDateValue = document.getElementById('dueDate').value;
    
    // Validate and parse the date
    let parsedDate = null;
    if (dueDateValue) {
        try {
            parsedDate = new Date(dueDateValue);
            if (isNaN(parsedDate.getTime())) {
                throw new Error('Invalid date format');
            }
        } catch (dateError) {
            showError('Bitte geben Sie ein gültiges Datum und eine gültige Uhrzeit ein.');
            return;
        }
    }
    
    const taskData = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim() || null,
        due_date: parsedDate ? parsedDate.toISOString() : null,
        priority: document.getElementById('priority').value,
        is_completed: false
    };

    if (!taskData.title) {
        showError('Titel ist erforderlich.');
        return;
    }

    if (!taskData.due_date) {
        showError('Fälligkeitsdatum ist erforderlich.');
        return;
    }

    try {
        let response;
        if (editingTaskId) {
            // Update existing task
            response = await fetch(`${API_BASE_URL}/tasks/${editingTaskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });
        } else {
            // Create new task
            response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const savedTask = await response.json();
        showSuccess(editingTaskId ? 'Erinnerung erfolgreich aktualisiert!' : 'Erinnerung erfolgreich erstellt!');
        closeModalHandler();
        loadTasks(); // Reload tasks to show the changes
    } catch (error) {
        console.error('Error saving task:', error);
        showError('Fehler beim Speichern der Erinnerung: ' + error.message);
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
        showSuccess(`Erinnerung als ${isCompleted ? 'abgeschlossen' : 'offen'} markiert!`);
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Fehler beim Aktualisieren der Erinnerung.');
        loadTasks(); // Reload to revert any visual changes
    }
}

// Edit task
function editTask(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
        openModal(task);
    }
}

// Delete a task
async function deleteTask(taskId) {
    if (!confirm('Sind Sie sicher, dass Sie diese Erinnerung löschen möchten?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showSuccess('Erinnerung erfolgreich gelöscht!');
        loadTasks(); // Reload tasks to remove the deleted one
    } catch (error) {
        console.error('Error deleting task:', error);
        showError('Fehler beim Löschen der Erinnerung.');
    }
}

// Utility functions
function showLoading() {
    taskList.innerHTML = '<div class="loading">Lade Erinnerungen...</div>';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error');
    existingErrors.forEach(error => error.remove());
    
    // Add error message to body
    document.body.appendChild(errorDiv);
    
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
    
    // Add success message to body
    document.body.appendChild(successDiv);
    
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
