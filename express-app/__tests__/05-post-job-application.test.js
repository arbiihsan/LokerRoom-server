const request = require('supertest');
const app = require('../app');
const { encrypt } = require('../helpers/password'); 
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
  { name: 'Labour', createdAt: dummyDate, updatedAt: dummyDate }
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
  },
  {
    name: "Donal Bebek",
    email: "donal.bebek@mail.com",
    password: "password",
    telephone: "081113334462",
    address: "Jakarta",
    imgUrl: null,
    EducationId: 3,
    gender: "Male",
    dateOfBirth: new Date("2005-04-02T00:00:00"),
    profileDescription: "",
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
];
const jobPostings = [
  {
    title: "Money counter",
    description: "Job Posting 1",
    address: "Jakarta",
    CategoryId: 1,
    minSalary: 100_000,
    maxSalary: 300_000,
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
    title: "Money cleaner",
    description: "Job Posting 2",
    address: "Jakarta",
    CategoryId: 1,
    minSalary: 100_000,
    maxSalary: 300_000,
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
    title: "Accountant",
    description: "Job Posting 3",
    address: "Jakarta",
    CategoryId: 1,
    minSalary: 100_000,
    maxSalary: 300_000,
    AuthorId: 1,
    requiredGender: 'Male',
    maxAge: 30,
    RequiredEducation: 1,
    status: 'Filled',
    isUrgent: false,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    title: "Superhero",
    description: "Job Posting 4",
    address: "Jakarta",
    CategoryId: 1,
    minSalary: 100_000,
    maxSalary: 300_000,
    AuthorId: 1,
    requiredGender: 'Male',
    maxAge: 30,
    RequiredEducation: 1,
    status: 'Inactive',
    isUrgent: true,
    createdAt: dummyDate,
    updatedAt: dummyDate
  }
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
});

describe('POST Job Application', () => {  

  let access_token;
  beforeAll(async () => {
    const response = await request(app)
      .post(entrypoints.login)
      .send({
        telephone: users[1].telephone,
        password: users[1].password
      });
    access_token = response.body.access_token;
  });

  it('should successfully post a job application', async () => {

    const response = await request(app)
      .post(entrypoints.applyToJob(1))
      .set('access_token', access_token);
    expect(response.statusCode).toBe(201);

    const fetchResponse = await request(app)
      .get(entrypoints.myJobApplications)
      .set('access_token', access_token);
    expect(fetchResponse.statusCode).toBe(200);
    const jobApplication = fetchResponse.body[0];
    const {
      jobPosting, applicationStatus, isEmployed, startDateOfEmployment, endDateOfEmployment
    } = jobApplication;
    expect(jobPosting.id).toBe(1);
    expect(applicationStatus).toBe("Processing");
    expect(isEmployed).toBeNull();
    expect(startDateOfEmployment).toBeNull();
    expect(endDateOfEmployment).toBeNull();

  });

  it('should fail to post a job application if user has already applied', async () => {
    const response = await request(app)
      .post(entrypoints.applyToJob(1))
      .set('access_token', access_token);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to post a job application without authentication', async () => {
    const response = await request(app)
      .post(entrypoints.applyToJob(2));
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to post a job application if job posting is inactive', async () => {
    const response = await request(app)
      .post(entrypoints.applyToJob(3))
      .set('access_token', access_token);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to post a job application if job posting is filled', async () => {
    const response = await request(app)
      .post(entrypoints.applyToJob(4))
      .set('access_token', access_token);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();
  });

});