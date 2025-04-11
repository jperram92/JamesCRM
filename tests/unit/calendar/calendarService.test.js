/**
 * Unit tests for calendar service
 */

describe('Calendar Service', () => {
  // Mock dependencies
  const mockEventRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  // Mock calendar service
  const calendarService = {
    getAllEvents: async () => {
      return await mockEventRepository.findAll();
    },

    getEventById: async (id) => {
      const event = await mockEventRepository.findById(id);

      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    },

    createEvent: async (eventData) => {
      return await mockEventRepository.create(eventData);
    },

    updateEvent: async (id, eventData) => {
      const event = await mockEventRepository.findById(id);

      if (!event) {
        throw new Error('Event not found');
      }

      return await mockEventRepository.update(id, eventData);
    },

    deleteEvent: async (id) => {
      const event = await mockEventRepository.findById(id);

      if (!event) {
        throw new Error('Event not found');
      }

      return await mockEventRepository.delete(id);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockEventRepository.findAll.mockReset();
    mockEventRepository.findById.mockReset();
    mockEventRepository.create.mockReset();
    mockEventRepository.update.mockReset();
    mockEventRepository.delete.mockReset();

    // Default mock implementations
    mockEventRepository.findAll.mockResolvedValue([
      {
        id: 1,
        title: 'Meeting with Client',
        start: new Date('2023-01-01T10:00:00Z'),
        end: new Date('2023-01-01T11:00:00Z'),
        user_id: 1,
        type: 'meeting'
      },
      {
        id: 2,
        title: 'Follow-up Call',
        start: new Date('2023-01-02T14:00:00Z'),
        end: new Date('2023-01-02T14:30:00Z'),
        user_id: 1,
        type: 'call'
      }
    ]);

    mockEventRepository.findById.mockImplementation((id) => {
      if (id === 1) {
        return {
          id: 1,
          title: 'Meeting with Client',
          start: new Date('2023-01-01T10:00:00Z'),
          end: new Date('2023-01-01T11:00:00Z'),
          user_id: 1,
          type: 'meeting'
        };
      }

      if (id === 2) {
        return {
          id: 2,
          title: 'Follow-up Call',
          start: new Date('2023-01-02T14:00:00Z'),
          end: new Date('2023-01-02T14:30:00Z'),
          user_id: 1,
          type: 'call'
        };
      }

      return null;
    });

    mockEventRepository.create.mockImplementation((eventData) => ({
      id: 3,
      ...eventData,
      created_at: new Date()
    }));

    mockEventRepository.update.mockImplementation((id, eventData) => ({
      id,
      ...(id === 1 ? {
        title: 'Meeting with Client',
        start: new Date('2023-01-01T10:00:00Z'),
        end: new Date('2023-01-01T11:00:00Z'),
        user_id: 1,
        type: 'meeting'
      } : {
        title: 'Follow-up Call',
        start: new Date('2023-01-02T14:00:00Z'),
        end: new Date('2023-01-02T14:30:00Z'),
        user_id: 1,
        type: 'call'
      }),
      ...eventData,
      updated_at: new Date()
    }));

    mockEventRepository.delete.mockResolvedValue(true);
  });

  describe('getAllEvents', () => {
    test('should return all events', async () => {
      // Act
      const result = await calendarService.getAllEvents();

      // Assert
      expect(mockEventRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('getEventById', () => {
    test('should return event by ID', async () => {
      // Arrange
      const eventId = 1;

      // Act
      const result = await calendarService.getEventById(eventId);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(result).toEqual({
        id: eventId,
        title: 'Meeting with Client',
        start: expect.any(Date),
        end: expect.any(Date),
        user_id: 1,
        type: 'meeting'
      });
    });

    test('should throw error when event is not found', async () => {
      // Arrange
      const eventId = 999;

      // Act & Assert
      await expect(calendarService.getEventById(eventId)).rejects.toThrow('Event not found');
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
    });
  });

  describe('createEvent', () => {
    test('should create a new event', async () => {
      // Arrange
      const eventData = {
        title: 'New Event',
        start: new Date('2023-01-03T09:00:00Z'),
        end: new Date('2023-01-03T10:00:00Z'),
        user_id: 1,
        type: 'meeting'
      };

      // Act
      const result = await calendarService.createEvent(eventData);

      // Assert
      expect(mockEventRepository.create).toHaveBeenCalledWith(eventData);
      expect(result).toEqual({
        id: 3,
        ...eventData,
        created_at: expect.any(Date)
      });
    });
  });

  describe('updateEvent', () => {
    test('should update an existing event', async () => {
      // Arrange
      const eventId = 1;
      const eventData = {
        title: 'Updated Meeting',
        type: 'important'
      };

      // Act
      const result = await calendarService.updateEvent(eventId, eventData);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.update).toHaveBeenCalledWith(eventId, eventData);
      expect(result).toEqual({
        id: eventId,
        title: 'Updated Meeting',
        start: expect.any(Date),
        end: expect.any(Date),
        user_id: 1,
        type: 'important',
        updated_at: expect.any(Date)
      });
    });

    test('should throw error when event is not found', async () => {
      // Arrange
      const eventId = 999;
      const eventData = { title: 'Updated Meeting' };

      // Act & Assert
      await expect(calendarService.updateEvent(eventId, eventData)).rejects.toThrow('Event not found');
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteEvent', () => {
    test('should delete an existing event', async () => {
      // Arrange
      const eventId = 1;

      // Act
      const result = await calendarService.deleteEvent(eventId);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.delete).toHaveBeenCalledWith(eventId);
      expect(result).toBe(true);
    });

    test('should throw error when event is not found', async () => {
      // Arrange
      const eventId = 999;

      // Act & Assert
      await expect(calendarService.deleteEvent(eventId)).rejects.toThrow('Event not found');
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.delete).not.toHaveBeenCalled();
    });
  });
});
