'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('email_deliveries', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      email_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Type of email (invitation, password_reset, etc.)'
      },
      recipient: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Status of email delivery (pending, delivered, failed, etc.)'
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Email service provider (sendgrid, mailgun, smtp)'
      },
      provider_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Message ID from the email provider'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      opened_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      clicked_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('email_deliveries', ['user_id']);
    await queryInterface.addIndex('email_deliveries', ['email_type']);
    await queryInterface.addIndex('email_deliveries', ['status']);
    await queryInterface.addIndex('email_deliveries', ['sent_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('email_deliveries');
  }
};
