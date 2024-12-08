class TaskManager {
    constructor(taskListId = 'taskList', taskInputId = 'taskInput', premiumAmountId = 'premiumAmount') {
        this.taskList = document.getElementById(taskListId);
        this.taskInput = document.getElementById(taskInputId);
        this.premiumInput = document.getElementById(premiumAmountId);
        this.titleElement = document.querySelector('h1');
        this.loadPremiumAmount();
        this.loadInitialTasks();
    }

    async loadInitialTasks() {
        try {
            const response = await fetch('tasks.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const amount = parseInt(localStorage.getItem('premiumAmount')) || 0;
            
            // Get current tasks and their completion states
            const currentTasks = this.getTasks();
            const completionStates = {};
            currentTasks.forEach(task => {
                // Use the task text without HTML tags as key
                const plainText = task.text.replace(/<[^>]*>/g, '');
                completionStates[plainText] = task.completed;
            });
            
            // Replace placeholders with actual amount, handling multiplication
            const processedTasks = data.tasks.map(task => {
                let text = task.text;
                // Handle {{amount*2}} format
                text = text.replace(/{{amount\*(\d+)}}/, (match, multiplier) => {
                    const calculatedAmount = amount * parseInt(multiplier);
                    return `<span class="amount">${calculatedAmount}</span>`;
                });
                // Handle {{amount}} format
                text = text.replace(/{{amount}}/, `<span class="amount">${amount}</span>`);
                
                // Get the plain text version for checking completion state
                const plainText = text.replace(/<[^>]*>/g, '');
                
                return {
                    text: text,
                    completed: completionStates[plainText] || false
                };
            });
            
            localStorage.setItem('tasks', JSON.stringify(processedTasks));
            
            // Clear existing tasks and load new ones
            this.taskList.innerHTML = '';
            this.loadTasks();
        } catch (error) {
            this.loadTasks();
        }
    }

    setPremiumAmount() {
        const amount = this.premiumInput.value;
        if (amount && !isNaN(amount) && amount >= 0) {
            localStorage.setItem('premiumAmount', amount);
            this.premiumInput.value = amount;
            this.updateTitle(amount);
            
            // Save current completion states before reloading
            const currentTasks = this.getTasks();
            const completionStates = {};
            currentTasks.forEach(task => {
                const plainText = task.text.replace(/<[^>]*>/g, '');
                completionStates[plainText] = task.completed;
            });
            
            // Reload tasks with new amount
            this.loadInitialTasks();
        }
    }

    updateTitle(amount) {
        this.titleElement.textContent = `To-Do List เซ็ตขนมจีน (Premium: ${amount} กล่อง)`;
    }

    loadPremiumAmount() {
        const amount = localStorage.getItem('premiumAmount');
        if (amount) {
            this.premiumInput.value = amount;
            this.updateTitle(amount);
        }
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        if (taskText) {
            const task = {
                text: taskText,
                completed: false
            };
            this.createTask(task);
            this.saveTask(task);
            this.taskInput.value = '';
        }
    }

    createTask(task) {
        const li = document.createElement('li');
        li.draggable = true;
        
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        
        // Create task text span
        const taskSpan = document.createElement('span');
        taskSpan.innerHTML = task.text;
        if (task.completed) {
            taskSpan.classList.add('completed');
        }
        
        checkbox.addEventListener('change', () => {
            taskSpan.classList.toggle('completed');
            this.updateTaskStatus(task.text, checkbox.checked);
        });
        
        // Create edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => this.editTask(taskSpan);
        
        // Create remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => {
            const tasks = this.getTasks().filter(t => t.text !== task.text);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            li.remove();
        };
        
        // Add drag and drop event listeners
        li.addEventListener('dragstart', () => {
            li.classList.add('dragging');
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            this.updateTasksOrder();
        });
        
        // Append all elements
        li.appendChild(checkbox);
        li.appendChild(taskSpan);
        li.appendChild(editButton);
        li.appendChild(removeButton);
        
        this.taskList.appendChild(li);
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        this.taskList.querySelectorAll('li').forEach(item => {
            if (!item.draggable) {
                item.draggable = true;
                item.addEventListener('dragstart', () => {
                    item.classList.add('dragging');
                });
                item.addEventListener('dragend', () => {
                    item.classList.remove('dragging');
                    this.updateTasksOrder();
                });
            }
        });

        this.taskList.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(e.clientY);
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                if (afterElement) {
                    this.taskList.insertBefore(draggable, afterElement);
                } else {
                    this.taskList.appendChild(draggable);
                }
            }
        });
    }

    getDragAfterElement(y) {
        const draggableElements = [...this.taskList.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    getTasks() {
        const tasksJson = localStorage.getItem('tasks');
        return tasksJson ? JSON.parse(tasksJson) : [];
    }

    saveTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    updateTaskStatus(taskText, completed) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.text === taskText);
        if (task) {
            task.completed = completed;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }

    updateTasksOrder() {
        const tasks = [];
        this.taskList.querySelectorAll('li').forEach(li => {
            const span = li.querySelector('span');
            const checkbox = li.querySelector('input[type="checkbox"]');
            if (span) {
                tasks.push({
                    text: span.innerHTML, // Changed from textContent to innerHTML
                    completed: checkbox.checked
                });
            }
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    editTask(taskSpan) {
        const oldText = taskSpan.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = oldText;
        
        taskSpan.parentNode.replaceChild(input, taskSpan);
        input.focus();
        
        input.onblur = () => {
            const newText = input.value.trim();
            if (newText && newText !== oldText) {
                const tasks = this.getTasks();
                const task = tasks.find(t => t.text === oldText);
                if (task) {
                    task.text = newText;
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    taskSpan.textContent = newText;
                }
            }
            input.parentNode.replaceChild(taskSpan, input);
        };
        
        input.onkeypress = (e) => {
            if (e.key === 'Enter') input.blur();
        };
    }

    loadTasks() {
        const tasks = this.getTasks();
        this.taskList.innerHTML = ''; // Clear existing tasks
        tasks.forEach(task => this.createTask(task));
    }

    deleteAllTasks() {
        if (confirm('Are you sure you want to delete all tasks?')) {
            // Clear localStorage
            localStorage.removeItem('tasks');
            
            // Clear the UI
            this.taskList.innerHTML = '';
            
            // Reload initial tasks
            this.loadInitialTasks();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});