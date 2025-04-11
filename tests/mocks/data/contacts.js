/**
 * Mock contact data for testing
 */

const mockContacts = [
  {
    id: 1,
    first_name: 'Alice',
    last_name: 'Anderson',
    email: 'alice.anderson@acme.example.com',
    phone: '123-456-7890',
    job_title: 'CEO',
    company_id: 1, // Acme Corporation
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    country: 'USA',
    notes: 'Key decision maker',
    created_by: 1, // John Doe
    created_at: new Date('2023-01-15T00:00:00Z'),
    updated_at: new Date('2023-01-15T00:00:00Z'),
  },
  {
    id: 2,
    first_name: 'Bob',
    last_name: 'Brown',
    email: 'bob.brown@acme.example.com',
    phone: '234-567-8901',
    job_title: 'CTO',
    company_id: 1, // Acme Corporation
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    country: 'USA',
    notes: 'Technical contact',
    created_by: 1, // John Doe
    created_at: new Date('2023-01-16T00:00:00Z'),
    updated_at: new Date('2023-01-16T00:00:00Z'),
  },
  {
    id: 3,
    first_name: 'Charlie',
    last_name: 'Clark',
    email: 'charlie.clark@globex.example.com',
    phone: '345-678-9012',
    job_title: 'Procurement Manager',
    company_id: 2, // Globex Corporation
    address: '456 Oak St',
    city: 'Chicago',
    state: 'IL',
    zip_code: '60601',
    country: 'USA',
    notes: 'Handles purchasing decisions',
    created_by: 2, // Jane Smith
    created_at: new Date('2023-01-17T00:00:00Z'),
    updated_at: new Date('2023-01-17T00:00:00Z'),
  },
  {
    id: 4,
    first_name: 'David',
    last_name: 'Davis',
    email: 'david.davis@initech.example.com',
    phone: '456-789-0123',
    job_title: 'CFO',
    company_id: 3, // Initech
    address: '789 Pine St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94101',
    country: 'USA',
    notes: 'Financial decision maker',
    created_by: 2, // Jane Smith
    created_at: new Date('2023-01-18T00:00:00Z'),
    updated_at: new Date('2023-01-18T00:00:00Z'),
  },
];

module.exports = mockContacts;
