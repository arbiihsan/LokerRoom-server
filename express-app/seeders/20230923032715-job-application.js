'use strict';

const fs = require('fs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const rawSeedData = JSON.parse(fs.readFileSync('../data/job-applications.json'));
    const seedData = rawSeedData.map(el => {
      let { UserId, JobPostingId, applicationStatus, isEmployed, startDateOfEmployment, endDateOfEmployment } = el;
      const createdAt = new Date();
      const updatedAt = new Date();
      startDateOfEmployment = startDateOfEmployment ? new Date(startDateOfEmployment) : null;
      endDateOfEmployment = endDateOfEmployment ? new Date(endDateOfEmployment) : null;
      return { 
        UserId, JobPostingId, applicationStatus, isEmployed, 
        startDateOfEmployment, endDateOfEmployment, 
        createdAt, updatedAt 
      }
    });
    await queryInterface.bulkInsert('JobApplications', seedData, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('JobApplications', null, {
      restartIdentity: true,
      cascade: true,
      truncate: true
    });
  }
};
