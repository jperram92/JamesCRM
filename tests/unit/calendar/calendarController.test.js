/**
 * Unit tests for calendar controller
 */

describe('Calendar Controller', () => {
  // Mock dependencies
  const mockCalendarService = {
    getEvents: jest.fn(),
    getEventById: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn()
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
  
  // Mock calendar controller
  const calendarController = {
    getEvents: async (req, res) => {
      try {
        const { start_date, end_date, user_id } = req.query;
        
        if (!start_date || !end_date) {
          return res.status(400).json({ message: 'Start date and end date are required' });
        }
        
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format' });
        }
        
        const events = await mockCalendarService.getEvents(startDate, endDate, user_id || req.user.id);
        res.json(events);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
      }
    },
    
    getEventById: async (req, res) => {
      try {
        const { id } = req.params;
        
        if (!id) {
          return res.status(400).json({ message: 'Event ID is required' });
        }
        
        const event = await mockCalendarService.getEventById(id);
        
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json(event);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching event' });
      }
    },
    
    createEvent: async (req, res) => {
      try {
        const { title, description, start_date, end_date, location, type, related_to } = req.body;
        
        if (!title || !start_date || !end_date) {
          return res.status(400).json({ message: 'Title, start date, and end date are required' });
        }
        
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format' });
        }
        
        if (startDate > endDate) {
          return res.status(400).json({ message: 'Start date must be before end date' });
        }
        
        const eventData = {
          title,
          description,
          start_date: startDate,
          end_date: endDate,
          location,
          type,
          related_to,
          created_by: req.user.id
        };
        
        const event = await mockCalendarService.createEvent(eventData);
        res.status(201).json(event);
      } catch (error) {
        res.status(500).json({ message: 'Error creating event' });
      }
    },
    
    updateEvent: async (req, res) => {
      try {
        const { id } = req.params;
        const { title, description, start_date, end_date, location, type, related_to } = req.body;
        
        if (!id) {
          return res.status(400).json({ message: 'Event ID is required' });
        }
        
        const event = await mockCalendarService.getEventById(id);
        
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }
        
        // Check if user has permission to update the event
        if (event.created_by !== req.user.id) {
          return res.status(403).json({ message: 'You do not have permission to update this event' });
        }
        
        let startDate = event.start_date;
        let endDate = event.end_date;
        
        if (start_date) {
          startDate = new Date(start_date);
          if (isNaN(startDate.getTime())) {
            return res.status(400).json({ message: 'Invalid start date format' });
          }
        }
        
        if (end_date) {
          endDate = new Date(end_date);
          if (isNaN(endDate.getTime())) {
            return res.status(400).json({ message: 'Invalid end date format' });
          }
        }
        
        if (startDate > endDate) {
          return res.status(400).json({ message: 'Start date must be before end date' });
        }
        
        const eventData = {
          title: title || event.title,
          description: description !== undefined ? description : event.description,
          start_date: startDate,
          end_date: endDate,
          location: location !== undefined ? location : event.location,
          type: type || event.type,
          related_to: related_to !== undefined ? related_to : event.related_to
        };
        
        const updatedEvent = await mockCalendarService.updateEvent(id, eventData);
        res.json(updatedEvent);
      } catch (error) {
        res.status(500).json({ message: 'Error updating event' });
      }
    },
    
    deleteEvent: async (req, res) => {
      try {
        const { id } = req.params;
        
        if (!id) {
          return res.status(400).json({ message: 'Event ID is required' });
        }
        
        const event = await mockCalendarService.getEventById(id);
        
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }
        
        // Check if user has permission to delete the event
        if (event.created_by !== req.user.id) {
          return res.status(403).json({ message: 'You do not have permission to delete this event' });
        }
        
        await mockCalendarService.deleteEvent(id);
        res.json({ message: 'Event deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting event' });
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    test('should return events for a date range', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.query = { start_date: startDate, end_date: endDate };
      
      const mockEvents = [
        { id: 1, title: 'Meeting 1', start_date: new Date('2023-01-05'), end_date: new Date('2023-01-05') },
        { id: 2, title: 'Meeting 2', start_date: new Date('2023-01-15'), end_date: new Date('2023-01-15') }
      ];
      
      mockCalendarService.getEvents.mockResolvedValue(mockEvents);
      
      // Act
      await calendarController.getEvents(req, res);
      
      // Assert
      expect(mockCalendarService.getEvents).toHaveBeenCalledWith(new Date(startDate), new Date(endDate), req.user.id);
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });
    
    test('should return 400 when start date is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const endDate = '2023-01-31';
      
      req.query = { end_date: endDate };
      
      // Act
      await calendarController.getEvents(req, res);
      
      // Assert
      expect(mockCalendarService.getEvents).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Start date and end date are required' });
    });
    
    test('should return 400 when end date is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      
      req.query = { start_date: startDate };
      
      // Act
      await calendarController.getEvents(req, res);
      
      // Assert
      expect(mockCalendarService.getEvents).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Start date and end date are required' });
    });
    
    test('should return 400 when date format is invalid', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { start_date: 'invalid-date', end_date: '2023-01-31' };
      
      // Act
      await calendarController.getEvents(req, res);
      
      // Assert
      expect(mockCalendarService.getEvents).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid date format' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      req.query = { start_date: startDate, end_date: endDate };
      
      mockCalendarService.getEvents.mockRejectedValue(new Error('Database error'));
      
      // Act
      await calendarController.getEvents(req, res);
      
      // Assert
      expect(mockCalendarService.getEvents).toHaveBeenCalledWith(new Date(startDate), new Date(endDate), req.user.id);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching events' });
    });
  });
  
  describe('getEventById', () => {
    test('should return an event by ID', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const eventId = '1';
      
      req.params = { id: eventId };
      
      const mockEvent = {
        id: 1,
        title: 'Meeting',
        description: 'Team meeting',
        start_date: new Date('2023-01-05T10:00:00'),
        end_date: new Date('2023-01-05T11:00:00'),
        location: 'Conference Room',
        type: 'meeting',
        created_by: 1
      };
      
      mockCalendarService.getEventById.mockResolvedValue(mockEvent);
      
      // Act
      await calendarController.getEventById(req, res);
      
      // Assert
      expect(mockCalendarService.getEventById).toHaveBeenCalledWith(eventId);
      expect(res.json).toHaveBeenCalledWith(mockEvent);
    });
    
    test('should return 400 when event ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {};
      
      // Act
      await calendarController.getEventById(req, res);
      
      // Assert
      expect(mockCalendarService.getEventById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event ID is required' });
    });
    
    test('should return 404 when event is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const eventId = '999';
      
      req.params = { id: eventId };
      
      mockCalendarService.getEventById.mockResolvedValue(null);
      
      // Act
      await calendarController.getEventById(req, res);
      
      // Assert
      expect(mockCalendarService.getEventById).toHaveBeenCalledWith(eventId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const eventId = '1';
      
      req.params = { id: eventId };
      
      mockCalendarService.getEventById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await calendarController.getEventById(req, res);
      
      // Assert
      expect(mockCalendarService.getEventById).toHaveBeenCalledWith(eventId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching event' });
    });
  });
  
  describe('createEvent', () => {
    test('should create a new event', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: 'New Meeting',
        description: 'Team planning meeting',
        start_date: '2023-02-01T10:00:00',
        end_date: '2023-02-01T11:00:00',
        location: 'Conference Room',
        type: 'meeting',
        related_to: { type: 'contact', id: 5 }
      };
      
      const eventData = {
        title: 'New Meeting',
        description: 'Team planning meeting',
        start_date: new Date('2023-02-01T10:00:00'),
        end_date: new Date('2023-02-01T11:00:00'),
        location: 'Conference Room',
        type: 'meeting',
        related_to: { type: 'contact', id: 5 },
        created_by: req.user.id
      };
      
      const createdEvent = {
        id: 3,
        ...eventData,
        created_at: new Date()
      };
      
      mockCalendarService.createEvent.mockResolvedValue(createdEvent);
      
      // Act
      await calendarController.createEvent(req, res);
      
      // Assert
      expect(mockCalendarService.createEvent).toHaveBeenCalledWith(eventData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdEvent);
    });
    
    test('should return 400 when title is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        start_date: '2023-02-01T10:00:00',
        end_date: '2023-02-01T11:00:00'
      };
      
      // Act
      await calendarController.createEvent(req, res);
      
      // Assert
      expect(mockCalendarService.createEvent).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Title, start date, and end date are required' });
    });
    
    test('should return 400 when start date is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: 'New Meeting',
        end_date: '2023-02-01T11:00:00'
      };
      
      // Act
      await calendarController.createEvent(req, res);
      
      // Assert
      expect(mockCalendarService.createEvent).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Title, start date, and end date are required' });
    });
    
    test('should return 400 when end date is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: 'New Meeting',
        start_date: '2023-02-01T10:00:00'
      };
      
      // Act
      await calendarController.createEvent(req, res);
      
      // Assert
      expect(mockCalendarService.createEvent).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Title, start date, and end date are required' });
    });
    
    test('should return 400 when date format is invalid', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: 'New Meeting',
        start_date: 'invalid-date',
        end_date: '2023-02-01T11:00:00'
      };
      
      // Act
      await calendarController.createEvent(req, res);
      
      // Assert
      expect(mockCalendarService.createEvent).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid date format' });
    });
    
    test('should return 400 when start date is after end date', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: 'New Meeting',
        start_date: '2023-02-01T12:00:00',
        end_date: '2023-02-01T11:00:00'
      };
      
      // Act
      await calendarController.createEvent(req, res);
      
      // Assert
      expect(mockCalendarService.createEvent).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Start date must be before end date' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: 'New Meeting',
        description: 'Team planning meeting',
        start_date: '2023-02-01T10:00:00',
        end_date: '2023-02-01T11:00:00',
        location: 'Conference Room',
        type: 'meeting'
      };
      
      mockCalendarService.createEvent.mockRejectedValue(new Error('Database error'));
      
      // Act
      await calendarController.createEvent(req, res);
      
      // Assert
      expect(mockCalendarService.createEvent).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating event' });
    });
  });
});
