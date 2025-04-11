/**
 * Unit tests for settings service
 */

describe('Settings Service', () => {
  // Mock dependencies
  const mockSettingsRepository = {
    findAll: jest.fn(),
    findByKey: jest.fn(),
    findByUser: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn()
  };
  
  // Mock settings service
  const settingsService = {
    getAllSettings: async () => {
      return await mockSettingsRepository.findAll();
    },
    
    getSettingByKey: async (key) => {
      const setting = await mockSettingsRepository.findByKey(key);
      if (!setting) return null;
      return setting;
    },
    
    getUserSettings: async (userId) => {
      return await mockSettingsRepository.findByUser(userId);
    },
    
    updateSetting: async (key, value, userId) => {
      return await mockSettingsRepository.upsert(key, value, userId);
    },
    
    deleteSetting: async (key, userId) => {
      const setting = await mockSettingsRepository.findByKey(key);
      if (!setting) throw new Error('Setting not found');
      if (setting.user_id !== userId) throw new Error('Unauthorized');
      return await mockSettingsRepository.delete(key, userId);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockSettingsRepository.findAll.mockReset();
    mockSettingsRepository.findByKey.mockReset();
    mockSettingsRepository.findByUser.mockReset();
    mockSettingsRepository.upsert.mockReset();
    mockSettingsRepository.delete.mockReset();
    
    // Default mock implementations
    mockSettingsRepository.findAll.mockResolvedValue([
      { key: 'theme', value: 'dark', user_id: null },
      { key: 'language', value: 'en', user_id: null },
      { key: 'notifications', value: 'true', user_id: 1 }
    ]);
    
    mockSettingsRepository.findByKey.mockImplementation((key) => {
      if (key === 'theme') return { key: 'theme', value: 'dark', user_id: null };
      if (key === 'language') return { key: 'language', value: 'en', user_id: null };
      if (key === 'notifications') return { key: 'notifications', value: 'true', user_id: 1 };
      return null;
    });
    
    mockSettingsRepository.findByUser.mockImplementation((userId) => {
      if (userId === 1) {
        return [
          { key: 'notifications', value: 'true', user_id: 1 },
          { key: 'dashboard_layout', value: 'compact', user_id: 1 }
        ];
      }
      return [];
    });
    
    mockSettingsRepository.upsert.mockImplementation((key, value, userId) => ({
      key,
      value,
      user_id: userId,
      updated_at: new Date()
    }));
    
    mockSettingsRepository.delete.mockResolvedValue(true);
  });

  describe('getAllSettings', () => {
    test('should return all settings', async () => {
      // Act
      const result = await settingsService.getAllSettings();
      
      // Assert
      expect(mockSettingsRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(3);
      expect(result[0].key).toBe('theme');
      expect(result[1].key).toBe('language');
      expect(result[2].key).toBe('notifications');
    });
  });
  
  describe('getSettingByKey', () => {
    test('should return setting by key', async () => {
      // Arrange
      const key = 'theme';
      
      // Act
      const result = await settingsService.getSettingByKey(key);
      
      // Assert
      expect(mockSettingsRepository.findByKey).toHaveBeenCalledWith(key);
      expect(result).toEqual({
        key: 'theme',
        value: 'dark',
        user_id: null
      });
    });
    
    test('should return null when setting is not found', async () => {
      // Arrange
      const key = 'nonexistent';
      
      // Act
      const result = await settingsService.getSettingByKey(key);
      
      // Assert
      expect(mockSettingsRepository.findByKey).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
  });
  
  describe('getUserSettings', () => {
    test('should return settings for a user', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await settingsService.getUserSettings(userId);
      
      // Assert
      expect(mockSettingsRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBe(userId);
      expect(result[1].user_id).toBe(userId);
    });
    
    test('should return empty array when user has no settings', async () => {
      // Arrange
      const userId = 999;
      
      // Act
      const result = await settingsService.getUserSettings(userId);
      
      // Assert
      expect(mockSettingsRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
  
  describe('updateSetting', () => {
    test('should update a setting', async () => {
      // Arrange
      const key = 'theme';
      const value = 'light';
      const userId = 1;
      
      // Act
      const result = await settingsService.updateSetting(key, value, userId);
      
      // Assert
      expect(mockSettingsRepository.upsert).toHaveBeenCalledWith(key, value, userId);
      expect(result).toEqual({
        key,
        value,
        user_id: userId,
        updated_at: expect.any(Date)
      });
    });
  });
  
  describe('deleteSetting', () => {
    test('should delete a setting', async () => {
      // Arrange
      const key = 'notifications';
      const userId = 1;
      
      // Act
      const result = await settingsService.deleteSetting(key, userId);
      
      // Assert
      expect(mockSettingsRepository.findByKey).toHaveBeenCalledWith(key);
      expect(mockSettingsRepository.delete).toHaveBeenCalledWith(key, userId);
      expect(result).toBe(true);
    });
    
    test('should throw error when setting is not found', async () => {
      // Arrange
      const key = 'nonexistent';
      const userId = 1;
      
      // Act & Assert
      await expect(settingsService.deleteSetting(key, userId)).rejects.toThrow('Setting not found');
      expect(mockSettingsRepository.findByKey).toHaveBeenCalledWith(key);
      expect(mockSettingsRepository.delete).not.toHaveBeenCalled();
    });
    
    test('should throw error when user is unauthorized', async () => {
      // Arrange
      const key = 'notifications';
      const userId = 2;
      
      // Act & Assert
      await expect(settingsService.deleteSetting(key, userId)).rejects.toThrow('Unauthorized');
      expect(mockSettingsRepository.findByKey).toHaveBeenCalledWith(key);
      expect(mockSettingsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
