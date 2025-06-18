const API_BASE_URL = '/api';

// Global variables
let allTasks = [];
let allCategories = [
    { id: 'work', name: 'Arbeit', color: '#007aff', icon: 'fas fa-briefcase' },
    { id: 'personal', name: 'Persönlich', color: '#34c759', icon: 'fas fa-home' }
];
let currentFilter = 'open';
let currentSort = 'date';
let editingTaskId = null;
let currentLanguage = 'de';
let currentTheme = 'light';
let selectedCategory = null;

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
        years: 'Year(s)',
        category: 'Kategorie',
        categoryLabel: 'Kategorie:',
        noCategory: 'No Category',
        newCategory: 'New Category',
        allCategories: 'All Categories',
        createCategory: 'Create Category',
        categoryName: 'Name:',
        categoryColor: 'Color:',
        categoryIcon: 'Icon:',
        categoryNameRequired: 'Category name is required.'
    }
};

// DOM Elements
let taskList, taskForm, taskModal, categoryModal, addTaskFab, closeModal, closeCategoryModal;
let cancelCategoryBtn, modalTitle, submitBtn, createCategoryBtn, themeToggle, languageToggle;
let repeatToggle, repeatOptions, customRepeat, categoriesList, categorySelector;
let manageCategoriesBtn, categoryManageModal, closeCategoryManageModal, categoryManageList, addNewCategoryBtn;
let backgroundModal, backgroundToggle, closeBackgroundModal, backgroundForm, backgroundColorInput, backgroundImageInput, resetBackgroundBtn;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    taskList = document.getElementById('taskList');
    taskForm = document.getElementById('taskForm');
    taskModal = document.getElementById('taskModal');
    categoryModal = document.getElementById('categoryModal');
    addTaskFab = document.getElementById('addTaskFab');
    closeModal = document.getElementById('closeModal');
    closeCategoryModal = document.getElementById('closeCategoryModal');
    cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    modalTitle = document.getElementById('modalTitle');
    submitBtn = document.getElementById('submitBtn');
    createCategoryBtn = document.getElementById('createCategoryBtn');
    themeToggle = document.getElementById('themeToggle');
    languageToggle = document.getElementById('languageToggle');
    repeatToggle = document.getElementById('repeatToggle');
    repeatOptions = document.getElementById('repeatOptions');
    customRepeat = document.getElementById('customRepeat');
    categoriesList = document.getElementById('categoriesList');
    categorySelector = document.getElementById('categorySelector');
    manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    categoryManageModal = document.getElementById('categoryManageModal');
    closeCategoryManageModal = document.getElementById('closeCategoryManageModal');
    categoryManageList = document.getElementById('categoryManageList');
    addNewCategoryBtn = document.getElementById('addNewCategoryBtn');

    // Background customization modal elements
    backgroundModal = document.getElementById('backgroundModal');
    backgroundToggle = document.getElementById('backgroundToggle');
    closeBackgroundModal = document.getElementById('closeBackgroundModal');
    backgroundForm = document.getElementById('backgroundForm');
    backgroundColorInput = document.getElementById('backgroundColor');
    backgroundImageInput = document.getElementById('backgroundImage');
    resetBackgroundBtn = document.getElementById('resetBackgroundBtn');

    console.log('Background elements:', {
        backgroundModal,
        backgroundToggle,
        closeBackgroundModal,
        backgroundForm
    });

    initializeSettings();
    loadTasks();
    setupEventListeners();
    setupBackgroundCustomization();
    updateLanguage();
});

// Initialize settings from localStorage
function initializeSettings() {
    currentLanguage = localStorage.getItem('language') || 'de';
    currentTheme = localStorage.getItem('theme') || 'light';
    currentFilter = 'open'; // Set default filter to 'open'
    
    // Load saved categories
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
        allCategories = JSON.parse(savedCategories);
    }
    
    document.documentElement.setAttribute('data-lang', currentLanguage);
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
    
    updateThemeIcon();
    updateLanguageIndicator();
    updateCategorySidebar();
    
    // Set active filter button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        }
    });
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
            e.preventDefault();
            if (btn.classList.contains('active')) return; // prevent race condition by ignoring clicks on active button
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

    // Category management
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

    // Background toggle
    if (backgroundToggle) {
        backgroundToggle.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Background button clicked!');
            if (backgroundModal) {
                backgroundModal.classList.add('show');
                loadSavedBackgroundSettings();
                updateBackgroundTypeUI(localStorage.getItem('backgroundType') || 'color');
            }
        });
    }

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && taskModal.classList.contains('show')) {
            closeModalHandler();
        }
    });
}

