class TaskManager {
    constructor(taskListId = 'taskList', taskInputId = 'taskInput', premiumAmountId = 'premiumAmount') {
        this.taskList = document.getElementById(taskListId);
        this.taskInput = document.getElementById(taskInputId);
        this.premiumInput = document.getElementById(premiumAmountId);
        this.titleElement = document.querySelector('h1');
        this.draggedItem = null;
        this.touchStartY = 0;
        this.touchStartTime = 0;
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
            
            // Get current tasks, their completion states, and removed states
            const currentTasks = this.getTasks();
            const taskStates = {};
            const removedTasks = JSON.parse(localStorage.getItem('removedTasks') || '[]');
            
            currentTasks.forEach(task => {
                const plainText = task.text.replace(/<[^>]*>/g, '');
                taskStates[plainText] = {
                    completed: task.completed,
                    removed: false
                };
            });

            // Mark removed tasks
            removedTasks.forEach(plainText => {
                taskStates[plainText] = {
                    completed: false,
                    removed: true
                };
            });
            
            // Process tasks, respecting their states
            const processedTasks = data.tasks
                .map(task => {
                    let text = task.text;
                    // Handle {{amount*2}} format
                    text = text.replace(/{{amount\*(\d+)}}/, (match, multiplier) => {
                        const calculatedAmount = amount * parseInt(multiplier);
                        return `<span class="amount">${calculatedAmount}</span>`;
                    });
                    // Handle {{amount}} format
                    text = text.replace(/{{amount}}/, `<span class="amount">${amount}</span>`);
                    
                    const plainText = text.replace(/<[^>]*>/g, '');
                    const state = taskStates[plainText] || { completed: false, removed: false };
                    
                    return {
                        text: text,
                        completed: state.completed,
                        removed: state.removed
                    };
                })
                .filter(task => !task.removed); // Filter out removed tasks
            
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
            const plainText = task.text.replace(/<[^>]*>/g, '');
            const removedTasks = JSON.parse(localStorage.getItem('removedTasks') || '[]');
            removedTasks.push(plainText);
            localStorage.setItem('removedTasks', JSON.stringify(removedTasks));
            
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
            // Touch event handlers
            item.addEventListener('touchstart', (e) => {
                this.touchStartY = e.touches[0].clientY;
                this.touchStartTime = Date.now();
                this.draggedItem = item;
                
                // Add visual feedback after a short delay
                setTimeout(() => {
                    if (this.draggedItem === item) {
                        item.classList.add('dragging');
                    }
                }, 200);
            }, { passive: false });

            item.addEventListener('touchmove', (e) => {
                if (!this.draggedItem) return;
                
                e.preventDefault();
                const touch = e.touches[0];
                const currentY = touch.clientY;
                const deltaY = currentY - this.touchStartY;
                
                // Apply transform to move the item
                this.draggedItem.style.transform = `translateY(${deltaY}px)`;
                
                // Find and move items
                const rect = this.draggedItem.getBoundingClientRect();
                const siblings = [...this.taskList.children];
                const draggedIndex = siblings.indexOf(this.draggedItem);
                
                siblings.forEach((sibling, index) => {
                    if (sibling === this.draggedItem) return;
                    
                    const siblingRect = sibling.getBoundingClientRect();
                    const siblingMiddle = siblingRect.top + siblingRect.height / 2;
                    
                    if (rect.top + rect.height / 2 < siblingMiddle && index < draggedIndex) {
                        sibling.style.transform = 'translateY(40px)';
                        setTimeout(() => {
                            sibling.style.transform = '';
                            this.taskList.insertBefore(this.draggedItem, sibling);
                        }, 100);
                    } else if (rect.top + rect.height / 2 > siblingMiddle && index > draggedIndex) {
                        sibling.style.transform = 'translateY(-40px)';
                        setTimeout(() => {
                            sibling.style.transform = '';
                            this.taskList.insertBefore(sibling, this.draggedItem);
                        }, 100);
                    }
                });
            }, { passive: false });

            item.addEventListener('touchend', () => {
                if (!this.draggedItem) return;
                
                this.draggedItem.classList.remove('dragging');
                this.draggedItem.style.transform = '';
                
                // Update order in storage
                this.updateTasksOrder();
                
                // Reset variables
                this.draggedItem = null;
                this.touchStartY = 0;
                this.touchStartTime = 0;
            });

            // Prevent default drag behavior on iOS
            item.addEventListener('dragstart', (e) => {
                e.preventDefault();
            });
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
            localStorage.removeItem('tasks');
            localStorage.removeItem('removedTasks'); // Clear removed tasks state
            this.taskList.innerHTML = '';
            this.loadInitialTasks();
        }
    }

    resetTasks() {
        if (confirm('Are you sure you want to reset all tasks to their initial state?')) {
            localStorage.removeItem('tasks');
            localStorage.removeItem('removedTasks');
            this.taskList.innerHTML = '';
            this.loadInitialTasks();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});