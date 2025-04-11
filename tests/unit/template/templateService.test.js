/**
 * Unit tests for template service
 */

describe('Template Service', () => {
  // Mock dependencies
  const mockTemplateRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };
  
  // Mock template service
  const templateService = {
    getAllTemplates: async () => {
      return await mockTemplateRepository.findAll();
    },
    
    getTemplateById: async (id) => {
      const template = await mockTemplateRepository.findById(id);
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      return template;
    },
    
    getTemplateByName: async (name) => {
      const template = await mockTemplateRepository.findByName(name);
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      return template;
    },
    
    createTemplate: async (templateData) => {
      const existingTemplate = await mockTemplateRepository.findByName(templateData.name);
      
      if (existingTemplate) {
        throw new Error(`Template with name '${templateData.name}' already exists`);
      }
      
      return await mockTemplateRepository.create(templateData);
    },
    
    updateTemplate: async (id, templateData) => {
      const template = await mockTemplateRepository.findById(id);
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      if (templateData.name && templateData.name !== template.name) {
        const existingTemplate = await mockTemplateRepository.findByName(templateData.name);
        
        if (existingTemplate) {
          throw new Error(`Template with name '${templateData.name}' already exists`);
        }
      }
      
      return await mockTemplateRepository.update(id, templateData);
    },
    
    deleteTemplate: async (id) => {
      const template = await mockTemplateRepository.findById(id);
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      return await mockTemplateRepository.delete(id);
    },
    
    renderTemplate: (template, data) => {
      if (!template || !template.content) {
        throw new Error('Invalid template');
      }
      
      let renderedContent = template.content;
      
      // Simple template rendering with {{variable}} syntax
      for (const key in data) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        renderedContent = renderedContent.replace(regex, data[key]);
      }
      
      return renderedContent;
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockTemplateRepository.findAll.mockReset();
    mockTemplateRepository.findById.mockReset();
    mockTemplateRepository.findByName.mockReset();
    mockTemplateRepository.create.mockReset();
    mockTemplateRepository.update.mockReset();
    mockTemplateRepository.delete.mockReset();
    
    // Default mock implementations
    mockTemplateRepository.findAll.mockResolvedValue([
      {
        id: 'template-1',
        name: 'welcome',
        subject: 'Welcome to JamesCRM',
        content: '<p>Welcome {{name}}!</p>',
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: null
      },
      {
        id: 'template-2',
        name: 'password-reset',
        subject: 'Reset your password',
        content: '<p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>',
        created_at: new Date('2023-01-02T00:00:00Z'),
        updated_at: null
      }
    ]);
    
    mockTemplateRepository.findById.mockImplementation((id) => {
      if (id === 'template-1') {
        return {
          id,
          name: 'welcome',
          subject: 'Welcome to JamesCRM',
          content: '<p>Welcome {{name}}!</p>',
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: null
        };
      }
      
      if (id === 'template-2') {
        return {
          id,
          name: 'password-reset',
          subject: 'Reset your password',
          content: '<p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>',
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: null
        };
      }
      
      return null;
    });
    
    mockTemplateRepository.findByName.mockImplementation((name) => {
      if (name === 'welcome') {
        return {
          id: 'template-1',
          name,
          subject: 'Welcome to JamesCRM',
          content: '<p>Welcome {{name}}!</p>',
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: null
        };
      }
      
      if (name === 'password-reset') {
        return {
          id: 'template-2',
          name,
          subject: 'Reset your password',
          content: '<p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>',
          created_at: new Date('2023-01-02T00:00:00Z'),
          updated_at: null
        };
      }
      
      return null;
    });
    
    mockTemplateRepository.create.mockImplementation((templateData) => ({
      id: 'template-3',
      ...templateData,
      created_at: new Date(),
      updated_at: null
    }));
    
    mockTemplateRepository.update.mockImplementation((id, templateData) => ({
      id,
      ...(id === 'template-1' ? {
        name: 'welcome',
        subject: 'Welcome to JamesCRM',
        content: '<p>Welcome {{name}}!</p>',
        created_at: new Date('2023-01-01T00:00:00Z')
      } : {
        name: 'password-reset',
        subject: 'Reset your password',
        content: '<p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>',
        created_at: new Date('2023-01-02T00:00:00Z')
      }),
      ...templateData,
      updated_at: new Date()
    }));
    
    mockTemplateRepository.delete.mockResolvedValue(true);
  });

  describe('getAllTemplates', () => {
    test('should return all templates', async () => {
      // Act
      const result = await templateService.getAllTemplates();
      
      // Assert
      expect(mockTemplateRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('template-1');
      expect(result[1].id).toBe('template-2');
    });
  });
  
  describe('getTemplateById', () => {
    test('should return template by ID', async () => {
      // Arrange
      const templateId = 'template-1';
      
      // Act
      const result = await templateService.getTemplateById(templateId);
      
      // Assert
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(templateId);
      expect(result).toEqual({
        id: templateId,
        name: 'welcome',
        subject: 'Welcome to JamesCRM',
        content: '<p>Welcome {{name}}!</p>',
        created_at: expect.any(Date),
        updated_at: null
      });
    });
    
    test('should throw error when template is not found', async () => {
      // Arrange
      const templateId = 'nonexistent';
      
      // Act & Assert
      await expect(templateService.getTemplateById(templateId)).rejects.toThrow('Template not found');
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(templateId);
    });
  });
  
  describe('getTemplateByName', () => {
    test('should return template by name', async () => {
      // Arrange
      const templateName = 'welcome';
      
      // Act
      const result = await templateService.getTemplateByName(templateName);
      
      // Assert
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith(templateName);
      expect(result).toEqual({
        id: 'template-1',
        name: templateName,
        subject: 'Welcome to JamesCRM',
        content: '<p>Welcome {{name}}!</p>',
        created_at: expect.any(Date),
        updated_at: null
      });
    });
    
    test('should throw error when template is not found', async () => {
      // Arrange
      const templateName = 'nonexistent';
      
      // Act & Assert
      await expect(templateService.getTemplateByName(templateName)).rejects.toThrow('Template not found');
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith(templateName);
    });
  });
  
  describe('createTemplate', () => {
    test('should create a new template', async () => {
      // Arrange
      const templateData = {
        name: 'new-template',
        subject: 'New Template',
        content: '<p>This is a new template with {{variable}}.</p>'
      };
      
      mockTemplateRepository.findByName.mockResolvedValue(null);
      
      // Act
      const result = await templateService.createTemplate(templateData);
      
      // Assert
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith(templateData.name);
      expect(mockTemplateRepository.create).toHaveBeenCalledWith(templateData);
      expect(result).toEqual({
        id: 'template-3',
        ...templateData,
        created_at: expect.any(Date),
        updated_at: null
      });
    });
    
    test('should throw error when template name already exists', async () => {
      // Arrange
      const templateData = {
        name: 'welcome',
        subject: 'Duplicate Template',
        content: '<p>This template name already exists.</p>'
      };
      
      // Act & Assert
      await expect(templateService.createTemplate(templateData)).rejects.toThrow("Template with name 'welcome' already exists");
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith(templateData.name);
      expect(mockTemplateRepository.create).not.toHaveBeenCalled();
    });
  });
  
  describe('updateTemplate', () => {
    test('should update an existing template', async () => {
      // Arrange
      const templateId = 'template-1';
      const templateData = {
        subject: 'Updated Welcome',
        content: '<p>Updated welcome message for {{name}}!</p>'
      };
      
      // Act
      const result = await templateService.updateTemplate(templateId, templateData);
      
      // Assert
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateRepository.update).toHaveBeenCalledWith(templateId, templateData);
      expect(result).toEqual({
        id: templateId,
        name: 'welcome',
        subject: 'Updated Welcome',
        content: '<p>Updated welcome message for {{name}}!</p>',
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should update template name when new name does not exist', async () => {
      // Arrange
      const templateId = 'template-1';
      const templateData = {
        name: 'new-welcome',
        subject: 'Updated Welcome',
        content: '<p>Updated welcome message for {{name}}!</p>'
      };
      
      mockTemplateRepository.findByName.mockResolvedValue(null);
      
      // Act
      const result = await templateService.updateTemplate(templateId, templateData);
      
      // Assert
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith(templateData.name);
      expect(mockTemplateRepository.update).toHaveBeenCalledWith(templateId, templateData);
      expect(result).toEqual({
        id: templateId,
        name: 'new-welcome',
        subject: 'Updated Welcome',
        content: '<p>Updated welcome message for {{name}}!</p>',
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
    
    test('should throw error when template is not found', async () => {
      // Arrange
      const templateId = 'nonexistent';
      const templateData = {
        subject: 'Updated Subject'
      };
      
      // Act & Assert
      await expect(templateService.updateTemplate(templateId, templateData)).rejects.toThrow('Template not found');
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateRepository.update).not.toHaveBeenCalled();
    });
    
    test('should throw error when new template name already exists', async () => {
      // Arrange
      const templateId = 'template-1';
      const templateData = {
        name: 'password-reset',
        subject: 'Updated Welcome'
      };
      
      // Act & Assert
      await expect(templateService.updateTemplate(templateId, templateData)).rejects.toThrow("Template with name 'password-reset' already exists");
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith(templateData.name);
      expect(mockTemplateRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteTemplate', () => {
    test('should delete an existing template', async () => {
      // Arrange
      const templateId = 'template-1';
      
      // Act
      const result = await templateService.deleteTemplate(templateId);
      
      // Assert
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateRepository.delete).toHaveBeenCalledWith(templateId);
      expect(result).toBe(true);
    });
    
    test('should throw error when template is not found', async () => {
      // Arrange
      const templateId = 'nonexistent';
      
      // Act & Assert
      await expect(templateService.deleteTemplate(templateId)).rejects.toThrow('Template not found');
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateRepository.delete).not.toHaveBeenCalled();
    });
  });
  
  describe('renderTemplate', () => {
    test('should render template with provided data', () => {
      // Arrange
      const template = {
        content: '<p>Hello {{name}}, welcome to {{company}}!</p>'
      };
      
      const data = {
        name: 'John',
        company: 'JamesCRM'
      };
      
      // Act
      const result = templateService.renderTemplate(template, data);
      
      // Assert
      expect(result).toBe('<p>Hello John, welcome to JamesCRM!</p>');
    });
    
    test('should handle multiple occurrences of the same variable', () => {
      // Arrange
      const template = {
        content: '<p>Hello {{name}}! Your name is {{name}}.</p>'
      };
      
      const data = {
        name: 'John'
      };
      
      // Act
      const result = templateService.renderTemplate(template, data);
      
      // Assert
      expect(result).toBe('<p>Hello John! Your name is John.</p>');
    });
    
    test('should leave unmatched variables unchanged', () => {
      // Arrange
      const template = {
        content: '<p>Hello {{name}}, your email is {{email}}.</p>'
      };
      
      const data = {
        name: 'John'
      };
      
      // Act
      const result = templateService.renderTemplate(template, data);
      
      // Assert
      expect(result).toBe('<p>Hello John, your email is {{email}}.</p>');
    });
    
    test('should throw error when template is invalid', () => {
      // Arrange
      const template = null;
      const data = { name: 'John' };
      
      // Act & Assert
      expect(() => templateService.renderTemplate(template, data)).toThrow('Invalid template');
    });
    
    test('should throw error when template content is missing', () => {
      // Arrange
      const template = { id: 'template-1' };
      const data = { name: 'John' };
      
      // Act & Assert
      expect(() => templateService.renderTemplate(template, data)).toThrow('Invalid template');
    });
  });
});
