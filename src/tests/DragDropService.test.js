import { DragDropService } from '../js/DragDropService';

describe('DragDropService', () => {
    let dragDropService;
    let container;
    let onOrderChange;

    beforeEach(() => {
        container = document.createElement('ul');
        onOrderChange = jest.fn();
        dragDropService = new DragDropService(container, onOrderChange);
    });

    test('should attach drag handlers to element', () => {
        const element = document.createElement('li');
        dragDropService.attachDragHandlers(element);
        
        expect(element.draggable).toBe(true);
        expect(element.ondragstart).toBeTruthy();
        expect(element.ondragover).toBeTruthy();
        expect(element.ondrop).toBeTruthy();
    });

    test('should handle drag start', () => {
        const element = document.createElement('li');
        const event = new Event('dragstart');
        
        dragDropService.handleDragStart.call(element, event);
        expect(element.classList.contains('dragging')).toBe(true);
    });
}); 