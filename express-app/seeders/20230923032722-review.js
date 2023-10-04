'use strict';

const fs = require('fs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const rawSeedData = JSON.parse(fs.readFileSync('../data/reviews.json'));
    const seedData = rawSeedData.map(el => {
      const { EmployerId, UserId, JobPostingId, content, rating } = el;
      const createdAt = new Date();
      const updatedAt = new Date();
      return { EmployerId, UserId, JobPostingId, content, rating, createdAt, updatedAt }
    });
    await queryInterface.bulkInsert('Reviews', seedData, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reviews', null, {
      restartIdentity: true,
      cascade: true,
      truncate: true
    });
  }
};
