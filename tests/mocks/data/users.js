/**
 * Mock user data for testing
 */

const mockUsers = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: '$2a$10$rrm9CjKUIFrdJJHVUVVXX.Qd1Mj8nKJ.sSE5DVR.r9wMgJTRnnVVa', // hashed 'password123'
    role: 'admin',
    status: 'active',
    created_at: new Date('2023-01-01T00:00:00Z'),
    updated_at: new Date('2023-01-01T00:00:00Z'),
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    password: '$2a$10$rrm9CjKUIFrdJJHVUVVXX.Qd1Mj8nKJ.sSE5DVR.r9wMgJTRnnVVa', // hashed 'password123'
    role: 'manager',
    status: 'active',
    created_at: new Date('2023-01-02T00:00:00Z'),
    updated_at: new Date('2023-01-02T00:00:00Z'),
  },
  {
    id: 3,
    first_name: 'Bob',
    last_name: 'Johnson',
    email: 'bob.johnson@example.com',
    password: '$2a$10$rrm9CjKUIFrdJJHVUVVXX.Qd1Mj8nKJ.sSE5DVR.r9wMgJTRnnVVa', // hashed 'password123'
    role: 'user',
    status: 'active',
    created_at: new Date('2023-01-03T00:00:00Z'),
    updated_at: new Date('2023-01-03T00:00:00Z'),
  },
  {
    id: 4,
    first_name: null,
    last_name: null,
    email: 'pending.user@example.com',
    password: null,
    role: 'user',
    status: 'pending',
    invitation_token: 'abc123xyz456',
    invitation_expires: new Date(Date.now() + 86400000), // 24 hours from now
    created_at: new Date('2023-01-04T00:00:00Z'),
    updated_at: new Date('2023-01-04T00:00:00Z'),
  },
];

module.exports = mockUsers;
