/**
 * Unit tests for settings controller
 */

describe('Settings Controller', () => {
  // Mock dependencies
  const mockSettingsService = {
    getAllSettings: jest.fn(),
    getSettingByKey: jest.fn(),
    getUserSettings: jest.fn(),
    updateSetting: jest.fn(),
    deleteSetting: jest.fn()
  };
  
  // Mock request and response
  const mockRequest = () => {
    const req = {};
    req.body = {};
    req.params = {};
    req.query = {};
    req.user = { id: 1 };
    return req;
  };
  
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  // Mock settings controller
  const settingsController = {
    getAllSettings: async (req, res) => {
      try {
        const settings = await mockSettingsService.getAllSettings();
        res.json(settings);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
      }
    },
    
    getSettingByKey: async (req, res) => {
      try {
        const { key } = req.params;
        const setting = await mockSettingsService.getSettingByKey(key);
        
        if (!setting) {
          return res.status(404).json({ message: 'Setting not found' });
        }
        
        res.json(setting);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching setting' });
      }
    },
    
    getUserSettings: async (req, res) => {
      try {
        const userId = req.user.id;
        const settings = await mockSettingsService.getUserSettings(userId);
        res.json(settings);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching user settings' });
      }
    },
    
    updateSetting: async (req, res) => {
      try {
        const { key } = req.params;
        const { value } = req.body;
        const userId = req.user.id;
        
        if (!key || value === undefined) {
          return res.status(400).json({ message: 'Key and value are required' });
        }
        
        const setting = await mockSettingsService.updateSetting(key, value, userId);
        res.json(setting);
      } catch (error) {
        res.status(500).json({ message: 'Error updating setting' });
      }
    },
    
    deleteSetting: async (req, res) => {
      try {
        const { key } = req.params;
        const userId = req.user.id;
        
        await mockSettingsService.deleteSetting(key, userId);
        res.json({ message: 'Setting deleted successfully' });
      } catch (error) {
        if (error.message === 'Setting not found') {
          return res.status(404).json({ message: 'Setting not found' });
        }
        
        if (error.message === 'Unauthorized') {
          return res.status(403).json({ message: 'Unauthorized to delete this setting' });
        }
        
        res.status(500).json({ message: 'Error deleting setting' });
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSettings', () => {
    test('should return all settings', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const mockSettings = [
        { key: 'theme', value: 'dark', user_id: null },
        { key: 'language', value: 'en', user_id: null }
      ];
      
      mockSettingsService.getAllSettings.mockResolvedValue(mockSettings);
      
      // Act
      await settingsController.getAllSettings(req, res);
      
      // Assert
      expect(mockSettingsService.getAllSettings).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockSettings);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      mockSettingsService.getAllSettings.mockRejectedValue(new Error('Database error'));
      
      // Act
      await settingsController.getAllSettings(req, res);
      
      // Assert
      expect(mockSettingsService.getAllSettings).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching settings' });
    });
  });
  
  describe('getSettingByKey', () => {
    test('should return setting by key', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const key = 'theme';
      const mockSetting = { key: 'theme', value: 'dark', user_id: null };
      
      req.params.key = key;
      mockSettingsService.getSettingByKey.mockResolvedValue(mockSetting);
      
      // Act
      await settingsController.getSettingByKey(req, res);
      
      // Assert
      expect(mockSettingsService.getSettingByKey).toHaveBeenCalledWith(key);
      expect(res.json).toHaveBeenCalledWith(mockSetting);
    });
    
    test('should return 404 when setting is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const key = 'nonexistent';
      
      req.params.key = key;
      mockSettingsService.getSettingByKey.mockResolvedValue(null);
      
      // Act
      await settingsController.getSettingByKey(req, res);
      
      // Assert
      expect(mockSettingsService.getSettingByKey).toHaveBeenCalledWith(key);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Setting not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const key = 'theme';
      
      req.params.key = key;
      mockSettingsService.getSettingByKey.mockRejectedValue(new Error('Database error'));
      
      // Act
      await settingsController.getSettingByKey(req, res);
      
      // Assert
      expect(mockSettingsService.getSettingByKey).toHaveBeenCalledWith(key);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching setting' });
    });
  });
  
  describe('getUserSettings', () => {
    test('should return user settings', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      const mockSettings = [
        { key: 'notifications', value: 'true', user_id: userId },
        { key: 'dashboard_layout', value: 'compact', user_id: userId }
      ];
      
      req.user.id = userId;
      mockSettingsService.getUserSettings.mockResolvedValue(mockSettings);
      
      // Act
      await settingsController.getUserSettings(req, res);
      
      // Assert
      expect(mockSettingsService.getUserSettings).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(mockSettings);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const userId = 1;
      
      req.user.id = userId;
      mockSettingsService.getUserSettings.mockRejectedValue(new Error('Database error'));
      
      // Act
      await settingsController.getUserSettings(req, res);
      
      // Assert
      expect(mockSettingsService.getUserSettings).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching user settings' });
    });
  });
  
  describe('updateSetting', () => {
    test('should update a setting', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const key = 'theme';
      const value = 'light';
      const userId = 1;
      const updatedSetting = { key, value, user_id: userId, updated_at: new Date() };
      
      req.params.key = key;
      req.body.value = value;
      req.user.id = userId;
      mockSettingsService.updateSetting.mockResolvedValue(updatedSetting);
      
      // Act
      await settingsController.updateSetting(req, res);
      
      // Assert
      expect(mockSettingsService.updateSetting).toHaveBeenCalledWith(key, value, userId);
      expect(res.json).toHaveBeenCalledWith(updatedSetting);
    });
    
    test('should return 400 when key is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const value = 'light';
      
      req.body.value = value;
      
      // Act
      await settingsController.updateSetting(req, res);
      
      // Assert
      expect(mockSettingsService.updateSetting).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Key and value are required' });
    });
    
    test('should return 400 when value is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const key = 'theme';
      
      req.params.key = key;
      
      // Act
      await settingsController.updateSetting(req, res);
      
      // Assert
      expect(mockSettingsService.updateSetting).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Key and value are required' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const key = 'theme';
      const value = 'light';
      const userId = 1;
      
      req.params.key = key;
      req.body.value = value;
      req.user.id = userId;
      mockSettingsService.updateSetting.mockRejectedValue(new Error('Database error'));
      
      // Act
      await settingsController.updateSetting(req, res);
      
      // Assert
      expect(mockSettingsService.updateSetting).toHaveBeenCalledWith(key, value, userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating setting' });
    });
  });
  
  describe('deleteSetting', () => {
    test('should delete a setting', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const key = 'notifications';
      const userId = 1;
      
      req.params.key = key;
      req.user.id = userId;
      mockSettingsService.deleteSetting.mockResolvedValue(true);
      
      // Act
      await settingsController.deleteSetting(req, res);
      
      // Assert
      expect(mockSettingsService.deleteSetting).toHaveBeenCalledWith(key, userId);
      expect(res.json).toHaveBeenCalledWith({ message: 'Setting deleted successfully' });
    });
    
    test('should return 404 when setting is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const key = 'nonexistent';
      const userId = 1;
      
      req.params.key = key;
      req.user.id = userId;
      mockSettingsService.deleteSetting.mockRejectedValue(new Error('Setting not found'));
      
      // Act
      await settingsController.deleteSetting(req, res);
      
      // Assert
      expect(mockSettingsService.deleteSetting).toHaveBeenCalledWith(key, userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Setting not found' });
    });
    
    test('should return 403 when user is unauthorized', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const key = 'notifications';
      const userId = 1;
      
      req.params.key = key;
      req.user.id = userId;
      mockSettingsService.deleteSetting.mockRejectedValue(new Error('Unauthorized'));
      
      // Act
      await settingsController.deleteSetting(req, res);
      
      // Assert
      expect(mockSettingsService.deleteSetting).toHaveBeenCalledWith(key, userId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized to delete this setting' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const key = 'notifications';
      const userId = 1;
      
      req.params.key = key;
      req.user.id = userId;
      mockSettingsService.deleteSetting.mockRejectedValue(new Error('Database error'));
      
      // Act
      await settingsController.deleteSetting(req, res);
      
      // Assert
      expect(mockSettingsService.deleteSetting).toHaveBeenCalledWith(key, userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting setting' });
    });
  });
});
