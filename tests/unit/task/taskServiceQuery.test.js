/**
 * Unit tests for task service - query operations
 */

describe('Task Service - Query Operations', () => {
  // Mock dependencies
  const mockTaskRepository = {
    findByUserId: jest.fn(),
    findByEntityId: jest.fn(),
    findByStatus: jest.fn(),
    findByPriority: jest.fn(),
    findByDueDate: jest.fn()
  };
  
  const mockNotificationService = {
    notifyTaskDueSoon: jest.fn()
  };
  
  // Mock task service
  const taskService = {
    getTasksByUser: async (userId) => {
      return await mockTaskRepository.findByUserId(userId);
    },
    
    getTasksByEntity: async (entityType, entityId) => {
      return await mockTaskRepository.findByEntityId(entityType, entityId);
    },
    
    getTasksByStatus: async (status) => {
      return await mockTaskRepository.findByStatus(status);
    },
    
    getTasksByPriority: async (priority) => {
      return await mockTaskRepository.findByPriority(priority);
    },
    
    getTasksByDueDate: async (startDate, endDate) => {
      return await mockTaskRepository.findByDueDate(startDate, endDate);
    },
    
    checkDueTasks: async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dueSoonTasks = await mockTaskRepository.findByDueDate(today, tomorrow);
      
      for (const task of dueSoonTasks) {
        if (task.status !== 'completed' && task.assigned_to) {
          await mockNotificationService.notifyTaskDueSoon(task);
        }
      }
      
      return dueSoonTasks.length;
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockTaskRepository.findByUserId.mockReset();
    mockTaskRepository.findByEntityId.mockReset();
    mockTaskRepository.findByStatus.mockReset();
    mockTaskRepository.findByPriority.mockReset();
    mockTaskRepository.findByDueDate.mockReset();
    mockNotificationService.notifyTaskDueSoon.mockReset();
    
    // Default mock implementations
    mockTaskRepository.findByUserId.mockImplementation((userId) => {
      if (userId === 999) {
        return [];
      }
      
      if (userId === 1) {
        return [
          {
            id: 1,
            title: 'First task',
            description: 'Description for first task',
            status: 'pending',
            priority: 'high',
            due_date: new Date('2023-01-15T00:00:00Z'),
            entity_type: 'contact',
            entity_id: 1,
            assigned_to: userId,
            created_by: 1,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: null,
            completed_at: null
          }
        ];
      }
      
      if (userId === 2) {
        return [
          {
            id: 2,
            title: 'Second task',
            description: 'Description for second task',
            status: 'completed',
            priority: 'medium',
            due_date: new Date('2023-01-10T00:00:00Z'),
            entity_type: 'company',
            entity_id: 1,
            assigned_to: userId,
            created_by: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-10T00:00:00Z'),
            completed_at: new Date('2023-01-10T00:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    mockTaskRepository.findByEntityId.mockImplementation((entityType, entityId) => {
      if (entityId === 999) {
        return [];
      }
      
      if (entityType === 'contact' && entityId === 1) {
        return [
          {
            id: 1,
            title: 'First task',
            description: 'Description for first task',
            status: 'pending',
            priority: 'high',
            due_date: new Date('2023-01-15T00:00:00Z'),
            entity_type: entityType,
            entity_id: entityId,
            assigned_to: 1,
            created_by: 1,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: null,
            completed_at: null
          }
        ];
      }
      
      if (entityType === 'company' && entityId === 1) {
        return [
          {
            id: 2,
            title: 'Second task',
            description: 'Description for second task',
            status: 'completed',
            priority: 'medium',
            due_date: new Date('2023-01-10T00:00:00Z'),
            entity_type: entityType,
            entity_id: entityId,
            assigned_to: 2,
            created_by: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-10T00:00:00Z'),
            completed_at: new Date('2023-01-10T00:00:00Z')
          }
        ];
      }
      
      if (entityType === 'deal' && entityId === 1) {
        return [
          {
            id: 3,
            title: 'Deal task',
            description: 'Description for deal task',
            status: 'pending',
            priority: 'low',
            due_date: new Date('2023-01-20T00:00:00Z'),
            entity_type: entityType,
            entity_id: entityId,
            assigned_to: 1,
            created_by: 1,
            created_at: new Date('2023-01-03T00:00:00Z'),
            updated_at: null,
            completed_at: null
          }
        ];
      }
      
      return [];
    });
    
    mockTaskRepository.findByStatus.mockImplementation((status) => {
      if (status === 'pending') {
        return [
          {
            id: 1,
            title: 'First task',
            description: 'Description for first task',
            status,
            priority: 'high',
            due_date: new Date('2023-01-15T00:00:00Z'),
            entity_type: 'contact',
            entity_id: 1,
            assigned_to: 1,
            created_by: 1,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: null,
            completed_at: null
          }
        ];
      }
      
      if (status === 'completed') {
        return [
          {
            id: 2,
            title: 'Second task',
            description: 'Description for second task',
            status,
            priority: 'medium',
            due_date: new Date('2023-01-10T00:00:00Z'),
            entity_type: 'company',
            entity_id: 1,
            assigned_to: 2,
            created_by: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-10T00:00:00Z'),
            completed_at: new Date('2023-01-10T00:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    mockTaskRepository.findByPriority.mockImplementation((priority) => {
      if (priority === 'high') {
        return [
          {
            id: 1,
            title: 'First task',
            description: 'Description for first task',
            status: 'pending',
            priority,
            due_date: new Date('2023-01-15T00:00:00Z'),
            entity_type: 'contact',
            entity_id: 1,
            assigned_to: 1,
            created_by: 1,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: null,
            completed_at: null
          }
        ];
      }
      
      if (priority === 'medium') {
        return [
          {
            id: 2,
            title: 'Second task',
            description: 'Description for second task',
            status: 'completed',
            priority,
            due_date: new Date('2023-01-10T00:00:00Z'),
            entity_type: 'company',
            entity_id: 1,
            assigned_to: 2,
            created_by: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-10T00:00:00Z'),
            completed_at: new Date('2023-01-10T00:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    mockTaskRepository.findByDueDate.mockImplementation((startDate, endDate) => {
      const tasks = [
        {
          id: 1,
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
        },
        {
          id: 2,
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
        }
      ];
      
      return tasks.filter(task => {
        const dueDate = new Date(task.due_date);
        return dueDate >= startDate && dueDate <= endDate;
      });
    });
    
    mockNotificationService.notifyTaskDueSoon.mockResolvedValue(true);
  });

  describe('getTasksByUser', () => {
    test('should return tasks for user 1', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await taskService.getTasksByUser(userId);
      
      // Assert
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result[0].assigned_to).toBe(userId);
      expect(result[0].title).toBe('First task');
    });
    
    test('should return tasks for user 2', async () => {
      // Arrange
      const userId = 2;
      
      // Act
      const result = await taskService.getTasksByUser(userId);
      
      // Assert
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result[0].assigned_to).toBe(userId);
      expect(result[0].title).toBe('Second task');
    });
    
    test('should return empty array when user has no tasks', async () => {
      // Arrange
      const userId = 999;
      
      // Act
      const result = await taskService.getTasksByUser(userId);
      
      // Assert
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getTasksByEntity', () => {
    test('should return tasks for a contact', async () => {
      // Arrange
      const entityType = 'contact';
      const entityId = 1;
      
      // Act
      const result = await taskService.getTasksByEntity(entityType, entityId);
      
      // Assert
      expect(mockTaskRepository.findByEntityId).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toHaveLength(1);
      expect(result[0].entity_type).toBe(entityType);
      expect(result[0].entity_id).toBe(entityId);
      expect(result[0].title).toBe('First task');
    });
    
    test('should return tasks for a company', async () => {
      // Arrange
      const entityType = 'company';
      const entityId = 1;
      
      // Act
      const result = await taskService.getTasksByEntity(entityType, entityId);
      
      // Assert
      expect(mockTaskRepository.findByEntityId).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toHaveLength(1);
      expect(result[0].entity_type).toBe(entityType);
      expect(result[0].entity_id).toBe(entityId);
      expect(result[0].title).toBe('Second task');
    });
    
    test('should return tasks for a deal', async () => {
      // Arrange
      const entityType = 'deal';
      const entityId = 1;
      
      // Act
      const result = await taskService.getTasksByEntity(entityType, entityId);
      
      // Assert
      expect(mockTaskRepository.findByEntityId).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toHaveLength(1);
      expect(result[0].entity_type).toBe(entityType);
      expect(result[0].entity_id).toBe(entityId);
      expect(result[0].title).toBe('Deal task');
    });
    
    test('should return empty array when entity has no tasks', async () => {
      // Arrange
      const entityType = 'contact';
      const entityId = 999;
      
      // Act
      const result = await taskService.getTasksByEntity(entityType, entityId);
      
      // Assert
      expect(mockTaskRepository.findByEntityId).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getTasksByStatus', () => {
    test('should return pending tasks', async () => {
      // Arrange
      const status = 'pending';
      
      // Act
      const result = await taskService.getTasksByStatus(status);
      
      // Assert
      expect(mockTaskRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(status);
      expect(result[0].title).toBe('First task');
    });
    
    test('should return completed tasks', async () => {
      // Arrange
      const status = 'completed';
      
      // Act
      const result = await taskService.getTasksByStatus(status);
      
      // Assert
      expect(mockTaskRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(status);
      expect(result[0].title).toBe('Second task');
    });
    
    test('should return empty array when no tasks with status exist', async () => {
      // Arrange
      const status = 'in_progress';
      
      // Mock implementation for this specific test
      mockTaskRepository.findByStatus.mockResolvedValue([]);
      
      // Act
      const result = await taskService.getTasksByStatus(status);
      
      // Assert
      expect(mockTaskRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toEqual([]);
    });
  });
  
  describe('getTasksByPriority', () => {
    test('should return high priority tasks', async () => {
      // Arrange
      const priority = 'high';
      
      // Act
      const result = await taskService.getTasksByPriority(priority);
      
      // Assert
      expect(mockTaskRepository.findByPriority).toHaveBeenCalledWith(priority);
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe(priority);
      expect(result[0].title).toBe('First task');
    });
    
    test('should return medium priority tasks', async () => {
      // Arrange
      const priority = 'medium';
      
      // Act
      const result = await taskService.getTasksByPriority(priority);
      
      // Assert
      expect(mockTaskRepository.findByPriority).toHaveBeenCalledWith(priority);
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe(priority);
      expect(result[0].title).toBe('Second task');
    });
    
    test('should return empty array when no tasks with priority exist', async () => {
      // Arrange
      const priority = 'low';
      
      // Mock implementation for this specific test
      mockTaskRepository.findByPriority.mockResolvedValue([]);
      
      // Act
      const result = await taskService.getTasksByPriority(priority);
      
      // Assert
      expect(mockTaskRepository.findByPriority).toHaveBeenCalledWith(priority);
      expect(result).toEqual([]);
    });
  });
  
  describe('getTasksByDueDate', () => {
    test('should return tasks within date range', async () => {
      // Arrange
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-31T23:59:59Z');
      
      // Act
      const result = await taskService.getTasksByDueDate(startDate, endDate);
      
      // Assert
      expect(mockTaskRepository.findByDueDate).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toHaveLength(2);
    });
    
    test('should return tasks for first half of January', async () => {
      // Arrange
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-15T23:59:59Z');
      
      // Act
      const result = await taskService.getTasksByDueDate(startDate, endDate);
      
      // Assert
      expect(mockTaskRepository.findByDueDate).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toHaveLength(2);
    });
    
    test('should return tasks for second half of January', async () => {
      // Arrange
      const startDate = new Date('2023-01-16T00:00:00Z');
      const endDate = new Date('2023-01-31T23:59:59Z');
      
      // Mock implementation for this specific test
      mockTaskRepository.findByDueDate.mockResolvedValue([]);
      
      // Act
      const result = await taskService.getTasksByDueDate(startDate, endDate);
      
      // Assert
      expect(mockTaskRepository.findByDueDate).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual([]);
    });
    
    test('should return empty array when no tasks in date range', async () => {
      // Arrange
      const startDate = new Date('2023-02-01T00:00:00Z');
      const endDate = new Date('2023-02-28T23:59:59Z');
      
      // Mock implementation for this specific test
      mockTaskRepository.findByDueDate.mockResolvedValue([]);
      
      // Act
      const result = await taskService.getTasksByDueDate(startDate, endDate);
      
      // Assert
      expect(mockTaskRepository.findByDueDate).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual([]);
    });
  });
  
  describe('checkDueTasks', () => {
    test('should check for due tasks and send notifications', async () => {
      // Arrange
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dueTasks = [
        {
          id: 1,
          title: 'Due task 1',
          status: 'pending',
          assigned_to: 1,
          due_date: today
        },
        {
          id: 2,
          title: 'Due task 2',
          status: 'pending',
          assigned_to: 2,
          due_date: tomorrow
        },
        {
          id: 3,
          title: 'Completed task',
          status: 'completed',
          assigned_to: 1,
          due_date: today
        },
        {
          id: 4,
          title: 'Unassigned task',
          status: 'pending',
          assigned_to: null,
          due_date: today
        }
      ];
      
      mockTaskRepository.findByDueDate.mockResolvedValue(dueTasks);
      
      // Act
      const result = await taskService.checkDueTasks();
      
      // Assert
      expect(mockTaskRepository.findByDueDate).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date)
      );
      
      expect(mockNotificationService.notifyTaskDueSoon).toHaveBeenCalledTimes(2);
      expect(mockNotificationService.notifyTaskDueSoon).toHaveBeenCalledWith(dueTasks[0]);
      expect(mockNotificationService.notifyTaskDueSoon).toHaveBeenCalledWith(dueTasks[1]);
      expect(mockNotificationService.notifyTaskDueSoon).not.toHaveBeenCalledWith(dueTasks[2]); // Completed task
      expect(mockNotificationService.notifyTaskDueSoon).not.toHaveBeenCalledWith(dueTasks[3]); // Unassigned task
      
      expect(result).toBe(4); // Total number of due tasks
    });
    
    test('should return 0 when no due tasks', async () => {
      // Arrange
      mockTaskRepository.findByDueDate.mockResolvedValue([]);
      
      // Act
      const result = await taskService.checkDueTasks();
      
      // Assert
      expect(mockTaskRepository.findByDueDate).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date)
      );
      
      expect(mockNotificationService.notifyTaskDueSoon).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });
});
