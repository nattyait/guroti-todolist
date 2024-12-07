const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');

function addTask() {
    const task = taskInput.value.trim();
    if (task) {
        createTask(task);
        saveTaskToLocalStorage(task);
        taskInput.value = '';
    }
}
function createTask(task) {
    const li = document.createElement('li');
    li.draggable = true;

    // Add drag handlers
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);
    li.addEventListener('dragenter', handleDragEnter);
    li.addEventListener('dragleave', handleDragLeave);

    // Create span for task text
    const taskSpan = document.createElement('span');
    taskSpan.textContent = task;
    li.appendChild(taskSpan);

    // Add edit button
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => editTask(taskSpan);
    li.appendChild(editButton);

    removeTask(li);

    taskList.appendChild(li); 
    
}
// Add these new drag and drop functions
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();  // Necessary to allow dropping
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}
function handleDrop(e) {
    e.preventDefault();
    if (this !== draggedItem) {
        let allItems = [...taskList.querySelectorAll('li')];
        let draggedIndex = allItems.indexOf(draggedItem);
        let droppedIndex = allItems.indexOf(this);

        if (draggedIndex < droppedIndex) {
            this.parentNode.insertBefore(draggedItem, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedItem, this);
        }
        
        // Update localStorage with new order
        updateTasksOrder();
    }
    this.classList.remove('drag-over');
    draggedItem.classList.remove('dragging');
}
function updateTasksOrder() {
    const tasks = [];
    taskList.querySelectorAll('li span').forEach(span => {
        tasks.push(span.textContent);
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function editTask(taskSpan) {
    const oldText = taskSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldText;
    
    // Replace span with input temporarily
    taskSpan.parentNode.replaceChild(input, taskSpan);
    input.focus();
    
    input.onblur = () => {
        const newText = input.value.trim();
        if (newText) {
            // Update localStorage
            updateTaskInLocalStorage(oldText, newText);
            taskSpan.textContent = newText;
        }
        // Replace input with span
        input.parentNode.replaceChild(taskSpan, input);
    };
    
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    };
}
function removeTask(li) {
    // สร้างปุ่ม Remove
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => {
        li.remove();
        removeTaskFromLocalStorage(li.textContent);
    };
    li.appendChild(removeButton);
}

// ฟังก์ชันบันทึก Task ลงใน Local Storage
function saveTaskToLocalStorage(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
// Add new localStorage update function
function updateTaskInLocalStorage(oldTask, newTask) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.indexOf(oldTask);
    if (taskIndex !== -1) {
        tasks[taskIndex] = newTask;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

// ฟังก์ชันลบ Task จาก Local Storage
function removeTaskFromLocalStorage(taskToRemove) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.filter(task => task !== taskToRemove);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

// ฟังก์ชันโหลด Task จาก Local Storage
function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => createTask(task));
}

// โหลด Task เมื่อหน้าเว็บเปิด
document.addEventListener('DOMContentLoaded', loadTasksFromLocalStorage);