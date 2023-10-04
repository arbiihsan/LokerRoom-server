'use strict';

const fs = require('fs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const rawSeedData = JSON.parse(fs.readFileSync('../data/education-levels.json'));
    const seedData = rawSeedData.map(el => {
      const { education, priority } = el;
      const createdAt = new Date();
      const updatedAt = new Date();
      return { education, priority, createdAt, updatedAt }
    });
    await queryInterface.bulkInsert('EducationLevels', seedData, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('EducationLevels', null, {
      restartIdentity: true,
      cascade: true,
      truncate: true
    });
  }
};
