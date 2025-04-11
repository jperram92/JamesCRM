/**
 * Mock company data for testing
 */

const mockCompanies = [
  {
    id: 1,
    name: 'Acme Corporation',
    industry: 'Technology',
    website: 'https://acme.example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    country: 'USA',
    description: 'A leading technology company',
    created_by: 1, // John Doe
    created_at: new Date('2023-01-10T00:00:00Z'),
    updated_at: new Date('2023-01-10T00:00:00Z'),
  },
  {
    id: 2,
    name: 'Globex Corporation',
    industry: 'Manufacturing',
    website: 'https://globex.example.com',
    phone: '234-567-8901',
    address: '456 Oak St',
    city: 'Chicago',
    state: 'IL',
    zip_code: '60601',
    country: 'USA',
    description: 'A global manufacturing company',
    created_by: 1, // John Doe
    created_at: new Date('2023-01-11T00:00:00Z'),
    updated_at: new Date('2023-01-11T00:00:00Z'),
  },
  {
    id: 3,
    name: 'Initech',
    industry: 'Finance',
    website: 'https://initech.example.com',
    phone: '345-678-9012',
    address: '789 Pine St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94101',
    country: 'USA',
    description: 'A financial services company',
    created_by: 2, // Jane Smith
    created_at: new Date('2023-01-12T00:00:00Z'),
    updated_at: new Date('2023-01-12T00:00:00Z'),
  },
];

module.exports = mockCompanies;
