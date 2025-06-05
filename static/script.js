const API_BASE_URL = 'http://localhost:8000/api';

// Global variables
let allTasks = [];
let currentFilter = 'all';
let currentSort = 'date';
let editingTaskId = null;
let currentLanguage = 'de';
let currentTheme = 'light';

// Translation object
const translations = {
    de: {
        title: 'Erinnerungen',
        open: 'Offen',
        completed: 'Abgeschlossen',
        all: 'Alle',
        sortBy: 'Sortieren nach:',
        sortDate: 'Datum (nächste zuerst)',
        sortPriority: 'Wichtigkeit (wichtigste zuerst)',
        newReminder: 'Neue Erinnerung',
        editReminder: 'Erinnerung bearbeiten',
        titleLabel: 'Titel:',
        descriptionLabel: 'Beschreibung:',
        dueDateLabel: 'Fälligkeitsdatum:',
        priorityLabel: 'Wichtigkeit:',
        priorityLow: 'Niedrig',
        priorityMedium: 'Mittel',
        priorityHigh: 'Hoch',
        cancel: 'Abbrechen',
        save: 'Speichern',
        create: 'Erstellen',
        update: 'Aktualisieren',
        due: 'Fällig:',
        overdue: '(Überfällig!)',
        noTasks: 'Keine Erinnerungen vorhanden',
        noOpenTasks: 'Keine offenen Erinnerungen',
        noCompletedTasks: 'Keine abgeschlossenen Erinnerungen',
        createFirstTask: 'Erstellen Sie Ihre erste Erinnerung mit dem + Button',
        loading: 'Lade Erinnerungen...',
        errorLoading: 'Fehler beim Laden der Erinnerungen',
        errorSaving: 'Fehler beim Speichern der Erinnerung:',
        errorDeleting: 'Fehler beim Löschen der Erinnerung.',
        errorUpdating: 'Fehler beim Aktualisieren der Erinnerung.',
        titleRequired: 'Titel ist erforderlich.',
        dueDateRequired: 'Fälligkeitsdatum ist erforderlich.',
        invalidDate: 'Bitte geben Sie ein gültiges Datum und eine gültige Uhrzeit ein.',
        deleteConfirm: 'Sind Sie sicher, dass Sie diese Erinnerung löschen möchten?'
    },
    en: {
        title: 'Reminders',
        open: 'Open',
        completed: 'Completed',
        all: 'All',
        sortBy: 'Sort by:',
        sortDate: 'Date (nearest first)',
        sortPriority: 'Priority (highest first)',
        newReminder: 'New Reminder',
        editReminder: 'Edit Reminder',
        titleLabel: 'Title:',
        descriptionLabel: 'Description:',
        dueDateLabel: 'Due Date:',
        priorityLabel: 'Priority:',
        priorityLow: 'Low',
        priorityMedium: 'Medium',
        priorityHigh: 'High',
        cancel: 'Cancel',
        save: 'Save',
        create: 'Create',
        update: 'Update',
        due: 'Due:',
        overdue: '(Overdue!)',
        noTasks: 'No reminders available',
        noOpenTasks: 'No open reminders',
        noCompletedTasks: 'No completed reminders',
        createFirstTask: 'Create your first reminder with the + button',
        loading: 'Loading reminders...',
        errorLoading: 'Error loading reminders',
        errorSaving: 'Error saving reminder:',
        errorDeleting: 'Error deleting reminder.',
        errorUpdating: 'Error updating reminder.',
        titleRequired: 'Title is required.',
        dueDateRequired: 'Due date is required.',
        invalidDate: 'Please enter a valid date and time.',
        deleteConfirm: 'Are you sure you want to delete this reminder?'
    }
};

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
const themeToggle = document.getElementById('themeToggle');
const languageToggle = document.getElementById('languageToggle');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
    loadTasks();
    setupEventListeners();
    updateLanguage();
});

// Initialize settings from localStorage
function initializeSettings() {
    currentLanguage = localStorage.getItem('language') || 'de';
    currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-lang', currentLanguage);
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    updateThemeIcon();
    updateLanguageIndicator();
}

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

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Language toggle
    languageToggle.addEventListener('click', toggleLanguage);

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && taskModal.classList.contains('show')) {
            closeModalHandler();
        }
    });
}

// Toggle theme
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

// Update theme icon
function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Toggle language
async function toggleLanguage() {
    currentLanguage = currentLanguage === 'de' ? 'en' : 'de';
    document.documentElement.setAttribute('data-lang', currentLanguage);
    localStorage.setItem('language', currentLanguage);
    updateLanguageIndicator();
    updateLanguage();
    
    // Translate existing tasks
    await translateTasks();
}

// Update language indicator
function updateLanguageIndicator() {
    const indicator = languageToggle.querySelector('.lang-indicator');
    indicator.textContent = currentLanguage.toUpperCase();
}

// Update language in UI
function updateLanguage() {
    const t = translations[currentLanguage];
    
    // Update sort options
    const sortOptions = sortSelect.querySelectorAll('option');
    sortOptions[0].textContent = t.sortDate;
    sortOptions[1].textContent = t.sortPriority;
    
    // Update modal titles
    if (editingTaskId) {
        modalTitle.textContent = t.editReminder;
        submitBtn.textContent = t.update;
    } else {
        modalTitle.textContent = t.newReminder;
        submitBtn.textContent = t.create;
    }
    
    // Redisplay tasks to update language
    displayTasks();
}

