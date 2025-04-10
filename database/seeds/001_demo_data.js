/**
 * Seed file for demo data
 */
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@jamescrm.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'user@jamescrm.com',
      password: userPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert users
    await queryInterface.bulkInsert('Users', [adminUser, regularUser]);

    // Create demo companies
    const companies = [
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Acme Inc',
        industry: 'Technology',
        website: 'https://acme.example.com',
        phone: '123-456-7890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        notes: 'Important client with multiple projects',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'Globex Corporation',
        industry: 'Manufacturing',
        website: 'https://globex.example.com',
        phone: '987-654-3210',
        address: '456 Oak Ave',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA',
        notes: 'Potential for expansion into new markets',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert companies
    await queryInterface.bulkInsert('Companies', companies);

    // Create demo contacts
    const contacts = [
      {
        id: '00000000-0000-0000-0000-000000000005',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@acme.example.com',
        phone: '123-456-7891',
        jobTitle: 'CEO',
        notes: 'Decision maker for all major projects',
        CompanyId: '00000000-0000-0000-0000-000000000003', // Acme Inc
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '00000000-0000-0000-0000-000000000006',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@acme.example.com',
        phone: '123-456-7892',
        jobTitle: 'CTO',
        notes: 'Technical contact for IT projects',
        CompanyId: '00000000-0000-0000-0000-000000000003', // Acme Inc
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '00000000-0000-0000-0000-000000000007',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@globex.example.com',
        phone: '987-654-3211',
        jobTitle: 'Procurement Manager',
        notes: 'Handles all purchasing decisions',
        CompanyId: '00000000-0000-0000-0000-000000000004', // Globex Corporation
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert contacts
    await queryInterface.bulkInsert('Contacts', contacts);

    // Create demo deals
    const deals = [
      {
        id: '00000000-0000-0000-0000-000000000008',
        name: 'Website Redesign',
        amount: 15000.00,
        stage: 'proposal',
        closeDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        probability: 70,
        notes: 'Proposal sent, awaiting feedback',
        CompanyId: '00000000-0000-0000-0000-000000000003', // Acme Inc
        ContactId: '00000000-0000-0000-0000-000000000005', // John Doe
        ownerId: '00000000-0000-0000-0000-000000000001', // Admin User
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '00000000-0000-0000-0000-000000000009',
        name: 'CRM Implementation',
        amount: 50000.00,
        stage: 'qualified',
        closeDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        probability: 50,
        notes: 'Initial requirements gathered',
        CompanyId: '00000000-0000-0000-0000-000000000004', // Globex Corporation
        ContactId: '00000000-0000-0000-0000-000000000007', // Bob Johnson
        ownerId: '00000000-0000-0000-0000-000000000002', // Regular User
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert deals
    await queryInterface.bulkInsert('Deals', deals);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seeded data
    await queryInterface.bulkDelete('Deals', null, {});
    await queryInterface.bulkDelete('Contacts', null, {});
    await queryInterface.bulkDelete('Companies', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};
