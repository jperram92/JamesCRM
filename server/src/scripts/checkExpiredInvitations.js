/**
 * Script to check for expired invitations and update their status
 * This script should be run periodically (e.g., daily) using a cron job
 */

const { Invitation, User } = require('../models');
const { Op } = require('sequelize');

async function checkExpiredInvitations() {
  try {
    console.log('Checking for expired invitations...');
    
    // Find all pending invitations that have expired
    const expiredInvitations = await Invitation.findAll({
      where: {
        status: 'pending',
        expires_at: {
          [Op.lt]: new Date() // Less than current date
        }
      },
      include: [{ model: User, as: 'user' }]
    });
    
    console.log(`Found ${expiredInvitations.length} expired invitations`);
    
    // Update each invitation and associated user
    for (const invitation of expiredInvitations) {
      console.log(`Updating invitation ID ${invitation.id} for user ${invitation.user.email}`);
      
      // Update invitation status
      await invitation.update({
        status: 'expired',
        updated_at: new Date()
      });
      
      // Update user status if it's still in 'invited' state
      if (invitation.user.status === 'invited') {
        await invitation.user.update({
          status: 'inactive'
        });
      }
    }
    
    console.log('Expired invitations check completed successfully');
  } catch (error) {
    console.error('Error checking expired invitations:', error);
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  checkExpiredInvitations()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = checkExpiredInvitations;
