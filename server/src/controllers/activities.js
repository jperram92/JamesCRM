const { Activity, Company, Contact, Deal, User } = require('../models');

// Get all activities
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.findAll({
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Deal,
          as: 'deal',
          attributes: ['id', 'title', 'stage']
        },
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
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error while fetching activities' });
  }
};

// Get activity by ID
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Deal,
          as: 'deal',
          attributes: ['id', 'title', 'stage']
        },
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
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Server error while fetching activity' });
  }
};

// Create activity
exports.createActivity = async (req, res) => {
  try {
    const {
      type,
      subject,
      description,
      due_date,
      contact_id,
      company_id,
      deal_id,
      assigned_to
    } = req.body;

    // Check if contact exists if contact_id is provided
    if (contact_id) {
      const contact = await Contact.findByPk(contact_id);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
    }

    // Check if company exists if company_id is provided
    if (company_id) {
      const company = await Company.findByPk(company_id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    // Check if deal exists if deal_id is provided
    if (deal_id) {
      const deal = await Deal.findByPk(deal_id);
      if (!deal) {
        return res.status(404).json({ message: 'Deal not found' });
      }
    }

    // Check if user exists if assigned_to is provided
    if (assigned_to) {
      const user = await User.findByPk(assigned_to);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    const activity = await Activity.create({
      type,
      subject,
      description,
      due_date,
      contact_id,
      company_id,
      deal_id,
      assigned_to: assigned_to || req.user.id,
      created_by: req.user.id
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Server error while creating activity' });
  }
};

// Update activity
exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Extract updatable fields
    const {
      type,
      subject,
      description,
      due_date,
      completed,
      completed_at,
      contact_id,
      company_id,
      deal_id,
      assigned_to
    } = req.body;
    
    // Check if contact exists if contact_id is provided
    if (contact_id) {
      const contact = await Contact.findByPk(contact_id);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
    }

    // Check if company exists if company_id is provided
    if (company_id) {
      const company = await Company.findByPk(company_id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    // Check if deal exists if deal_id is provided
    if (deal_id) {
      const deal = await Deal.findByPk(deal_id);
      if (!deal) {
        return res.status(404).json({ message: 'Deal not found' });
      }
    }

    // Check if user exists if assigned_to is provided
    if (assigned_to) {
      const user = await User.findByPk(assigned_to);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }
    
    // Update activity
    await activity.update({
      type: type || activity.type,
      subject: subject || activity.subject,
      description: description !== undefined ? description : activity.description,
      due_date: due_date !== undefined ? due_date : activity.due_date,
      completed: completed !== undefined ? completed : activity.completed,
      completed_at: completed_at !== undefined ? completed_at : activity.completed_at,
      contact_id: contact_id !== undefined ? contact_id : activity.contact_id,
      company_id: company_id !== undefined ? company_id : activity.company_id,
      deal_id: deal_id !== undefined ? deal_id : activity.deal_id,
      assigned_to: assigned_to !== undefined ? assigned_to : activity.assigned_to
    });

    res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Server error while updating activity' });
  }
};

// Delete activity
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await activity.destroy();
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Server error while deleting activity' });
  }
};

// Mark activity as completed
exports.completeActivity = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await activity.update({
      completed: true,
      completed_at: new Date()
    });

    res.json(activity);
  } catch (error) {
    console.error('Error completing activity:', error);
    res.status(500).json({ message: 'Server error while completing activity' });
  }
};
