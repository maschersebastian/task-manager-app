const API_BASE_URL = 'http://localhost:8000/api';
const GOOGLE_TRANSLATE_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with actual API key

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
        date: 'Datum',
        priority: 'Wichtigkeit',
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
        deleteConfirm: 'Sind Sie sicher, dass Sie diese Erinnerung löschen möchten?',
        repeat: 'Wiederholen',
        daily: 'Täglich',
        weekly: 'Wöchentlich',
        monthly: 'Monatlich',
        yearly: 'Jährlich',
        custom: 'Eigene',
        every: 'Alle',
        days: 'Tag(e)',
        weeks: 'Woche(n)',
        months: 'Monat(e)',
        years: 'Jahr(e)'
    },
    en: {
        title: 'Reminders',
        open: 'Open',
        completed: 'Completed',
        all: 'All',
        date: 'Date',
        priority: 'Priority',
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
        deleteConfirm: 'Are you sure you want to delete this reminder?',
        repeat: 'Repeat',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly',
        custom: 'Custom',
        every: 'Every',
        days: 'Day(s)',
        weeks: 'Week(s)',
        months: 'Month(s)',
        years: 'Year(s)'
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
const themeToggle = document.getElementById('themeToggle');
const languageToggle = document.getElementById('languageToggle');
const repeatToggle = document.getElementById('repeatToggle');
const repeatOptions = document.getElementById('repeatOptions');
const customRepeat = document.getElementById('customRepeat');

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

    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentSort = e.target.dataset.sort;
            updateSortButtons();
            displayTasks();
        });
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

    // Repeat toggle
    repeatToggle.addEventListener('change', (e) => {
        repeatOptions.style.display = e.target.checked ? 'block' : 'none';
    });

    // Repeat buttons
    document.querySelectorAll('.repeat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.repeat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.repeat === 'custom') {
                customRepeat.style.display = 'block';
            } else {
                customRepeat.style.display = 'none';
            }
        });
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && taskModal.classList.contains('show')) {
            closeModalHandler();
        }
    });
}

