class TaskManager {
    constructor(taskListId = 'taskList', taskInputId = 'taskInput') {
        this.taskList = document.getElementById(taskListId);
        this.taskInput = document.getElementById(taskInputId);
        this.loadInitialTasks();
    }

    async loadInitialTasks() {
        const tasks = this.getTasks();
        if (tasks.length === 0) {
            try {
                const response = await fetch('tasks.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                localStorage.setItem('tasks', JSON.stringify(data.tasks));
                this.loadTasks();
            } catch (error) {
                this.loadTasks();
            }
        } else {
            this.loadTasks();
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
        checkbox.addEventListener('change', () => {
            taskSpan.classList.toggle('completed');
            this.updateTaskStatus(task.text, checkbox.checked);
        });
        
        // Create task text span
        const taskSpan = document.createElement('span');
        taskSpan.textContent = task.text;
        if (task.completed) {
            taskSpan.classList.add('completed');
        }
        
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
                    text: span.textContent,
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
        tasks.forEach(task => this.createTask(task));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});