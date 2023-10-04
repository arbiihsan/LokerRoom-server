'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobApplications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        allowNull: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      JobPostingId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'JobPostings',
          key: 'id'
        },
        allowNull: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      applicationStatus: {
        type: Sequelize.ENUM,
        values: ['Accepted', 'Rejected', 'Processing'],
        allowNull: false,
        defaultValue: 'Processing'
      },
      isEmployed: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      startDateOfEmployment: {
        type: Sequelize.DATE,
        allowNull: true
      },
      endDateOfEmployment: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('JobApplications');
  }
};