/**
 * Unit tests for user preferences service
 */

describe('User Preferences Service', () => {
  // Mock dependencies
  const mockPreferencesRepository = {
    findByUser: jest.fn(),
    update: jest.fn()
  };
  
  const mockUserRepository = {
    findById: jest.fn()
  };
  
  // Mock user preferences service
  const userPreferencesService = {
    getUserPreferences: async (userId) => {
      // Validate user exists
      const user = await mockUserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const preferences = await mockPreferencesRepository.findByUser(userId);
      
      // Return default preferences if none found
      if (!preferences) {
        return {
          user_id: userId,
          theme: 'light',
          language: 'en',
          notifications_enabled: true,
          email_notifications: true,
          dashboard_layout: 'default'
        };
      }
      
      return preferences;
    },
    
    updateUserPreferences: async (userId, preferencesData) => {
      // Validate user exists
      const user = await mockUserRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get current preferences
      const currentPreferences = await userPreferencesService.getUserPreferences(userId);
      
      // Update preferences
      return await mockPreferencesRepository.update(userId, {
        ...currentPreferences,
        ...preferencesData,
        updated_at: new Date()
      });
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUserRepository.findById.mockImplementation((id) => {
      if (id === 1) {
        return { id, first_name: 'John', last_name: 'Doe' };
      }
      if (id === 2) {
        return { id, first_name: 'Jane', last_name: 'Smith' };
      }
      return null;
    });
    
    mockPreferencesRepository.findByUser.mockImplementation((userId) => {
      if (userId === 1) {
        return {
          user_id: userId,
          theme: 'dark',
          language: 'en',
          notifications_enabled: true,
          email_notifications: false,
          dashboard_layout: 'compact',
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-10')
        };
      }
      
      // User 2 has no preferences yet
      if (userId === 2) {
        return null;
      }
      
      return null;
    });
    
    mockPreferencesRepository.update.mockImplementation((userId, data) => ({
      ...data,
      updated_at: expect.any(Date)
    }));
  });

  describe('getUserPreferences', () => {
    test('should return user preferences', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await userPreferencesService.getUserPreferences(userId);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockPreferencesRepository.findByUser).toHaveBeenCalledWith(userId);
      
      expect(result).toEqual({
        user_id: userId,
        theme: 'dark',
        language: 'en',
        notifications_enabled: true,
        email_notifications: false,
        dashboard_layout: 'compact',
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should return default preferences when none exist', async () => {
      // Arrange
      const userId = 2;
      
      // Act
      const result = await userPreferencesService.getUserPreferences(userId);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockPreferencesRepository.findByUser).toHaveBeenCalledWith(userId);
      
      expect(result).toEqual({
        user_id: userId,
        theme: 'light',
        language: 'en',
        notifications_enabled: true,
        email_notifications: true,
        dashboard_layout: 'default'
      });
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      
      // Act & Assert
      await expect(userPreferencesService.getUserPreferences(userId))
        .rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockPreferencesRepository.findByUser).not.toHaveBeenCalled();
    });
  });
  
  describe('updateUserPreferences', () => {
    test('should update existing user preferences', async () => {
      // Arrange
      const userId = 1;
      const updateData = {
        theme: 'light',
        dashboard_layout: 'detailed'
      };
      
      // Act
      const result = await userPreferencesService.updateUserPreferences(userId, updateData);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockPreferencesRepository.findByUser).toHaveBeenCalledWith(userId);
      
      expect(mockPreferencesRepository.update).toHaveBeenCalledWith(userId, {
        user_id: userId,
        theme: 'light', // Updated
        language: 'en',
        notifications_enabled: true,
        email_notifications: false,
        dashboard_layout: 'detailed', // Updated
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        user_id: userId,
        theme: 'light',
        language: 'en',
        notifications_enabled: true,
        email_notifications: false,
        dashboard_layout: 'detailed',
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should create preferences for user without existing preferences', async () => {
      // Arrange
      const userId = 2;
      const updateData = {
        theme: 'dark',
        language: 'fr'
      };
      
      // Act
      const result = await userPreferencesService.updateUserPreferences(userId, updateData);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockPreferencesRepository.findByUser).toHaveBeenCalledWith(userId);
      
      expect(mockPreferencesRepository.update).toHaveBeenCalledWith(userId, {
        user_id: userId,
        theme: 'dark', // From update data
        language: 'fr', // From update data
        notifications_enabled: true, // Default
        email_notifications: true, // Default
        dashboard_layout: 'default', // Default
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        user_id: userId,
        theme: 'dark',
        language: 'fr',
        notifications_enabled: true,
        email_notifications: true,
        dashboard_layout: 'default',
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when user is not found', async () => {
      // Arrange
      const userId = 999;
      const updateData = {
        theme: 'dark'
      };
      
      // Act & Assert
      await expect(userPreferencesService.updateUserPreferences(userId, updateData))
        .rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockPreferencesRepository.findByUser).not.toHaveBeenCalled();
      expect(mockPreferencesRepository.update).not.toHaveBeenCalled();
    });
  });
});
