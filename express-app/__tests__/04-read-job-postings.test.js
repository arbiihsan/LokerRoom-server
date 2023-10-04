const request = require('supertest');
const app = require('../app');
const { encrypt } = require('../helpers/password'); 
const { sequelize } = require('../models');
const entrypoints = require('../config/testing-entrypoints');

const { NUM_JOB_POSTINGS_PER_PAGE } = require('../config/pagination');

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
const users = [
  {
    name: "Gober Bebek",
    email: "moneymoneymoney@mail.com",
    password: "password",
    telephone: "081113334465",
    address: "Jakarta",
    imgUrl: null,
    EducationId: 2,
    gender: "Male",
    dateOfBirth: new Date("1985-01-30T00:00:00"),
    profileDescription: "",
    createdAt: dummyDate,
    updatedAt: dummyDate
  }
];
const jobPostings = [
  {
    title: "Pekerja kontruksi",
    description: "Job Posting 1",
    address: "Jakarta",
    long: 2301.1,
    lat: 189.2,
    CategoryId: 1,
    minSalary: 2000_000,
    maxSalary: 3000_000,
    AuthorId: 1,
    requiredGender: 'Male',
    maxAge: 30,
    RequiredEducation: 1,
    status: 'Active',
    isUrgent: false,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    title: "ART",
    description: "Job Posting 2",
    address: "Bandung",
    long: 3101.1,
    lat: 139.5,
    CategoryId: 2,
    minSalary: 1300_000,
    maxSalary: 1600_000,
    AuthorId: 1,
    requiredGender: 'Female',
    maxAge: null,
    RequiredEducation: 1,
    status: 'Active',
    isUrgent: false,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    title: "Koki",
    description: "Job Posting 3",
    address: "Jakarta",
    long: 201.9,
    lat: 142.4,
    CategoryId: 3,
    minSalary: 2500_000,
    maxSalary: 3000_000,
    AuthorId: 1,
    requiredGender: null,
    maxAge: null,
    RequiredEducation: 2,
    status: 'Active',
    isUrgent: false,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    title: "Onsite drill team",
    description: "Job Posting 4",
    address: "Depok",
    long: 901.9,
    lat: 149.2,
    CategoryId: 1,
    minSalary: 3000_000,
    maxSalary: 3500_000,
    AuthorId: 1,
    requiredGender: "Male",
    maxAge: 25,
    RequiredEducation: 3,
    status: 'Active',
    isUrgent: true,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    title: "Gamer",
    description: "Job Posting 5",
    address: "Dreamland",
    long: null,
    lat: null,
    CategoryId: 1,
    minSalary: 10000_000,
    maxSalary: 15000_000,
    AuthorId: 1,
    requiredGender: null,
    maxAge: null,
    RequiredEducation: null,
    status: 'Inactive',
    isUrgent: false,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
];
/* 
 * END SEED DATA
 */

beforeAll(async () => {
  await sequelize.queryInterface.bulkInsert('EducationLevels', educationLevels);
  await sequelize.queryInterface.bulkInsert('Categories', categories);
  await sequelize.queryInterface.bulkInsert('Users', users.map(el => {
    return {...el, password: encrypt(el.password)}
  }));
  await sequelize.queryInterface.bulkInsert('JobPostings', jobPostings);
})

afterAll(async () => {
  ['EducationLevels', 'Categories', 'Users', 'JobPostings', 'JobApplications', 'Reviews'].forEach(async (tableName) => {
    await sequelize.queryInterface.bulkDelete(tableName, null, {
      restartIdentity: true,
      cascade: true,
      truncate: true
    });
  });
})

describe('GET Multiple Job Postings', () => {  

  it('should successfully fetch multiple postings', async () => {
    const response = await request(app)
      .get(entrypoints.jobPostings())
    expect(response.statusCode).toBe(200);

    const { numPages, data: fetchedPostings } = response.body;
    expect(numPages).toBe(1);
    expect(fetchedPostings.length).toBe(Math.min(NUM_JOB_POSTINGS_PER_PAGE, 5));
    const { 
      title, description, address, long, lat, category, author,  
      minSalary, maxSalary, requiredGender, maxAge, requiredEducation, 
      status, isUrgent } = fetchedPostings[0];
    expect(title).toBeDefined();
    expect(description).toBeDefined();
    expect(address).toBeDefined();
    expect(long).toBeDefined();
    expect(lat).toBeDefined();
    expect(category).toBeDefined();
    expect(author).toBeDefined();
    expect(minSalary).toBeDefined();
    expect(maxSalary).toBeDefined();
    expect(requiredGender).toBeDefined();
    expect(maxAge).toBeDefined();
    expect(requiredEducation).toBeDefined();
    expect(status).toBeDefined();
    expect(isUrgent).toBeDefined();

  });

  it('should successfully filter job postings based on gender', async () => {
    const response = await request(app)
      .get(entrypoints.jobPostings({ requiredGender: 'Male' }));
    expect(response.statusCode).toBe(200);
    const { data: jobPostings } = response.body;
    const jobPostingsGenders = jobPostings.map(el => el.requiredGender);
    expect(jobPostingsGenders.every(el => el === 'Male')).toBe(true);
  });

  it('should successfully filter job postings based on maximum age', async () => {
    const response = await request(app)
      .get(entrypoints.jobPostings({ maxAge: 30 }));
    expect(response.statusCode).toBe(200);
    const { data: jobPostings } = response.body;
    const jobPostingsAgeRequirements = jobPostings.map(el => el.maxAge);
    expect(jobPostingsAgeRequirements.every(el => el === null || el <= 30)).toBe(true);
  });

  it('should successfully filter job postings based on category', async () => {
    const response = await request(app)
      .get(entrypoints.jobPostings({ categoryId: 1 }));
    expect(response.statusCode).toBe(200);
    const { data: jobPostings } = response.body;
    const jobPostingsCategories = jobPostings.map(el => el.category.id);
    expect(jobPostingsCategories.every(el => el === 1)).toBe(true);
  });

  it('should successfully filter job postings based on max education level', async () => {
    const response = await request(app)
      .get(entrypoints.jobPostings({ education: 2 }));
    expect(response.statusCode).toBe(200);
    const { data: jobPostings } = response.body;
    const jobPostingsEducations = jobPostings.map(el => el.requiredEducation);
    expect(jobPostingsEducations.every(el => el === null || el.id === 1 || el.id === 2)).toBe(true);
  });

  it('should successfully filter job postings based on location', async () => {
    const response = await request(app)
      .get(entrypoints.jobPostings({ location: 'Jakarta' }));
    expect(response.statusCode).toBe(200);
    const { data: jobPostings } = response.body;
    const jobPostingsLocations = jobPostings.map(el => el.address);
    expect(jobPostingsLocations.every(el => el === 'Jakarta')).toBe(true);
  });

  it('should successfully filter job postings that are urgent', async () => {
    const response = await request(app)
      .get(entrypoints.jobPostings({ isUrgent: 1 }));
    expect(response.statusCode).toBe(200);
    const { data: jobPostings } = response.body;
    const jobPostingsUrgent = jobPostings.map(el => el.isUrgent);
    expect(jobPostingsUrgent.every(el => el)).toBe(true);
  });

  it('should return with a status code of 200 even if no data is found', async () => {
    const response = await request(app)
      .get(entrypoints.jobPostings({ location: "Bogota" }));
    expect(response.statusCode).toBe(200);
    const { numPages, data: jobPostings } = response.body;
    expect(numPages).toBe(0);
    expect(jobPostings).toBeDefined();
    expect(jobPostings.length).toBe(0);
  });

});

describe('GET One Job Posting', () => {  

  it('should successfully get a posting by Id', async () => {
    const response = await request(app)
      .get(entrypoints.jobPosting(1))
    expect(response.statusCode).toBe(200);

    const { 
      title, description, address, long, lat, category, author,  
      minSalary, maxSalary, requiredGender, maxAge, requiredEducation, 
      status, isUrgent } = response.body;
    expect(title).toBeDefined();
    expect(description).toBeDefined();
    expect(address).toBeDefined();
    expect(long).toBeDefined();
    expect(lat).toBeDefined();
    expect(category).toBeDefined();
    expect(author).toBeDefined();
    expect(minSalary).toBeDefined();
    expect(maxSalary).toBeDefined();
    expect(requiredGender).toBeDefined();
    expect(maxAge).toBeDefined();
    expect(requiredEducation).toBeDefined();
    expect(status).toBeDefined();
    expect(isUrgent).toBeDefined();

  });

  it('should fail to get a non-existent posting', async () => {
    const response = await request(app)
      .get(entrypoints.jobPosting(200))
    expect(response.statusCode).toBe(404);
  });

  it('should fail to get a posting with an invalid Id', async () => {
    const response = await request(app)
      .get(entrypoints.jobPosting("abcd"))
    expect(response.statusCode).toBe(404);
  });

});