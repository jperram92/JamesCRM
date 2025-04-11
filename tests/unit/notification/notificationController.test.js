/**
 * Unit tests for notification controller
 */

describe('Notification Controller', () => {
  // Mock dependencies
  const mockNotificationService = {
    getAllNotifications: jest.fn(),
    getNotificationById: jest.fn(),
    getNotificationsByUser: jest.fn(),
    createNotification: jest.fn(),
    updateNotification: jest.fn(),
    deleteNotification: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn()
  };
  
  // Mock request and response
  const mockRequest = () => {
    const req = {};
    req.body = jest.fn().mockReturnValue(req);
    req.params = jest.fn().mockReturnValue(req);
    req.query = jest.fn().mockReturnValue(req);
    req.user = { id: 1 };
    return req;
  };
  
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  // Mock notification controller
  const notificationController = {
    getAllNotifications: async (req, res) => {
      try {
        const notifications = await mockNotificationService.getAllNotifications();
        res.json(notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error while fetching notifications' });
      }
    },
    
    getNotificationById: async (req, res) => {
      try {
        const { id } = req.params;
        const notification = await mockNotificationService.getNotificationById(id);
        
        if (!notification) {
          return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
      } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({ message: 'Server error while fetching notification' });
      }
    },
    
    getNotificationsByUser: async (req, res) => {
      try {
        const userId = req.params.userId || req.user.id;
        const notifications = await mockNotificationService.getNotificationsByUser(userId);
        res.json(notifications);
      } catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({ message: 'Server error while fetching user notifications' });
      }
    },
    
    createNotification: async (req, res) => {
      try {
        const notificationData = req.body;
        const notification = await mockNotificationService.createNotification(notificationData);
        res.status(201).json(notification);
      } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Server error while creating notification' });
      }
    },
    
    updateNotification: async (req, res) => {
      try {
        const { id } = req.params;
        const notificationData = req.body;
        
        const notification = await mockNotificationService.getNotificationById(id);
        
        if (!notification) {
          return res.status(404).json({ message: 'Notification not found' });
        }
        
        const updatedNotification = await mockNotificationService.updateNotification(id, notificationData);
        res.json(updatedNotification);
      } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Server error while updating notification' });
      }
    },
    
    deleteNotification: async (req, res) => {
      try {
        const { id } = req.params;
        
        const notification = await mockNotificationService.getNotificationById(id);
        
        if (!notification) {
          return res.status(404).json({ message: 'Notification not found' });
        }
        
        await mockNotificationService.deleteNotification(id);
        res.json({ message: 'Notification deleted successfully' });
      } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server error while deleting notification' });
      }
    },
    
    markAsRead: async (req, res) => {
      try {
        const { id } = req.params;
        
        const notification = await mockNotificationService.getNotificationById(id);
        
        if (!notification) {
          return res.status(404).json({ message: 'Notification not found' });
        }
        
        const updatedNotification = await mockNotificationService.markAsRead(id);
        res.json(updatedNotification);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error while marking notification as read' });
      }
    },
    
    markAllAsRead: async (req, res) => {
      try {
        const userId = req.params.userId || req.user.id;
        await mockNotificationService.markAllAsRead(userId);
        res.json({ message: 'All notifications marked as read' });
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Server error while marking all notifications as read' });
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllNotifications', () => {
    test('should return all notifications', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const mockNotifications = [
        { id: 1, title: 'Notification 1', message: 'Message 1', user_id: 1, read: false },
        { id: 2, title: 'Notification 2', message: 'Message 2', user_id: 2, read: true }
      ];
      
      mockNotificationService.getAllNotifications.mockResolvedValue(mockNotifications);
      
      // Act
      await notificationController.getAllNotifications(req, res);
      
      // Assert
      expect(mockNotificationService.getAllNotifications).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockNotifications);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const errorMessage = 'Database error';
      
      mockNotificationService.getAllNotifications.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await notificationController.getAllNotifications(req, res);
      
      // Assert
      expect(mockNotificationService.getAllNotifications).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching notifications' });
    });
  });
  
  describe('getNotificationById', () => {
    test('should return a notification when a valid ID is provided', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '1';
      const mockNotification = { id: 1, title: 'Notification 1', message: 'Message 1', user_id: 1, read: false };
      
      req.params = { id: notificationId };
      mockNotificationService.getNotificationById.mockResolvedValue(mockNotification);
      
      // Act
      await notificationController.getNotificationById(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(res.json).toHaveBeenCalledWith(mockNotification);
    });
    
    test('should return 404 when notification is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '999';
      
      req.params = { id: notificationId };
      mockNotificationService.getNotificationById.mockResolvedValue(null);
      
      // Act
      await notificationController.getNotificationById(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '1';
      const errorMessage = 'Database error';
      
      req.params = { id: notificationId };
      mockNotificationService.getNotificationById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await notificationController.getNotificationById(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching notification' });
    });
  });
  
  describe('getNotificationsByUser', () => {
    test('should return notifications for a user when user ID is provided in params', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = '2';
      const mockNotifications = [
        { id: 3, title: 'Notification 3', message: 'Message 3', user_id: 2, read: false },
        { id: 4, title: 'Notification 4', message: 'Message 4', user_id: 2, read: true }
      ];
      
      req.params = { userId };
      mockNotificationService.getNotificationsByUser.mockResolvedValue(mockNotifications);
      
      // Act
      await notificationController.getNotificationsByUser(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationsByUser).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(mockNotifications);
    });
    
    test('should return notifications for the current user when user ID is not provided', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const currentUserId = 1;
      const mockNotifications = [
        { id: 1, title: 'Notification 1', message: 'Message 1', user_id: 1, read: false },
        { id: 2, title: 'Notification 2', message: 'Message 2', user_id: 1, read: true }
      ];
      
      req.params = {};
      req.user = { id: currentUserId };
      mockNotificationService.getNotificationsByUser.mockResolvedValue(mockNotifications);
      
      // Act
      await notificationController.getNotificationsByUser(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationsByUser).toHaveBeenCalledWith(currentUserId);
      expect(res.json).toHaveBeenCalledWith(mockNotifications);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = '1';
      const errorMessage = 'Database error';
      
      req.params = { userId };
      mockNotificationService.getNotificationsByUser.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await notificationController.getNotificationsByUser(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationsByUser).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching user notifications' });
    });
  });
  
  describe('createNotification', () => {
    test('should create a new notification', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationData = {
        title: 'New Notification',
        message: 'New Message',
        user_id: 1,
        type: 'info'
      };
      const createdNotification = {
        id: 5,
        ...notificationData,
        read: false,
        created_at: new Date()
      };
      
      req.body = notificationData;
      mockNotificationService.createNotification.mockResolvedValue(createdNotification);
      
      // Act
      await notificationController.createNotification(req, res);
      
      // Assert
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(notificationData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdNotification);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationData = {
        title: 'New Notification',
        message: 'New Message',
        user_id: 1,
        type: 'info'
      };
      const errorMessage = 'Database error';
      
      req.body = notificationData;
      mockNotificationService.createNotification.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await notificationController.createNotification(req, res);
      
      // Assert
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(notificationData);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while creating notification' });
    });
  });
  
  describe('updateNotification', () => {
    test('should update an existing notification', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '1';
      const notificationData = {
        title: 'Updated Notification',
        message: 'Updated Message'
      };
      const existingNotification = {
        id: 1,
        title: 'Notification 1',
        message: 'Message 1',
        user_id: 1,
        read: false
      };
      const updatedNotification = {
        ...existingNotification,
        ...notificationData
      };
      
      req.params = { id: notificationId };
      req.body = notificationData;
      mockNotificationService.getNotificationById.mockResolvedValue(existingNotification);
      mockNotificationService.updateNotification.mockResolvedValue(updatedNotification);
      
      // Act
      await notificationController.updateNotification(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationService.updateNotification).toHaveBeenCalledWith(notificationId, notificationData);
      expect(res.json).toHaveBeenCalledWith(updatedNotification);
    });
    
    test('should return 404 when notification is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '999';
      const notificationData = {
        title: 'Updated Notification',
        message: 'Updated Message'
      };
      
      req.params = { id: notificationId };
      req.body = notificationData;
      mockNotificationService.getNotificationById.mockResolvedValue(null);
      
      // Act
      await notificationController.updateNotification(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationService.updateNotification).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '1';
      const notificationData = {
        title: 'Updated Notification',
        message: 'Updated Message'
      };
      const errorMessage = 'Database error';
      
      req.params = { id: notificationId };
      req.body = notificationData;
      mockNotificationService.getNotificationById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await notificationController.updateNotification(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationService.updateNotification).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while updating notification' });
    });
  });
  
  describe('deleteNotification', () => {
    test('should delete an existing notification', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '1';
      const existingNotification = {
        id: 1,
        title: 'Notification 1',
        message: 'Message 1',
        user_id: 1,
        read: false
      };
      
      req.params = { id: notificationId };
      mockNotificationService.getNotificationById.mockResolvedValue(existingNotification);
      mockNotificationService.deleteNotification.mockResolvedValue(true);
      
      // Act
      await notificationController.deleteNotification(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith(notificationId);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification deleted successfully' });
    });
    
    test('should return 404 when notification is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '999';
      
      req.params = { id: notificationId };
      mockNotificationService.getNotificationById.mockResolvedValue(null);
      
      // Act
      await notificationController.deleteNotification(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationService.deleteNotification).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '1';
      const errorMessage = 'Database error';
      
      req.params = { id: notificationId };
      mockNotificationService.getNotificationById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await notificationController.deleteNotification(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationService.deleteNotification).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting notification' });
    });
  });
  
  describe('markAsRead', () => {
    test('should mark a notification as read', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '1';
      const existingNotification = {
        id: 1,
        title: 'Notification 1',
        message: 'Message 1',
        user_id: 1,
        read: false
      };
      const updatedNotification = {
        ...existingNotification,
        read: true
      };
      
      req.params = { id: notificationId };
      mockNotificationService.getNotificationById.mockResolvedValue(existingNotification);
      mockNotificationService.markAsRead.mockResolvedValue(updatedNotification);
      
      // Act
      await notificationController.markAsRead(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(notificationId);
      expect(res.json).toHaveBeenCalledWith(updatedNotification);
    });
    
    test('should return 404 when notification is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '999';
      
      req.params = { id: notificationId };
      mockNotificationService.getNotificationById.mockResolvedValue(null);
      
      // Act
      await notificationController.markAsRead(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationService.markAsRead).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const notificationId = '1';
      const errorMessage = 'Database error';
      
      req.params = { id: notificationId };
      mockNotificationService.getNotificationById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await notificationController.markAsRead(req, res);
      
      // Assert
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationService.markAsRead).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while marking notification as read' });
    });
  });
  
  describe('markAllAsRead', () => {
    test('should mark all notifications as read for a user when user ID is provided in params', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = '2';
      
      req.params = { userId };
      mockNotificationService.markAllAsRead.mockResolvedValue(true);
      
      // Act
      await notificationController.markAllAsRead(req, res);
      
      // Assert
      expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith({ message: 'All notifications marked as read' });
    });
    
    test('should mark all notifications as read for the current user when user ID is not provided', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const currentUserId = 1;
      
      req.params = {};
      req.user = { id: currentUserId };
      mockNotificationService.markAllAsRead.mockResolvedValue(true);
      
      // Act
      await notificationController.markAllAsRead(req, res);
      
      // Assert
      expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith(currentUserId);
      expect(res.json).toHaveBeenCalledWith({ message: 'All notifications marked as read' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = '1';
      const errorMessage = 'Database error';
      
      req.params = { userId };
      mockNotificationService.markAllAsRead.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await notificationController.markAllAsRead(req, res);
      
      // Assert
      expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while marking all notifications as read' });
    });
  });
});
