/**
 * Unit tests for chat message service
 */

describe('Chat Message Service', () => {
  // Mock dependencies
  const mockMessageRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByChat: jest.fn(),
    findByUser: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn()
  };
  
  // Mock chat message service
  const chatMessageService = {
    getAllMessages: async () => {
      return await mockMessageRepository.findAll();
    },
    
    getMessageById: async (id) => {
      const message = await mockMessageRepository.findById(id);
      
      if (!message) {
        throw new Error('Message not found');
      }
      
      return message;
    },
    
    getMessagesByChat: async (chatId) => {
      return await mockMessageRepository.findByChat(chatId);
    },
    
    getMessagesByUser: async (userId) => {
      return await mockMessageRepository.findByUser(userId);
    },
    
    createMessage: async (messageData) => {
      const { content, chat_id, user_id } = messageData;
      
      if (!content) {
        throw new Error('Message content is required');
      }
      
      if (!chat_id) {
        throw new Error('Chat ID is required');
      }
      
      if (!user_id) {
        throw new Error('User ID is required');
      }
      
      return await mockMessageRepository.create(messageData);
    },
    
    updateMessage: async (id, messageData) => {
      const message = await mockMessageRepository.findById(id);
      
      if (!message) {
        throw new Error('Message not found');
      }
      
      if (message.user_id !== messageData.user_id) {
        throw new Error('You can only edit your own messages');
      }
      
      return await mockMessageRepository.update(id, messageData);
    },
    
    deleteMessage: async (id, userId) => {
      const message = await mockMessageRepository.findById(id);
      
      if (!message) {
        throw new Error('Message not found');
      }
      
      if (message.user_id !== userId) {
        throw new Error('You can only delete your own messages');
      }
      
      return await mockMessageRepository.delete(id);
    },
    
    markAsRead: async (id, userId) => {
      const message = await mockMessageRepository.findById(id);
      
      if (!message) {
        throw new Error('Message not found');
      }
      
      return await mockMessageRepository.markAsRead(id, userId);
    },
    
    markAllAsRead: async (chatId, userId) => {
      return await mockMessageRepository.markAllAsRead(chatId, userId);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockMessageRepository.findAll.mockReset();
    mockMessageRepository.findById.mockReset();
    mockMessageRepository.create.mockReset();
    mockMessageRepository.update.mockReset();
    mockMessageRepository.delete.mockReset();
    mockMessageRepository.findByChat.mockReset();
    mockMessageRepository.findByUser.mockReset();
    mockMessageRepository.markAsRead.mockReset();
    mockMessageRepository.markAllAsRead.mockReset();
    
    // Default mock implementations
    mockMessageRepository.findAll.mockResolvedValue([
      {
        id: 1,
        content: 'Hello',
        chat_id: 1,
        user_id: 1,
        created_at: new Date('2023-01-01T10:00:00Z'),
        read_by: [1]
      },
      {
        id: 2,
        content: 'Hi there',
        chat_id: 1,
        user_id: 2,
        created_at: new Date('2023-01-01T10:01:00Z'),
        read_by: [2]
      }
    ]);
    
    mockMessageRepository.findById.mockImplementation((id) => {
      if (id === 1) {
        return {
          id: 1,
          content: 'Hello',
          chat_id: 1,
          user_id: 1,
          created_at: new Date('2023-01-01T10:00:00Z'),
          read_by: [1]
        };
      }
      
      if (id === 2) {
        return {
          id: 2,
          content: 'Hi there',
          chat_id: 1,
          user_id: 2,
          created_at: new Date('2023-01-01T10:01:00Z'),
          read_by: [2]
        };
      }
      
      return null;
    });
    
    mockMessageRepository.findByChat.mockImplementation((chatId) => {
      if (chatId === 1) {
        return [
          {
            id: 1,
            content: 'Hello',
            chat_id: 1,
            user_id: 1,
            created_at: new Date('2023-01-01T10:00:00Z'),
            read_by: [1]
          },
          {
            id: 2,
            content: 'Hi there',
            chat_id: 1,
            user_id: 2,
            created_at: new Date('2023-01-01T10:01:00Z'),
            read_by: [2]
          }
        ];
      }
      
      return [];
    });
    
    mockMessageRepository.findByUser.mockImplementation((userId) => {
      if (userId === 1) {
        return [
          {
            id: 1,
            content: 'Hello',
            chat_id: 1,
            user_id: 1,
            created_at: new Date('2023-01-01T10:00:00Z'),
            read_by: [1]
          }
        ];
      }
      
      if (userId === 2) {
        return [
          {
            id: 2,
            content: 'Hi there',
            chat_id: 1,
            user_id: 2,
            created_at: new Date('2023-01-01T10:01:00Z'),
            read_by: [2]
          }
        ];
      }
      
      return [];
    });
    
    mockMessageRepository.create.mockImplementation((messageData) => ({
      id: 3,
      ...messageData,
      created_at: new Date(),
      read_by: [messageData.user_id]
    }));
    
    mockMessageRepository.update.mockImplementation((id, messageData) => ({
      id,
      ...messageData,
      updated_at: new Date()
    }));
    
    mockMessageRepository.delete.mockResolvedValue(true);
    
    mockMessageRepository.markAsRead.mockImplementation((id, userId) => {
      const message = mockMessageRepository.findById(id);
      return {
        ...message,
        read_by: [...message.read_by, userId]
      };
    });
    
    mockMessageRepository.markAllAsRead.mockResolvedValue(true);
  });

  describe('getAllMessages', () => {
    test('should return all messages', async () => {
      // Act
      const result = await chatMessageService.getAllMessages();
      
      // Assert
      expect(mockMessageRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
  
  describe('getMessageById', () => {
    test('should return message by ID', async () => {
      // Arrange
      const messageId = 1;
      
      // Act
      const result = await chatMessageService.getMessageById(messageId);
      
      // Assert
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(result).toEqual({
        id: messageId,
        content: 'Hello',
        chat_id: 1,
        user_id: 1,
        created_at: expect.any(Date),
        read_by: [1]
      });
    });
    
    test('should throw error when message is not found', async () => {
      // Arrange
      const messageId = 999;
      
      // Act & Assert
      await expect(chatMessageService.getMessageById(messageId)).rejects.toThrow('Message not found');
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
    });
  });
  
  describe('getMessagesByChat', () => {
    test('should return messages by chat ID', async () => {
      // Arrange
      const chatId = 1;
      
      // Act
      const result = await chatMessageService.getMessagesByChat(chatId);
      
      // Assert
      expect(mockMessageRepository.findByChat).toHaveBeenCalledWith(chatId);
      expect(result).toHaveLength(2);
      expect(result[0].chat_id).toBe(chatId);
      expect(result[1].chat_id).toBe(chatId);
    });
    
    test('should return empty array when chat has no messages', async () => {
      // Arrange
      const chatId = 999;
      
      // Act
      const result = await chatMessageService.getMessagesByChat(chatId);
      
      // Assert
      expect(mockMessageRepository.findByChat).toHaveBeenCalledWith(chatId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getMessagesByUser', () => {
    test('should return messages by user ID', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await chatMessageService.getMessagesByUser(userId);
      
      // Assert
      expect(mockMessageRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result[0].user_id).toBe(userId);
    });
    
    test('should return empty array when user has no messages', async () => {
      // Arrange
      const userId = 999;
      
      // Act
      const result = await chatMessageService.getMessagesByUser(userId);
      
      // Assert
      expect(mockMessageRepository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
  
  describe('createMessage', () => {
    test('should create a new message', async () => {
      // Arrange
      const messageData = {
        content: 'New message',
        chat_id: 1,
        user_id: 1
      };
      
      // Act
      const result = await chatMessageService.createMessage(messageData);
      
      // Assert
      expect(mockMessageRepository.create).toHaveBeenCalledWith(messageData);
      expect(result).toEqual({
        id: 3,
        content: 'New message',
        chat_id: 1,
        user_id: 1,
        created_at: expect.any(Date),
        read_by: [1]
      });
    });
    
    test('should throw error when content is missing', async () => {
      // Arrange
      const messageData = {
        chat_id: 1,
        user_id: 1
      };
      
      // Act & Assert
      await expect(chatMessageService.createMessage(messageData)).rejects.toThrow('Message content is required');
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });
    
    test('should throw error when chat ID is missing', async () => {
      // Arrange
      const messageData = {
        content: 'New message',
        user_id: 1
      };
      
      // Act & Assert
      await expect(chatMessageService.createMessage(messageData)).rejects.toThrow('Chat ID is required');
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });
    
    test('should throw error when user ID is missing', async () => {
      // Arrange
      const messageData = {
        content: 'New message',
        chat_id: 1
      };
      
      // Act & Assert
      await expect(chatMessageService.createMessage(messageData)).rejects.toThrow('User ID is required');
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });
  });
  
  describe('updateMessage', () => {
    test('should update an existing message', async () => {
      // Arrange
      const messageId = 1;
      const messageData = {
        content: 'Updated message',
        user_id: 1
      };
      
      // Act
      const result = await chatMessageService.updateMessage(messageId, messageData);
      
      // Assert
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(mockMessageRepository.update).toHaveBeenCalledWith(messageId, messageData);
      expect(result).toEqual({
        id: messageId,
        content: 'Updated message',
        user_id: 1,
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when message is not found', async () => {
      // Arrange
      const messageId = 999;
      const messageData = {
        content: 'Updated message',
        user_id: 1
      };
      
      // Act & Assert
      await expect(chatMessageService.updateMessage(messageId, messageData)).rejects.toThrow('Message not found');
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(mockMessageRepository.update).not.toHaveBeenCalled();
    });
    
    test('should throw error when user is not the message author', async () => {
      // Arrange
      const messageId = 1;
      const messageData = {
        content: 'Updated message',
        user_id: 2
      };
      
      // Act & Assert
      await expect(chatMessageService.updateMessage(messageId, messageData)).rejects.toThrow('You can only edit your own messages');
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(mockMessageRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteMessage', () => {
    test('should delete an existing message', async () => {
      // Arrange
      const messageId = 1;
      const userId = 1;
      
      // Act
      const result = await chatMessageService.deleteMessage(messageId, userId);
      
      // Assert
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(mockMessageRepository.delete).toHaveBeenCalledWith(messageId);
      expect(result).toBe(true);
    });
    
    test('should throw error when message is not found', async () => {
      // Arrange
      const messageId = 999;
      const userId = 1;
      
      // Act & Assert
      await expect(chatMessageService.deleteMessage(messageId, userId)).rejects.toThrow('Message not found');
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(mockMessageRepository.delete).not.toHaveBeenCalled();
    });
    
    test('should throw error when user is not the message author', async () => {
      // Arrange
      const messageId = 1;
      const userId = 2;
      
      // Act & Assert
      await expect(chatMessageService.deleteMessage(messageId, userId)).rejects.toThrow('You can only delete your own messages');
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(mockMessageRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('markAsRead', () => {
    test('should mark a message as read', async () => {
      // Arrange
      const messageId = 1;
      const userId = 2;
      
      // Act
      const result = await chatMessageService.markAsRead(messageId, userId);
      
      // Assert
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(mockMessageRepository.markAsRead).toHaveBeenCalledWith(messageId, userId);
      expect(result.read_by).toContain(userId);
    });
    
    test('should throw error when message is not found', async () => {
      // Arrange
      const messageId = 999;
      const userId = 1;
      
      // Act & Assert
      await expect(chatMessageService.markAsRead(messageId, userId)).rejects.toThrow('Message not found');
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(mockMessageRepository.markAsRead).not.toHaveBeenCalled();
    });
  });
  
  describe('markAllAsRead', () => {
    test('should mark all messages in a chat as read', async () => {
      // Arrange
      const chatId = 1;
      const userId = 1;
      
      // Act
      const result = await chatMessageService.markAllAsRead(chatId, userId);
      
      // Assert
      expect(mockMessageRepository.markAllAsRead).toHaveBeenCalledWith(chatId, userId);
      expect(result).toBe(true);
    });
  });
});
