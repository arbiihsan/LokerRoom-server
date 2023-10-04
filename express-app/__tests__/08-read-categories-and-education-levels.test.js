const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const entrypoints = require('../config/testing-entrypoints');

const dummyDate = new Date('2020-01-01T00:00:00');

/* 
 * START SEED DATA
 */
const educationLevels = [
  {
    education: 'SD',
    priority: 1,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    education: 'SMK',
    priority: 2,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    education: 'Diploma',
    priority: 3,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    education: 'S1',
    priority: 4,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    education: 'S2',
    priority: 5,
    createdAt: dummyDate,
    updatedAt: dummyDate
  }
];
const categories = [
  { name: 'Labour', createdAt: dummyDate, updatedAt: dummyDate },
  { name: 'Domestic Help', createdAt: dummyDate, updatedAt: dummyDate },
  { name: 'Cooking', createdAt: dummyDate, updatedAt: dummyDate },
  { name: 'Office', createdAt: dummyDate, updatedAt: dummyDate }
];
/* 
 * END SEED DATA
 */

beforeAll(async () => {
  await sequelize.queryInterface.bulkInsert('EducationLevels', educationLevels);
  await sequelize.queryInterface.bulkInsert('Categories', categories);
})

afterAll(async () => {
  ['EducationLevels', 'Categories'].forEach(async (tableName) => {
    await sequelize.queryInterface.bulkDelete(tableName, null, {
      restartIdentity: true,
      cascade: true,
      truncate: true
    });
  });
})

describe('GET Categories', () => {  
  it('should successfully fetch categories', async () => {
    const response = await request(app)
      .get(entrypoints.categories)
    expect(response.statusCode).toBe(200);

    const fetchedCategories = response.body;
    expect(fetchedCategories.length).toBe(4);
    const { name } = fetchedCategories[0];
    expect(name).toBeDefined();
  });
});

describe('GET Education Levels', () => {  
  it('should successfully fetch education levels', async () => {
    const response = await request(app)
      .get(entrypoints.educationLevels)
    expect(response.statusCode).toBe(200);

    const fetchedLevels = response.body;
    expect(fetchedLevels.length).toBe(5);
    const { education, priority } = fetchedLevels[0];
    expect(education).toBeDefined();
    expect(priority).toBeDefined();
  });
});