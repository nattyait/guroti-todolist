export class DragDropService {
    constructor(container, onOrderChange) {
        this.container = container;
        this.draggedItem = null;
        this.onOrderChange = onOrderChange;
    }

    attachDragHandlers(element) {
        element.draggable = true;
        element.addEventListener('dragstart', this.handleDragStart.bind(this));
        element.addEventListener('dragover', this.handleDragOver.bind(this));
        element.addEventListener('drop', this.handleDrop.bind(this));
        element.addEventListener('dragenter', this.handleDragEnter.bind(this));
        element.addEventListener('dragleave', this.handleDragLeave.bind(this));
    }

    handleDragStart(e) {
        this.draggedItem = e.target;
        e.target.classList.add('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.target.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        const target = e.target.closest('li');
        
        if (target && this.draggedItem !== target) {
            const allItems = [...this.container.querySelectorAll('li')];
            const draggedIndex = allItems.indexOf(this.draggedItem);
            const droppedIndex = allItems.indexOf(target);

            if (draggedIndex < droppedIndex) {
                target.parentNode.insertBefore(this.draggedItem, target.nextSibling);
            } else {
                target.parentNode.insertBefore(this.draggedItem, target);
            }
            
            this.onOrderChange();
        }
        
        target.classList.remove('drag-over');
        this.draggedItem.classList.remove('dragging');
    }
} 