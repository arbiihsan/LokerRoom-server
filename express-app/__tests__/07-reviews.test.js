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
  {
    name: "Agus Angsa",
    email: "agus.angsa@mail.com",
    password: "password",
    telephone: "081113334469",
    address: "Jakarta",
    imgUrl: null,
    EducationId: 3,
    gender: "Male",
    dateOfBirth: new Date("1990-01-30T00:00:00"),
    profileDescription: "",
    createdAt: dummyDate,
    updatedAt: dummyDate
  }
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
    title: "Office Boy",
    description: "Job Posting 3",
    address: "Jakarta",
    CategoryId: 1,
    minSalary: 100_000,
    maxSalary: 300_000,
    AuthorId: 2,
    requiredGender: 'Male',
    maxAge: 30,
    RequiredEducation: 1,
    status: 'Active',
    isUrgent: false,
    createdAt: dummyDate,
    updatedAt: dummyDate
  }
];
const jobApplications = [
  {
    UserId: 2,
    JobPostingId: 1,
    applicationStatus: 'Accepted',
    isEmployed: false,
    startDateOfEmployment: dummyDate,
    endDateOfEmployment: dummyDate,
    createdAt: dummyDate,
    updatedAt: dummyDate,
  },
  {
    UserId: 2,
    JobPostingId: 2,
    applicationStatus: 'Accepted',
    isEmployed: true,
    startDateOfEmployment: dummyDate,
    endDateOfEmployment: null,
    createdAt: dummyDate,
    updatedAt: dummyDate,
  },
  {
    UserId: 2,
    JobPostingId: 3,
    applicationStatus: 'Accepted',
    isEmployed: true,
    startDateOfEmployment: dummyDate,
    endDateOfEmployment: null,
    createdAt: dummyDate,
    updatedAt: dummyDate,
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
  await sequelize.queryInterface.bulkInsert('JobApplications', jobApplications);
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

describe('POST User Review', () => {  

  let employer_access_token;
  let applicant_access_token;

  beforeAll(async () => {

    const userLoginResponse = await request(app)
      .post(entrypoints.login)
      .send({
        telephone: users[1].telephone,
        password: users[1].password
      });
    applicant_access_token = userLoginResponse.body.access_token;

    const response = await request(app)
      .post(entrypoints.login)
      .send({
        telephone: users[0].telephone,
        password: users[0].password
      });
    employer_access_token = response.body.access_token;

  });

  it('should successfully add a user review if the employee is no longer working with the employer', async () => {
    
    const testData = {
      jobPostingId: 1,
      content: "Pekerja bagus",
      rating: 5
    };

    const response = await request(app)
      .post(entrypoints.reviewUser(2))
      .set('access_token', employer_access_token)
      .send(testData);
    expect(response.statusCode).toBe(201);

    const fetchResponse = await request(app)
      .get(entrypoints.myReviews)
      .set('access_token', applicant_access_token);
    const reviews = fetchResponse.body;
    const { employer, user, jobPosting, content, rating } = reviews[0];
    expect(employer?.id).toBe(1);
    // expect(user?.id).toBe(2);
    expect(jobPosting?.id).toBe(testData.jobPostingId);
    expect(content).toBe(testData.content);
    expect(rating).toBe(testData.rating);

  });

  it('should successfully add a user review if the employee is still working with the employer', async () => {
    
    const testData = {
      jobPostingId: 2,
      content: "Pekerja bagus",
      rating: 5
    };

    const response = await request(app)
      .post(entrypoints.reviewUser(2))
      .set('access_token', employer_access_token)
      .send(testData);
    expect(response.statusCode).toBe(201);

    const fetchResponse = await request(app)
      .get(entrypoints.myReviews)
      .set('access_token', applicant_access_token);
    const reviews = fetchResponse.body;
    const { employer, user, jobPosting, content, rating } = reviews[0];
    expect(employer?.id).toBe(1);
    // expect(user?.id).toBe(2);
    expect(jobPosting?.id).toBe(testData.jobPostingId);
    expect(content).toBe(testData.content);
    expect(rating).toBe(testData.rating);

  });

  it('should fail to add a user review without authentication', async () => {
    
    const testData = {
      jobPostingId: 3,
      content: "Pekerja bagus",
      rating: 5
    };

    const response = await request(app)
      .post(entrypoints.reviewUser(2))
      .send(testData);
    expect(response.statusCode).toBe(401);

  });

  it('should forbid to add a user review if the related job posting is not written by the logged in user', async () => {
    
    const testData = {
      jobPostingId: 3,
      content: "Pekerja bagus",
      rating: 5
    };

    const response = await request(app)
      .post(entrypoints.reviewUser(2))
      .set('access_token', employer_access_token)
      .send(testData);
    expect(response.statusCode).toBe(403);

  });

});