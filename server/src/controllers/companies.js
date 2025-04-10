const { Company, Contact, Deal, Activity, User } = require('../models');

// Get all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Server error while fetching companies' });
  }
};

// Get company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Server error while fetching company' });
  }
};

// Create company
exports.createCompany = async (req, res) => {
  try {
    const {
      name,
      industry,
      website,
      phone,
      address,
      city,
      state,
      zip_code,
      country,
      notes
    } = req.body;

    const company = await Company.create({
      name,
      industry,
      website,
      phone,
      address,
      city,
      state,
      zip_code,
      country,
      notes,
      created_by: req.user.id
    });

    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Server error while creating company' });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Extract updatable fields
    const {
      name,
      industry,
      website,
      phone,
      address,
      city,
      state,
      zip_code,
      country,
      notes
    } = req.body;
    
    // Update company
    await company.update({
      name: name || company.name,
      industry: industry !== undefined ? industry : company.industry,
      website: website !== undefined ? website : company.website,
      phone: phone !== undefined ? phone : company.phone,
      address: address !== undefined ? address : company.address,
      city: city !== undefined ? city : company.city,
      state: state !== undefined ? state : company.state,
      zip_code: zip_code !== undefined ? zip_code : company.zip_code,
      country: country !== undefined ? country : company.country,
      notes: notes !== undefined ? notes : company.notes
    });

    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Server error while updating company' });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await company.destroy();
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Server error while deleting company' });
  }
};

// Get company contacts
exports.getCompanyContacts = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const contacts = await Contact.findAll({
      where: { company_id: req.params.id },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching company contacts:', error);
    res.status(500).json({ message: 'Server error while fetching company contacts' });
  }
};

// Get company deals
exports.getCompanyDeals = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const deals = await Deal.findAll({
      where: { company_id: req.params.id },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json(deals);
  } catch (error) {
    console.error('Error fetching company deals:', error);
    res.status(500).json({ message: 'Server error while fetching company deals' });
  }
};

// Get company activities
exports.getCompanyActivities = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const activities = await Activity.findAll({
      where: { company_id: req.params.id },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching company activities:', error);
    res.status(500).json({ message: 'Server error while fetching company activities' });
  }
};