// Setup background customization event listeners and logic
function setupBackgroundCustomization() {
    let currentBgType = localStorage.getItem('backgroundType') || 'color';

    // Open background modal
    if (backgroundToggle) {
        backgroundToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Background toggle clicked');
            if (backgroundModal) {
                console.log('Opening background modal');
                backgroundModal.classList.add('show');
                loadSavedBackgroundSettings();
                updateBackgroundTypeUI(currentBgType);
            } else {
                console.log('Background modal not found');
            }
        });
    } else {
        console.log('Background toggle button not found');
    }

    // Close background modal
    if (closeBackgroundModal) {
        closeBackgroundModal.addEventListener('click', () => {
            if (backgroundModal) {
                backgroundModal.classList.remove('show');
            }
        });
    }

    // Close modal on outside click
    if (backgroundModal) {
        backgroundModal.addEventListener('click', (e) => {
            if (e.target === backgroundModal) {
                backgroundModal.classList.remove('show');
            }
        });
    }

    // Reset background settings
    if (resetBackgroundBtn) {
        resetBackgroundBtn.addEventListener('click', () => {
            currentBgType = 'color';
            
            // Reset to default theme colors
            const isDarkMode = document.body.classList.contains('dark-mode');
            const defaultColor = isDarkMode ? '#1c1c1e' : '#f5f5f7';
            
            applyBackgroundSettings({
                type: 'color',
                color: defaultColor
            });
            
            localStorage.removeItem('backgroundSettings');
            localStorage.removeItem('backgroundType');
            updateBackgroundTypeUI('color');
            
            // Reset active presets
            document.querySelectorAll('.bg-preset, .gradient-preset').forEach(preset => {
                preset.classList.remove('active');
            });
            
            // Set standard as active
            const standardPreset = document.querySelector('.bg-preset.standard');
            if (standardPreset) {
                standardPreset.classList.add('active');
            }
        });
    }

    // Handle background type selection
    document.querySelectorAll('.bg-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.bg-type-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            currentBgType = btn.dataset.type;
            
            // Show/hide options based on type using CSS classes
            const colorOptions = document.getElementById('colorOptions');
            const gradientOptions = document.getElementById('gradientOptions');
            
            if (colorOptions && gradientOptions) {
                if (currentBgType === 'color') {
                    colorOptions.classList.add('active');
                    gradientOptions.classList.remove('active');
                } else if (currentBgType === 'gradient') {
                    colorOptions.classList.remove('active');
                    gradientOptions.classList.add('active');
                }
            }
        });
    });

    // Background color presets
    document.querySelectorAll('.bg-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            document.querySelectorAll('.bg-preset').forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            
            const isDarkMode = document.body.classList.contains('dark-mode');
            const color = isDarkMode ? preset.dataset.dark : preset.dataset.light;
            
            const settings = {
                type: 'color',
                color: color,
                lightColor: preset.dataset.light,
                darkColor: preset.dataset.dark,
                preset: true
            };
            
            applyBackgroundSettings(settings);
            localStorage.setItem('backgroundType', 'color');
            localStorage.setItem('backgroundSettings', JSON.stringify(settings));
        });
    });

    // Gradient presets
    document.querySelectorAll('.gradient-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            document.querySelectorAll('.gradient-preset').forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            
            const isDarkMode = document.body.classList.contains('dark-mode');
            const startColor = isDarkMode ? preset.dataset.darkStart : preset.dataset.lightStart;
            const endColor = isDarkMode ? preset.dataset.darkEnd : preset.dataset.lightEnd;
            
            const settings = {
                type: 'gradient',
                lightStart: preset.dataset.lightStart,
                lightEnd: preset.dataset.lightEnd,
                darkStart: preset.dataset.darkStart,
                darkEnd: preset.dataset.darkEnd,
                preset: true
            };
            
            applyGradientBackground(startColor, endColor);
            localStorage.setItem('backgroundType', 'gradient');
            localStorage.setItem('backgroundSettings', JSON.stringify(settings));
        });
    });


    // Handle background form submission
    backgroundForm.addEventListener('submit', (e) => {
        e.preventDefault();
        backgroundModal.classList.remove('show');
    });

    // Load saved settings on startup
    loadSavedBackgroundSettings();
}

