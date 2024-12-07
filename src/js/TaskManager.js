import { StorageService } from './StorageService';
import { DragDropService } from './DragDropService';

export class TaskManager {
    constructor(taskListId = 'taskList', taskInputId = 'taskInput') {
        this.taskList = document.getElementById(taskListId);
        this.taskInput = document.getElementById(taskInputId);
        this.storageService = new StorageService();
        this.dragDropService = new DragDropService(
            this.taskList, 
            () => this.updateTasksOrder()
        );
        
        this.initializeEventListeners();
        this.loadTasks();
    }

    initializeEventListeners() {
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
    }

    addTask() {
        const task = this.taskInput.value.trim();
        if (task) {
            this.createTask(task);
            this.storageService.addTask(task);
            this.taskInput.value = '';
        }
    }

    createTask(task) {
        const li = this.createTaskElement(task);
        this.dragDropService.attachDragHandlers(li);
        this.addTaskControls(li);
        this.taskList.appendChild(li);
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        const taskSpan = document.createElement('span');
        taskSpan.textContent = task;
        li.appendChild(taskSpan);
        return li;
    }

    addTaskControls(li) {
        const taskSpan = li.querySelector('span');
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => this.editTask(taskSpan);
        
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => {
            this.storageService.removeTask(taskSpan.textContent);
            li.remove();
        };

        li.appendChild(editButton);
        li.appendChild(removeButton);
    }

    editTask(taskSpan) {
        const oldText = taskSpan.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = oldText;
        
        taskSpan.parentNode.replaceChild(input, taskSpan);
        input.focus();
        
        input.onblur = () => this.handleEditComplete(input, taskSpan, oldText);
        input.onkeypress = (e) => {
            if (e.key === 'Enter') input.blur();
        };
    }

    handleEditComplete(input, taskSpan, oldText) {
        const newText = input.value.trim();
        if (newText) {
            this.storageService.updateTask(oldText, newText);
            taskSpan.textContent = newText;
        }
        input.parentNode.replaceChild(taskSpan, input);
    }

    loadTasks() {
        const tasks = this.storageService.getTasks();
        tasks.forEach(task => this.createTask(task));
    }

    updateTasksOrder() {
        const tasks = [];
        this.taskList.querySelectorAll('li span').forEach(span => {
            tasks.push(span.textContent);
        });
        this.storageService.saveTasks(tasks);
    }
} 