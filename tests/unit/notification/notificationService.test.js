/**
 * Unit tests for notification service
 */

describe('Notification Service', () => {
  // Mock dependencies
  const mockNotificationRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByUserId: jest.fn(),
    findByType: jest.fn(),
    findByStatus: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn()
  };
  
  const mockEmailService = {
    sendEmail: jest.fn()
  };
  
  const mockPushNotificationService = {
    sendPushNotification: jest.fn()
  };
  
  // Mock notification service
  const notificationService = {
    getAllNotifications: async () => {
      return await mockNotificationRepository.findAll();
    },
    
    getNotificationById: async (id) => {
      const notification = await mockNotificationRepository.findById(id);
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      return notification;
    },
    
    createNotification: async (notificationData) => {
      const notification = await mockNotificationRepository.create({
        ...notificationData,
        status: 'unread',
        created_at: new Date()
      });
      
      // Send email notification if email is enabled
      if (notification.email_enabled && notification.user_id) {
        const user = { id: notification.user_id, email: `user${notification.user_id}@example.com` };
        
        await mockEmailService.sendEmail({
          to: user.email,
          from: 'notifications@jamescrm.com',
          subject: notification.title,
          text: notification.message
        });
      }
      
      // Send push notification if push is enabled
      if (notification.push_enabled && notification.user_id) {
        await mockPushNotificationService.sendPushNotification({
          user_id: notification.user_id,
          title: notification.title,
          body: notification.message,
          data: {
            notification_id: notification.id,
            type: notification.type
          }
        });
      }
      
      return notification;
    },
    
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
    
    getNotificationsByUser: async (userId) => {
      return await mockNotificationRepository.findByUserId(userId);
    },
    
    getNotificationsByType: async (type) => {
      return await mockNotificationRepository.findByType(type);
    },
    
    getNotificationsByStatus: async (status) => {
      return await mockNotificationRepository.findByStatus(status);
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
    },
    
    notifyTaskAssignment: async (task) => {
      if (!task.assigned_to) {
        return null;
      }
      
      return await notificationService.createNotification({
        user_id: task.assigned_to,
        type: 'task_assignment',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        entity_type: 'task',
        entity_id: task.id,
        email_enabled: true,
        push_enabled: true
      });
    },
    
    notifyTaskDueSoon: async (task) => {
      if (!task.assigned_to) {
        return null;
      }
      
      return await notificationService.createNotification({
        user_id: task.assigned_to,
        type: 'task_due_soon',
        title: 'Task Due Soon',
        message: `Task "${task.title}" is due soon`,
        entity_type: 'task',
        entity_id: task.id,
        email_enabled: true,
        push_enabled: true
      });
    },
    
    notifyDealStatusChange: async (deal, userId) => {
      return await notificationService.createNotification({
        user_id: userId,
        type: 'deal_status_change',
        title: 'Deal Status Changed',
        message: `Deal "${deal.name}" status changed to ${deal.status}`,
        entity_type: 'deal',
        entity_id: deal.id,
        email_enabled: true,
        push_enabled: true
      });
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockNotificationRepository.findAll.mockReset();
    mockNotificationRepository.findById.mockReset();
    mockNotificationRepository.create.mockReset();
    mockNotificationRepository.update.mockReset();
    mockNotificationRepository.delete.mockReset();
    mockNotificationRepository.findByUserId.mockReset();
    mockNotificationRepository.findByType.mockReset();
    mockNotificationRepository.findByStatus.mockReset();
    mockNotificationRepository.markAsRead.mockReset();
    mockNotificationRepository.markAllAsRead.mockReset();
    mockEmailService.sendEmail.mockReset();
    mockPushNotificationService.sendPushNotification.mockReset();
    
    // Default mock implementations
    mockNotificationRepository.findAll.mockResolvedValue([
      {
        id: 1,
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
      },
      {
        id: 2,
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
      }
    ]);
    
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
    
    mockNotificationRepository.create.mockImplementation((notificationData) => ({
      id: 3,
      ...notificationData
    }));
    
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
    
    mockEmailService.sendEmail.mockResolvedValue({
      success: true,
      message: 'Email sent successfully'
    });
    
    mockPushNotificationService.sendPushNotification.mockResolvedValue({
      success: true,
      message: 'Push notification sent successfully'
    });
  });

  describe('getAllNotifications', () => {
    test('should return all notifications', async () => {
      // Act
      const result = await notificationService.getAllNotifications();
      
      // Assert
      expect(mockNotificationRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
  
  describe('getNotificationById', () => {
    test('should return notification by ID', async () => {
      // Arrange
      const notificationId = 1;
      
      // Act
      const result = await notificationService.getNotificationById(notificationId);
      
      // Assert
      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(notificationId);
      expect(result).toEqual({
        id: notificationId,
        user_id: 1,
        type: 'task_assignment',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: First task',
        entity_type: 'task',
        entity_id: 1,
        status: 'unread',
        email_enabled: true,
        push_enabled: true,
        created_at: expect.any(Date),
        updated_at: null
      });
    });
    
    test('should throw error when notification is not found', async () => {
      // Arrange
      const notificationId = 999;
      
      // Act & Assert
      await expect(notificationService.getNotificationById(notificationId)).rejects.toThrow('Notification not found');
      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(notificationId);
    });
  });
  
  describe('createNotification', () => {
    test('should create a new notification with email and push', async () => {
      // Arrange
      const notificationData = {
        user_id: 1,
        type: 'task_due_soon',
        title: 'Task Due Soon',
        message: 'Task "First task" is due soon',
        entity_type: 'task',
        entity_id: 1,
        email_enabled: true,
        push_enabled: true
      };
      
      // Act
      const result = await notificationService.createNotification(notificationData);
      
      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        ...notificationData,
        status: 'unread',
        created_at: expect.any(Date)
      });
      
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'user1@example.com',
        from: 'notifications@jamescrm.com',
        subject: notificationData.title,
        text: notificationData.message
      });
      
      expect(mockPushNotificationService.sendPushNotification).toHaveBeenCalledWith({
        user_id: notificationData.user_id,
        title: notificationData.title,
        body: notificationData.message,
        data: {
          notification_id: 3,
          type: notificationData.type
        }
      });
      
      expect(result).toEqual({
        id: 3,
        ...notificationData,
        status: 'unread',
        created_at: expect.any(Date)
      });
    });
    
    test('should create a notification with email only', async () => {
      // Arrange
      const notificationData = {
        user_id: 1,
        type: 'task_due_soon',
        title: 'Task Due Soon',
        message: 'Task "First task" is due soon',
        entity_type: 'task',
        entity_id: 1,
        email_enabled: true,
        push_enabled: false
      };
      
      // Act
      const result = await notificationService.createNotification(notificationData);
      
      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        ...notificationData,
        status: 'unread',
        created_at: expect.any(Date)
      });
      
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(mockPushNotificationService.sendPushNotification).not.toHaveBeenCalled();
      
      expect(result).toEqual({
        id: 3,
        ...notificationData,
        status: 'unread',
        created_at: expect.any(Date)
      });
    });
    
    test('should create a notification with push only', async () => {
      // Arrange
      const notificationData = {
        user_id: 1,
        type: 'task_due_soon',
        title: 'Task Due Soon',
        message: 'Task "First task" is due soon',
        entity_type: 'task',
        entity_id: 1,
        email_enabled: false,
        push_enabled: true
      };
      
      // Act
      const result = await notificationService.createNotification(notificationData);
      
      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        ...notificationData,
        status: 'unread',
        created_at: expect.any(Date)
      });
      
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
      expect(mockPushNotificationService.sendPushNotification).toHaveBeenCalled();
      
      expect(result).toEqual({
        id: 3,
        ...notificationData,
        status: 'unread',
        created_at: expect.any(Date)
      });
    });
    
    test('should create a notification without email or push', async () => {
      // Arrange
      const notificationData = {
        user_id: 1,
        type: 'task_due_soon',
        title: 'Task Due Soon',
        message: 'Task "First task" is due soon',
        entity_type: 'task',
        entity_id: 1,
        email_enabled: false,
        push_enabled: false
      };
      
      // Act
      const result = await notificationService.createNotification(notificationData);
      
      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        ...notificationData,
        status: 'unread',
        created_at: expect.any(Date)
      });
      
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
      expect(mockPushNotificationService.sendPushNotification).not.toHaveBeenCalled();
      
      expect(result).toEqual({
        id: 3,
        ...notificationData,
        status: 'unread',
        created_at: expect.any(Date)
      });
    });
  });
});
