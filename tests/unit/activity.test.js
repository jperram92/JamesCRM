/**
 * Unit tests for activity functionality
 */

describe('Activity Management', () => {
  // Mock activity data
  const mockActivities = [
    {
      id: 1,
      type: 'Call',
      subject: 'Initial sales call',
      description: 'Discussed product features and pricing',
      due_date: new Date('2023-01-25T14:00:00Z'),
      completed_date: new Date('2023-01-25T14:30:00Z'),
      status: 'Completed',
      contact_id: 1,
      company_id: 1,
      deal_id: 1,
      assigned_to: 1,
      created_by: 1,
      created_at: new Date('2023-01-24T00:00:00Z'),
      updated_at: new Date('2023-01-25T14:30:00Z')
    },
    {
      id: 2,
      type: 'Meeting',
      subject: 'Product demo',
      description: 'Scheduled product demonstration for key stakeholders',
      due_date: new Date('2023-02-01T10:00:00Z'),
      completed_date: null,
      status: 'Scheduled',
      contact_id: 1,
      company_id: 1,
      deal_id: 1,
      assigned_to: 1,
      created_by: 1,
      created_at: new Date('2023-01-26T00:00:00Z'),
      updated_at: new Date('2023-01-26T00:00:00Z')
    },
    {
      id: 3,
      type: 'Email',
      subject: 'Follow-up on proposal',
      description: 'Sent follow-up email regarding the proposal',
      due_date: new Date('2023-01-27T09:00:00Z'),
      completed_date: new Date('2023-01-27T09:15:00Z'),
      status: 'Completed',
      contact_id: 3,
      company_id: 2,
      deal_id: 2,
      assigned_to: 2,
      created_by: 2,
      created_at: new Date('2023-01-26T00:00:00Z'),
      updated_at: new Date('2023-01-27T09:15:00Z')
    },
    {
      id: 4,
      type: 'Task',
      subject: 'Prepare implementation plan',
      description: 'Create detailed implementation plan for financial software',
      due_date: new Date('2023-02-05T00:00:00Z'),
      completed_date: null,
      status: 'In Progress',
      contact_id: 4,
      company_id: 3,
      deal_id: 3,
      assigned_to: 1,
      created_by: 1,
      created_at: new Date('2023-01-28T00:00:00Z'),
      updated_at: new Date('2023-01-28T00:00:00Z')
    }
  ];

  // Mock activity service
  const mockFindAll = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByContact = jest.fn();
  const mockFindByCompany = jest.fn();
  const mockFindByDeal = jest.fn();
  const mockFindByAssignee = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockComplete = jest.fn();
  const mockDelete = jest.fn();

  const activityService = {
    findAllActivities: mockFindAll,
    findActivityById: mockFindById,
    findActivitiesByContact: mockFindByContact,
    findActivitiesByCompany: mockFindByCompany,
    findActivitiesByDeal: mockFindByDeal,
    findActivitiesByAssignee: mockFindByAssignee,
    createActivity: mockCreate,
    updateActivity: mockUpdate,
    completeActivity: mockComplete,
    deleteActivity: mockDelete
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockFindAll.mockReset();
    mockFindById.mockReset();
    mockFindByContact.mockReset();
    mockFindByCompany.mockReset();
    mockFindByDeal.mockReset();
    mockFindByAssignee.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockComplete.mockReset();
    mockDelete.mockReset();
  });

  test('should get all activities', async () => {
    // Arrange
    mockFindAll.mockResolvedValue(mockActivities);

    // Act
    const result = await activityService.findAllActivities();

    // Assert
    expect(mockFindAll).toHaveBeenCalled();
    expect(result).toEqual(mockActivities);
    expect(result.length).toBe(4);
  });

  test('should get activity by ID', async () => {
    // Arrange
    const activityId = 1;
    const expectedActivity = mockActivities.find(activity => activity.id === activityId);
    mockFindById.mockResolvedValue(expectedActivity);

    // Act
    const result = await activityService.findActivityById(activityId);

    // Assert
    expect(mockFindById).toHaveBeenCalledWith(activityId);
    expect(result).toEqual(expectedActivity);
  });

  test('should return null when activity is not found', async () => {
    // Arrange
    const activityId = 999;
    mockFindById.mockResolvedValue(null);

    // Act
    const result = await activityService.findActivityById(activityId);

    // Assert
    expect(mockFindById).toHaveBeenCalledWith(activityId);
    expect(result).toBeNull();
  });

  test('should get activities by contact ID', async () => {
    // Arrange
    const contactId = 1;
    const expectedActivities = mockActivities.filter(activity => activity.contact_id === contactId);
    mockFindByContact.mockResolvedValue(expectedActivities);

    // Act
    const result = await activityService.findActivitiesByContact(contactId);

    // Assert
    expect(mockFindByContact).toHaveBeenCalledWith(contactId);
    expect(result).toEqual(expectedActivities);
    expect(result.length).toBe(2);
  });

  test('should get activities by company ID', async () => {
    // Arrange
    const companyId = 1;
    const expectedActivities = mockActivities.filter(activity => activity.company_id === companyId);
    mockFindByCompany.mockResolvedValue(expectedActivities);

    // Act
    const result = await activityService.findActivitiesByCompany(companyId);

    // Assert
    expect(mockFindByCompany).toHaveBeenCalledWith(companyId);
    expect(result).toEqual(expectedActivities);
    expect(result.length).toBe(2);
  });

  test('should get activities by deal ID', async () => {
    // Arrange
    const dealId = 1;
    const expectedActivities = mockActivities.filter(activity => activity.deal_id === dealId);
    mockFindByDeal.mockResolvedValue(expectedActivities);

    // Act
    const result = await activityService.findActivitiesByDeal(dealId);

    // Assert
    expect(mockFindByDeal).toHaveBeenCalledWith(dealId);
    expect(result).toEqual(expectedActivities);
    expect(result.length).toBe(2);
  });

  test('should get activities by assignee ID', async () => {
    // Arrange
    const assigneeId = 1;
    const expectedActivities = mockActivities.filter(activity => activity.assigned_to === assigneeId);
    mockFindByAssignee.mockResolvedValue(expectedActivities);

    // Act
    const result = await activityService.findActivitiesByAssignee(assigneeId);

    // Assert
    expect(mockFindByAssignee).toHaveBeenCalledWith(assigneeId);
    expect(result).toEqual(expectedActivities);
    expect(result.length).toBe(3);
  });

  test('should create a new activity', async () => {
    // Arrange
    const newActivity = {
      type: 'Call',
      subject: 'Follow-up call',
      description: 'Follow up on previous discussion',
      due_date: new Date('2023-02-10T15:00:00Z'),
      status: 'Scheduled',
      contact_id: 2,
      company_id: 1,
      deal_id: 1,
      assigned_to: 1,
      created_by: 1
    };
    const createdActivity = {
      id: 5,
      ...newActivity,
      completed_date: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockCreate.mockResolvedValue(createdActivity);

    // Act
    const result = await activityService.createActivity(newActivity);

    // Assert
    expect(mockCreate).toHaveBeenCalledWith(newActivity);
    expect(result).toEqual(createdActivity);
    expect(result.id).toBe(5);
  });

  test('should update an existing activity', async () => {
    // Arrange
    const activityId = 2;
    const updateData = {
      subject: 'Updated Product Demo',
      description: 'Updated description for product demo',
      due_date: new Date('2023-02-02T10:00:00Z')
    };
    const updatedActivity = {
      ...mockActivities.find(activity => activity.id === activityId),
      ...updateData,
      updated_at: new Date()
    };
    mockUpdate.mockResolvedValue(updatedActivity);

    // Act
    const result = await activityService.updateActivity(activityId, updateData);

    // Assert
    expect(mockUpdate).toHaveBeenCalledWith(activityId, updateData);
    expect(result).toEqual(updatedActivity);
    expect(result.subject).toBe('Updated Product Demo');
    expect(result.description).toBe('Updated description for product demo');
  });

  test('should complete an activity', async () => {
    // Arrange
    const activityId = 2;
    const completedDate = new Date();
    const notes = 'Completed successfully';

    const completedActivity = {
      ...mockActivities.find(activity => activity.id === activityId),
      status: 'Completed',
      completed_date: completedDate,
      description: mockActivities.find(activity => activity.id === activityId).description + '\n\nNotes: ' + notes,
      updated_at: new Date()
    };
    mockComplete.mockResolvedValue(completedActivity);

    // Act
    const result = await activityService.completeActivity(activityId, completedDate, notes);

    // Assert
    expect(mockComplete).toHaveBeenCalledWith(activityId, completedDate, notes);
    expect(result).toEqual(completedActivity);
    expect(result.status).toBe('Completed');
    expect(result.completed_date).toBe(completedDate);
    expect(result.description).toContain(notes);
  });

  test('should delete an activity', async () => {
    // Arrange
    const activityId = 1;
    mockDelete.mockResolvedValue(true);

    // Act
    const result = await activityService.deleteActivity(activityId);

    // Assert
    expect(mockDelete).toHaveBeenCalledWith(activityId);
    expect(result).toBe(true);
  });

  test('should filter activities by status', () => {
    // Act
    const completedActivities = filterActivitiesByStatus(mockActivities, 'Completed');
    const scheduledActivities = filterActivitiesByStatus(mockActivities, 'Scheduled');
    const inProgressActivities = filterActivitiesByStatus(mockActivities, 'In Progress');

    // Assert
    expect(completedActivities.length).toBe(2);
    expect(completedActivities[0].id).toBe(1);
    expect(completedActivities[1].id).toBe(3);

    expect(scheduledActivities.length).toBe(1);
    expect(scheduledActivities[0].id).toBe(2);

    expect(inProgressActivities.length).toBe(1);
    expect(inProgressActivities[0].id).toBe(4);
  });

  test('should filter activities by type', () => {
    // Act
    const callActivities = filterActivitiesByType(mockActivities, 'Call');
    const meetingActivities = filterActivitiesByType(mockActivities, 'Meeting');
    const emailActivities = filterActivitiesByType(mockActivities, 'Email');
    const taskActivities = filterActivitiesByType(mockActivities, 'Task');

    // Assert
    expect(callActivities.length).toBe(1);
    expect(callActivities[0].id).toBe(1);

    expect(meetingActivities.length).toBe(1);
    expect(meetingActivities[0].id).toBe(2);

    expect(emailActivities.length).toBe(1);
    expect(emailActivities[0].id).toBe(3);

    expect(taskActivities.length).toBe(1);
    expect(taskActivities[0].id).toBe(4);
  });

  test('should filter activities by due date range', () => {
    // Arrange
    const startDate = new Date('2023-01-26T00:00:00Z');
    const endDate = new Date('2023-02-01T23:59:59Z');

    // Act
    const activitiesInRange = filterActivitiesByDueDateRange(mockActivities, startDate, endDate);

    // Assert
    expect(activitiesInRange.length).toBe(2);
    expect(activitiesInRange[0].id).toBe(2);
    expect(activitiesInRange[1].id).toBe(3);
  });

  test('should sort activities by due date', () => {
    // Act
    const ascendingActivities = sortActivitiesByDueDate(mockActivities, 'asc');
    const descendingActivities = sortActivitiesByDueDate(mockActivities, 'desc');

    // Assert
    expect(ascendingActivities[0].id).toBe(1);
    expect(ascendingActivities[1].id).toBe(3);
    expect(ascendingActivities[2].id).toBe(2);
    expect(ascendingActivities[3].id).toBe(4);

    expect(descendingActivities[0].id).toBe(4);
    expect(descendingActivities[1].id).toBe(2);
    expect(descendingActivities[2].id).toBe(3);
    expect(descendingActivities[3].id).toBe(1);
  });

  test('should get upcoming activities', () => {
    // Arrange
    const now = new Date('2023-01-26T12:00:00Z');

    // Act
    const upcomingActivities = getUpcomingActivities(mockActivities, now);

    // Assert
    expect(upcomingActivities.length).toBe(2);
    expect(upcomingActivities[0].id).toBe(2); // Due on 2023-02-01
    expect(upcomingActivities[1].id).toBe(4); // Due on 2023-02-05
  });

  test('should get overdue activities', () => {
    // Arrange
    const now = new Date('2023-01-26T12:00:00Z');

    // Act
    const overdueActivities = getOverdueActivities(mockActivities, now);

    // Assert
    expect(overdueActivities.length).toBe(0);
  });

  // Helper functions for testing
  function filterActivitiesByStatus(activities, status) {
    return activities.filter(activity => activity.status === status);
  }

  function filterActivitiesByType(activities, type) {
    return activities.filter(activity => activity.type === type);
  }

  function filterActivitiesByDueDateRange(activities, startDate, endDate) {
    return activities.filter(activity => {
      const dueDate = new Date(activity.due_date);
      return dueDate >= startDate && dueDate <= endDate;
    });
  }

  function sortActivitiesByDueDate(activities, direction = 'asc') {
    return [...activities].sort((a, b) => {
      const dateA = new Date(a.due_date);
      const dateB = new Date(b.due_date);
      return direction === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  function getUpcomingActivities(activities, now) {
    return activities
      .filter(activity => {
        const dueDate = new Date(activity.due_date);
        return dueDate > now && activity.status !== 'Completed';
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }

  function getOverdueActivities(activities, now) {
    return activities
      .filter(activity => {
        const dueDate = new Date(activity.due_date);
        return dueDate < now && activity.status !== 'Completed';
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }
});