// Load saved background settings
function loadSavedBackgroundSettings() {
    const savedType = localStorage.getItem('backgroundType') || 'color';
    const savedSettings = JSON.parse(localStorage.getItem('backgroundSettings') || '{"type":"color","preset":true,"lightColor":"#f5f5f7","darkColor":"#1c1c1e"}');
    
    updateBackgroundTypeUI(savedType);
    
    // Set active presets based on saved settings
    if (savedSettings.preset) {
        if (savedSettings.type === 'color' && savedSettings.lightColor) {
            const preset = document.querySelector(`.bg-preset[data-light="${savedSettings.lightColor}"]`);
            if (preset) {
                document.querySelectorAll('.bg-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
            }
        } else if (savedSettings.type === 'gradient' && savedSettings.lightStart) {
            const preset = document.querySelector(`.gradient-preset[data-light-start="${savedSettings.lightStart}"]`);
            if (preset) {
                document.querySelectorAll('.gradient-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
            }
        }
    }
    
    // Apply the background based on current theme
    updateBackgroundForTheme();
}

// Update background for current theme
function updateBackgroundForTheme() {
    const savedSettings = JSON.parse(localStorage.getItem('backgroundSettings') || '{"type":"color","preset":true,"lightColor":"#f5f5f7","darkColor":"#1c1c1e"}');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    if (savedSettings.preset) {
        if (savedSettings.type === 'color') {
            const color = isDarkMode ? savedSettings.darkColor : savedSettings.lightColor;
            applyBackgroundSettings({ type: 'color', color: color });
        } else if (savedSettings.type === 'gradient') {
            const startColor = isDarkMode ? savedSettings.darkStart : savedSettings.lightStart;
            const endColor = isDarkMode ? savedSettings.darkEnd : savedSettings.lightEnd;
            applyGradientBackground(startColor, endColor);
        } else if (savedSettings.type === 'image') {
            applyImageBackground(savedSettings.imageName);
        }
    } else {
        applyBackgroundSettings(savedSettings);
    }
}

// Update background type UI
function updateBackgroundTypeUI(type) {
    document.querySelectorAll('.bg-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Show only the options for the selected type using CSS classes
    const colorOptions = document.getElementById('colorOptions');
    const gradientOptions = document.getElementById('gradientOptions');
    
    if (colorOptions && gradientOptions) {
        if (type === 'color') {
            colorOptions.classList.add('active');
            gradientOptions.classList.remove('active');
        } else if (type === 'gradient') {
            colorOptions.classList.remove('active');
            gradientOptions.classList.add('active');
        }
    }
}

// Update gradient preview
function updateGradientPreview() {
    const start = document.getElementById('gradientStart').value;
    const end = document.getElementById('gradientEnd').value;
    const direction = document.getElementById('gradientDirection').value;
    const preview = document.getElementById('gradientPreview');
    
    preview.style.background = `linear-gradient(${direction}, ${start}, ${end})`;
}

// Apply background settings to document body
function applyBackgroundSettings(settings) {
    switch (settings.type) {
        case 'color':
            document.documentElement.style.setProperty('--bg-color', settings.color);
            document.documentElement.style.setProperty('--bg-image', 'none');
            break;
        case 'gradient':
            if (settings.gradient) {
                const { start, end, direction } = settings.gradient;
                document.documentElement.style.setProperty('--bg-color', 'transparent');
                document.documentElement.style.setProperty('--bg-image', `linear-gradient(${direction}, ${start}, ${end})`);
            }
            break;
        case 'image':
            document.documentElement.style.setProperty('--bg-color', 'transparent');
            document.documentElement.style.setProperty('--bg-image', settings.image ? `url('${settings.image}')` : 'none');
            break;
    }
}

// Apply gradient background
function applyGradientBackground(startColor, endColor) {
    const gradient = `linear-gradient(135deg, ${startColor}, ${endColor})`;
    document.documentElement.style.setProperty('--bg-image', gradient);
    document.documentElement.style.setProperty('--bg-color', 'transparent');
}

// Apply image background (using gradients as placeholders)
function applyImageBackground(imageName) {
    const imageGradients = {
        waves: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        mountains: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        forest: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        abstract: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    };
    
    const gradient = imageGradients[imageName] || imageGradients.waves;
    document.documentElement.style.setProperty('--bg-image', gradient);
    document.documentElement.style.setProperty('--bg-color', 'transparent');
}

// Update language in UI with immediate category translation
function updateLanguage() {
    const t = translations[currentLanguage];
    
    // Update all language-specific elements
    document.querySelectorAll('[data-text-' + currentLanguage + ']').forEach(el => {
        el.textContent = el.dataset['text' + currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1)];
    });
    
    // Update "All Categories" text immediately
    const allCategoriesBtn = document.querySelector('.all-categories .category-name');
    if (allCategoriesBtn) {
        allCategoriesBtn.textContent = currentLanguage === 'de' ? 'Alle Kategorien' : 'All Categories';
    }
    
    // Rest of the updateLanguage function...
    // [Previous updateLanguage code continues here]
}

// Modal handlers
function openModal() {
    editingTaskId = null;
    taskForm.reset();
    const t = translations[currentLanguage];
    modalTitle.textContent = t.newReminder;
    submitBtn.textContent = t.create;
    taskModal.classList.add('show');
}

function closeModalHandler() {
    taskModal.classList.remove('show');
    taskForm.reset();
    editingTaskId = null;
}

function closeCategoryModalHandler() {
    categoryModal.classList.remove('show');
    document.getElementById('categoryForm').reset();
}

// Show loading state
function showLoading() {
    const t = translations[currentLanguage];
    taskList.innerHTML = `<div class="loading">${t.loading}</div>`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Task management functions
function toggleTaskCompletion(taskId, isCompleted) {
    // This would normally make an API call to update the task
    console.log(`Toggle task ${taskId} completion to ${isCompleted}`);
    
    // For demo purposes, update the local task
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
        task.is_completed = isCompleted;
        displayTasks();
    }
}

function editTask(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    editingTaskId = taskId;
    const t = translations[currentLanguage];
    modalTitle.textContent = t.editReminder;
    submitBtn.textContent = t.update;
    
    // Populate form with task data
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description || '';
    
    const dueDate = new Date(task.due_date);
    document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
    document.getElementById('dueTime').value = dueDate.toTimeString().slice(0, 5);
    
    document.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;
    
    updateCategorySelector();
    taskModal.classList.add('show');
}

function deleteTask(taskId) {
    const t = translations[currentLanguage];
    if (confirm(t.deleteConfirm)) {
        // This would normally make an API call to delete the task
        console.log(`Delete task ${taskId}`);
        
        // For demo purposes, remove from local array
        allTasks = allTasks.filter(t => t.id !== taskId);
        displayTasks();
    }
}

// Form submission handlers
function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const dueDate = document.getElementById('dueDate').value;
    const dueTime = document.getElementById('dueTime').value;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    
    if (!title) {
        const t = translations[currentLanguage];
        alert(t.titleRequired);
        return;
    }
    
    if (!dueDate || !dueTime) {
        const t = translations[currentLanguage];
        alert(t.dueDateRequired);
        return;
    }
    
    const dueDatetime = new Date(`${dueDate}T${dueTime}`);
    
    // Get selected category
    const selectedCategoryOption = document.querySelector('.category-option.active');
    const category = selectedCategoryOption ? selectedCategoryOption.dataset.category : null;
    
    const taskData = {
        id: editingTaskId || Date.now(), // Use timestamp as ID for demo
        title,
        description,
        due_date: dueDatetime.toISOString(),
        priority,
        category: category || null,
        is_completed: false
    };
    
    if (editingTaskId) {
        // Update existing task
        const taskIndex = allTasks.findIndex(t => t.id === editingTaskId);
        if (taskIndex !== -1) {
            allTasks[taskIndex] = { ...allTasks[taskIndex], ...taskData };
        }
    } else {
        // Add new task
        allTasks.push(taskData);
    }
    
    displayTasks();
    closeModalHandler();
}

function handleCategoryFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value.trim();
    const color = document.getElementById('categoryColor').value;
    const selectedIcon = document.querySelector('.icon-option.active');
    const icon = selectedIcon ? selectedIcon.dataset.icon : 'fas fa-folder';
    
    if (!name) {
        const t = translations[currentLanguage];
        alert(t.categoryNameRequired);
        return;
    }
    
    const newCategory = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        color,
        icon
    };
    
    allCategories.push(newCategory);
    saveCategories();
    updateCategorySidebar();
    updateCategorySelector();
    closeCategoryModalHandler();
}

