/**
 * Unit tests for task service - update operations
 */

describe('Task Service - Update Operations', () => {
  // Mock dependencies
  const mockTaskRepository = {
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };
  
  const mockNotificationService = {
    notifyTaskAssignment: jest.fn()
  };
  
  // Mock task service
  const taskService = {
    updateTask: async (id, taskData) => {
      const task = await mockTaskRepository.findById(id);
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      const updatedTask = await mockTaskRepository.update(id, {
        ...taskData,
        updated_at: new Date()
      });
      
      // If assignment changed, notify new assignee
      if (taskData.assigned_to && taskData.assigned_to !== task.assigned_to) {
        await mockNotificationService.notifyTaskAssignment(updatedTask);
      }
      
      return updatedTask;
    },
    
    deleteTask: async (id) => {
      const task = await mockTaskRepository.findById(id);
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      return await mockTaskRepository.delete(id);
    },
    
    completeTask: async (id) => {
      const task = await mockTaskRepository.findById(id);
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      return await mockTaskRepository.update(id, {
        status: 'completed',
        completed_at: new Date(),
        updated_at: new Date()
      });
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockTaskRepository.findById.mockReset();
    mockTaskRepository.update.mockReset();
    mockTaskRepository.delete.mockReset();
    mockNotificationService.notifyTaskAssignment.mockReset();
    
    // Default mock implementations
    mockTaskRepository.findById.mockImplementation((id) => {
      if (id === 999) {
        return null;
      }
      
      if (id === 1) {
        return {
          id,
          title: 'First task',
          description: 'Description for first task',
          status: 'pending',
          priority: 'high',
          due_date: new Date('2023-01-15T00:00:00Z'),
          entity_type: 'contact',
          entity_id: 1,
          assigned_to: 1,
          created_by: 1,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: null,
          completed_at: null
        };
      }
      
      if (id === 2) {
        return {
          id,
          title: 'Second task',
          description: 'Description for second task',
          status: 'completed',
          priority: 'medium',
          due_date: new Date('2023-01-10T00:00:00Z'),
          entity_type: 'company',
          entity_id: 1,
          assigned_to: 2,
          created_by: 1,
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: new Date('2023-01-10T00:00:00Z'),
          completed_at: new Date('2023-01-10T00:00:00Z')
        };
      }
      
      return null;
    });
    
    mockTaskRepository.update.mockImplementation((id, taskData) => ({
      id,
      ...(id === 1 ? {
        title: 'First task',
        description: 'Description for first task',
        status: 'pending',
        priority: 'high',
        due_date: new Date('2023-01-15T00:00:00Z'),
        entity_type: 'contact',
        entity_id: 1,
        assigned_to: 1,
        created_by: 1,
        created_at: new Date('2023-01-01T00:00:00Z')
      } : {
        title: 'Second task',
        description: 'Description for second task',
        status: 'completed',
        priority: 'medium',
        due_date: new Date('2023-01-10T00:00:00Z'),
        entity_type: 'company',
        entity_id: 1,
        assigned_to: 2,
        created_by: 1,
        created_at: new Date('2023-01-02T00:00:00Z'),
        completed_at: new Date('2023-01-10T00:00:00Z')
      }),
      ...taskData
    }));
    
    mockTaskRepository.delete.mockResolvedValue(true);
    
    mockNotificationService.notifyTaskAssignment.mockResolvedValue(true);
  });

  describe('updateTask', () => {
    test('should update an existing task', async () => {
      // Arrange
      const taskId = 1;
      const taskData = {
        title: 'Updated task',
        description: 'Updated description'
      };
      
      // Act
      const result = await taskService.updateTask(taskId, taskData);
      
      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, {
        ...taskData,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: taskId,
        title: 'Updated task',
        description: 'Updated description',
        status: 'pending',
        priority: 'high',
        due_date: expect.any(Date),
        entity_type: 'contact',
        entity_id: 1,
        assigned_to: 1,
        created_by: 1,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
      
      expect(mockNotificationService.notifyTaskAssignment).not.toHaveBeenCalled();
    });
    
    test('should update task assignee and send notification', async () => {
      // Arrange
      const taskId = 1;
      const taskData = {
        assigned_to: 3
      };
      
      // Act
      const result = await taskService.updateTask(taskId, taskData);
      
      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, {
        ...taskData,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: taskId,
        title: 'First task',
        description: 'Description for first task',
        status: 'pending',
        priority: 'high',
        due_date: expect.any(Date),
        entity_type: 'contact',
        entity_id: 1,
        assigned_to: 3,
        created_by: 1,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
      
      expect(mockNotificationService.notifyTaskAssignment).toHaveBeenCalledWith(result);
    });
    
    test('should not notify when assignee is the same', async () => {
      // Arrange
      const taskId = 1;
      const taskData = {
        title: 'Updated task',
        assigned_to: 1 // Same as current assignee
      };
      
      // Act
      const result = await taskService.updateTask(taskId, taskData);
      
      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, {
        ...taskData,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: taskId,
        title: 'Updated task',
        description: 'Description for first task',
        status: 'pending',
        priority: 'high',
        due_date: expect.any(Date),
        entity_type: 'contact',
        entity_id: 1,
        assigned_to: 1,
        created_by: 1,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
      
      expect(mockNotificationService.notifyTaskAssignment).not.toHaveBeenCalled();
    });
    
    test('should throw error when task is not found', async () => {
      // Arrange
      const taskId = 999;
      const taskData = {
        title: 'Updated task'
      };
      
      // Act & Assert
      await expect(taskService.updateTask(taskId, taskData)).rejects.toThrow('Task not found');
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
      expect(mockNotificationService.notifyTaskAssignment).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteTask', () => {
    test('should delete an existing task', async () => {
      // Arrange
      const taskId = 1;
      
      // Act
      const result = await taskService.deleteTask(taskId);
      
      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
      expect(result).toBe(true);
    });
    
    test('should throw error when task is not found', async () => {
      // Arrange
      const taskId = 999;
      
      // Act & Assert
      await expect(taskService.deleteTask(taskId)).rejects.toThrow('Task not found');
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('completeTask', () => {
    test('should mark a task as completed', async () => {
      // Arrange
      const taskId = 1;
      
      // Act
      const result = await taskService.completeTask(taskId);
      
      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, {
        status: 'completed',
        completed_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: taskId,
        title: 'First task',
        description: 'Description for first task',
        status: 'completed',
        priority: 'high',
        due_date: expect.any(Date),
        entity_type: 'contact',
        entity_id: 1,
        assigned_to: 1,
        created_by: 1,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        completed_at: expect.any(Date)
      });
    });
    
    test('should throw error when task is not found', async () => {
      // Arrange
      const taskId = 999;
      
      // Act & Assert
      await expect(taskService.completeTask(taskId)).rejects.toThrow('Task not found');
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });
  });
});
