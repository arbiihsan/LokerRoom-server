'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobPostings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      CategoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Categories',
          key: 'id'
        },
        allowNull: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      minSalary: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      maxSalary: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      AuthorId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        allowNull: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      requiredGender: {
        type: Sequelize.ENUM,
        values: ['Male', 'Female'],
        allowNull: true
      },
      maxAge: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      RequiredEducation: {
        type: Sequelize.INTEGER,
        references: {
          model: 'EducationLevels',
          key: 'id'
        },
        allowNull: true,
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM,
        values: ['Active', 'Inactive', 'Filled'],
        allowNull: false,
        defaultValue: 'Active'
      },
      isUrgent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('JobPostings');
  }
};