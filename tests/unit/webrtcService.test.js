/**
 * Unit tests for WebRTC service
 */

describe('WebRTC Service', () => {
  // Mock dependencies
  const mockSocketIO = {
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    join: jest.fn(),
    leave: jest.fn()
  };

  const mockRoomManager = {
    createRoom: jest.fn(),
    joinRoom: jest.fn(),
    leaveRoom: jest.fn(),
    getRoomParticipants: jest.fn(),
    getRoomByUserId: jest.fn(),
    deleteRoom: jest.fn()
  };

  const mockCallLogger = {
    logCallStart: jest.fn(),
    logCallEnd: jest.fn(),
    getCallHistory: jest.fn(),
    getCallById: jest.fn()
  };

  // Mock WebRTC service
  const webrtcService = {
    handleConnection: (socket, userId) => {
      socket.userId = userId;

      socket.on('create-room', async (data, callback) => {
        try {
          const room = await mockRoomManager.createRoom({
            createdBy: userId,
            type: data.type || 'video',
            name: data.name || `Room-${Date.now()}`,
            participants: [userId]
          });

          socket.join(room.id);

          callback({ success: true, roomId: room.id });

          await mockCallLogger.logCallStart({
            roomId: room.id,
            initiatedBy: userId,
            type: room.type,
            startTime: new Date()
          });
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      }),

      socket.on('join-room', async (data, callback) => {
        try {
          const { roomId } = data;

          const room = await mockRoomManager.joinRoom(roomId, userId);

          if (!room) {
            return callback({ success: false, error: 'Room not found' });
          }

          socket.join(roomId);

          // Notify other participants
          socket.to(roomId).emit('user-joined', { userId, roomId });

          // Get current participants to send back to the joining user
          const participants = await mockRoomManager.getRoomParticipants(roomId);

          callback({
            success: true,
            roomId,
            participants: participants.filter(id => id !== userId)
          });
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      }),

      socket.on('leave-room', async (data, callback) => {
        try {
          const { roomId } = data;

          await mockRoomManager.leaveRoom(roomId, userId);

          socket.leave(roomId);

          // Notify other participants
          socket.to(roomId).emit('user-left', { userId, roomId });

          // Check if room is empty and delete if needed
          const participants = await mockRoomManager.getRoomParticipants(roomId);
          if (participants.length === 0) {
            await mockRoomManager.deleteRoom(roomId);
          }

          callback({ success: true });
        } catch (error) {
          // Don't call any socket methods when there's an error
          callback({ success: false, error: error.message });
        }
      }),

      socket.on('signal', (data) => {
        const { userId: targetUserId, signal, roomId } = data;

        // Forward the signal to the specific user in the room
        socket.to(roomId).emit('signal', {
          userId: socket.userId,
          signal,
          roomId
        });
      }),

      socket.on('disconnect', async () => {
        try {
          // Find any rooms the user is in and leave them
          const room = await mockRoomManager.getRoomByUserId(userId);

          if (room) {
            await mockRoomManager.leaveRoom(room.id, userId);

            // Notify other participants
            socket.to(room.id).emit('user-left', { userId, roomId: room.id });

            // Log call end
            await mockCallLogger.logCallEnd({
              roomId: room.id,
              userId,
              endTime: new Date()
            });

            // Check if room is empty and delete if needed
            const participants = await mockRoomManager.getRoomParticipants(room.id);
            if (participants.length === 0) {
              await mockRoomManager.deleteRoom(room.id);
            }
          }
        } catch (error) {
          console.error('Error during disconnect:', error.message);
        }
      });
    },

    getCallHistory: async (userId) => {
      return await mockCallLogger.getCallHistory(userId);
    },

    getCallById: async (callId) => {
      return await mockCallLogger.getCallById(callId);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockRoomManager.createRoom.mockImplementation((roomData) => ({
      id: 'room-123',
      ...roomData,
      createdAt: new Date()
    }));

    mockRoomManager.joinRoom.mockImplementation((roomId, userId) => ({
      id: roomId,
      participants: ['user-1', userId],
      type: 'video'
    }));

    mockRoomManager.leaveRoom.mockResolvedValue(true);

    mockRoomManager.getRoomParticipants.mockResolvedValue(['user-1', 'user-2']);

    mockRoomManager.getRoomByUserId.mockImplementation((userId) => ({
      id: 'room-123',
      participants: ['user-1', userId],
      type: 'video'
    }));

    mockCallLogger.getCallHistory.mockResolvedValue([
      {
        id: 'call-1',
        roomId: 'room-123',
        initiatedBy: 'user-1',
        participants: ['user-1', 'user-2'],
        type: 'video',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T10:15:00Z'),
        duration: 15 * 60 // 15 minutes in seconds
      }
    ]);

    mockCallLogger.getCallById.mockImplementation((callId) => ({
      id: callId,
      roomId: 'room-123',
      initiatedBy: 'user-1',
      participants: ['user-1', 'user-2'],
      type: 'video',
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T10:15:00Z'),
      duration: 15 * 60 // 15 minutes in seconds
    }));
  });

  describe('handleConnection', () => {
    test('should set userId on socket', () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';

      // Act
      webrtcService.handleConnection(socket, userId);

      // Assert
      expect(socket.userId).toBe(userId);
    });

    test('should register event handlers on socket', () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';

      // Act
      webrtcService.handleConnection(socket, userId);

      // Assert
      expect(socket.on).toHaveBeenCalledWith('create-room', expect.any(Function));
      expect(socket.on).toHaveBeenCalledWith('join-room', expect.any(Function));
      expect(socket.on).toHaveBeenCalledWith('leave-room', expect.any(Function));
      expect(socket.on).toHaveBeenCalledWith('signal', expect.any(Function));
      expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('create-room event', () => {
    test('should create a room successfully', async () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';
      const roomData = { type: 'video', name: 'Test Room' };
      const callback = jest.fn();

      // Register event handlers
      webrtcService.handleConnection(socket, userId);

      // Get the create-room handler
      const createRoomHandler = socket.on.mock.calls.find(call => call[0] === 'create-room')[1];

      // Act
      await createRoomHandler(roomData, callback);

      // Assert
      expect(mockRoomManager.createRoom).toHaveBeenCalledWith({
        createdBy: userId,
        type: 'video',
        name: 'Test Room',
        participants: [userId]
      });

      expect(socket.join).toHaveBeenCalledWith('room-123');

      expect(mockCallLogger.logCallStart).toHaveBeenCalledWith({
        roomId: 'room-123',
        initiatedBy: userId,
        type: 'video',
        startTime: expect.any(Date)
      });

      expect(callback).toHaveBeenCalledWith({
        success: true,
        roomId: 'room-123'
      });
    });

    test('should handle errors when creating a room', async () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';
      const roomData = { type: 'video', name: 'Test Room' };
      const callback = jest.fn();

      // Mock error
      mockRoomManager.createRoom.mockRejectedValue(new Error('Failed to create room'));

      // Register event handlers
      webrtcService.handleConnection(socket, userId);

      // Get the create-room handler
      const createRoomHandler = socket.on.mock.calls.find(call => call[0] === 'create-room')[1];

      // Act
      await createRoomHandler(roomData, callback);

      // Assert
      expect(mockRoomManager.createRoom).toHaveBeenCalled();
      expect(socket.join).not.toHaveBeenCalled();
      expect(mockCallLogger.logCallStart).not.toHaveBeenCalled();

      expect(callback).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create room'
      });
    });
  });

  describe('join-room event', () => {
    test('should join a room successfully', async () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';
      const roomData = { roomId: 'room-123' };
      const callback = jest.fn();

      // Register event handlers
      webrtcService.handleConnection(socket, userId);

      // Get the join-room handler
      const joinRoomHandler = socket.on.mock.calls.find(call => call[0] === 'join-room')[1];

      // Act
      await joinRoomHandler(roomData, callback);

      // Assert
      expect(mockRoomManager.joinRoom).toHaveBeenCalledWith('room-123', userId);
      expect(socket.join).toHaveBeenCalledWith('room-123');
      expect(socket.to).toHaveBeenCalledWith('room-123');
      expect(mockSocketIO.emit).toHaveBeenCalledWith('user-joined', { userId, roomId: 'room-123' });
      expect(mockRoomManager.getRoomParticipants).toHaveBeenCalledWith('room-123');

      expect(callback).toHaveBeenCalledWith({
        success: true,
        roomId: 'room-123',
        participants: ['user-1', 'user-2']
      });
    });

    test('should handle room not found', async () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';
      const roomData = { roomId: 'nonexistent-room' };
      const callback = jest.fn();

      // Mock room not found
      mockRoomManager.joinRoom.mockResolvedValue(null);

      // Register event handlers
      webrtcService.handleConnection(socket, userId);

      // Get the join-room handler
      const joinRoomHandler = socket.on.mock.calls.find(call => call[0] === 'join-room')[1];

      // Act
      await joinRoomHandler(roomData, callback);

      // Assert
      expect(mockRoomManager.joinRoom).toHaveBeenCalledWith('nonexistent-room', userId);
      expect(socket.join).not.toHaveBeenCalled();
      expect(socket.to).not.toHaveBeenCalled();
      expect(mockSocketIO.emit).not.toHaveBeenCalled();
      expect(mockRoomManager.getRoomParticipants).not.toHaveBeenCalled();

      expect(callback).toHaveBeenCalledWith({
        success: false,
        error: 'Room not found'
      });
    });

    test('should handle errors when joining a room', async () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';
      const roomData = { roomId: 'room-123' };
      const callback = jest.fn();

      // Mock error
      mockRoomManager.joinRoom.mockRejectedValue(new Error('Failed to join room'));

      // Register event handlers
      webrtcService.handleConnection(socket, userId);

      // Get the join-room handler
      const joinRoomHandler = socket.on.mock.calls.find(call => call[0] === 'join-room')[1];

      // Act
      await joinRoomHandler(roomData, callback);

      // Assert
      expect(mockRoomManager.joinRoom).toHaveBeenCalledWith('room-123', userId);
      expect(socket.join).not.toHaveBeenCalled();
      expect(socket.to).not.toHaveBeenCalled();
      expect(mockSocketIO.emit).not.toHaveBeenCalled();
      expect(mockRoomManager.getRoomParticipants).not.toHaveBeenCalled();

      expect(callback).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to join room'
      });
    });
  });

  describe('leave-room event', () => {
    test('should leave a room successfully', async () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';
      const roomData = { roomId: 'room-123' };
      const callback = jest.fn();

      // Register event handlers
      webrtcService.handleConnection(socket, userId);

      // Get the leave-room handler
      const leaveRoomHandler = socket.on.mock.calls.find(call => call[0] === 'leave-room')[1];

      // Act
      await leaveRoomHandler(roomData, callback);

      // Assert
      expect(mockRoomManager.leaveRoom).toHaveBeenCalledWith('room-123', userId);
      expect(socket.leave).toHaveBeenCalledWith('room-123');
      expect(socket.to).toHaveBeenCalledWith('room-123');
      expect(mockSocketIO.emit).toHaveBeenCalledWith('user-left', { userId, roomId: 'room-123' });
      expect(mockRoomManager.getRoomParticipants).toHaveBeenCalledWith('room-123');

      // Room still has participants, so it shouldn't be deleted
      expect(mockRoomManager.deleteRoom).not.toHaveBeenCalled();

      expect(callback).toHaveBeenCalledWith({
        success: true
      });
    });

    test('should delete room when last participant leaves', async () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';
      const roomData = { roomId: 'room-123' };
      const callback = jest.fn();

      // Mock empty room
      mockRoomManager.getRoomParticipants.mockResolvedValue([]);

      // Register event handlers
      webrtcService.handleConnection(socket, userId);

      // Get the leave-room handler
      const leaveRoomHandler = socket.on.mock.calls.find(call => call[0] === 'leave-room')[1];

      // Act
      await leaveRoomHandler(roomData, callback);

      // Assert
      expect(mockRoomManager.leaveRoom).toHaveBeenCalledWith('room-123', userId);
      expect(socket.leave).toHaveBeenCalledWith('room-123');
      expect(socket.to).toHaveBeenCalledWith('room-123');
      expect(mockSocketIO.emit).toHaveBeenCalledWith('user-left', { userId, roomId: 'room-123' });
      expect(mockRoomManager.getRoomParticipants).toHaveBeenCalledWith('room-123');

      // Room is empty, so it should be deleted
      expect(mockRoomManager.deleteRoom).toHaveBeenCalledWith('room-123');

      expect(callback).toHaveBeenCalledWith({
        success: true
      });
    });

    test('should handle errors when leaving a room', async () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';
      const roomData = { roomId: 'room-123' };
      const callback = jest.fn();

      // Mock error
      mockRoomManager.leaveRoom.mockRejectedValue(new Error('Failed to leave room'));

      // Register event handlers
      webrtcService.handleConnection(socket, userId);

      // Get the leave-room handler
      const leaveRoomHandler = socket.on.mock.calls.find(call => call[0] === 'leave-room')[1];

      // Act
      await leaveRoomHandler(roomData, callback);

      // Assert
      expect(mockRoomManager.leaveRoom).toHaveBeenCalledWith('room-123', userId);
      expect(socket.leave).not.toHaveBeenCalled();
      expect(socket.to).not.toHaveBeenCalled();
      expect(mockSocketIO.emit).not.toHaveBeenCalled();
      expect(mockRoomManager.getRoomParticipants).not.toHaveBeenCalled();
      expect(mockRoomManager.deleteRoom).not.toHaveBeenCalled();

      expect(callback).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to leave room'
      });
    });
  });

  describe('signal event', () => {
    test('should forward signal to other participants', () => {
      // Arrange
      const socket = { ...mockSocketIO, userId: 'user-123' };
      const signalData = {
        userId: 'user-456',
        signal: { type: 'offer', sdp: 'test-sdp' },
        roomId: 'room-123'
      };

      // Register event handlers
      webrtcService.handleConnection(socket, 'user-123');

      // Get the signal handler
      const signalHandler = socket.on.mock.calls.find(call => call[0] === 'signal')[1];

      // Act
      signalHandler(signalData);

      // Assert
      expect(socket.to).toHaveBeenCalledWith('room-123');
      expect(mockSocketIO.emit).toHaveBeenCalledWith('signal', {
        userId: 'user-123',
        signal: { type: 'offer', sdp: 'test-sdp' },
        roomId: 'room-123'
      });
    });
  });

  describe('disconnect event', () => {
    test('should handle user disconnection', async () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';

      // Register event handlers
      webrtcService.handleConnection(socket, userId);

      // Get the disconnect handler
      const disconnectHandler = socket.on.mock.calls.find(call => call[0] === 'disconnect')[1];

      // Act
      await disconnectHandler();

      // Assert
      expect(mockRoomManager.getRoomByUserId).toHaveBeenCalledWith(userId);
      expect(mockRoomManager.leaveRoom).toHaveBeenCalledWith('room-123', userId);
      expect(socket.to).toHaveBeenCalledWith('room-123');
      expect(mockSocketIO.emit).toHaveBeenCalledWith('user-left', { userId, roomId: 'room-123' });

      expect(mockCallLogger.logCallEnd).toHaveBeenCalledWith({
        roomId: 'room-123',
        userId,
        endTime: expect.any(Date)
      });

      expect(mockRoomManager.getRoomParticipants).toHaveBeenCalledWith('room-123');

      // Room still has participants, so it shouldn't be deleted
      expect(mockRoomManager.deleteRoom).not.toHaveBeenCalled();
    });

    test('should delete room when last participant disconnects', async () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';

      // Mock empty room
      mockRoomManager.getRoomParticipants.mockResolvedValue([]);

      // Register event handlers
      webrtcService.handleConnection(socket, userId);

      // Get the disconnect handler
      const disconnectHandler = socket.on.mock.calls.find(call => call[0] === 'disconnect')[1];

      // Act
      await disconnectHandler();

      // Assert
      expect(mockRoomManager.getRoomByUserId).toHaveBeenCalledWith(userId);
      expect(mockRoomManager.leaveRoom).toHaveBeenCalledWith('room-123', userId);
      expect(socket.to).toHaveBeenCalledWith('room-123');
      expect(mockSocketIO.emit).toHaveBeenCalledWith('user-left', { userId, roomId: 'room-123' });

      expect(mockCallLogger.logCallEnd).toHaveBeenCalledWith({
        roomId: 'room-123',
        userId,
        endTime: expect.any(Date)
      });

      expect(mockRoomManager.getRoomParticipants).toHaveBeenCalledWith('room-123');

      // Room is empty, so it should be deleted
      expect(mockRoomManager.deleteRoom).toHaveBeenCalledWith('room-123');
    });

    test('should handle user not in any room', async () => {
      // Arrange
      const socket = { ...mockSocketIO };
      const userId = 'user-123';

      // Mock user not in any room
      mockRoomManager.getRoomByUserId.mockResolvedValue(null);

      // Register event handlers
      webrtcService.handleConnection(socket, userId);

      // Get the disconnect handler
      const disconnectHandler = socket.on.mock.calls.find(call => call[0] === 'disconnect')[1];

      // Act
      await disconnectHandler();

      // Assert
      expect(mockRoomManager.getRoomByUserId).toHaveBeenCalledWith(userId);
      expect(mockRoomManager.leaveRoom).not.toHaveBeenCalled();
      expect(socket.to).not.toHaveBeenCalled();
      expect(mockSocketIO.emit).not.toHaveBeenCalled();
      expect(mockCallLogger.logCallEnd).not.toHaveBeenCalled();
      expect(mockRoomManager.getRoomParticipants).not.toHaveBeenCalled();
      expect(mockRoomManager.deleteRoom).not.toHaveBeenCalled();
    });
  });

  describe('getCallHistory', () => {
    test('should get call history for a user', async () => {
      // Arrange
      const userId = 'user-123';

      // Act
      const result = await webrtcService.getCallHistory(userId);

      // Assert
      expect(mockCallLogger.getCallHistory).toHaveBeenCalledWith(userId);
      expect(result).toEqual([
        {
          id: 'call-1',
          roomId: 'room-123',
          initiatedBy: 'user-1',
          participants: ['user-1', 'user-2'],
          type: 'video',
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          duration: 15 * 60
        }
      ]);
    });
  });

  describe('getCallById', () => {
    test('should get call by ID', async () => {
      // Arrange
      const callId = 'call-123';

      // Act
      const result = await webrtcService.getCallById(callId);

      // Assert
      expect(mockCallLogger.getCallById).toHaveBeenCalledWith(callId);
      expect(result).toEqual({
        id: callId,
        roomId: 'room-123',
        initiatedBy: 'user-1',
        participants: ['user-1', 'user-2'],
        type: 'video',
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        duration: 15 * 60
      });
    });
  });
});
