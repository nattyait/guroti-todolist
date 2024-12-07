import { StorageService } from '../js/StorageService';

describe('StorageService', () => {
    let storageService;
    
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        storageService = new StorageService('test-tasks');
    });

    test('should add task to storage', () => {
        storageService.addTask('Test task');
        expect(storageService.getTasks()).toEqual(['Test task']);
    });

    test('should update task in storage', () => {
        storageService.addTask('Old task');
        storageService.updateTask('Old task', 'New task');
        expect(storageService.getTasks()).toEqual(['New task']);
    });

    test('should remove task from storage', () => {
        storageService.addTask('Task 1');
        storageService.addTask('Task 2');
        storageService.removeTask('Task 1');
        expect(storageService.getTasks()).toEqual(['Task 2']);
    });
}); 