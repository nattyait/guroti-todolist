class TaskManager {
    constructor(taskListId = 'taskList', taskInputId = 'taskInput') {
        this.taskList = document.getElementById(taskListId);
        this.taskInput = document.getElementById(taskInputId);
        this.loadTasks();
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
        
        // Append all elements
        li.appendChild(checkbox);
        li.appendChild(taskSpan);
        li.appendChild(editButton);
        li.appendChild(removeButton);
        
        this.taskList.appendChild(li);
    }

    saveTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    updateTaskStatus(taskText, completed) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.text === taskText);
        if (task) {
            task.completed = completed;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
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

// Initialize TaskManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});