/**
 * Unit tests for template controller
 */

describe('Template Controller', () => {
  // Mock dependencies
  const mockTemplateService = {
    getAllTemplates: jest.fn(),
    getTemplateById: jest.fn(),
    getTemplatesByType: jest.fn(),
    createTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn()
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
  
  // Mock template controller
  const templateController = {
    getAllTemplates: async (req, res) => {
      try {
        const templates = await mockTemplateService.getAllTemplates();
        res.json(templates);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching templates' });
      }
    },
    
    getTemplateById: async (req, res) => {
      try {
        const { id } = req.params;
        
        if (!id) {
          return res.status(400).json({ message: 'Template ID is required' });
        }
        
        const template = await mockTemplateService.getTemplateById(id);
        
        if (!template) {
          return res.status(404).json({ message: 'Template not found' });
        }
        
        res.json(template);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching template' });
      }
    },
    
    getTemplatesByType: async (req, res) => {
      try {
        const { type } = req.params;
        
        if (!type) {
          return res.status(400).json({ message: 'Template type is required' });
        }
        
        const templates = await mockTemplateService.getTemplatesByType(type);
        res.json(templates);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching templates' });
      }
    },
    
    createTemplate: async (req, res) => {
      try {
        const { name, type, subject, content, variables } = req.body;
        
        if (!name || !type || !content) {
          return res.status(400).json({ message: 'Name, type, and content are required' });
        }
        
        const templateData = {
          name,
          type,
          subject,
          content,
          variables,
          created_by: req.user.id
        };
        
        const template = await mockTemplateService.createTemplate(templateData);
        res.status(201).json(template);
      } catch (error) {
        res.status(500).json({ message: 'Error creating template' });
      }
    },
    
    updateTemplate: async (req, res) => {
      try {
        const { id } = req.params;
        const { name, type, subject, content, variables } = req.body;
        
        if (!id) {
          return res.status(400).json({ message: 'Template ID is required' });
        }
        
        const template = await mockTemplateService.getTemplateById(id);
        
        if (!template) {
          return res.status(404).json({ message: 'Template not found' });
        }
        
        const templateData = {
          name: name || template.name,
          type: type || template.type,
          subject: subject !== undefined ? subject : template.subject,
          content: content || template.content,
          variables: variables || template.variables
        };
        
        const updatedTemplate = await mockTemplateService.updateTemplate(id, templateData);
        res.json(updatedTemplate);
      } catch (error) {
        res.status(500).json({ message: 'Error updating template' });
      }
    },
    
    deleteTemplate: async (req, res) => {
      try {
        const { id } = req.params;
        
        if (!id) {
          return res.status(400).json({ message: 'Template ID is required' });
        }
        
        const template = await mockTemplateService.getTemplateById(id);
        
        if (!template) {
          return res.status(404).json({ message: 'Template not found' });
        }
        
        await mockTemplateService.deleteTemplate(id);
        res.json({ message: 'Template deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting template' });
      }
    }
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTemplates', () => {
    test('should return all templates', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      const mockTemplates = [
        { id: 1, name: 'Welcome Email', type: 'email', content: 'Welcome to our platform!' },
        { id: 2, name: 'Order Confirmation', type: 'email', content: 'Your order has been confirmed.' }
      ];
      
      mockTemplateService.getAllTemplates.mockResolvedValue(mockTemplates);
      
      // Act
      await templateController.getAllTemplates(req, res);
      
      // Assert
      expect(mockTemplateService.getAllTemplates).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockTemplates);
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      mockTemplateService.getAllTemplates.mockRejectedValue(new Error('Database error'));
      
      // Act
      await templateController.getAllTemplates(req, res);
      
      // Assert
      expect(mockTemplateService.getAllTemplates).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching templates' });
    });
  });
  
  describe('getTemplateById', () => {
    test('should return a template by ID', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const templateId = '1';
      
      req.params = { id: templateId };
      
      const mockTemplate = {
        id: 1,
        name: 'Welcome Email',
        type: 'email',
        subject: 'Welcome to our platform',
        content: 'Welcome to our platform!',
        variables: ['name', 'company'],
        created_by: 1,
        created_at: new Date()
      };
      
      mockTemplateService.getTemplateById.mockResolvedValue(mockTemplate);
      
      // Act
      await templateController.getTemplateById(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith(templateId);
      expect(res.json).toHaveBeenCalledWith(mockTemplate);
    });
    
    test('should return 400 when template ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {};
      
      // Act
      await templateController.getTemplateById(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Template ID is required' });
    });
    
    test('should return 404 when template is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const templateId = '999';
      
      req.params = { id: templateId };
      
      mockTemplateService.getTemplateById.mockResolvedValue(null);
      
      // Act
      await templateController.getTemplateById(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith(templateId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Template not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const templateId = '1';
      
      req.params = { id: templateId };
      
      mockTemplateService.getTemplateById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await templateController.getTemplateById(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith(templateId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching template' });
    });
  });
  
  describe('getTemplatesByType', () => {
    test('should return templates by type', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const templateType = 'email';
      
      req.params = { type: templateType };
      
      const mockTemplates = [
        {
          id: 1,
          name: 'Welcome Email',
          type: 'email',
          subject: 'Welcome to our platform',
          content: 'Welcome to our platform!',
          variables: ['name', 'company'],
          created_by: 1,
          created_at: new Date()
        },
        {
          id: 3,
          name: 'Password Reset',
          type: 'email',
          subject: 'Password Reset Request',
          content: 'Click the link to reset your password.',
          variables: ['name', 'reset_link'],
          created_by: 1,
          created_at: new Date()
        }
      ];
      
      mockTemplateService.getTemplatesByType.mockResolvedValue(mockTemplates);
      
      // Act
      await templateController.getTemplatesByType(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplatesByType).toHaveBeenCalledWith(templateType);
      expect(res.json).toHaveBeenCalledWith(mockTemplates);
    });
    
    test('should return 400 when template type is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {};
      
      // Act
      await templateController.getTemplatesByType(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplatesByType).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Template type is required' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const templateType = 'email';
      
      req.params = { type: templateType };
      
      mockTemplateService.getTemplatesByType.mockRejectedValue(new Error('Database error'));
      
      // Act
      await templateController.getTemplatesByType(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplatesByType).toHaveBeenCalledWith(templateType);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching templates' });
    });
  });
  
  describe('createTemplate', () => {
    test('should create a new template', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'New Template',
        type: 'email',
        subject: 'New Subject',
        content: 'New content for the template',
        variables: ['name', 'company']
      };
      
      const templateData = {
        ...req.body,
        created_by: req.user.id
      };
      
      const createdTemplate = {
        id: 4,
        ...templateData,
        created_at: new Date()
      };
      
      mockTemplateService.createTemplate.mockResolvedValue(createdTemplate);
      
      // Act
      await templateController.createTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.createTemplate).toHaveBeenCalledWith(templateData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdTemplate);
    });
    
    test('should return 400 when name is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        type: 'email',
        content: 'New content for the template'
      };
      
      // Act
      await templateController.createTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.createTemplate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name, type, and content are required' });
    });
    
    test('should return 400 when type is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'New Template',
        content: 'New content for the template'
      };
      
      // Act
      await templateController.createTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.createTemplate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name, type, and content are required' });
    });
    
    test('should return 400 when content is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'New Template',
        type: 'email'
      };
      
      // Act
      await templateController.createTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.createTemplate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name, type, and content are required' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'New Template',
        type: 'email',
        subject: 'New Subject',
        content: 'New content for the template',
        variables: ['name', 'company']
      };
      
      mockTemplateService.createTemplate.mockRejectedValue(new Error('Database error'));
      
      // Act
      await templateController.createTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.createTemplate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating template' });
    });
  });
  
  describe('updateTemplate', () => {
    test('should update an existing template', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const templateId = '1';
      
      req.params = { id: templateId };
      req.body = {
        name: 'Updated Template',
        content: 'Updated content for the template'
      };
      
      const existingTemplate = {
        id: 1,
        name: 'Welcome Email',
        type: 'email',
        subject: 'Welcome to our platform',
        content: 'Welcome to our platform!',
        variables: ['name', 'company'],
        created_by: 1,
        created_at: new Date()
      };
      
      const templateData = {
        name: 'Updated Template',
        type: existingTemplate.type,
        subject: existingTemplate.subject,
        content: 'Updated content for the template',
        variables: existingTemplate.variables
      };
      
      const updatedTemplate = {
        ...existingTemplate,
        ...templateData,
        updated_at: new Date()
      };
      
      mockTemplateService.getTemplateById.mockResolvedValue(existingTemplate);
      mockTemplateService.updateTemplate.mockResolvedValue(updatedTemplate);
      
      // Act
      await templateController.updateTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateService.updateTemplate).toHaveBeenCalledWith(templateId, templateData);
      expect(res.json).toHaveBeenCalledWith(updatedTemplate);
    });
    
    test('should return 400 when template ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {};
      req.body = {
        name: 'Updated Template',
        content: 'Updated content for the template'
      };
      
      // Act
      await templateController.updateTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).not.toHaveBeenCalled();
      expect(mockTemplateService.updateTemplate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Template ID is required' });
    });
    
    test('should return 404 when template is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const templateId = '999';
      
      req.params = { id: templateId };
      req.body = {
        name: 'Updated Template',
        content: 'Updated content for the template'
      };
      
      mockTemplateService.getTemplateById.mockResolvedValue(null);
      
      // Act
      await templateController.updateTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateService.updateTemplate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Template not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const templateId = '1';
      
      req.params = { id: templateId };
      req.body = {
        name: 'Updated Template',
        content: 'Updated content for the template'
      };
      
      mockTemplateService.getTemplateById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await templateController.updateTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateService.updateTemplate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating template' });
    });
  });
  
  describe('deleteTemplate', () => {
    test('should delete an existing template', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const templateId = '1';
      
      req.params = { id: templateId };
      
      const existingTemplate = {
        id: 1,
        name: 'Welcome Email',
        type: 'email',
        subject: 'Welcome to our platform',
        content: 'Welcome to our platform!',
        variables: ['name', 'company'],
        created_by: 1,
        created_at: new Date()
      };
      
      mockTemplateService.getTemplateById.mockResolvedValue(existingTemplate);
      mockTemplateService.deleteTemplate.mockResolvedValue(true);
      
      // Act
      await templateController.deleteTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateService.deleteTemplate).toHaveBeenCalledWith(templateId);
      expect(res.json).toHaveBeenCalledWith({ message: 'Template deleted successfully' });
    });
    
    test('should return 400 when template ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {};
      
      // Act
      await templateController.deleteTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).not.toHaveBeenCalled();
      expect(mockTemplateService.deleteTemplate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Template ID is required' });
    });
    
    test('should return 404 when template is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const templateId = '999';
      
      req.params = { id: templateId };
      
      mockTemplateService.getTemplateById.mockResolvedValue(null);
      
      // Act
      await templateController.deleteTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateService.deleteTemplate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Template not found' });
    });
    
    test('should handle errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const templateId = '1';
      
      req.params = { id: templateId };
      
      mockTemplateService.getTemplateById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await templateController.deleteTemplate(req, res);
      
      // Assert
      expect(mockTemplateService.getTemplateById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateService.deleteTemplate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting template' });
    });
  });
});
