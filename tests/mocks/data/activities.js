/**
 * Mock activity data for testing
 */

const mockActivities = [
  {
    id: 1,
    type: 'Call',
    subject: 'Initial sales call',
    description: 'Discussed product features and pricing',
    due_date: new Date('2023-01-25T14:00:00Z'),
    completed_date: new Date('2023-01-25T14:30:00Z'),
    status: 'Completed',
    contact_id: 1, // Alice Anderson
    company_id: 1, // Acme Corporation
    deal_id: 1, // Enterprise Software License
    assigned_to: 1, // John Doe
    created_by: 1, // John Doe
    created_at: new Date('2023-01-24T00:00:00Z'),
    updated_at: new Date('2023-01-25T14:30:00Z'),
  },
  {
    id: 2,
    type: 'Meeting',
    subject: 'Product demo',
    description: 'Scheduled product demonstration for key stakeholders',
    due_date: new Date('2023-02-01T10:00:00Z'),
    completed_date: null,
    status: 'Scheduled',
    contact_id: 1, // Alice Anderson
    company_id: 1, // Acme Corporation
    deal_id: 1, // Enterprise Software License
    assigned_to: 1, // John Doe
    created_by: 1, // John Doe
    created_at: new Date('2023-01-26T00:00:00Z'),
    updated_at: new Date('2023-01-26T00:00:00Z'),
  },
  {
    id: 3,
    type: 'Email',
    subject: 'Follow-up on proposal',
    description: 'Sent follow-up email regarding the proposal',
    due_date: new Date('2023-01-27T09:00:00Z'),
    completed_date: new Date('2023-01-27T09:15:00Z'),
    status: 'Completed',
    contact_id: 3, // Charlie Clark
    company_id: 2, // Globex Corporation
    deal_id: 2, // Consulting Services
    assigned_to: 2, // Jane Smith
    created_by: 2, // Jane Smith
    created_at: new Date('2023-01-26T00:00:00Z'),
    updated_at: new Date('2023-01-27T09:15:00Z'),
  },
  {
    id: 4,
    type: 'Task',
    subject: 'Prepare implementation plan',
    description: 'Create detailed implementation plan for financial software',
    due_date: new Date('2023-02-05T00:00:00Z'),
    completed_date: null,
    status: 'In Progress',
    contact_id: 4, // David Davis
    company_id: 3, // Initech
    deal_id: 3, // Financial Software Implementation
    assigned_to: 1, // John Doe
    created_by: 1, // John Doe
    created_at: new Date('2023-01-28T00:00:00Z'),
    updated_at: new Date('2023-01-28T00:00:00Z'),
  },
];

module.exports = mockActivities;
