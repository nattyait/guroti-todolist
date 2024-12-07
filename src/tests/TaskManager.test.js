import { TaskManager } from '../js/TaskManager';

// Mock the DOM elements
document.body.innerHTML = `
    <input id="taskInput" type="text">
    <ul id="taskList"></ul>
`;

describe('TaskManager', () => {
    let taskManager;

    beforeEach(() => {
        localStorage.clear();
        taskManager = new TaskManager();
    });

    test('should create new task', () => {
        taskManager.taskInput.value = 'New Task';
        taskManager.addTask();
        
        const taskElements = document.querySelectorAll('#taskList li span');
        expect(taskElements.length).toBe(1);
        expect(taskElements[0].textContent).toBe('New Task');
    });

    test('should not create empty task', () => {
        taskManager.taskInput.value = '   ';
        taskManager.addTask();
        
        const taskElements = document.querySelectorAll('#taskList li');
        expect(taskElements.length).toBe(0);
    });

    test('should edit task', () => {
        taskManager.createTask('Original Task');
        const taskSpan = document.querySelector('#taskList li span');
        
        taskManager.editTask(taskSpan);
        const input = document.querySelector('#taskList li input');
        input.value = 'Edited Task';
        input.blur();

        expect(taskSpan.textContent).toBe('Edited Task');
    });
}); 