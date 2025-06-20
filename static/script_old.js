const API_BASE_URL = 'http://localhost:8000/api';

// Global variables
let allTasks = [];
let allCategories = [
    { id: 'work', name: 'Arbeit', color: '#007aff', icon: 'fas fa-briefcase' },
    { id: 'personal', name: 'Persönlich', color: '#34c759', icon: 'fas fa-home' }
];
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
        years: 'Jahr(e)',
        category: 'Kategorie',
        categoryLabel: 'Kategorie:',
        noCategory: 'Keine Kategorie',
        newCategory: '+ Neue Kategorie erstellen',
        allCategories: 'Alle Kategorien',
        createCategory: 'Neue Kategorie erstellen',
        categoryName: 'Name:',
        categoryColor: 'Farbe:',
        categoryIcon: 'Symbol:',
        categoryNameRequired: 'Kategorie-Name ist erforderlich.'
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
const categoryModal = document.getElementById('categoryModal');
const addTaskFab = document.getElementById('addTaskFab');
const closeModal = document.getElementById('closeModal');
const closeCategoryModal = document.getElementById('closeCategoryModal');
const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
const modalTitle = document.getElementById('modalTitle');
const submitBtn = document.getElementById('submitBtn');
const createCategoryBtn = document.getElementById('createCategoryBtn');
const themeToggle = document.getElementById('themeToggle');
const languageToggle = document.getElementById('languageToggle');
const repeatToggle = document.getElementById('repeatToggle');
const repeatOptions = document.getElementById('repeatOptions');
const customRepeat = document.getElementById('customRepeat');
const categoriesList = document.getElementById('categoriesList');
const categorySelector = document.getElementById('categorySelector');
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const categoryManageModal = document.getElementById('categoryManageModal');
const closeCategoryManageModal = document.getElementById('closeCategoryManageModal');
const categoryManageList = document.getElementById('categoryManageList');
const addNewCategoryBtn = document.getElementById('addNewCategoryBtn');

let selectedCategory = null;

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
    
    // Load saved categories
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
        allCategories = JSON.parse(savedCategories);
    }
    
    document.documentElement.setAttribute('data-lang', currentLanguage);
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    updateThemeIcon();
    updateLanguageIndicator();
    updateCategorySidebar();
}

// Save categories to localStorage
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(allCategories));
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
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModalHandler();
        }
    });

    // Category modal controls
    closeCategoryModal.addEventListener('click', closeCategoryModalHandler);
    cancelCategoryBtn.addEventListener('click', closeCategoryModalHandler);
    categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) {
            closeCategoryModalHandler();
        }
    });

    // Form submission
    taskForm.addEventListener('submit', handleFormSubmit);
    document.getElementById('categoryForm').addEventListener('submit', handleCategoryFormSubmit);

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
    // Show the opposite language that user can switch to
    indicator.textContent = currentLanguage === 'de' ? 'EN' : 'DE';
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
    
    // Update form labels dynamically
    const titleLabel = document.querySelector('label[for="title"]');
    if (titleLabel) titleLabel.textContent = currentLanguage === 'de' ? 'Titel' : 'Title';
    
    const descLabel = document.querySelector('label[for="description"]');
    if (descLabel) descLabel.textContent = currentLanguage === 'de' ? 'Beschreibung' : 'Description';
    
    const dueDateLabel = document.querySelector('.form-group label:not([for])');
    if (dueDateLabel) dueDateLabel.textContent = currentLanguage === 'de' ? 'Fälligkeitsdatum' : 'Due Date';
    
    const priorityLabel = document.querySelector('.form-group:nth-last-of-type(2) label');
    if (priorityLabel) priorityLabel.textContent = currentLanguage === 'de' ? 'Wichtigkeit:' : 'Priority:';
    
    // Update priority option labels
    const priorityLabels = document.querySelectorAll('.priority-label span:not(.priority-icon)');
    if (priorityLabels.length >= 3) {
        priorityLabels[0].textContent = currentLanguage === 'de' ? 'Niedrig' : 'Low';
        priorityLabels[1].textContent = currentLanguage === 'de' ? 'Mittel' : 'Medium';
        priorityLabels[2].textContent = currentLanguage === 'de' ? 'Hoch' : 'High';
    }
    
    // Update repeat toggle label
    const repeatLabel = document.querySelector('.repeat-toggle span:not(.slider)');
    if (repeatLabel) repeatLabel.textContent = currentLanguage === 'de' ? 'Wiederholen' : 'Repeat';
    
    // Update repeat button labels
    const repeatButtons = document.querySelectorAll('.repeat-btn');
    repeatButtons.forEach((btn, index) => {
        const span = btn.querySelector('span');
        if (span) {
            switch (index) {
                case 0:
                    span.textContent = currentLanguage === 'de' ? 'Täglich' : 'Daily';
                    break;
                case 1:
                    span.textContent = currentLanguage === 'de' ? 'Wöchentlich' : 'Weekly';
                    break;
                case 2:
                    span.textContent = currentLanguage === 'de' ? 'Monatlich' : 'Monthly';
                    break;
                case 3:
                    span.textContent = currentLanguage === 'de' ? 'Jährlich' : 'Yearly';
                    break;
                case 4:
                    span.textContent = currentLanguage === 'de' ? 'Eigene' : 'Custom';
                    break;
            }
        }
    });
    
    // Update navigation button labels
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        const filter = btn.dataset.filter;
        switch (filter) {
            case 'open':
                btn.textContent = currentLanguage === 'de' ? 'Offen' : 'Open';
                break;
            case 'completed':
                btn.textContent = currentLanguage === 'de' ? 'Abgeschlossen' : 'Completed';
                break;
            case 'all':
                btn.textContent = currentLanguage === 'de' ? 'Alle' : 'All';
                break;
        }
    });
    
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

