/**
 * Unit tests for chat service - basic functionality
 */

describe('Chat Service - Basic', () => {
  // Mock dependencies
  const mockChatRepository = {
    saveMessage: jest.fn(),
    getMessages: jest.fn(),
    getConversation: jest.fn(),
    markAsRead: jest.fn()
  };
  
  // Mock chat service
  const chatService = {
    sendMessage: async (message) => {
      return await mockChatRepository.saveMessage(message);
    },
    
    getMessages: async (conversationId, options = {}) => {
      return await mockChatRepository.getMessages(conversationId, options);
    },
    
    getConversation: async (userId1, userId2) => {
      return await mockChatRepository.getConversation(userId1, userId2);
    },
    
    markAsRead: async (conversationId, userId) => {
      return await mockChatRepository.markAsRead(conversationId, userId);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockChatRepository.saveMessage.mockReset();
    mockChatRepository.getMessages.mockReset();
    mockChatRepository.getConversation.mockReset();
    mockChatRepository.markAsRead.mockReset();
    
    // Default mock implementations
    mockChatRepository.saveMessage.mockImplementation((message) => ({
      id: 'msg-123',
      ...message,
      timestamp: new Date()
    }));
    
    mockChatRepository.getMessages.mockResolvedValue([
      {
        id: 'msg-1',
        conversationId: 'conv-123',
        senderId: 'user-1',
        receiverId: 'user-2',
        content: 'Hello',
        timestamp: new Date('2023-01-01T10:00:00Z'),
        read: true
      },
      {
        id: 'msg-2',
        conversationId: 'conv-123',
        senderId: 'user-2',
        receiverId: 'user-1',
        content: 'Hi there',
        timestamp: new Date('2023-01-01T10:01:00Z'),
        read: false
      }
    ]);
    
    mockChatRepository.getConversation.mockResolvedValue({
      id: 'conv-123',
      participants: ['user-1', 'user-2'],
      lastMessage: {
        content: 'Hi there',
        timestamp: new Date('2023-01-01T10:01:00Z'),
        senderId: 'user-2'
      },
      unreadCount: 1
    });
    
    mockChatRepository.markAsRead.mockResolvedValue(true);
  });

  describe('sendMessage', () => {
    test('should send a message successfully', async () => {
      // Arrange
      const message = {
        conversationId: 'conv-123',
        senderId: 'user-1',
        receiverId: 'user-2',
        content: 'Hello world'
      };
      
      // Act
      const result = await chatService.sendMessage(message);
      
      // Assert
      expect(mockChatRepository.saveMessage).toHaveBeenCalledWith(message);
      expect(result).toEqual({
        id: 'msg-123',
        ...message,
        timestamp: expect.any(Date)
      });
    });
  });
  
  describe('getMessages', () => {
    test('should get messages for a conversation', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const options = { limit: 10, offset: 0 };
      
      // Act
      const result = await chatService.getMessages(conversationId, options);
      
      // Assert
      expect(mockChatRepository.getMessages).toHaveBeenCalledWith(conversationId, options);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].id).toBe('msg-2');
    });
    
    test('should get messages with default options', async () => {
      // Arrange
      const conversationId = 'conv-123';
      
      // Act
      const result = await chatService.getMessages(conversationId);
      
      // Assert
      expect(mockChatRepository.getMessages).toHaveBeenCalledWith(conversationId, {});
      expect(result).toHaveLength(2);
    });
  });
  
  describe('getConversation', () => {
    test('should get conversation between two users', async () => {
      // Arrange
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      
      // Act
      const result = await chatService.getConversation(userId1, userId2);
      
      // Assert
      expect(mockChatRepository.getConversation).toHaveBeenCalledWith(userId1, userId2);
      expect(result).toEqual({
        id: 'conv-123',
        participants: ['user-1', 'user-2'],
        lastMessage: {
          content: 'Hi there',
          timestamp: expect.any(Date),
          senderId: 'user-2'
        },
        unreadCount: 1
      });
    });
  });
  
  describe('markAsRead', () => {
    test('should mark messages as read', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const userId = 'user-1';
      
      // Act
      const result = await chatService.markAsRead(conversationId, userId);
      
      // Assert
      expect(mockChatRepository.markAsRead).toHaveBeenCalledWith(conversationId, userId);
      expect(result).toBe(true);
    });
  });
});
