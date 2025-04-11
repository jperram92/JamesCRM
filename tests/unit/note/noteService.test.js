/**
 * Unit tests for note service
 */

describe('Note Service', () => {
  // Mock dependencies
  const mockNoteRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByUserId: jest.fn(),
    findByEntityId: jest.fn()
  };
  
  // Mock note service
  const noteService = {
    getAllNotes: async () => {
      return await mockNoteRepository.findAll();
    },
    
    getNoteById: async (id) => {
      const note = await mockNoteRepository.findById(id);
      
      if (!note) {
        throw new Error('Note not found');
      }
      
      return note;
    },
    
    createNote: async (noteData) => {
      return await mockNoteRepository.create({
        ...noteData,
        created_at: new Date()
      });
    },
    
    updateNote: async (id, noteData) => {
      const note = await mockNoteRepository.findById(id);
      
      if (!note) {
        throw new Error('Note not found');
      }
      
      return await mockNoteRepository.update(id, {
        ...noteData,
        updated_at: new Date()
      });
    },
    
    deleteNote: async (id) => {
      const note = await mockNoteRepository.findById(id);
      
      if (!note) {
        throw new Error('Note not found');
      }
      
      return await mockNoteRepository.delete(id);
    },
    
    getNotesByUser: async (userId) => {
      return await mockNoteRepository.findByUserId(userId);
    },
    
    getNotesByEntity: async (entityType, entityId) => {
      return await mockNoteRepository.findByEntityId(entityType, entityId);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockNoteRepository.findAll.mockReset();
    mockNoteRepository.findById.mockReset();
    mockNoteRepository.create.mockReset();
    mockNoteRepository.update.mockReset();
    mockNoteRepository.delete.mockReset();
    mockNoteRepository.findByUserId.mockReset();
    mockNoteRepository.findByEntityId.mockReset();
    
    // Default mock implementations
    mockNoteRepository.findAll.mockResolvedValue([
      {
        id: 1,
        content: 'First note',
        entity_type: 'contact',
        entity_id: 1,
        created_by: 1,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: null
      },
      {
        id: 2,
        content: 'Second note',
        entity_type: 'company',
        entity_id: 1,
        created_by: 1,
        created_at: new Date('2023-01-02T00:00:00Z'),
        updated_at: null
      }
    ]);
    
    mockNoteRepository.findById.mockImplementation((id) => {
      if (id === 999) {
        return null;
      }
      
      return {
        id,
        content: `Note ${id}`,
        entity_type: id === 1 ? 'contact' : 'company',
        entity_id: 1,
        created_by: 1,
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: null
      };
    });
    
    mockNoteRepository.create.mockImplementation((noteData) => ({
      id: 3,
      ...noteData
    }));
    
    mockNoteRepository.update.mockImplementation((id, noteData) => ({
      id,
      ...noteData
    }));
    
    mockNoteRepository.delete.mockResolvedValue(true);
    
    mockNoteRepository.findByUserId.mockImplementation((userId) => {
      if (userId === 999) {
        return [];
      }
      
      return [
        {
          id: 1,
          content: 'First note',
          entity_type: 'contact',
          entity_id: 1,
          created_by: userId,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: null
        },
        {
          id: 2,
          content: 'Second note',
          entity_type: 'company',
          entity_id: 1,
          created_by: userId,
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: null
        }
      ];
    });
    
    mockNoteRepository.findByEntityId.mockImplementation((entityType, entityId) => {
      if (entityId === 999) {
        return [];
      }
      
      if (entityType === 'contact' && entityId === 1) {
        return [
          {
            id: 1,
            content: 'First note',
            entity_type: entityType,
            entity_id: entityId,
            created_by: 1,
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      if (entityType === 'company' && entityId === 1) {
        return [
          {
            id: 2,
            content: 'Second note',
            entity_type: entityType,
            entity_id: entityId,
            created_by: 1,
            created_at: new Date('2023-01-02T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      if (entityType === 'deal' && entityId === 1) {
        return [
          {
            id: 3,
            content: 'Deal note',
            entity_type: entityType,
            entity_id: entityId,
            created_by: 1,
            created_at: new Date('2023-01-03T00:00:00Z'),
            updated_at: null
          }
        ];
      }
      
      return [];
    });
  });

  describe('getAllNotes', () => {
    test('should return all notes', async () => {
      // Act
      const result = await noteService.getAllNotes();
      
      // Assert
      expect(mockNoteRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
  
  describe('getNoteById', () => {
    test('should return note by ID', async () => {
      // Arrange
      const noteId = 1;
      
      // Act
      const result = await noteService.getNoteById(noteId);
      
      // Assert
      expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
      expect(result).toEqual({
        id: noteId,
        content: `Note ${noteId}`,
        entity_type: 'contact',
        entity_id: 1,
        created_by: 1,
        created_at: expect.any(Date),
        updated_at: null
      });
    });
    
    test('should throw error when note is not found', async () => {
      // Arrange
      const noteId = 999;
      
      // Act & Assert
      await expect(noteService.getNoteById(noteId)).rejects.toThrow('Note not found');
      expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
    });
  });
  
  describe('createNote', () => {
    test('should create a new note', async () => {
      // Arrange
      const noteData = {
        content: 'New note',
        entity_type: 'deal',
        entity_id: 2,
        created_by: 1
      };
      
      // Act
      const result = await noteService.createNote(noteData);
      
      // Assert
      expect(mockNoteRepository.create).toHaveBeenCalledWith({
        ...noteData,
        created_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: 3,
        ...noteData,
        created_at: expect.any(Date)
      });
    });
  });
  
  describe('updateNote', () => {
    test('should update an existing note', async () => {
      // Arrange
      const noteId = 1;
      const noteData = {
        content: 'Updated note'
      };
      
      // Act
      const result = await noteService.updateNote(noteId, noteData);
      
      // Assert
      expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
      expect(mockNoteRepository.update).toHaveBeenCalledWith(noteId, {
        ...noteData,
        updated_at: expect.any(Date)
      });
      
      expect(result).toEqual({
        id: noteId,
        ...noteData,
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when note is not found', async () => {
      // Arrange
      const noteId = 999;
      const noteData = {
        content: 'Updated note'
      };
      
      // Act & Assert
      await expect(noteService.updateNote(noteId, noteData)).rejects.toThrow('Note not found');
      expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
      expect(mockNoteRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteNote', () => {
    test('should delete an existing note', async () => {
      // Arrange
      const noteId = 1;
      
      // Act
      const result = await noteService.deleteNote(noteId);
      
      // Assert
      expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
      expect(mockNoteRepository.delete).toHaveBeenCalledWith(noteId);
      expect(result).toBe(true);
    });
    
    test('should throw error when note is not found', async () => {
      // Arrange
      const noteId = 999;
      
      // Act & Assert
      await expect(noteService.deleteNote(noteId)).rejects.toThrow('Note not found');
      expect(mockNoteRepository.findById).toHaveBeenCalledWith(noteId);
      expect(mockNoteRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('getNotesByUser', () => {
    test('should return notes for a user', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const result = await noteService.getNotesByUser(userId);
      
      // Assert
      expect(mockNoteRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0].created_by).toBe(userId);
      expect(result[1].created_by).toBe(userId);
    });
    
    test('should return empty array when user has no notes', async () => {
      // Arrange
      const userId = 999;
      
      // Act
      const result = await noteService.getNotesByUser(userId);
      
      // Assert
      expect(mockNoteRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
  
  describe('getNotesByEntity', () => {
    test('should return notes for a contact', async () => {
      // Arrange
      const entityType = 'contact';
      const entityId = 1;
      
      // Act
      const result = await noteService.getNotesByEntity(entityType, entityId);
      
      // Assert
      expect(mockNoteRepository.findByEntityId).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toHaveLength(1);
      expect(result[0].entity_type).toBe(entityType);
      expect(result[0].entity_id).toBe(entityId);
    });
    
    test('should return notes for a company', async () => {
      // Arrange
      const entityType = 'company';
      const entityId = 1;
      
      // Act
      const result = await noteService.getNotesByEntity(entityType, entityId);
      
      // Assert
      expect(mockNoteRepository.findByEntityId).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toHaveLength(1);
      expect(result[0].entity_type).toBe(entityType);
      expect(result[0].entity_id).toBe(entityId);
    });
    
    test('should return notes for a deal', async () => {
      // Arrange
      const entityType = 'deal';
      const entityId = 1;
      
      // Act
      const result = await noteService.getNotesByEntity(entityType, entityId);
      
      // Assert
      expect(mockNoteRepository.findByEntityId).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toHaveLength(1);
      expect(result[0].entity_type).toBe(entityType);
      expect(result[0].entity_id).toBe(entityId);
    });
    
    test('should return empty array when entity has no notes', async () => {
      // Arrange
      const entityType = 'contact';
      const entityId = 999;
      
      // Act
      const result = await noteService.getNotesByEntity(entityType, entityId);
      
      // Assert
      expect(mockNoteRepository.findByEntityId).toHaveBeenCalledWith(entityType, entityId);
      expect(result).toEqual([]);
    });
  });
});
