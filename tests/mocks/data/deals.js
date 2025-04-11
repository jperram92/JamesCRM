/**
 * Mock deal data for testing
 */

const mockDeals = [
  {
    id: 1,
    name: 'Enterprise Software License',
    quote_number: 'Q-2023-001',
    amount: 50000.00,
    status: 'Sent',
    stage: 'Proposal',
    company_id: 1, // Acme Corporation
    contact_id: 1, // Alice Anderson
    billing_contact_id: 2, // Bob Brown
    owner_id: 1, // John Doe
    close_date: new Date('2023-03-31T00:00:00Z'),
    description: 'Enterprise software license for 100 users',
    created_at: new Date('2023-01-20T00:00:00Z'),
    updated_at: new Date('2023-01-20T00:00:00Z'),
  },
  {
    id: 2,
    name: 'Consulting Services',
    quote_number: 'Q-2023-002',
    amount: 25000.00,
    status: 'Draft',
    stage: 'Qualification',
    company_id: 2, // Globex Corporation
    contact_id: 3, // Charlie Clark
    billing_contact_id: 3, // Charlie Clark
    owner_id: 2, // Jane Smith
    close_date: new Date('2023-04-15T00:00:00Z'),
    description: '2-week consulting engagement',
    created_at: new Date('2023-01-21T00:00:00Z'),
    updated_at: new Date('2023-01-21T00:00:00Z'),
  },
  {
    id: 3,
    name: 'Financial Software Implementation',
    quote_number: 'Q-2023-003',
    amount: 100000.00,
    status: 'Accepted',
    stage: 'Closing',
    company_id: 3, // Initech
    contact_id: 4, // David Davis
    billing_contact_id: 4, // David Davis
    owner_id: 1, // John Doe
    close_date: new Date('2023-02-28T00:00:00Z'),
    description: 'Full implementation of financial software suite',
    created_at: new Date('2023-01-22T00:00:00Z'),
    updated_at: new Date('2023-01-25T00:00:00Z'),
  },
];

module.exports = mockDeals;