function updateCategoryManageList() {
    if (!categoryManageList) return;
    
    categoryManageList.innerHTML = allCategories.map(cat => `
        <div class="category-manage-item">
            <div class="category-icon" style="background-color: ${cat.color}">
                <i class="${cat.icon}" style="color: white"></i>
            </div>
            <span class="category-name">${cat.name}</span>
            <div class="category-manage-actions">
                <button class="category-manage-btn category-delete-btn" onclick="deleteCategory('${cat.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function deleteCategory(categoryId) {
    const t = translations[currentLanguage];
    if (confirm(t.deleteConfirm)) {
        allCategories = allCategories.filter(cat => cat.id !== categoryId);
        saveCategories();
        updateCategorySidebar();
        updateCategorySelector();
        updateCategoryManageList();
        displayTasks();
    }
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
    
    // Update background colors for the new theme
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
    updateBackgroundForTheme();
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
    
    // Update category sidebar to fix translation issue
    updateCategorySidebar();
    
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
    
    // Category filter
    if (selectedCategory) {
        filteredTasks = filteredTasks.filter(task => task.category === selectedCategory);
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

// Update category sidebar
function updateCategorySidebar() {
    if (!categoriesList) return;
    
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
    if (!categorySelector) return;
    
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

    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
            categoryModal.classList.add('show');
        });
    }
}
