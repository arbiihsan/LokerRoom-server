'use strict';

const fs = require('fs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const rawSeedData = JSON.parse(fs.readFileSync('../data/categories.json'));
    const seedData = rawSeedData.map(el => {
      const { name } = el;
      const createdAt = new Date();
      const updatedAt = new Date();
      return { name, createdAt, updatedAt }
    });
    await queryInterface.bulkInsert('Categories', seedData, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {
      restartIdentity: true,
      cascade: true,
      truncate: true
    });
  }
};
