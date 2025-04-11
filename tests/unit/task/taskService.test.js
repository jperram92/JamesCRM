/**
 * Unit tests for task service
 */

describe('Task Service', () => {
  // Mock dependencies
  const mockTaskRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByUserId: jest.fn(),
    findByEntityId: jest.fn(),
    findByStatus: jest.fn(),
    findByPriority: jest.fn(),
    findByDueDate: jest.fn()
  };
  
  const mockNotificationService = {
    notifyTaskAssignment: jest.fn(),
    notifyTaskDueSoon: jest.fn()
  };
  
  // Mock task service
  const taskService = {
    getAllTasks: async () => {
      return await mockTaskRepository.findAll();
    },
    
    getTaskById: async (id) => {
      const task = await mockTaskRepository.findById(id);
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      return task;
    },
    
    createTask: async (taskData) => {
      const newTask = await mockTaskRepository.create({
        ...taskData,
        status: taskData.status || 'pending',
        created_at: new Date()
      });
      
      if (newTask.assigned_to) {
        await mockNotificationService.notifyTaskAssignment(newTask);
      }
      
      return newTask;
    },
    
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
    mockTaskRepository.findAll.mockReset();
    mockTaskRepository.findById.mockReset();
    mockTaskRepository.create.mockReset();
    mockTaskRepository.update.mockReset();
    mockTaskRepository.delete.mockReset();
    mockTaskRepository.findByUserId.mockReset();
    mockTaskRepository.findByEntityId.mockReset();
    mockTaskRepository.findByStatus.mockReset();
    mockTaskRepository.findByPriority.mockReset();
    mockTaskRepository.findByDueDate.mockReset();
    mockNotificationService.notifyTaskAssignment.mockReset();
    mockNotificationService.notifyTaskDueSoon.mockReset();
    
    // Default mock implementations
    mockTaskRepository.findAll.mockResolvedValue([
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
    ]);
    
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
    
    mockTaskRepository.create.mockImplementation((taskData) => ({
      id: 3,
      ...taskData
    }));
    
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
    
    mockNotificationService.notifyTaskAssignment.mockResolvedValue(true);
    mockNotificationService.notifyTaskDueSoon.mockResolvedValue(true);
  });

  describe('getAllTasks', () => {
    test('should return all tasks', async () => {
      // Act
      const result = await taskService.getAllTasks();
      
      // Assert
      expect(mockTaskRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
  
  describe('getTaskById', () => {
    test('should return task by ID', async () => {
      // Arrange
      const taskId = 1;
      
      // Act
      const result = await taskService.getTaskById(taskId);
      
      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual({
        id: taskId,
        title: 'First task',
        description: 'Description for first task',
        status: 'pending',
        priority: 'high',
        due_date: expect.any(Date),
        entity_type: 'contact',
        entity_id: 1,
        assigned_to: 1,
        created_by: 1,
        created_at: expect.any(Date),
        updated_at: null,
        completed_at: null
      });
    });
    
    test('should throw error when task is not found', async () => {
      // Arrange
      const taskId = 999;
      
      // Act & Assert
      await expect(taskService.getTaskById(taskId)).rejects.toThrow('Task not found');
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
    });
  });
  
  describe('createTask', () => {
    test('should create a new task', async () => {
      // Arrange
      const taskData = {
        title: 'New task',
        description: 'Description for new task',
        priority: 'medium',
        due_date: new Date('2023-01-20T00:00:00Z'),
        entity_type: 'deal',
        entity_id: 1,
        assigned_to: 2,
        created_by: 1
      };
      
      // Act
      const result = await taskService.createTask(taskData);
      
      // Assert
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...taskData,
        status: 'pending',
        created_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: 3,
        ...taskData,
        status: 'pending',
        created_at: expect.any(Date)
      });
      
      expect(mockNotificationService.notifyTaskAssignment).toHaveBeenCalledWith({
        id: 3,
        ...taskData,
        status: 'pending',
        created_at: expect.any(Date)
      });
    });
    
    test('should create a task with specified status', async () => {
      // Arrange
      const taskData = {
        title: 'New task',
        description: 'Description for new task',
        status: 'in_progress',
        priority: 'medium',
        due_date: new Date('2023-01-20T00:00:00Z'),
        entity_type: 'deal',
        entity_id: 1,
        assigned_to: 2,
        created_by: 1
      };
      
      // Act
      const result = await taskService.createTask(taskData);
      
      // Assert
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...taskData,
        created_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: 3,
        ...taskData,
        created_at: expect.any(Date)
      });
      
      expect(mockNotificationService.notifyTaskAssignment).toHaveBeenCalledWith({
        id: 3,
        ...taskData,
        created_at: expect.any(Date)
      });
    });
    
    test('should not notify when task has no assignee', async () => {
      // Arrange
      const taskData = {
        title: 'New task',
        description: 'Description for new task',
        priority: 'medium',
        due_date: new Date('2023-01-20T00:00:00Z'),
        entity_type: 'deal',
        entity_id: 1,
        created_by: 1
      };
      
      // Act
      const result = await taskService.createTask(taskData);
      
      // Assert
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...taskData,
        status: 'pending',
        created_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: 3,
        ...taskData,
        status: 'pending',
        created_at: expect.any(Date)
      });
      
      expect(mockNotificationService.notifyTaskAssignment).not.toHaveBeenCalled();
    });
  });
});
