export class StorageService {
    constructor(storageKey = 'tasks') {
        this.storageKey = storageKey;
    }

    getTasks() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    saveTasks(tasks) {
        localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    }

    addTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        this.saveTasks(tasks);
    }

    updateTask(oldTask, newTask) {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(t => 
            (typeof t === 'string' ? t : t.text) === oldTask
        );
        if (taskIndex !== -1) {
            tasks[taskIndex] = newTask;
            this.saveTasks(tasks);
        }
    }

    removeTask(taskText) {
        const tasks = this.getTasks();
        const updatedTasks = tasks.filter(task => 
            (typeof task === 'string' ? task : task.text) !== taskText
        );
        this.saveTasks(updatedTasks);
    }
} 