// Update sort buttons
function updateSortButtons() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-sort="${currentSort}"]`).classList.add('active');
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
    icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-lightbulb';
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
    
    // Update modal titles
    if (editingTaskId) {
        modalTitle.textContent = t.editReminder;
        submitBtn.textContent = t.update;
    } else {
        modalTitle.textContent = t.newReminder;
        submitBtn.textContent = t.create;
    }
    
    // Update placeholders
    document.getElementById('title').placeholder = currentLanguage === 'de' ? 'Erinnerung eingeben...' : 'Enter reminder...';
    document.getElementById('description').placeholder = currentLanguage === 'de' ? 'Optionale Beschreibung...' : 'Optional description...';
    
    // Update custom repeat options
    const customUnitOptions = document.querySelectorAll('#customUnit option');
    customUnitOptions.forEach(option => {
        const textKey = `${currentLanguage === 'de' ? 'de' : 'en'}`;
        if (option.dataset[`text${textKey.charAt(0).toUpperCase() + textKey.slice(1)}`]) {
            option.textContent = option.dataset[`text${textKey.charAt(0).toUpperCase() + textKey.slice(1)}`];
        }
    });
    
    // Redisplay tasks to update language
    displayTasks();
}

// Translate tasks using Google Translate API
async function translateTasks() {
    if (allTasks.length === 0) return;
    
    try {
        const translatedTasks = await Promise.all(allTasks.map(async (task) => {
            const translatedTask = { ...task };
            
            // Translate title
            if (task.title) {
                translatedTask.title = await translateText(task.title, currentLanguage);
            }
            
            // Translate description
            if (task.description) {
                translatedTask.description = await translateText(task.description, currentLanguage);
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

// Translate text using Google Translate API or fallback
async function translateText(text, targetLang) {
    // If Google Translate API key is not set, use simple fallback
    if (GOOGLE_TRANSLATE_API_KEY === 'YOUR_API_KEY_HERE') {
        return await simpleTranslate(text, targetLang);
    }
    
    try {
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                target: targetLang,
                format: 'text'
            })
        });
        
        if (!response.ok) {
            throw new Error('Translation API error');
        }
        
        const data = await response.json();
        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Google Translate API error:', error);
        return await simpleTranslate(text, targetLang);
    }
}

// Simple translation function (fallback)
async function simpleTranslate(text, targetLang) {
    const basicTranslations = {
        'de': {
            'Reminder': 'Erinnerung',
            'Task': 'Aufgabe',
            'important': 'wichtig',
            'urgent': 'dringend',
            'meeting': 'Besprechung',
            'call': 'Anruf',
            'email': 'E-Mail',
            'buy': 'kaufen',
            'work': 'Arbeit',
            'home': 'Zuhause'
        },
        'en': {
            'Erinnerung': 'Reminder',
            'Aufgabe': 'Task',
            'wichtig': 'important',
            'dringend': 'urgent',
            'Besprechung': 'meeting',
            'Anruf': 'call',
            'E-Mail': 'email',
            'kaufen': 'buy',
            'Arbeit': 'work',
            'Zuhause': 'home'
        }
    };
    
    const translations = basicTranslations[targetLang] || {};
    
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
                 onclick="toggleTaskCompletion(${task.id}, ${!task.is_completed})"
                 style="background-color: ${task.is_completed ? 'var(--primary-color)' : 'var(--border-color)'}">
            </div>
            
            <div class="task-content">
                <div class="task-header">
                    <h3 class="task-title ${task.is_completed ? 'completed' : ''}">${escapeHtml(task.title)}</h3>
                </div>
                
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                
                <p class="task-due-date ${isOverdue ? 'overdue' : ''}">
                    ${t.due} ${formattedDate} ${isOverdue ? t.overdue : ''}
                </p>
            </div>
            
            <div class="task-actions">
                <span class="task-priority priority-${task.priority}">${priorityLabels[task.priority]}</span>
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
        
        // Format date and time for inputs
        const dueDate = new Date(task.due_date);
        document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
        document.getElementById('dueTime').value = dueDate.toTimeString().slice(0, 5);
        
        // Handle repeat settings if available
        if (task.repeat_type) {
            repeatToggle.checked = true;
            repeatOptions.style.display = 'block';
            
            document.querySelectorAll('.repeat-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-repeat="${task.repeat_type}"]`).classList.add('active');
            
            if (task.repeat_type === 'custom') {
                customRepeat.style.display = 'block';
                document.getElementById('customInterval').value = task.repeat_interval || 1;
                document.getElementById('customUnit').value = task.repeat_unit || 'days';
            }
        }
    } else {
        modalTitle.textContent = t.newReminder;
        submitBtn.textContent = t.create;
        taskForm.reset();
        document.querySelector('input[name="priority"][value="medium"]').checked = true;
        repeatOptions.style.display = 'none';
        customRepeat.style.display = 'none';
        
        // Set default date to today
        const today = new Date();
        document.getElementById('dueDate').value = today.toISOString().split('T')[0];
        document.getElementById('dueTime').value = '12:00';
    }
    
    taskModal.classList.add('show');
    document.getElementById('title').focus();
}

// Close modal
function closeModalHandler() {
    taskModal.classList.remove('show');
    taskForm.reset();
    editingTaskId = null;
    repeatOptions.style.display = 'none';
    customRepeat.style.display = 'none';
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    const t = translations[currentLanguage];
    
    const dueDateValue = document.getElementById('dueDate').value;
    const dueTimeValue = document.getElementById('dueTime').value;
    
    // Validate and parse the date
    let parsedDate = null;
    if (dueDateValue && dueTimeValue) {
        try {
            parsedDate = new Date(`${dueDateValue}T${dueTimeValue}`);
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

    // Handle repeat settings
    if (repeatToggle.checked) {
        const activeRepeatBtn = document.querySelector('.repeat-btn.active');
        if (activeRepeatBtn) {
            taskData.repeat_type = activeRepeatBtn.dataset.repeat;
            
            if (taskData.repeat_type === 'custom') {
                taskData.repeat_interval = parseInt(document.getElementById('customInterval').value) || 1;
                taskData.repeat_unit = document.getElementById('customUnit').value;
            }
        }
    }

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
