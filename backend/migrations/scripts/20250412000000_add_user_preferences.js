/**
 * Migration: Add User Preferences
 * Created at: 2025-04-12T00:00:00.000Z
 */
const mongoose = require('mongoose');

module.exports = {
  /**
   * Apply the migration
   */
  up: async () => {
    const db = mongoose.connection;
    
    // Add preferences field to all users
    await db.collection('users').updateMany(
      {}, 
      { 
        $set: { 
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              inApp: true
            },
            dashboardLayout: 'default'
          } 
        } 
      }
    );
    
    console.log('Added preferences field to all users');
  },

  /**
   * Revert the migration
   */
  down: async () => {
    const db = mongoose.connection;
    
    // Remove preferences field from all users
    await db.collection('users').updateMany(
      {}, 
      { $unset: { preferences: '' } }
    );
    
    console.log('Removed preferences field from all users');
  }
};
