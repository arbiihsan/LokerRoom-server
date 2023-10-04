'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('JobPostings', 'long', {
      type: Sequelize.FLOAT
    });
    await queryInterface.addColumn('JobPostings', 'lat', {
      type: Sequelize.FLOAT
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('JobPostings', 'long');
    await queryInterface.removeColumn('JobPostings', 'lat');
  }
};
