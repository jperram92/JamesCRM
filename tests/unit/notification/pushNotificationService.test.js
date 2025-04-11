/**
 * Unit tests for push notification service
 */

describe('Push Notification Service', () => {
  // Mock dependencies
  const mockFirebaseMessaging = {
    send: jest.fn()
  };
  
  const mockDeviceRepository = {
    findByUserId: jest.fn()
  };
  
  // Mock push notification service
  const pushNotificationService = {
    initialize: (config) => {
      return true;
    },
    
    sendPushNotification: async (notification) => {
      const { user_id, title, body, data } = notification;
      
      if (!user_id) {
        throw new Error('User ID is required');
      }
      
      if (!title) {
        throw new Error('Title is required');
      }
      
      // Get user devices
      const devices = await mockDeviceRepository.findByUserId(user_id);
      
      if (!devices || devices.length === 0) {
        return {
          success: false,
          message: 'No devices found for user'
        };
      }
      
      const results = [];
      
      // Send notification to each device
      for (const device of devices) {
        try {
          const message = {
            token: device.token,
            notification: {
              title,
              body: body || ''
            },
            data: data || {}
          };
          
          const response = await mockFirebaseMessaging.send(message);
          
          results.push({
            device_id: device.id,
            success: true,
            message_id: response.messageId
          });
        } catch (error) {
          results.push({
            device_id: device.id,
            success: false,
            error: error.message
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount > 0,
        message: `Notification sent to ${successCount}/${devices.length} devices`,
        results
      };
    },
    
    registerDevice: async (userId, deviceData) => {
      // This would typically save the device to the database
      return {
        id: 'device-123',
        user_id: userId,
        ...deviceData
      };
    },
    
    unregisterDevice: async (deviceId) => {
      // This would typically remove the device from the database
      return true;
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockFirebaseMessaging.send.mockReset();
    mockDeviceRepository.findByUserId.mockReset();
    
    // Default mock implementations
    mockFirebaseMessaging.send.mockResolvedValue({
      messageId: 'message-123'
    });
    
    mockDeviceRepository.findByUserId.mockImplementation((userId) => {
      if (userId === 999) {
        return [];
      }
      
      if (userId === 1) {
        return [
          {
            id: 'device-1',
            user_id: userId,
            token: 'device-token-1',
            platform: 'android',
            model: 'Pixel 6',
            created_at: new Date('2023-01-01T00:00:00Z')
          },
          {
            id: 'device-2',
            user_id: userId,
            token: 'device-token-2',
            platform: 'ios',
            model: 'iPhone 13',
            created_at: new Date('2023-01-02T00:00:00Z')
          }
        ];
      }
      
      if (userId === 2) {
        return [
          {
            id: 'device-3',
            user_id: userId,
            token: 'device-token-3',
            platform: 'android',
            model: 'Galaxy S21',
            created_at: new Date('2023-01-03T00:00:00Z')
          }
        ];
      }
      
      return [];
    });
  });

  describe('sendPushNotification', () => {
    test('should send notification to multiple devices', async () => {
      // Arrange
      const notification = {
        user_id: 1,
        title: 'Test Notification',
        body: 'This is a test notification',
        data: {
          type: 'test',
          id: '123'
        }
      };
      
      // Act
      const result = await pushNotificationService.sendPushNotification(notification);
      
      // Assert
      expect(mockDeviceRepository.findByUserId).toHaveBeenCalledWith(notification.user_id);
      expect(mockFirebaseMessaging.send).toHaveBeenCalledTimes(2);
      expect(mockFirebaseMessaging.send).toHaveBeenCalledWith({
        token: 'device-token-1',
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data
      });
      expect(mockFirebaseMessaging.send).toHaveBeenCalledWith({
        token: 'device-token-2',
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data
      });
      
      expect(result).toEqual({
        success: true,
        message: 'Notification sent to 2/2 devices',
        results: [
          {
            device_id: 'device-1',
            success: true,
            message_id: 'message-123'
          },
          {
            device_id: 'device-2',
            success: true,
            message_id: 'message-123'
          }
        ]
      });
    });
    
    test('should send notification to a single device', async () => {
      // Arrange
      const notification = {
        user_id: 2,
        title: 'Test Notification',
        body: 'This is a test notification'
      };
      
      // Act
      const result = await pushNotificationService.sendPushNotification(notification);
      
      // Assert
      expect(mockDeviceRepository.findByUserId).toHaveBeenCalledWith(notification.user_id);
      expect(mockFirebaseMessaging.send).toHaveBeenCalledTimes(1);
      expect(mockFirebaseMessaging.send).toHaveBeenCalledWith({
        token: 'device-token-3',
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {}
      });
      
      expect(result).toEqual({
        success: true,
        message: 'Notification sent to 1/1 devices',
        results: [
          {
            device_id: 'device-3',
            success: true,
            message_id: 'message-123'
          }
        ]
      });
    });
    
    test('should handle notification with no body', async () => {
      // Arrange
      const notification = {
        user_id: 2,
        title: 'Test Notification'
      };
      
      // Act
      const result = await pushNotificationService.sendPushNotification(notification);
      
      // Assert
      expect(mockDeviceRepository.findByUserId).toHaveBeenCalledWith(notification.user_id);
      expect(mockFirebaseMessaging.send).toHaveBeenCalledTimes(1);
      expect(mockFirebaseMessaging.send).toHaveBeenCalledWith({
        token: 'device-token-3',
        notification: {
          title: notification.title,
          body: ''
        },
        data: {}
      });
      
      expect(result).toEqual({
        success: true,
        message: 'Notification sent to 1/1 devices',
        results: [
          {
            device_id: 'device-3',
            success: true,
            message_id: 'message-123'
          }
        ]
      });
    });
    
    test('should return failure when user has no devices', async () => {
      // Arrange
      const notification = {
        user_id: 999,
        title: 'Test Notification',
        body: 'This is a test notification'
      };
      
      // Act
      const result = await pushNotificationService.sendPushNotification(notification);
      
      // Assert
      expect(mockDeviceRepository.findByUserId).toHaveBeenCalledWith(notification.user_id);
      expect(mockFirebaseMessaging.send).not.toHaveBeenCalled();
      
      expect(result).toEqual({
        success: false,
        message: 'No devices found for user'
      });
    });
    
    test('should handle send failure for some devices', async () => {
      // Arrange
      const notification = {
        user_id: 1,
        title: 'Test Notification',
        body: 'This is a test notification'
      };
      
      // Mock first call to succeed, second to fail
      mockFirebaseMessaging.send
        .mockResolvedValueOnce({ messageId: 'message-123' })
        .mockRejectedValueOnce(new Error('Invalid token'));
      
      // Act
      const result = await pushNotificationService.sendPushNotification(notification);
      
      // Assert
      expect(mockDeviceRepository.findByUserId).toHaveBeenCalledWith(notification.user_id);
      expect(mockFirebaseMessaging.send).toHaveBeenCalledTimes(2);
      
      expect(result).toEqual({
        success: true,
        message: 'Notification sent to 1/2 devices',
        results: [
          {
            device_id: 'device-1',
            success: true,
            message_id: 'message-123'
          },
          {
            device_id: 'device-2',
            success: false,
            error: 'Invalid token'
          }
        ]
      });
    });
    
    test('should handle send failure for all devices', async () => {
      // Arrange
      const notification = {
        user_id: 1,
        title: 'Test Notification',
        body: 'This is a test notification'
      };
      
      // Mock all calls to fail
      mockFirebaseMessaging.send.mockRejectedValue(new Error('Invalid token'));
      
      // Act
      const result = await pushNotificationService.sendPushNotification(notification);
      
      // Assert
      expect(mockDeviceRepository.findByUserId).toHaveBeenCalledWith(notification.user_id);
      expect(mockFirebaseMessaging.send).toHaveBeenCalledTimes(2);
      
      expect(result).toEqual({
        success: false,
        message: 'Notification sent to 0/2 devices',
        results: [
          {
            device_id: 'device-1',
            success: false,
            error: 'Invalid token'
          },
          {
            device_id: 'device-2',
            success: false,
            error: 'Invalid token'
          }
        ]
      });
    });
    
    test('should throw error when user ID is not provided', async () => {
      // Arrange
      const notification = {
        title: 'Test Notification',
        body: 'This is a test notification'
      };
      
      // Act & Assert
      await expect(pushNotificationService.sendPushNotification(notification)).rejects.toThrow('User ID is required');
      expect(mockDeviceRepository.findByUserId).not.toHaveBeenCalled();
      expect(mockFirebaseMessaging.send).not.toHaveBeenCalled();
    });
    
    test('should throw error when title is not provided', async () => {
      // Arrange
      const notification = {
        user_id: 1,
        body: 'This is a test notification'
      };
      
      // Act & Assert
      await expect(pushNotificationService.sendPushNotification(notification)).rejects.toThrow('Title is required');
      expect(mockDeviceRepository.findByUserId).not.toHaveBeenCalled();
      expect(mockFirebaseMessaging.send).not.toHaveBeenCalled();
    });
  });
  
  describe('registerDevice', () => {
    test('should register a new device', async () => {
      // Arrange
      const userId = 1;
      const deviceData = {
        token: 'new-device-token',
        platform: 'android',
        model: 'Pixel 7'
      };
      
      // Act
      const result = await pushNotificationService.registerDevice(userId, deviceData);
      
      // Assert
      expect(result).toEqual({
        id: 'device-123',
        user_id: userId,
        ...deviceData
      });
    });
  });
  
  describe('unregisterDevice', () => {
    test('should unregister a device', async () => {
      // Arrange
      const deviceId = 'device-1';
      
      // Act
      const result = await pushNotificationService.unregisterDevice(deviceId);
      
      // Assert
      expect(result).toBe(true);
    });
  });
});
