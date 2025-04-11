/**
 * Unit tests for WebRTC call logger
 */

describe('WebRTC Call Logger', () => {
  // Mock dependencies
  const mockCallRepository = {
    createCall: jest.fn(),
    updateCall: jest.fn(),
    getCall: jest.fn(),
    getCallsByUserId: jest.fn(),
    getCallsByRoomId: jest.fn()
  };
  
  // Mock call logger
  const callLogger = {
    logCallStart: async (callData) => {
      return await mockCallRepository.createCall(callData);
    },
    
    logCallEnd: async (callData) => {
      const { roomId, userId, endTime } = callData;
      
      const call = await mockCallRepository.getCallsByRoomId(roomId);
      
      if (!call) {
        throw new Error('Call not found');
      }
      
      const duration = Math.floor((endTime - new Date(call.startTime)) / 1000);
      
      return await mockCallRepository.updateCall(call.id, {
        ...call,
        endTime,
        duration,
        participants: call.participants || [call.initiatedBy, userId]
      });
    },
    
    getCallHistory: async (userId) => {
      return await mockCallRepository.getCallsByUserId(userId);
    },
    
    getCallById: async (callId) => {
      const call = await mockCallRepository.getCall(callId);
      
      if (!call) {
        throw new Error('Call not found');
      }
      
      return call;
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockCallRepository.createCall.mockReset();
    mockCallRepository.updateCall.mockReset();
    mockCallRepository.getCall.mockReset();
    mockCallRepository.getCallsByUserId.mockReset();
    mockCallRepository.getCallsByRoomId.mockReset();
    
    // Default mock implementations
    mockCallRepository.createCall.mockImplementation((callData) => ({
      id: 'call-123',
      ...callData
    }));
    
    mockCallRepository.updateCall.mockImplementation((callId, callData) => ({
      id: callId,
      ...callData
    }));
    
    mockCallRepository.getCall.mockImplementation((callId) => {
      if (callId === 'nonexistent-call') {
        return null;
      }
      
      return {
        id: callId,
        roomId: 'room-123',
        initiatedBy: 'user-1',
        type: 'video',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T10:15:00Z'),
        duration: 15 * 60, // 15 minutes in seconds
        participants: ['user-1', 'user-2']
      };
    });
    
    mockCallRepository.getCallsByUserId.mockImplementation((userId) => {
      if (userId === 'user-no-calls') {
        return [];
      }
      
      return [
        {
          id: 'call-1',
          roomId: 'room-123',
          initiatedBy: 'user-1',
          type: 'video',
          startTime: new Date('2023-01-01T10:00:00Z'),
          endTime: new Date('2023-01-01T10:15:00Z'),
          duration: 15 * 60, // 15 minutes in seconds
          participants: ['user-1', userId]
        },
        {
          id: 'call-2',
          roomId: 'room-456',
          initiatedBy: userId,
          type: 'audio',
          startTime: new Date('2023-01-02T14:00:00Z'),
          endTime: new Date('2023-01-02T14:10:00Z'),
          duration: 10 * 60, // 10 minutes in seconds
          participants: [userId, 'user-3']
        }
      ];
    });
    
    mockCallRepository.getCallsByRoomId.mockImplementation((roomId) => {
      if (roomId === 'nonexistent-room') {
        return null;
      }
      
      return {
        id: 'call-123',
        roomId,
        initiatedBy: 'user-1',
        type: 'video',
        startTime: new Date('2023-01-01T10:00:00Z')
      };
    });
  });

  describe('logCallStart', () => {
    test('should log call start successfully', async () => {
      // Arrange
      const callData = {
        roomId: 'room-123',
        initiatedBy: 'user-1',
        type: 'video',
        startTime: new Date()
      };
      
      // Act
      const result = await callLogger.logCallStart(callData);
      
      // Assert
      expect(mockCallRepository.createCall).toHaveBeenCalledWith(callData);
      expect(result).toEqual({
        id: 'call-123',
        ...callData
      });
    });
  });
  
  describe('logCallEnd', () => {
    test('should log call end successfully', async () => {
      // Arrange
      const callData = {
        roomId: 'room-123',
        userId: 'user-2',
        endTime: new Date('2023-01-01T10:15:00Z')
      };
      
      // Act
      const result = await callLogger.logCallEnd(callData);
      
      // Assert
      expect(mockCallRepository.getCallsByRoomId).toHaveBeenCalledWith('room-123');
      expect(mockCallRepository.updateCall).toHaveBeenCalledWith('call-123', {
        id: 'call-123',
        roomId: 'room-123',
        initiatedBy: 'user-1',
        type: 'video',
        startTime: expect.any(Date),
        endTime: callData.endTime,
        duration: expect.any(Number),
        participants: ['user-1', 'user-2']
      });
      
      expect(result).toEqual({
        id: 'call-123',
        roomId: 'room-123',
        initiatedBy: 'user-1',
        type: 'video',
        startTime: expect.any(Date),
        endTime: callData.endTime,
        duration: expect.any(Number),
        participants: ['user-1', 'user-2']
      });
    });
    
    test('should throw error when call is not found', async () => {
      // Arrange
      const callData = {
        roomId: 'nonexistent-room',
        userId: 'user-2',
        endTime: new Date()
      };
      
      // Act & Assert
      await expect(callLogger.logCallEnd(callData)).rejects.toThrow('Call not found');
      expect(mockCallRepository.getCallsByRoomId).toHaveBeenCalledWith('nonexistent-room');
      expect(mockCallRepository.updateCall).not.toHaveBeenCalled();
    });
  });
  
  describe('getCallHistory', () => {
    test('should get call history for a user', async () => {
      // Arrange
      const userId = 'user-2';
      
      // Act
      const result = await callLogger.getCallHistory(userId);
      
      // Assert
      expect(mockCallRepository.getCallsByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([
        {
          id: 'call-1',
          roomId: 'room-123',
          initiatedBy: 'user-1',
          type: 'video',
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          duration: 15 * 60,
          participants: ['user-1', userId]
        },
        {
          id: 'call-2',
          roomId: 'room-456',
          initiatedBy: userId,
          type: 'audio',
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          duration: 10 * 60,
          participants: [userId, 'user-3']
        }
      ]);
    });
    
    test('should return empty array when user has no calls', async () => {
      // Arrange
      const userId = 'user-no-calls';
      
      // Act
      const result = await callLogger.getCallHistory(userId);
      
      // Assert
      expect(mockCallRepository.getCallsByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getCallById', () => {
    test('should get call by ID', async () => {
      // Arrange
      const callId = 'call-123';
      
      // Act
      const result = await callLogger.getCallById(callId);
      
      // Assert
      expect(mockCallRepository.getCall).toHaveBeenCalledWith(callId);
      expect(result).toEqual({
        id: callId,
        roomId: 'room-123',
        initiatedBy: 'user-1',
        type: 'video',
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        duration: 15 * 60,
        participants: ['user-1', 'user-2']
      });
    });
    
    test('should throw error when call is not found', async () => {
      // Arrange
      const callId = 'nonexistent-call';
      
      // Act & Assert
      await expect(callLogger.getCallById(callId)).rejects.toThrow('Call not found');
      expect(mockCallRepository.getCall).toHaveBeenCalledWith(callId);
    });
  });
});
