/**
 * Unit tests for notification service - update operations
 */

describe('Notification Service - Update Operations', () => {
  // Mock dependencies
  const mockNotificationRepository = {
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn()
  };
  
  // Mock notification service
  const notificationService = {
    updateNotification: async (id, notificationData) => {
      const notification = await mockNotificationRepository.findById(id);
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      return await mockNotificationRepository.update(id, {
        ...notificationData,
        updated_at: new Date()
      });
    },
    
    deleteNotification: async (id) => {
      const notification = await mockNotificationRepository.findById(id);
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      return await mockNotificationRepository.delete(id);
    },
    
    markNotificationAsRead: async (id) => {
      const notification = await mockNotificationRepository.findById(id);
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      return await mockNotificationRepository.markAsRead(id);
    },
    
    markAllNotificationsAsRead: async (userId) => {
      return await mockNotificationRepository.markAllAsRead(userId);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockNotificationRepository.findById.mockReset();
    mockNotificationRepository.update.mockReset();
    mockNotificationRepository.delete.mockReset();
    mockNotificationRepository.markAsRead.mockReset();
    mockNotificationRepository.markAllAsRead.mockReset();
    
    // Default mock implementations
    mockNotificationRepository.findById.mockImplementation((id) => {
      if (id === 999) {
        return null;
      }
      
      if (id === 1) {
        return {
          id,
          user_id: 1,
          type: 'task_assignment',
          title: 'New Task Assigned',
          message: 'You have been assigned a new task: First task',
          entity_type: 'task',
          entity_id: 1,
          status: 'unread',
          email_enabled: true,
          push_enabled: true,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: null
        };
      }
      
      if (id === 2) {
        return {
          id,
          user_id: 1,
          type: 'deal_status_change',
          title: 'Deal Status Changed',
          message: 'Deal "First Deal" status changed to won',
          entity_type: 'deal',
          entity_id: 1,
          status: 'read',
          email_enabled: true,
          push_enabled: true,
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: new Date('2023-01-02T01:00:00Z')
        };
      }
      
      return null;
    });
    
    mockNotificationRepository.update.mockImplementation((id, notificationData) => ({
      id,
      ...(id === 1 ? {
        user_id: 1,
        type: 'task_assignment',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: First task',
        entity_type: 'task',
        entity_id: 1,
        status: 'unread',
        email_enabled: true,
        push_enabled: true,
        created_at: new Date('2023-01-01T00:00:00Z')
      } : {
        user_id: 1,
        type: 'deal_status_change',
        title: 'Deal Status Changed',
        message: 'Deal "First Deal" status changed to won',
        entity_type: 'deal',
        entity_id: 1,
        status: 'read',
        email_enabled: true,
        push_enabled: true,
        created_at: new Date('2023-01-02T00:00:00Z'),
        updated_at: new Date('2023-01-02T01:00:00Z')
      }),
      ...notificationData
    }));
    
    mockNotificationRepository.delete.mockResolvedValue(true);
    
    mockNotificationRepository.markAsRead.mockImplementation((id) => ({
      id,
      ...(id === 1 ? {
        user_id: 1,
        type: 'task_assignment',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: First task',
        entity_type: 'task',
        entity_id: 1,
        email_enabled: true,
        push_enabled: true,
        created_at: new Date('2023-01-01T00:00:00Z')
      } : {
        user_id: 1,
        type: 'deal_status_change',
        title: 'Deal Status Changed',
        message: 'Deal "First Deal" status changed to won',
        entity_type: 'deal',
        entity_id: 1,
        email_enabled: true,
        push_enabled: true,
        created_at: new Date('2023-01-02T00:00:00Z')
      }),
      status: 'read',
      updated_at: expect.any(Date)
    }));
    
    mockNotificationRepository.markAllAsRead.mockResolvedValue(2);
  });

  describe('updateNotification', () => {
    test('should update an existing notification', async () => {
      // Arrange
      const notificationId = 1;
      const notificationData = {
        title: 'Updated Title',
        message: 'Updated message'
      };
      
      // Act
      const result = await notificationService.updateNotification(notificationId, notificationData);
      
      // Assert
      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationRepository.update).toHaveBeenCalledWith(notificationId, {
        ...notificationData,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: notificationId,
        user_id: 1,
        type: 'task_assignment',
        title: 'Updated Title',
        message: 'Updated message',
        entity_type: 'task',
        entity_id: 1,
        status: 'unread',
        email_enabled: true,
        push_enabled: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when notification is not found', async () => {
      // Arrange
      const notificationId = 999;
      const notificationData = {
        title: 'Updated Title'
      };
      
      // Act & Assert
      await expect(notificationService.updateNotification(notificationId, notificationData)).rejects.toThrow('Notification not found');
      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteNotification', () => {
    test('should delete an existing notification', async () => {
      // Arrange
      const notificationId = 1;
      
      // Act
      const result = await notificationService.deleteNotification(notificationId);
      
      // Assert
      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationRepository.delete).toHaveBeenCalledWith(notificationId);
      expect(result).toBe(true);
    });
    
    test('should throw error when notification is not found', async () => {
      // Arrange
      const notificationId = 999;
      
      // Act & Assert
      await expect(notificationService.deleteNotification(notificationId)).rejects.toThrow('Notification not found');
      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('markNotificationAsRead', () => {
    test('should mark an unread notification as read', async () => {
      // Arrange
      const notificationId = 1;
      
      // Act
      const result = await notificationService.markNotificationAsRead(notificationId);
      
      // Assert
      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith(notificationId);
      
      expect(result).toEqual({
        id: notificationId,
        user_id: 1,
        type: 'task_assignment',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: First task',
        entity_type: 'task',
        entity_id: 1,
        status: 'read',
        email_enabled: true,
        push_enabled: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should mark an already read notification as read', async () => {
      // Arrange
      const notificationId = 2;
      
      // Act
      const result = await notificationService.markNotificationAsRead(notificationId);
      
      // Assert
      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith(notificationId);
      
      expect(result).toEqual({
        id: notificationId,
        user_id: 1,
        type: 'deal_status_change',
        title: 'Deal Status Changed',
        message: 'Deal "First Deal" status changed to won',
        entity_type: 'deal',
        entity_id: 1,
        status: 'read',
        email_enabled: true,
        push_enabled: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when notification is not found', async () => {
      // Arrange
      const notificationId = 999;
      
      // Act & Assert
      await expect(notificationService.markNotificationAsRead(notificationId)).rejects.toThrow('Notification not found');
      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationRepository.markAsRead).not.toHaveBeenCalled();
    });
  });
  
  describe('markAllNotificationsAsRead', () => {
    test('should mark all notifications as read for a user', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await notificationService.markAllNotificationsAsRead(userId);
      
      // Assert
      expect(mockNotificationRepository.markAllAsRead).toHaveBeenCalledWith(userId);
      expect(result).toBe(2);
    });
  });
});
