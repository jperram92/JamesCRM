/**
 * Unit tests for contact service - update and delete operations
 */

describe('Contact Service - Update and Delete', () => {
  // Mock dependencies
  const mockContactRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCompanyId: jest.fn()
  };

  // Mock contact service
  const contactService = {
    updateContact: async (id, contactData) => {
      const contact = await mockContactRepository.findById(id);

      if (!contact) {
        throw new Error('Contact not found');
      }

      // Only check for email uniqueness if email is being changed
      if (contactData.email && contactData.email !== contact.email) {
        const existingContact = await mockContactRepository.findByEmail(contactData.email);

        if (existingContact && existingContact.id !== id) {
          throw new Error('Contact with this email already exists');
        }
      }

      return await mockContactRepository.update(id, {
        ...contactData,
        updated_at: new Date()
      });
    },

    deleteContact: async (id) => {
      const contact = await mockContactRepository.findById(id);

      if (!contact) {
        throw new Error('Contact not found');
      }

      return await mockContactRepository.delete(id);
    },

    getContactsByCompany: async (companyId) => {
      return await mockContactRepository.findByCompanyId(companyId);
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockContactRepository.findById.mockReset();
    mockContactRepository.findByEmail.mockReset();
    mockContactRepository.update.mockReset();
    mockContactRepository.delete.mockReset();
    mockContactRepository.findByCompanyId.mockReset();

    // Default mock implementations
    mockContactRepository.findById.mockImplementation((id) => {
      if (id === 999) {
        return null;
      }

      return {
        id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        company_id: 1,
        position: 'CEO',
        created_at: new Date('2023-01-01T00:00:00Z')
      };
    });

    mockContactRepository.findByEmail.mockImplementation((email) => {
      if (email === 'nonexistent@example.com') {
        return null;
      }

      if (email === 'john.doe@example.com') {
        return {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email,
          phone: '123-456-7890',
          company_id: 1,
          position: 'CEO',
          created_at: new Date('2023-01-01T00:00:00Z')
        };
      }

      if (email === 'jane.smith@example.com') {
        return {
          id: 2,
          first_name: 'Jane',
          last_name: 'Smith',
          email,
          phone: '987-654-3210',
          company_id: 2,
          position: 'CTO',
          created_at: new Date('2023-01-02T00:00:00Z')
        };
      }

      return null;
    });

    mockContactRepository.update.mockImplementation((id, contactData) => ({
      id,
      ...contactData
    }));

    mockContactRepository.delete.mockResolvedValue(true);

    mockContactRepository.findByCompanyId.mockImplementation((companyId) => {
      if (companyId === 999) {
        return [];
      }

      return [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          company_id: companyId,
          position: 'CEO',
          created_at: new Date('2023-01-01T00:00:00Z')
        },
        {
          id: 4,
          first_name: 'Alice',
          last_name: 'Johnson',
          email: 'alice.johnson@example.com',
          phone: '555-123-4567',
          company_id: companyId,
          position: 'CFO',
          created_at: new Date('2023-01-03T00:00:00Z')
        }
      ];
    });
  });

  describe('updateContact', () => {
    test('should update a contact successfully', async () => {
      // Arrange
      const contactId = 1;
      const contactData = {
        first_name: 'Updated',
        last_name: 'Name',
        phone: '555-123-4567',
        position: 'President'
      };

      // Act
      const result = await contactService.updateContact(contactId, contactData);

      // Assert
      expect(mockContactRepository.findById).toHaveBeenCalledWith(contactId);
      expect(mockContactRepository.update).toHaveBeenCalledWith(contactId, {
        ...contactData,
        updated_at: expect.any(Date)
      });

      expect(result).toEqual({
        id: contactId,
        ...contactData,
        updated_at: expect.any(Date)
      });
    });

    test('should update contact email when it is not already in use', async () => {
      // Arrange
      const contactId = 1;
      const contactData = {
        email: 'new.email@example.com'
      };

      // Act
      const result = await contactService.updateContact(contactId, contactData);

      // Assert
      expect(mockContactRepository.findById).toHaveBeenCalledWith(contactId);
      expect(mockContactRepository.findByEmail).toHaveBeenCalledWith(contactData.email);
      expect(mockContactRepository.update).toHaveBeenCalledWith(contactId, {
        ...contactData,
        updated_at: expect.any(Date)
      });

      expect(result).toEqual({
        id: contactId,
        ...contactData,
        updated_at: expect.any(Date)
      });
    });

    test('should throw error when contact is not found', async () => {
      // Arrange
      const contactId = 999;
      const contactData = {
        first_name: 'Updated',
        last_name: 'Name'
      };

      // Act & Assert
      await expect(contactService.updateContact(contactId, contactData)).rejects.toThrow('Contact not found');
      expect(mockContactRepository.findById).toHaveBeenCalledWith(contactId);
      expect(mockContactRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error when new email is already in use', async () => {
      // Arrange
      const contactId = 1;
      const contactData = {
        email: 'jane.smith@example.com'
      };

      // Act & Assert
      await expect(contactService.updateContact(contactId, contactData)).rejects.toThrow('Contact with this email already exists');
      expect(mockContactRepository.findById).toHaveBeenCalledWith(contactId);
      expect(mockContactRepository.findByEmail).toHaveBeenCalledWith(contactData.email);
      expect(mockContactRepository.update).not.toHaveBeenCalled();
    });

    test('should allow updating to the same email', async () => {
      // Arrange
      const contactId = 1;
      const contactData = {
        email: 'john.doe@example.com', // Same email as the existing contact
        first_name: 'Updated'
      };

      // Act
      const result = await contactService.updateContact(contactId, contactData);

      // Assert
      expect(mockContactRepository.findById).toHaveBeenCalledWith(contactId);
      // Email is not changed, so findByEmail should not be called
      expect(mockContactRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockContactRepository.update).toHaveBeenCalledWith(contactId, {
        ...contactData,
        updated_at: expect.any(Date)
      });

      expect(result).toEqual({
        id: contactId,
        ...contactData,
        updated_at: expect.any(Date)
      });
    });
  });

  describe('deleteContact', () => {
    test('should delete a contact successfully', async () => {
      // Arrange
      const contactId = 1;

      // Act
      const result = await contactService.deleteContact(contactId);

      // Assert
      expect(mockContactRepository.findById).toHaveBeenCalledWith(contactId);
      expect(mockContactRepository.delete).toHaveBeenCalledWith(contactId);
      expect(result).toBe(true);
    });

    test('should throw error when contact is not found', async () => {
      // Arrange
      const contactId = 999;

      // Act & Assert
      await expect(contactService.deleteContact(contactId)).rejects.toThrow('Contact not found');
      expect(mockContactRepository.findById).toHaveBeenCalledWith(contactId);
      expect(mockContactRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getContactsByCompany', () => {
    test('should return contacts for a company', async () => {
      // Arrange
      const companyId = 1;

      // Act
      const result = await contactService.getContactsByCompany(companyId);

      // Assert
      expect(mockContactRepository.findByCompanyId).toHaveBeenCalledWith(companyId);
      expect(result).toHaveLength(2);
      expect(result[0].company_id).toBe(companyId);
      expect(result[1].company_id).toBe(companyId);
    });

    test('should return empty array when company has no contacts', async () => {
      // Arrange
      const companyId = 999;

      // Act
      const result = await contactService.getContactsByCompany(companyId);

      // Assert
      expect(mockContactRepository.findByCompanyId).toHaveBeenCalledWith(companyId);
      expect(result).toEqual([]);
    });
  });
});
