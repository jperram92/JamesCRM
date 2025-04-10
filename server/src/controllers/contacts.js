const { Contact, Company, Deal, Activity, User } = require('../models');

// Get all contacts
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error while fetching contacts' });
  }
};

// Get contact by ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Server error while fetching contact' });
  }
};

// Create contact
exports.createContact = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      job_title,
      company_id,
      address,
      city,
      state,
      zip_code,
      country,
      notes
    } = req.body;

    // Check if company exists if company_id is provided
    if (company_id) {
      const company = await Company.findByPk(company_id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    const contact = await Contact.create({
      first_name,
      last_name,
      email,
      phone,
      job_title,
      company_id,
      address,
      city,
      state,
      zip_code,
      country,
      notes,
      created_by: req.user.id
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Server error while creating contact' });
  }
};

// Update contact
exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Extract updatable fields
    const {
      first_name,
      last_name,
      email,
      phone,
      job_title,
      company_id,
      address,
      city,
      state,
      zip_code,
      country,
      notes
    } = req.body;
    
    // Check if company exists if company_id is provided
    if (company_id) {
      const company = await Company.findByPk(company_id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }
    
    // Update contact
    await contact.update({
      first_name: first_name || contact.first_name,
      last_name: last_name || contact.last_name,
      email: email !== undefined ? email : contact.email,
      phone: phone !== undefined ? phone : contact.phone,
      job_title: job_title !== undefined ? job_title : contact.job_title,
      company_id: company_id !== undefined ? company_id : contact.company_id,
      address: address !== undefined ? address : contact.address,
      city: city !== undefined ? city : contact.city,
      state: state !== undefined ? state : contact.state,
      zip_code: zip_code !== undefined ? zip_code : contact.zip_code,
      country: country !== undefined ? country : contact.country,
      notes: notes !== undefined ? notes : contact.notes
    });

    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ message: 'Server error while updating contact' });
  }
};

// Delete contact
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    await contact.destroy();
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Server error while deleting contact' });
  }
};

// Get contact deals
exports.getContactDeals = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const deals = await Deal.findAll({
      where: { contact_id: req.params.id },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json(deals);
  } catch (error) {
    console.error('Error fetching contact deals:', error);
    res.status(500).json({ message: 'Server error while fetching contact deals' });
  }
};

// Get contact activities
exports.getContactActivities = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const activities = await Activity.findAll({
      where: { contact_id: req.params.id },
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
    console.error('Error fetching contact activities:', error);
    res.status(500).json({ message: 'Server error while fetching contact activities' });
  }
};