// Translate text using LibreTranslate API
async function translateText(text, targetLang) {
    try {
        const response = await fetch("https://libretranslate.com/translate", {
            method: "POST",
            body: JSON.stringify({
                q: text,
                source: "auto",
                target: targetLang,
                format: "text",
                alternatives: 3,
                api_key: ""
            }),
            headers: { "Content-Type": "application/json" }
        });
        
        if (!response.ok) {
            throw new Error('Translation API error');
        }
        
        const data = await response.json();
        return data.translatedText;
    } catch (error) {
        console.error('LibreTranslate API error:', error);
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
    let filteredTasks = tasks;
    
    // Status filter
    switch (currentFilter) {
        case 'open':
            filteredTasks = filteredTasks.filter(task => !task.is_completed);
            break;
        case 'completed':
            filteredTasks = filteredTasks.filter(task => task.is_completed);
            break;
    }
    
    return filteredTasks;
}

// Sort tasks based on current sort option
function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
        if (currentSort === 'date') {
            return new Date(a.due_date) - new Date(b.due_date);
        } else if (currentSort === 'priority') {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        } else if (currentSort === 'category') {
            const aCat = a.category ? allCategories.find(cat => cat.id === a.category)?.name || '' : '';
            const bCat = b.category ? allCategories.find(cat => cat.id === b.category)?.name || '' : '';
            return aCat.localeCompare(bCat);
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
    
    // Get category info
    const category = task.category ? allCategories.find(cat => cat.id === task.category) : null;
    
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
                
                ${category ? `
                    <div class="category-badge" style="background-color: ${category.color};">
                        <i class="${category.icon}"></i>
                        <span>${category.name}</span>
                    </div>
                ` : ''}
                
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                
                <p class="task-due-date ${isOverdue ? 'overdue' : ''}">
                    ${t.due} ${formattedDate} ${isOverdue ? t.overdue : ''}
                </p>
            </div>
            
            <div class="task-actions">
                <span class="task-priority priority-${task.priority}">${priorityLabels[task.priority]}</span>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editTask(${task.id})" title="${t.editReminder}">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTask(${task.id})" title="${t.deleteConfirm}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
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
        updateCategorySelector();
        
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
        updateCategorySelector();
        
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

// Close category modal
function closeCategoryModalHandler() {
    categoryModal.classList.remove('show');
    document.getElementById('categoryForm').reset();
    document.querySelectorAll('.icon-option').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.icon-option').classList.add('active');
}

// Handle category form submission
async function handleCategoryFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('categoryName').value.trim();
    const color = document.getElementById('categoryColor').value;
    const icon = document.querySelector('.icon-option.active').dataset.icon;
    
    if (!name) {
        showError('Kategorie-Name ist erforderlich.');
        return;
    }
    
    const newCategory = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        color: color,
        icon: icon
    };
    
    // Add new category to the list
    allCategories.push(newCategory);
    
    // Save categories to localStorage
    saveCategories();
    
    // Update category selects
    updateCategorySelects();
    
    // Close the modal
    closeCategoryModalHandler();
    
    // Update all category displays
    updateCategorySidebar();
    updateCategorySelector();
}

// DOM Elements for Categories
const categoriesList = document.getElementById('categoriesList');
const categorySelector = document.getElementById('categorySelector');
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const categoryManageModal = document.getElementById('categoryManageModal');
const closeCategoryManageModal = document.getElementById('closeCategoryManageModal');
const categoryManageList = document.getElementById('categoryManageList');
const addNewCategoryBtn = document.getElementById('addNewCategoryBtn');

