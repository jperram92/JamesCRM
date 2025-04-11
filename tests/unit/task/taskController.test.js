/**
 * Unit tests for task controller
 */

describe('Task Controller', () => {
  // Mock dependencies
  const mockTaskService = {
    getAllTasks: jest.fn(),
    getTaskById: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn()
  };

  // Mock request and response
  let req;
  let res;

  // Mock task controller
  const taskController = {
    getAllTasks: async (req, res) => {
      try {
        const tasks = await mockTaskService.getAllTasks();
        res.json(tasks);
      } catch (error) {
        res.status(500).json({ message: 'Server error while fetching tasks' });
      }
    },

    getTaskById: async (req, res) => {
      try {
        const task = await mockTaskService.getTaskById(req.params.id);
        res.json(task);
      } catch (error) {
        if (error.message === 'Task not found') {
          res.status(404).json({ message: 'Task not found' });
        } else {
          res.status(500).json({ message: 'Server error while fetching task' });
        }
      }
    },

    createTask: async (req, res) => {
      try {
        const task = await mockTaskService.createTask(req.body);
        res.status(201).json(task);
      } catch (error) {
        res.status(500).json({ message: 'Server error while creating task' });
      }
    },

    updateTask: async (req, res) => {
      try {
        const task = await mockTaskService.updateTask(req.params.id, req.body);
        res.json(task);
      } catch (error) {
        if (error.message === 'Task not found') {
          res.status(404).json({ message: 'Task not found' });
        } else {
          res.status(500).json({ message: 'Server error while updating task' });
        }
      }
    },

    deleteTask: async (req, res) => {
      try {
        await mockTaskService.deleteTask(req.params.id);
        res.json({ message: 'Task deleted successfully' });
      } catch (error) {
        if (error.message === 'Task not found') {
          res.status(404).json({ message: 'Task not found' });
        } else {
          res.status(500).json({ message: 'Server error while deleting task' });
        }
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockTaskService.getAllTasks.mockReset();
    mockTaskService.getTaskById.mockReset();
    mockTaskService.createTask.mockReset();
    mockTaskService.updateTask.mockReset();
    mockTaskService.deleteTask.mockReset();

    // Initialize req and res for each test
    req = {
      params: {},
      body: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getAllTasks', () => {
    test('should return all tasks', async () => {
      // Arrange
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'pending' },
        { id: 2, title: 'Task 2', status: 'completed' }
      ];
      mockTaskService.getAllTasks.mockResolvedValue(mockTasks);

      // Act
      await taskController.getAllTasks(req, res);

      // Assert
      expect(mockTaskService.getAllTasks).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockTasks);
    });

    test('should handle errors', async () => {
      // Arrange
      mockTaskService.getAllTasks.mockRejectedValue(new Error('Database error'));

      // Act
      await taskController.getAllTasks(req, res);

      // Assert
      expect(mockTaskService.getAllTasks).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching tasks' });
    });
  });

  describe('getTaskById', () => {
    test('should return a task when a valid ID is provided', async () => {
      // Arrange
      const taskId = '1';
      const mockTask = { id: 1, title: 'Task 1', status: 'pending' };
      req.params.id = taskId;
      mockTaskService.getTaskById.mockResolvedValue(mockTask);

      // Act
      await taskController.getTaskById(req, res);

      // Assert
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith(taskId);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    test('should return 404 when task is not found', async () => {
      // Arrange
      const taskId = '999';
      req.params.id = taskId;
      mockTaskService.getTaskById.mockRejectedValue(new Error('Task not found'));

      // Act
      await taskController.getTaskById(req, res);

      // Assert
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith(taskId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
    });

    test('should handle server errors', async () => {
      // Arrange
      const taskId = '1';
      req.params.id = taskId;
      mockTaskService.getTaskById.mockRejectedValue(new Error('Database error'));

      // Act
      await taskController.getTaskById(req, res);

      // Assert
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith(taskId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching task' });
    });
  });

  describe('createTask', () => {
    test('should create a new task', async () => {
      // Arrange
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        status: 'pending',
        priority: 'medium',
        due_date: '2023-12-31',
        assigned_to: 1
      };
      const newTask = { id: 3, ...taskData };
      req.body = taskData;
      mockTaskService.createTask.mockResolvedValue(newTask);

      // Act
      await taskController.createTask(req, res);

      // Assert
      expect(mockTaskService.createTask).toHaveBeenCalledWith(taskData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newTask);
    });

    test('should handle server errors', async () => {
      // Arrange
      const taskData = { title: 'New Task' };
      req.body = taskData;
      mockTaskService.createTask.mockRejectedValue(new Error('Database error'));

      // Act
      await taskController.createTask(req, res);

      // Assert
      expect(mockTaskService.createTask).toHaveBeenCalledWith(taskData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while creating task' });
    });
  });

  describe('updateTask', () => {
    test('should update an existing task', async () => {
      // Arrange
      const taskId = '1';
      const taskData = {
        title: 'Updated Task',
        status: 'completed'
      };
      const updatedTask = { id: 1, ...taskData };
      req.params.id = taskId;
      req.body = taskData;
      mockTaskService.updateTask.mockResolvedValue(updatedTask);

      // Act
      await taskController.updateTask(req, res);

      // Assert
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(taskId, taskData);
      expect(res.json).toHaveBeenCalledWith(updatedTask);
    });

    test('should return 404 when task is not found', async () => {
      // Arrange
      const taskId = '999';
      const taskData = { title: 'Updated Task' };
      req.params.id = taskId;
      req.body = taskData;
      mockTaskService.updateTask.mockRejectedValue(new Error('Task not found'));

      // Act
      await taskController.updateTask(req, res);

      // Assert
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(taskId, taskData);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
    });

    test('should handle server errors', async () => {
      // Arrange
      const taskId = '1';
      const taskData = { title: 'Updated Task' };
      req.params.id = taskId;
      req.body = taskData;
      mockTaskService.updateTask.mockRejectedValue(new Error('Database error'));

      // Act
      await taskController.updateTask(req, res);

      // Assert
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(taskId, taskData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while updating task' });
    });
  });

  describe('deleteTask', () => {
    test('should delete an existing task', async () => {
      // Arrange
      const taskId = '1';
      req.params.id = taskId;
      mockTaskService.deleteTask.mockResolvedValue(true);

      // Act
      await taskController.deleteTask(req, res);

      // Assert
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task deleted successfully' });
    });

    test('should return 404 when task is not found', async () => {
      // Arrange
      const taskId = '999';
      req.params.id = taskId;
      mockTaskService.deleteTask.mockRejectedValue(new Error('Task not found'));

      // Act
      await taskController.deleteTask(req, res);

      // Assert
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });
    });

    test('should handle server errors', async () => {
      // Arrange
      const taskId = '1';
      req.params.id = taskId;
      mockTaskService.deleteTask.mockRejectedValue(new Error('Database error'));

      // Act
      await taskController.deleteTask(req, res);

      // Assert
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting task' });
    });
  });
});