// Translate tasks using a simple translation service
async function translateTasks() {
    if (allTasks.length === 0) return;
    
    try {
        // For demo purposes, we'll use a simple translation mapping
        // In a real app, you'd use Google Translate API or similar
        const translatedTasks = await Promise.all(allTasks.map(async (task) => {
            const translatedTask = { ...task };
            
            // Simple translation examples (in real app, use proper translation service)
            if (currentLanguage === 'en') {
                translatedTask.title = await simpleTranslate(task.title, 'de', 'en');
                if (task.description) {
                    translatedTask.description = await simpleTranslate(task.description, 'de', 'en');
                }
            } else {
                translatedTask.title = await simpleTranslate(task.title, 'en', 'de');
                if (task.description) {
                    translatedTask.description = await simpleTranslate(task.description, 'en', 'de');
                }
            }
            
            return translatedTask;
        }));
        
        allTasks = translatedTasks;
        displayTasks();
    } catch (error) {
        console.error('Translation error:', error);
        // If translation fails, just update the display without translation
        displayTasks();
    }
}

// Simple translation function (placeholder - in real app use proper translation service)
async function simpleTranslate(text, from, to) {
    // This is a placeholder function. In a real application, you would:
    // 1. Use Google Translate API
    // 2. Use Microsoft Translator API
    // 3. Use another translation service
    
    // For demo purposes, return original text
    // You could implement basic word replacements here
    const basicTranslations = {
        'de-en': {
            'Erinnerung': 'Reminder',
            'Aufgabe': 'Task',
            'wichtig': 'important',
            'dringend': 'urgent'
        },
        'en-de': {
            'Reminder': 'Erinnerung',
            'Task': 'Aufgabe',
            'important': 'wichtig',
            'urgent': 'dringend'
        }
    };
    
    const translationKey = `${from}-${to}`;
    const translations = basicTranslations[translationKey] || {};
    
    let translatedText = text;
    Object.keys(translations).forEach(key => {
        const regex = new RegExp(key, 'gi');
        translatedText = translatedText.replace(regex, translations[key]);
    });
    
    return translatedText;
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
        const t = translations[currentLanguage];
        taskList.innerHTML = `<div class="loading">${t.errorLoading}</div>`;
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
    const t = translations[currentLanguage];
    const messages = {
        'all': t.noTasks,
        'open': t.noOpenTasks,
        'completed': t.noCompletedTasks
    };
    
    return `
        <div class="empty-state">
            <i class="fas fa-tasks"></i>
            <h3>${messages[currentFilter]}</h3>
            <p>${t.createFirstTask}</p>
        </div>
    `;
}

// Create HTML for a single task
function createTaskHTML(task) {
    const t = translations[currentLanguage];
    const dueDate = new Date(task.due_date);
    const formattedDate = dueDate.toLocaleDateString(currentLanguage === 'de' ? 'de-DE' : 'en-US') + 
                         ' ' + dueDate.toLocaleTimeString(currentLanguage === 'de' ? 'de-DE' : 'en-US', {hour: '2-digit', minute: '2-digit'});
    const isOverdue = dueDate < new Date() && !task.is_completed;
    
    const priorityLabels = {
        'low': t.priorityLow,
        'medium': t.priorityMedium,
        'high': t.priorityHigh
    };
    
    return `
        <div class="task-item ${task.is_completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
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
                    ${t.due} ${formattedDate} ${isOverdue ? t.overdue : ''}
                </p>
            </div>
            
            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="editTask(${task.id})" title="${t.editReminder}">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})" title="${t.deleteConfirm}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
}

// Open modal for adding or editing task
function openModal(task = null) {
    const t = translations[currentLanguage];
    editingTaskId = task ? task.id : null;
    
    if (task) {
        modalTitle.textContent = t.editReminder;
        submitBtn.textContent = t.update;
        
        // Fill form with task data
        document.getElementById('title').value = task.title;
        document.getElementById('description').value = task.description || '';
        document.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;
        
        // Format date for datetime-local input
        const dueDate = new Date(task.due_date);
        const formattedDate = dueDate.toISOString().slice(0, 16);
        document.getElementById('dueDate').value = formattedDate;
    } else {
        modalTitle.textContent = t.newReminder;
        submitBtn.textContent = t.create;
        taskForm.reset();
        document.querySelector('input[name="priority"][value="medium"]').checked = true;
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
    const t = translations[currentLanguage];
    
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
            showError(t.invalidDate);
            return;
        }
    }
    
    const selectedPriority = document.querySelector('input[name="priority"]:checked');
    
    const taskData = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim() || null,
        due_date: parsedDate ? parsedDate.toISOString() : null,
        priority: selectedPriority ? selectedPriority.value : 'medium',
        is_completed: false
    };

    if (!taskData.title) {
        showError(t.titleRequired);
        return;
    }

    if (!taskData.due_date) {
        showError(t.dueDateRequired);
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

        closeModalHandler();
        loadTasks(); // Reload tasks to show the changes
    } catch (error) {
        console.error('Error saving task:', error);
        showError(t.errorSaving + ' ' + error.message);
    }
}

// Toggle task completion status
async function toggleTaskCompletion(taskId, isCompleted) {
    const t = translations[currentLanguage];
    
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
    } catch (error) {
        console.error('Error updating task:', error);
        showError(t.errorUpdating);
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
    const t = translations[currentLanguage];
    
    if (!confirm(t.deleteConfirm)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        loadTasks(); // Reload tasks to remove the deleted one
    } catch (error) {
        console.error('Error deleting task:', error);
        showError(t.errorDeleting);
    }
}

// Utility functions
function showLoading() {
    const t = translations[currentLanguage];
    taskList.innerHTML = `<div class="loading">${t.loading}</div>`;
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