let selectedCategory = null;

// Update category sidebar
function updateCategorySidebar() {
    categoriesList.innerHTML = `
        <div class="category-item all-categories ${!selectedCategory ? 'active' : ''}" data-category="">
            <i class="fas fa-layer-group"></i>
            <span class="category-name">${currentLanguage === 'de' ? 'Alle Kategorien' : 'All Categories'}</span>
        </div>
        ${allCategories.map(cat => `
            <div class="category-item ${selectedCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
                <div class="category-icon" style="background-color: ${cat.color}">
                    <i class="${cat.icon}" style="color: white"></i>
                </div>
                <span class="category-name">${cat.name}</span>
            </div>
        `).join('')}
    `;

    // Add click handlers
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            selectedCategory = item.dataset.category;
            updateCategorySidebar();
            displayTasks();
        });
    });
}

// Update visual category selector in task form
function updateCategorySelector() {
    const taskCategory = editingTaskId ? allTasks.find(t => t.id === editingTaskId)?.category : null;
    
    categorySelector.innerHTML = `
        <div class="category-option ${!taskCategory ? 'active' : ''}" data-category="">
            <i class="fas fa-times"></i>
            <span class="category-name">${currentLanguage === 'de' ? 'Keine Kategorie' : 'No Category'}</span>
        </div>
        ${allCategories.map(cat => `
            <div class="category-option ${taskCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
                <div class="category-icon" style="background-color: ${cat.color}">
                    <i class="${cat.icon}" style="color: white"></i>
                </div>
                <span class="category-name">${cat.name}</span>
            </div>
        `).join('')}
        <div class="add-category-option" id="addCategoryBtn">
            <i class="fas fa-plus"></i>
            <span>${currentLanguage === 'de' ? 'Neue Kategorie' : 'New Category'}</span>
        </div>
    `;

    // Add click handlers
    document.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.category-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        categoryModal.classList.add('show');
    });
}

// Update category management list
function updateCategoryManageList() {
    categoryManageList.innerHTML = allCategories.map(cat => `
        <div class="category-manage-item">
            <div class="category-icon" style="background-color: ${cat.color}">
                <i class="${cat.icon}" style="color: white"></i>
            </div>
            <span class="category-name">${cat.name}</span>
            <div class="category-manage-actions">
                <button class="category-manage-btn category-edit-btn" data-category="${cat.id}">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="category-manage-btn category-delete-btn" data-category="${cat.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Add click handlers for edit and delete buttons
    document.querySelectorAll('.category-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = allCategories.find(c => c.id === btn.dataset.category);
            if (category) {
                editCategory(category);
            }
        });
    });

    document.querySelectorAll('.category-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = allCategories.find(c => c.id === btn.dataset.category);
            if (category && confirm(currentLanguage === 'de' ? 
                `Möchten Sie die Kategorie "${category.name}" wirklich löschen?` : 
                `Are you sure you want to delete the category "${category.name}"?`)) {
                deleteCategory(category.id);
            }
        });
    });
}

// Edit category
function editCategory(category) {
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryColor').value = category.color;
    document.querySelectorAll('.icon-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.icon === category.icon);
    });
    
    categoryModal.classList.add('show');
    categoryManageModal.classList.remove('show');
}

// Delete category
function deleteCategory(categoryId) {
    allCategories = allCategories.filter(c => c.id !== categoryId);
    saveCategories();
    
    // Update tasks that used this category
    allTasks.forEach(task => {
        if (task.category === categoryId) {
            task.category = null;
        }
    });
    
    updateCategorySidebar();
    updateCategoryManageList();
    displayTasks();
}

// Event Listeners for Category Management
manageCategoriesBtn.addEventListener('click', () => {
    categoryManageModal.classList.add('show');
    updateCategoryManageList();
});

closeCategoryManageModal.addEventListener('click', () => {
    categoryManageModal.classList.remove('show');
});

addNewCategoryBtn.addEventListener('click', () => {
    categoryModal.classList.add('show');
    categoryManageModal.classList.remove('show');
});


// Get selected category from visual selector
function getSelectedCategory() {
    const activeOption = document.querySelector('.category-option.active');
    return activeOption ? activeOption.dataset.category : '';
}

// Initialize categories
document.addEventListener('DOMContentLoaded', function() {
    updateCategorySidebar();
    updateCategorySelector();
});

// Handle color preset selection
document.querySelectorAll('.color-preset').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('categoryColor').value = btn.dataset.color;
        document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Handle icon selection
document.querySelectorAll('.icon-option').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.icon-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

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
        category: getSelectedCategory() || null,
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
