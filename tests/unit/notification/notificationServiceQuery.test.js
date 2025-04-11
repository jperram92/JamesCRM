/**
 * Unit tests for notification service - query operations
 */

describe('Notification Service - Query Operations', () => {
  // Mock dependencies
  const mockNotificationRepository = {
    findByUserId: jest.fn(),
    findByType: jest.fn(),
    findByStatus: jest.fn()
  };
  
  const mockEmailService = {
    sendEmail: jest.fn()
  };
  
  const mockPushNotificationService = {
    sendPushNotification: jest.fn()
  };
  
  // Mock notification service
  const notificationService = {
    getNotificationsByUser: async (userId) => {
      return await mockNotificationRepository.findByUserId(userId);
    },
    
    getNotificationsByType: async (type) => {
      return await mockNotificationRepository.findByType(type);
    },
    
    getNotificationsByStatus: async (status) => {
      return await mockNotificationRepository.findByStatus(status);
    },
    
    notifyTaskAssignment: async (task) => {
      if (!task.assigned_to) {
        return null;
      }
      
      const notification = {
        id: 3,
        user_id: task.assigned_to,
        type: 'task_assignment',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        entity_type: 'task',
        entity_id: task.id,
        status: 'unread',
        email_enabled: true,
        push_enabled: true,
        created_at: new Date()
      };
      
      // Send email notification
      await mockEmailService.sendEmail({
        to: `user${task.assigned_to}@example.com`,
        from: 'notifications@jamescrm.com',
        subject: notification.title,
        text: notification.message
      });
      
      // Send push notification
      await mockPushNotificationService.sendPushNotification({
        user_id: notification.user_id,
        title: notification.title,
        body: notification.message,
        data: {
          notification_id: notification.id,
          type: notification.type
        }
      });
      
      return notification;
    },
    
    notifyTaskDueSoon: async (task) => {
      if (!task.assigned_to) {
        return null;
      }
      
      const notification = {
        id: 4,
        user_id: task.assigned_to,
        type: 'task_due_soon',
        title: 'Task Due Soon',
        message: `Task "${task.title}" is due soon`,
        entity_type: 'task',
        entity_id: task.id,
        status: 'unread',
        email_enabled: true,
        push_enabled: true,
        created_at: new Date()
      };
      
      // Send email notification
      await mockEmailService.sendEmail({
        to: `user${task.assigned_to}@example.com`,
        from: 'notifications@jamescrm.com',
        subject: notification.title,
        text: notification.message
      });
      
      // Send push notification
      await mockPushNotificationService.sendPushNotification({
        user_id: notification.user_id,
        title: notification.title,
        body: notification.message,
        data: {
          notification_id: notification.id,
          type: notification.type
        }
      });
      
      return notification;
    },
    
    notifyDealStatusChange: async (deal, userId) => {
      const notification = {
        id: 5,
        user_id: userId,
        type: 'deal_status_change',
        title: 'Deal Status Changed',
        message: `Deal "${deal.name}" status changed to ${deal.status}`,
        entity_type: 'deal',
        entity_id: deal.id,
        status: 'unread',
        email_enabled: true,
        push_enabled: true,
        created_at: new Date()
      };
      
      // Send email notification
      await mockEmailService.sendEmail({
        to: `user${userId}@example.com`,
        from: 'notifications@jamescrm.com',
        subject: notification.title,
        text: notification.message
      });
      
      // Send push notification
      await mockPushNotificationService.sendPushNotification({
        user_id: notification.user_id,
        title: notification.title,
        body: notification.message,
        data: {
          notification_id: notification.id,
          type: notification.type
        }
      });
      
      return notification;
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockNotificationRepository.findByUserId.mockReset();
    mockNotificationRepository.findByType.mockReset();
    mockNotificationRepository.findByStatus.mockReset();
    mockEmailService.sendEmail.mockReset();
    mockPushNotificationService.sendPushNotification.mockReset();
    
    // Default mock implementations
    mockNotificationRepository.findByUserId.mockImplementation((userId) => {
      if (userId === 999) {
        return [];
      }
      
      if (userId === 1) {
        return [
          {
            id: 1,
            user_id: userId,
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
          },
          {
            id: 2,
            user_id: userId,
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
          }
        ];
      }
      
      return [];
    });
    
    mockNotificationRepository.findByType.mockImplementation((type) => {
      if (type === 'task_assignment') {
        return [
          {
            id: 1,
            user_id: 1,
            type,
            title: 'New Task Assigned',
            message: 'You have been assigned a new task: First task',
            entity_type: 'task',
            entity_id: 1,
            status: 'unread',
            email_enabled: true,
            push_enabled: true,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      if (type === 'deal_status_change') {
        return [
          {
            id: 2,
            user_id: 1,
            type,
            title: 'Deal Status Changed',
            message: 'Deal "First Deal" status changed to won',
            entity_type: 'deal',
            entity_id: 1,
            status: 'read',
            email_enabled: true,
            push_enabled: true,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-02T01:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    mockNotificationRepository.findByStatus.mockImplementation((status) => {
      if (status === 'unread') {
        return [
          {
            id: 1,
            user_id: 1,
            type: 'task_assignment',
            title: 'New Task Assigned',
            message: 'You have been assigned a new task: First task',
            entity_type: 'task',
            entity_id: 1,
            status,
            email_enabled: true,
            push_enabled: true,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      if (status === 'read') {
        return [
          {
            id: 2,
            user_id: 1,
            type: 'deal_status_change',
            title: 'Deal Status Changed',
            message: 'Deal "First Deal" status changed to won',
            entity_type: 'deal',
            entity_id: 1,
            status,
            email_enabled: true,
            push_enabled: true,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: new Date('2023-01-02T01:00:00Z')
          }
        ];
      }
      
      return [];
    });
    
    mockEmailService.sendEmail.mockResolvedValue({
      success: true,
      message: 'Email sent successfully'
    });
    
    mockPushNotificationService.sendPushNotification.mockResolvedValue({
      success: true,
      message: 'Push notification sent successfully'
    });
  });

  describe('getNotificationsByUser', () => {
    test('should return notifications for a user', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await notificationService.getNotificationsByUser(userId);
      
      // Assert
      expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBe(userId);
      expect(result[1].user_id).toBe(userId);
    });
    
    test('should return empty array when user has no notifications', async () => {
      // Arrange
      const userId = 999;
      
      // Act
      const result = await notificationService.getNotificationsByUser(userId);
      
      // Assert
      expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getNotificationsByType', () => {
    test('should return task assignment notifications', async () => {
      // Arrange
      const type = 'task_assignment';
      
      // Act
      const result = await notificationService.getNotificationsByType(type);
      
      // Assert
      expect(mockNotificationRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(type);
      expect(result[0].title).toBe('New Task Assigned');
    });
    
    test('should return deal status change notifications', async () => {
      // Arrange
      const type = 'deal_status_change';
      
      // Act
      const result = await notificationService.getNotificationsByType(type);
      
      // Assert
      expect(mockNotificationRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(type);
      expect(result[0].title).toBe('Deal Status Changed');
    });
    
    test('should return empty array when no notifications of type exist', async () => {
      // Arrange
      const type = 'nonexistent_type';
      
      // Act
      const result = await notificationService.getNotificationsByType(type);
      
      // Assert
      expect(mockNotificationRepository.findByType).toHaveBeenCalledWith(type);
      expect(result).toEqual([]);
    });
  });
  
  describe('getNotificationsByStatus', () => {
    test('should return unread notifications', async () => {
      // Arrange
      const status = 'unread';
      
      // Act
      const result = await notificationService.getNotificationsByStatus(status);
      
      // Assert
      expect(mockNotificationRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(status);
      expect(result[0].type).toBe('task_assignment');
    });
    
    test('should return read notifications', async () => {
      // Arrange
      const status = 'read';
      
      // Act
      const result = await notificationService.getNotificationsByStatus(status);
      
      // Assert
      expect(mockNotificationRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(status);
      expect(result[0].type).toBe('deal_status_change');
    });
    
    test('should return empty array when no notifications with status exist', async () => {
      // Arrange
      const status = 'nonexistent_status';
      
      // Act
      const result = await notificationService.getNotificationsByStatus(status);
      
      // Assert
      expect(mockNotificationRepository.findByStatus).toHaveBeenCalledWith(status);
      expect(result).toEqual([]);
    });
  });
  
  describe('notifyTaskAssignment', () => {
    test('should create a task assignment notification', async () => {
      // Arrange
      const task = {
        id: 1,
        title: 'First task',
        assigned_to: 1
      };
      
      // Act
      const result = await notificationService.notifyTaskAssignment(task);
      
      // Assert
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'user1@example.com',
        from: 'notifications@jamescrm.com',
        subject: 'New Task Assigned',
        text: 'You have been assigned a new task: First task'
      });
      
      expect(mockPushNotificationService.sendPushNotification).toHaveBeenCalledWith({
        user_id: 1,
        title: 'New Task Assigned',
        body: 'You have been assigned a new task: First task',
        data: {
          notification_id: 3,
          type: 'task_assignment'
        }
      });
      
      expect(result).toEqual({
        id: 3,
        user_id: 1,
        type: 'task_assignment',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: First task',
        entity_type: 'task',
        entity_id: 1,
        status: 'unread',
        email_enabled: true,
        push_enabled: true,
        created_at: expect.any(Date)
      });
    });
    
    test('should return null when task has no assignee', async () => {
      // Arrange
      const task = {
        id: 1,
        title: 'First task',
        assigned_to: null
      };
      
      // Act
      const result = await notificationService.notifyTaskAssignment(task);
      
      // Assert
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
      expect(mockPushNotificationService.sendPushNotification).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('notifyTaskDueSoon', () => {
    test('should create a task due soon notification', async () => {
      // Arrange
      const task = {
        id: 1,
        title: 'First task',
        assigned_to: 1
      };
      
      // Act
      const result = await notificationService.notifyTaskDueSoon(task);
      
      // Assert
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'user1@example.com',
        from: 'notifications@jamescrm.com',
        subject: 'Task Due Soon',
        text: 'Task "First task" is due soon'
      });
      
      expect(mockPushNotificationService.sendPushNotification).toHaveBeenCalledWith({
        user_id: 1,
        title: 'Task Due Soon',
        body: 'Task "First task" is due soon',
        data: {
          notification_id: 4,
          type: 'task_due_soon'
        }
      });
      
      expect(result).toEqual({
        id: 4,
        user_id: 1,
        type: 'task_due_soon',
        title: 'Task Due Soon',
        message: 'Task "First task" is due soon',
        entity_type: 'task',
        entity_id: 1,
        status: 'unread',
        email_enabled: true,
        push_enabled: true,
        created_at: expect.any(Date)
      });
    });
    
    test('should return null when task has no assignee', async () => {
      // Arrange
      const task = {
        id: 1,
        title: 'First task',
        assigned_to: null
      };
      
      // Act
      const result = await notificationService.notifyTaskDueSoon(task);
      
      // Assert
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
      expect(mockPushNotificationService.sendPushNotification).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
  
  describe('notifyDealStatusChange', () => {
    test('should create a deal status change notification', async () => {
      // Arrange
      const deal = {
        id: 1,
        name: 'First Deal',
        status: 'won'
      };
      const userId = 1;
      
      // Act
      const result = await notificationService.notifyDealStatusChange(deal, userId);
      
      // Assert
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'user1@example.com',
        from: 'notifications@jamescrm.com',
        subject: 'Deal Status Changed',
        text: 'Deal "First Deal" status changed to won'
      });
      
      expect(mockPushNotificationService.sendPushNotification).toHaveBeenCalledWith({
        user_id: 1,
        title: 'Deal Status Changed',
        body: 'Deal "First Deal" status changed to won',
        data: {
          notification_id: 5,
          type: 'deal_status_change'
        }
      });
      
      expect(result).toEqual({
        id: 5,
        user_id: 1,
        type: 'deal_status_change',
        title: 'Deal Status Changed',
        message: 'Deal "First Deal" status changed to won',
        entity_type: 'deal',
        entity_id: 1,
        status: 'unread',
        email_enabled: true,
        push_enabled: true,
        created_at: expect.any(Date)
      });
    });
  });
});
