const { Deal, Company, Contact, Activity, User } = require('../models');

// Get all deals
exports.getAllDeals = async (req, res) => {
  try {
    const deals = await Deal.findAll({
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'first_name', 'last_name', 'email']
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
    console.error('Error fetching deals:', error);
    res.status(500).json({ message: 'Server error while fetching deals' });
  }
};

// Get deal by ID
exports.getDealById = async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ message: 'Server error while fetching deal' });
  }
};

// Create deal
exports.createDeal = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      stage,
      close_date,
      probability,
      company_id,
      contact_id
    } = req.body;

    // Check if company exists
    const company = await Company.findByPk(company_id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if contact exists if contact_id is provided
    if (contact_id) {
      const contact = await Contact.findByPk(contact_id);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
    }

    const deal = await Deal.create({
      title,
      description,
      amount,
      stage,
      close_date,
      probability,
      company_id,
      contact_id,
      owner_id: req.user.id
    });

    res.status(201).json(deal);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ message: 'Server error while creating deal' });
  }
};

// Update deal
exports.updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Extract updatable fields
    const {
      title,
      description,
      amount,
      stage,
      close_date,
      probability,
      company_id,
      contact_id
    } = req.body;
    
    // Check if company exists if company_id is provided
    if (company_id) {
      const company = await Company.findByPk(company_id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    // Check if contact exists if contact_id is provided
    if (contact_id) {
      const contact = await Contact.findByPk(contact_id);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
    }
    
    // Update deal
    await deal.update({
      title: title || deal.title,
      description: description !== undefined ? description : deal.description,
      amount: amount !== undefined ? amount : deal.amount,
      stage: stage || deal.stage,
      close_date: close_date !== undefined ? close_date : deal.close_date,
      probability: probability !== undefined ? probability : deal.probability,
      company_id: company_id || deal.company_id,
      contact_id: contact_id !== undefined ? contact_id : deal.contact_id
    });

    res.json(deal);
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ message: 'Server error while updating deal' });
  }
};

// Delete deal
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    await deal.destroy();
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({ message: 'Server error while deleting deal' });
  }
};

// Get deal activities
exports.getDealActivities = async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const activities = await Activity.findAll({
      where: { deal_id: req.params.id },
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
    console.error('Error fetching deal activities:', error);
    res.status(500).json({ message: 'Server error while fetching deal activities' });
  }
};
