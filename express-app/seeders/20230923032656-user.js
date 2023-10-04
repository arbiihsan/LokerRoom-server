'use strict';

const fs = require('fs');
const { encrypt } = require('../helpers/password');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const rawSeedData = JSON.parse(fs.readFileSync('../data/users.json'));
    const seedData = rawSeedData.map(el => {
      let { 
        name, email, password, telephone, address, imgUrl, EducationId, gender, dateOfBirth, profileDescription 
      } = el;
      password = encrypt(password);
      dateOfBirth = new Date(dateOfBirth);
      const createdAt = new Date();
      const updatedAt = new Date();
      return { 
        name, email, password, telephone, address, 
        imgUrl, EducationId, gender, dateOfBirth, profileDescription, 
        createdAt, updatedAt 
      }
    });
    await queryInterface.bulkInsert('Users', seedData, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {
      restartIdentity: true,
      cascade: true,
      truncate: true
    });
  }
};
