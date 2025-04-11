/**
 * Mock companies controller
 */

// Mock getAllCompanies function
exports.getAllCompanies = async (req, res) => {
  res.json([
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
      created_by: 1,
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
      created_by: 1,
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
      created_by: 2,
    },
  ]);
};

// Mock getCompanyById function
exports.getCompanyById = async (req, res) => {
  const { id } = req.params;
  
  if (id === '1') {
    return res.json({
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
      created_by: 1,
    });
  }
  
  res.status(404).json({ message: 'Company not found' });
};

// Mock createCompany function
exports.createCompany = async (req, res) => {
  const { name, industry, website, phone, address, city, state, zip_code, country, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  res.status(201).json({
    id: 4,
    name,
    industry,
    website,
    phone,
    address,
    city,
    state,
    zip_code,
    country,
    description,
    created_by: req.user.id,
  });
};

// Mock updateCompany function
exports.updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, industry, website, phone, address, city, state, zip_code, country, description } = req.body;
  
  if (id === '1') {
    return res.json({
      id: 1,
      name: name || 'Acme Corporation',
      industry: industry || 'Technology',
      website: website || 'https://acme.example.com',
      phone: phone || '123-456-7890',
      address: address || '123 Main St',
      city: city || 'New York',
      state: state || 'NY',
      zip_code: zip_code || '10001',
      country: country || 'USA',
      description: description || 'A leading technology company',
      created_by: 1,
    });
  }
  
  res.status(404).json({ message: 'Company not found' });
};

// Mock deleteCompany function
exports.deleteCompany = async (req, res) => {
  const { id } = req.params;
  
  if (id === '1') {
    return res.json({ message: 'Company deleted successfully' });
  }
  
  res.status(404).json({ message: 'Company not found' });
};

// Mock getCompanyContacts function
exports.getCompanyContacts = async (req, res) => {
  const { id } = req.params;
  
  if (id === '1') {
    return res.json([
      {
        id: 1,
        first_name: 'Alice',
        last_name: 'Anderson',
        email: 'alice.anderson@acme.example.com',
        phone: '123-456-7890',
        job_title: 'CEO',
        company_id: 1,
        created_by: 1,
      },
      {
        id: 2,
        first_name: 'Bob',
        last_name: 'Brown',
        email: 'bob.brown@acme.example.com',
        phone: '234-567-8901',
        job_title: 'CTO',
        company_id: 1,
        created_by: 1,
      },
    ]);
  }
  
  res.status(404).json({ message: 'Company not found' });
};

// Mock getCompanyDeals function
exports.getCompanyDeals = async (req, res) => {
  const { id } = req.params;
  
  if (id === '1') {
    return res.json([
      {
        id: 1,
        name: 'Enterprise Software License',
        quote_number: 'Q-2023-001',
        amount: 50000.00,
        status: 'Sent',
        stage: 'Proposal',
        company_id: 1,
        contact_id: 1,
        owner_id: 1,
      },
    ]);
  }
  
  res.status(404).json({ message: 'Company not found' });
};
