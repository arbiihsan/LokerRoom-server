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
    title: "Janitor",
    description: "Job Posting 3",
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
  }
];
const jobApplications = [
  {
    UserId: 2,
    JobPostingId: 1,
    applicationStatus: 'Processing',
    isEmployed: null,
    startDateOfEmployment: null,
    endDateOfEmployment: null,
    createdAt: dummyDate,
    updatedAt: dummyDate,
  },
  {
    UserId: 2,
    JobPostingId: 2,
    applicationStatus: 'Processing',
    isEmployed: null,
    startDateOfEmployment: null,
    endDateOfEmployment: null,
    createdAt: dummyDate,
    updatedAt: dummyDate,
  },
  {
    UserId: 2,
    JobPostingId: 3,
    applicationStatus: 'Accepted',
    isEmployed: null,
    startDateOfEmployment: null,
    endDateOfEmployment: null,
    createdAt: dummyDate,
    updatedAt: dummyDate,
  }
]
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

describe('PATCH Job Application', () => {  

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

  it('should successfully patch a job application (accept application)', async () => {

    const response = await request(app)
      .patch(entrypoints.acceptJobApplication(1))
      .set('access_token', employer_access_token);
    expect(response.statusCode).toBe(200);

    const fetchResponse = await request(app)
      .get(entrypoints.myJobApplications)
      .set('access_token', applicant_access_token);
    expect(fetchResponse.statusCode).toBe(200);
    const jobApplications = fetchResponse.body;
    const { 
      id, jobPosting, applicationStatus, isEmployed, startDateOfEmployment, endDateOfEmployment 
    } = jobApplications[2];
    expect(id).toBe(1);
    expect(jobPosting.id).toBe(1);
    expect(applicationStatus).toBe("Accepted");
    expect(isEmployed).toBeNull();
    expect(startDateOfEmployment).toBeNull();
    expect(endDateOfEmployment).toBeNull();

  });

  it('should successfully patch a job application (reject application)', async () => {

    const response = await request(app)
      .patch(entrypoints.rejectJobApplication(2))
      .set('access_token', employer_access_token);;
    expect(response.statusCode).toBe(200);

    const fetchResponse = await request(app)
      .get(entrypoints.myJobApplications)
      .set('access_token', applicant_access_token);
    expect(fetchResponse.statusCode).toBe(200);
    const jobApplications = fetchResponse.body;
    const { 
      id, jobPosting, applicationStatus, isEmployed, startDateOfEmployment, endDateOfEmployment 
    } = jobApplications[1];
    expect(id).toBe(2);
    expect(jobPosting.id).toBe(2);
    expect(applicationStatus).toBe("Rejected");
    expect(isEmployed).toBeNull();
    expect(startDateOfEmployment).toBeNull();
    expect(endDateOfEmployment).toBeNull();

  });

  it('should successfully patch a job application (started job)', async () => {

    const response = await request(app)
      .patch(entrypoints.startJob(1))
      .set('access_token', employer_access_token);
    expect(response.statusCode).toBe(200);

    const fetchResponse = await request(app)
      .get(entrypoints.myJobApplications)
      .set('access_token', applicant_access_token);
    expect(fetchResponse.statusCode).toBe(200);
    const jobApplications = fetchResponse.body;
    const { 
      id, jobPosting, applicationStatus, isEmployed, startDateOfEmployment, endDateOfEmployment
    } = jobApplications[2];
    const today = new Date();
    const compareDate = new Date(startDateOfEmployment);
    expect(id).toBe(1);
    expect(jobPosting.id).toBe(1);
    expect(applicationStatus).toBe("Accepted");
    expect(isEmployed).toBe(true);
    expect(compareDate.getDate()).toBe(today.getDate());
    expect(compareDate.getMonth()).toBe(today.getMonth());
    expect(compareDate.getYear()).toBe(today.getYear());
    expect(endDateOfEmployment).toBeNull();

  });

  it('should successfully patch a job application (finished job)', async () => {

    const response = await request(app)
      .patch(entrypoints.terminateJob(1))
      .set('access_token', employer_access_token);
    expect(response.statusCode).toBe(200);

    const fetchResponse = await request(app)
      .get(entrypoints.myJobApplications)
      .set('access_token', applicant_access_token);
    expect(fetchResponse.statusCode).toBe(200);
    const jobApplications = fetchResponse.body;
    const { 
      id, jobPosting, applicationStatus, isEmployed, startDateOfEmployment, endDateOfEmployment 
    } = jobApplications[2];
    const today = new Date();
    const compareDate = new Date(endDateOfEmployment);
    expect(id).toBe(1);
    expect(jobPosting.id).toBe(1);
    expect(applicationStatus).toBe("Accepted");
    expect(isEmployed).toBe(false);
    expect(startDateOfEmployment).not.toBeNull();
    expect(compareDate.getDate()).toBe(today.getDate());
    expect(compareDate.getMonth()).toBe(today.getMonth());
    expect(compareDate.getYear()).toBe(today.getYear());

  });

  it('should fail to patch a non-existent job application', async () => {
    const response = await request(app)
      .patch(entrypoints.acceptJobApplication(200))
      .set('access_token', employer_access_token);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to patch a job application with an invalid id', async () => {
    const response = await request(app)
      .patch(entrypoints.acceptJobApplication("abcd"))
      .set('access_token', employer_access_token);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to patch a job application with no authentication', async () => {
    const response = await request(app)
      .patch(entrypoints.acceptJobApplication(3));
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeDefined();
  });

  it('should forbid to patch a job application if the user is not the author of the job posting', async () => {
    const response = await request(app)
      .patch(entrypoints.acceptJobApplication(3))
      .set('access_token', applicant_access_token);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to patch a job application if the application status is an invalid string', async () => {
    const response = await request(app)
      .patch(entrypoints.acceptJobApplication(3))
      .set('access_token', employer_access_token)
      .send({
        applicationStatus: 'gibberish'
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();
  });

});