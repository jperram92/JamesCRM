/**
 * Unit tests for WebRTC room manager
 */

describe('WebRTC Room Manager', () => {
  // Mock dependencies
  const mockRoomRepository = {
    createRoom: jest.fn(),
    getRoom: jest.fn(),
    updateRoom: jest.fn(),
    deleteRoom: jest.fn(),
    getRoomsByUserId: jest.fn()
  };

  // Mock room manager
  const roomManager = {
    createRoom: async (roomData) => {
      return await mockRoomRepository.createRoom(roomData);
    },

    getRoom: async (roomId) => {
      const room = await mockRoomRepository.getRoom(roomId);

      if (!room) {
        throw new Error('Room not found');
      }

      return room;
    },

    joinRoom: async (roomId, userId) => {
      const room = await mockRoomRepository.getRoom(roomId);

      if (!room) {
        return null;
      }

      if (room.participants.includes(userId)) {
        return room;
      }

      const updatedRoom = {
        ...room,
        participants: [...room.participants, userId]
      };

      return await mockRoomRepository.updateRoom(roomId, updatedRoom);
    },

    leaveRoom: async (roomId, userId) => {
      const room = await mockRoomRepository.getRoom(roomId);

      if (!room) {
        throw new Error('Room not found');
      }

      if (!room.participants.includes(userId)) {
        return room;
      }

      const updatedRoom = {
        ...room,
        participants: room.participants.filter(id => id !== userId)
      };

      return await mockRoomRepository.updateRoom(roomId, updatedRoom);
    },

    getRoomParticipants: async (roomId) => {
      const room = await mockRoomRepository.getRoom(roomId);

      if (!room) {
        throw new Error('Room not found');
      }

      return room.participants;
    },

    getRoomByUserId: async (userId) => {
      const rooms = await mockRoomRepository.getRoomsByUserId(userId);
      return rooms.length > 0 ? rooms[0] : null;
    },

    deleteRoom: async (roomId) => {
      const room = await mockRoomRepository.getRoom(roomId);

      if (!room) {
        throw new Error('Room not found');
      }

      return await mockRoomRepository.deleteRoom(roomId);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockRoomRepository.createRoom.mockReset();
    mockRoomRepository.getRoom.mockReset();
    mockRoomRepository.updateRoom.mockReset();
    mockRoomRepository.deleteRoom.mockReset();
    mockRoomRepository.getRoomsByUserId.mockReset();

    // Default mock implementations
    mockRoomRepository.createRoom.mockImplementation((roomData) => ({
      id: 'room-123',
      ...roomData,
      createdAt: new Date()
    }));

    mockRoomRepository.getRoom.mockImplementation((roomId) => {
      if (roomId === 'nonexistent-room') {
        return null;
      }

      return {
        id: roomId,
        type: 'video',
        name: 'Test Room',
        createdBy: 'user-1',
        participants: ['user-1', 'user-2'],
        createdAt: new Date('2023-01-01T00:00:00Z')
      };
    });

    mockRoomRepository.updateRoom.mockImplementation((roomId, roomData) => ({
      id: roomId,
      ...roomData,
      updatedAt: new Date()
    }));

    mockRoomRepository.deleteRoom.mockResolvedValue(true);

    mockRoomRepository.getRoomsByUserId.mockImplementation((userId) => {
      if (userId === 'user-no-rooms') {
        return [];
      }

      return [
        {
          id: 'room-123',
          type: 'video',
          name: 'Test Room',
          createdBy: 'user-1',
          participants: ['user-1', userId],
          createdAt: new Date('2023-01-01T00:00:00Z')
        }
      ];
    });
  });

  describe('createRoom', () => {
    test('should create a room successfully', async () => {
      // Arrange
      const roomData = {
        type: 'video',
        name: 'New Room',
        createdBy: 'user-1',
        participants: ['user-1']
      };

      // Act
      const result = await roomManager.createRoom(roomData);

      // Assert
      expect(mockRoomRepository.createRoom).toHaveBeenCalledWith(roomData);
      expect(result).toEqual({
        id: 'room-123',
        ...roomData,
        createdAt: expect.any(Date)
      });
    });
  });

  describe('getRoom', () => {
    test('should get a room by ID', async () => {
      // Arrange
      const roomId = 'room-123';

      // Act
      const result = await roomManager.getRoom(roomId);

      // Assert
      expect(mockRoomRepository.getRoom).toHaveBeenCalledWith(roomId);
      expect(result).toEqual({
        id: roomId,
        type: 'video',
        name: 'Test Room',
        createdBy: 'user-1',
        participants: ['user-1', 'user-2'],
        createdAt: expect.any(Date)
      });
    });

    test('should throw error when room is not found', async () => {
      // Arrange
      const roomId = 'nonexistent-room';

      // Act & Assert
      await expect(roomManager.getRoom(roomId)).rejects.toThrow('Room not found');
      expect(mockRoomRepository.getRoom).toHaveBeenCalledWith(roomId);
    });
  });

  describe('joinRoom', () => {
    test('should join a room successfully', async () => {
      // Arrange
      const roomId = 'room-123';
      const userId = 'user-3';

      // Act
      const result = await roomManager.joinRoom(roomId, userId);

      // Assert
      expect(mockRoomRepository.getRoom).toHaveBeenCalledWith(roomId);
      expect(mockRoomRepository.updateRoom).toHaveBeenCalledWith(roomId, {
        id: roomId,
        type: 'video',
        name: 'Test Room',
        createdBy: 'user-1',
        participants: ['user-1', 'user-2', userId],
        createdAt: expect.any(Date)
      });

      expect(result).toEqual({
        id: roomId,
        type: 'video',
        name: 'Test Room',
        createdBy: 'user-1',
        participants: ['user-1', 'user-2', userId],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test('should return existing room when user is already a participant', async () => {
      // Arrange
      const roomId = 'room-123';
      const userId = 'user-2';

      // Act
      const result = await roomManager.joinRoom(roomId, userId);

      // Assert
      expect(mockRoomRepository.getRoom).toHaveBeenCalledWith(roomId);
      expect(mockRoomRepository.updateRoom).not.toHaveBeenCalled();

      expect(result).toEqual({
        id: roomId,
        type: 'video',
        name: 'Test Room',
        createdBy: 'user-1',
        participants: ['user-1', 'user-2'],
        createdAt: expect.any(Date)
      });
    });

    test('should return null when room is not found', async () => {
      // Arrange
      const roomId = 'nonexistent-room';
      const userId = 'user-3';

      // Act
      const result = await roomManager.joinRoom(roomId, userId);

      // Assert
      expect(mockRoomRepository.getRoom).toHaveBeenCalledWith(roomId);
      expect(mockRoomRepository.updateRoom).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('leaveRoom', () => {
    test('should leave a room successfully', async () => {
      // Arrange
      const roomId = 'room-123';
      const userId = 'user-2';

      // Act
      const result = await roomManager.leaveRoom(roomId, userId);

      // Assert
      expect(mockRoomRepository.getRoom).toHaveBeenCalledWith(roomId);
      expect(mockRoomRepository.updateRoom).toHaveBeenCalledWith(roomId, {
        id: roomId,
        type: 'video',
        name: 'Test Room',
        createdBy: 'user-1',
        participants: ['user-1'],
        createdAt: expect.any(Date)
      });

      expect(result).toEqual({
        id: roomId,
        type: 'video',
        name: 'Test Room',
        createdBy: 'user-1',
        participants: ['user-1'],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test('should return unchanged room when user is not a participant', async () => {
      // Arrange
      const roomId = 'room-123';
      const userId = 'user-3';

      // Act
      const result = await roomManager.leaveRoom(roomId, userId);

      // Assert
      expect(mockRoomRepository.getRoom).toHaveBeenCalledWith(roomId);
      expect(mockRoomRepository.updateRoom).not.toHaveBeenCalled();

      expect(result).toEqual({
        id: roomId,
        type: 'video',
        name: 'Test Room',
        createdBy: 'user-1',
        participants: ['user-1', 'user-2'],
        createdAt: expect.any(Date)
      });
    });

    test('should throw error when room is not found', async () => {
      // Arrange
      const roomId = 'nonexistent-room';
      const userId = 'user-2';

      // Act & Assert
      await expect(roomManager.leaveRoom(roomId, userId)).rejects.toThrow('Room not found');
      expect(mockRoomRepository.getRoom).toHaveBeenCalledWith(roomId);
      expect(mockRoomRepository.updateRoom).not.toHaveBeenCalled();
    });
  });
});
