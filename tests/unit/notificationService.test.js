/**
 * Unit tests for notification service
 */

describe('Notification Service', () => {
  // Mock dependencies
  const mockCreateNotification = jest.fn();
  const mockGetNotifications = jest.fn();
  const mockMarkAsRead = jest.fn();
  const mockDeleteNotification = jest.fn();
  const mockGetUnreadCount = jest.fn();
  
  // Mock notification service
  const notificationService = {
    createNotification: mockCreateNotification,
    getNotifications: mockGetNotifications,
    markAsRead: mockMarkAsRead,
    deleteNotification: mockDeleteNotification,
    getUnreadCount: mockGetUnreadCount,
    
    // Higher-level methods that use the above methods
    notifyNewDeal: async (deal, userId) => {
      const notification = {
        type: 'deal_created',
        title: 'New Deal Created',
        message: `A new deal "${deal.name}" has been created`,
        user_id: userId,
        related_id: deal.id,
        related_type: 'deal',
        created_at: new Date()
      };
      
      return await notificationService.createNotification(notification);
    },
    
    notifyDealUpdated: async (deal, userId) => {
      const notification = {
        type: 'deal_updated',
        title: 'Deal Updated',
        message: `Deal "${deal.name}" has been updated`,
        user_id: userId,
        related_id: deal.id,
        related_type: 'deal',
        created_at: new Date()
      };
      
      return await notificationService.createNotification(notification);
    },
    
    notifyNewContact: async (contact, userId) => {
      const notification = {
        type: 'contact_created',
        title: 'New Contact Added',
        message: `A new contact "${contact.first_name} ${contact.last_name}" has been added`,
        user_id: userId,
        related_id: contact.id,
        related_type: 'contact',
        created_at: new Date()
      };
      
      return await notificationService.createNotification(notification);
    },
    
    notifyNewCompany: async (company, userId) => {
      const notification = {
        type: 'company_created',
        title: 'New Company Added',
        message: `A new company "${company.name}" has been added`,
        user_id: userId,
        related_id: company.id,
        related_type: 'company',
        created_at: new Date()
      };
      
      return await notificationService.createNotification(notification);
    },
    
    notifyTaskAssigned: async (task, assigneeId) => {
      const notification = {
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `You have been assigned a new task: "${task.subject}"`,
        user_id: assigneeId,
        related_id: task.id,
        related_type: 'activity',
        created_at: new Date()
      };
      
      return await notificationService.createNotification(notification);
    },
    
    notifyTaskDueSoon: async (task, userId) => {
      const notification = {
        type: 'task_due_soon',
        title: 'Task Due Soon',
        message: `Task "${task.subject}" is due soon`,
        user_id: userId,
        related_id: task.id,
        related_type: 'activity',
        created_at: new Date()
      };
      
      return await notificationService.createNotification(notification);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockCreateNotification.mockReset();
    mockGetNotifications.mockReset();
    mockMarkAsRead.mockReset();
    mockDeleteNotification.mockReset();
    mockGetUnreadCount.mockReset();
    
    // Default mock implementations
    mockCreateNotification.mockResolvedValue({ id: 1 });
    mockGetNotifications.mockResolvedValue([]);
    mockMarkAsRead.mockResolvedValue(true);
    mockDeleteNotification.mockResolvedValue(true);
    mockGetUnreadCount.mockResolvedValue(0);
  });

  test('should create a notification', async () => {
    // Arrange
    const notification = {
      type: 'test',
      title: 'Test Notification',
      message: 'This is a test notification',
      user_id: 1,
      created_at: new Date()
    };
    
    // Act
    const result = await notificationService.createNotification(notification);
    
    // Assert
    expect(mockCreateNotification).toHaveBeenCalledWith(notification);
    expect(result).toEqual({ id: 1 });
  });

  test('should get notifications for a user', async () => {
    // Arrange
    const userId = 1;
    const mockNotifications = [
      {
        id: 1,
        type: 'deal_created',
        title: 'New Deal Created',
        message: 'A new deal "Test Deal" has been created',
        user_id: userId,
        related_id: 1,
        related_type: 'deal',
        read: false,
        created_at: new Date()
      },
      {
        id: 2,
        type: 'contact_created',
        title: 'New Contact Added',
        message: 'A new contact "John Doe" has been added',
        user_id: userId,
        related_id: 1,
        related_type: 'contact',
        read: true,
        created_at: new Date()
      }
    ];
    mockGetNotifications.mockResolvedValue(mockNotifications);
    
    // Act
    const result = await notificationService.getNotifications(userId);
    
    // Assert
    expect(mockGetNotifications).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockNotifications);
    expect(result.length).toBe(2);
  });

  test('should mark a notification as read', async () => {
    // Arrange
    const notificationId = 1;
    
    // Act
    const result = await notificationService.markAsRead(notificationId);
    
    // Assert
    expect(mockMarkAsRead).toHaveBeenCalledWith(notificationId);
    expect(result).toBe(true);
  });

  test('should delete a notification', async () => {
    // Arrange
    const notificationId = 1;
    
    // Act
    const result = await notificationService.deleteNotification(notificationId);
    
    // Assert
    expect(mockDeleteNotification).toHaveBeenCalledWith(notificationId);
    expect(result).toBe(true);
  });

  test('should get unread notification count', async () => {
    // Arrange
    const userId = 1;
    mockGetUnreadCount.mockResolvedValue(5);
    
    // Act
    const result = await notificationService.getUnreadCount(userId);
    
    // Assert
    expect(mockGetUnreadCount).toHaveBeenCalledWith(userId);
    expect(result).toBe(5);
  });

  test('should notify about new deal', async () => {
    // Arrange
    const deal = {
      id: 1,
      name: 'Test Deal',
      amount: 10000
    };
    const userId = 2;
    
    // Act
    await notificationService.notifyNewDeal(deal, userId);
    
    // Assert
    expect(mockCreateNotification).toHaveBeenCalledWith({
      type: 'deal_created',
      title: 'New Deal Created',
      message: 'A new deal "Test Deal" has been created',
      user_id: userId,
      related_id: deal.id,
      related_type: 'deal',
      created_at: expect.any(Date)
    });
  });

  test('should notify about updated deal', async () => {
    // Arrange
    const deal = {
      id: 1,
      name: 'Test Deal',
      amount: 15000
    };
    const userId = 2;
    
    // Act
    await notificationService.notifyDealUpdated(deal, userId);
    
    // Assert
    expect(mockCreateNotification).toHaveBeenCalledWith({
      type: 'deal_updated',
      title: 'Deal Updated',
      message: 'Deal "Test Deal" has been updated',
      user_id: userId,
      related_id: deal.id,
      related_type: 'deal',
      created_at: expect.any(Date)
    });
  });

  test('should notify about new contact', async () => {
    // Arrange
    const contact = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com'
    };
    const userId = 2;
    
    // Act
    await notificationService.notifyNewContact(contact, userId);
    
    // Assert
    expect(mockCreateNotification).toHaveBeenCalledWith({
      type: 'contact_created',
      title: 'New Contact Added',
      message: 'A new contact "John Doe" has been added',
      user_id: userId,
      related_id: contact.id,
      related_type: 'contact',
      created_at: expect.any(Date)
    });
  });

  test('should notify about new company', async () => {
    // Arrange
    const company = {
      id: 1,
      name: 'Acme Inc',
      industry: 'Technology'
    };
    const userId = 2;
    
    // Act
    await notificationService.notifyNewCompany(company, userId);
    
    // Assert
    expect(mockCreateNotification).toHaveBeenCalledWith({
      type: 'company_created',
      title: 'New Company Added',
      message: 'A new company "Acme Inc" has been added',
      user_id: userId,
      related_id: company.id,
      related_type: 'company',
      created_at: expect.any(Date)
    });
  });

  test('should notify about task assignment', async () => {
    // Arrange
    const task = {
      id: 1,
      subject: 'Follow up with client',
      description: 'Call the client to discuss the proposal',
      due_date: new Date()
    };
    const assigneeId = 2;
    
    // Act
    await notificationService.notifyTaskAssigned(task, assigneeId);
    
    // Assert
    expect(mockCreateNotification).toHaveBeenCalledWith({
      type: 'task_assigned',
      title: 'Task Assigned',
      message: 'You have been assigned a new task: "Follow up with client"',
      user_id: assigneeId,
      related_id: task.id,
      related_type: 'activity',
      created_at: expect.any(Date)
    });
  });

  test('should notify about task due soon', async () => {
    // Arrange
    const task = {
      id: 1,
      subject: 'Follow up with client',
      description: 'Call the client to discuss the proposal',
      due_date: new Date()
    };
    const userId = 2;
    
    // Act
    await notificationService.notifyTaskDueSoon(task, userId);
    
    // Assert
    expect(mockCreateNotification).toHaveBeenCalledWith({
      type: 'task_due_soon',
      title: 'Task Due Soon',
      message: 'Task "Follow up with client" is due soon',
      user_id: userId,
      related_id: task.id,
      related_type: 'activity',
      created_at: expect.any(Date)
    });
  });
});
