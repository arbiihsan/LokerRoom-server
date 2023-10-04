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
  { name: 'Labour', createdAt: dummyDate, updatedAt: dummyDate },
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
    telephone: "081113334453",
    address: "Jakarta",
    imgUrl: null,
    EducationId: 3,
    gender: "Male",
    dateOfBirth: new Date("2005-04-02T00:00:00"),
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
    CategoryId: 2,
    minSalary: 100_000,
    maxSalary: 300_000,
    AuthorId: 1,
    requiredGender: 'Male',
    maxAge: 30,
    RequiredEducation: null,
    status: 'Filled',
    isUrgent: false,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    title: "Janitor",
    description: "Job Posting 2",
    address: "Jakarta",
    CategoryId: 1,
    minSalary: 100_000,
    maxSalary: 300_000,
    AuthorId: 1,
    requiredGender: 'Male',
    maxAge: null,
    RequiredEducation: null,
    status: 'Filled',
    isUrgent: false,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    title: "Accountant",
    description: "Job Posting 3",
    address: "Jakarta",
    CategoryId: 2,
    minSalary: 100_000,
    maxSalary: 300_000,
    AuthorId: 1,
    requiredGender: null,
    maxAge: null,
    RequiredEducation: null,
    status: 'Active',
    isUrgent: false,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    title: "Gamer",
    description: "Job Posting 4",
    address: "Jakarta",
    CategoryId: 2,
    minSalary: 100_000,
    maxSalary: 300_000,
    AuthorId: 1,
    requiredGender: null,
    maxAge: null,
    RequiredEducation: null,
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
    applicationStatus: "Accepted",
    isEmployed: false,
    startDateOfEmployment: new Date("2010-01-01T00:00:00"),
    endDateOfEmployment: new Date("2010-05-01T00:00:00"),
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    UserId: 2,
    JobPostingId: 2,
    applicationStatus: "Accepted",
    isEmployed: true,
    startDateOfEmployment: new Date("2010-05-01T00:00:00"),
    endDateOfEmployment: null,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    UserId: 2,
    JobPostingId: 3,
    applicationStatus: "Processing",
    isEmployed: null,
    startDateOfEmployment: null,
    endDateOfEmployment: null,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    UserId: 2,
    JobPostingId: 4,
    applicationStatus: "Rejected",
    isEmployed: null,
    startDateOfEmployment: null,
    endDateOfEmployment: null,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    UserId: 3,
    JobPostingId: 1,
    applicationStatus: "Rejected",
    isEmployed: null,
    startDateOfEmployment: null,
    endDateOfEmployment: null,
    createdAt: dummyDate,
    updatedAt: dummyDate
  }
];
const reviews = [
  {
    EmployerId: 1,
    UserId: 2,
    JobPostingId: 1,
    content: "Etika kerja yang jelek",
    rating: 2,
    createdAt: dummyDate,
    updatedAt: dummyDate
  },
  {
    EmployerId: 1,
    UserId: 2,
    JobPostingId: 2,
    content: "Perlu bekerja lebih keras",
    rating: 3,
    createdAt: dummyDate,
    updatedAt: dummyDate
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
  await sequelize.queryInterface.bulkInsert('Reviews', reviews);
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

describe('GET User without authentication', () => {

  it('should successfully fetch multiple users', async () => {
    const response = await request(app)
      .get(entrypoints.users())
    expect(response.statusCode).toBe(200);

    const { numPages, data: fetchedUsers } = response.body;
    expect(numPages).toBe(1);
    expect(fetchedUsers.length).toBe(3);
    const { 
      name, telephone, email, address, imgUrl, 
      educationLevel, gender, dateOfBirth, profileDescription, 
      receivedReviews, password, appliedJobs, postedJobs
    } = fetchedUsers[0];
    expect(name).toBeDefined();
    expect(telephone).toBeDefined();
    expect(email).toBeDefined();
    expect(address).toBeDefined();
    expect(imgUrl).toBeDefined();
    expect(educationLevel).toBeDefined();
    expect(gender).toBeDefined();
    expect(dateOfBirth).toBeDefined();
    expect(profileDescription).toBeDefined();
    expect(receivedReviews).toBeDefined();
    // Limit 3 reviews per user when fetching multiple users
    expect(receivedReviews.length).toBeLessThanOrEqual(3);

    expect(password).toBeUndefined();
    expect(appliedJobs).toBeUndefined();
    expect(postedJobs).toBeUndefined();

  });

  it('should successfully fetch Donal Bebek\'s profile', async () => {
    const response = await request(app)
      .get(entrypoints.user(2))
    expect(response.statusCode).toBe(200);
    
    const fetchedUser = response.body;
    const { 
      name, email, telephone, address, imgUrl, 
      educationLevel, gender, dateOfBirth, 
      profileDescription, receivedReviews,
      password, appliedJobs, postedJobs
    } = fetchedUser;
    expect(name).toBeDefined();
    expect(telephone).toBeDefined();
    expect(email).toBeDefined();
    expect(address).toBeDefined();
    expect(imgUrl).toBeDefined();
    expect(educationLevel).toBeDefined();
    expect(gender).toBeDefined();
    expect(dateOfBirth).toBeDefined();
    expect(profileDescription).toBeDefined();
    expect(receivedReviews).toBeDefined();
    expect(receivedReviews.length).toBe(2);

    expect(password).toBeUndefined();
    expect(appliedJobs).toBeUndefined();
    expect(postedJobs).toBeUndefined();

  });

  it('should fail to fetch non-existent user profile', async () => {
    const response = await request(app)
      .get(entrypoints.user(200))
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to fetch invalid user profile', async () => {
    const response = await request(app)
      .get(entrypoints.user('abcd'))
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBeDefined();
  });

})

describe('GET my details with authentication', () => {

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

  it('should get user details for Donal Bebek', async () => {

    const response = await request(app)
      .get(entrypoints.me)
      .set('access_token', applicant_access_token);

    expect(response.statusCode).toBe(200);

    const { 
      id, name, email, telephone, password, address, imgUrl, educationLevel, 
      gender, dateOfBirth, profileDescription
    } = response.body;
    expect(id).toBe(2);
    expect(name).toBe(users[1].name);
    expect(telephone).toBe(users[1].telephone);
    expect(email).toBe(users[1].email);
    expect(password).toBeUndefined();
    expect(address).toBe(users[1].address);
    expect(imgUrl).toBe(users[1].imgUrl);
    expect(educationLevel.id).toBe(users[1].EducationId);
    expect(educationLevel.education).toBe(educationLevels[users[1].EducationId - 1].education);
    expect(gender).toBe(users[1].gender);
    const receivedDate = new Date(dateOfBirth);
    const compareDate = new Date(users[1].dateOfBirth);
    expect(receivedDate.getFullYear()).toBe(compareDate.getFullYear());
    expect(receivedDate.getMonth()).toBe(compareDate.getMonth());
    expect(receivedDate.getDate()).toBe(compareDate.getDate());
    expect(profileDescription).toBe('');
    
  });

  it('should get jobs that Donal Bebek has applied to', async () => {

    const response = await request(app)
      .get(entrypoints.myJobApplications)
      .set('access_token', applicant_access_token);

    expect(response.statusCode).toBe(200);

    const appliedJobs = response.body;
    expect(appliedJobs.length).toBe(4);
    expect(appliedJobs[0].jobPosting).toBeDefined();
    expect(appliedJobs[0].applicationStatus).toBeDefined();
    expect(appliedJobs[0].isEmployed).toBeDefined();
    expect(appliedJobs[0].startDateOfEmployment).toBeDefined();
    expect(appliedJobs[0].endDateOfEmployment).toBeDefined();
    
  });

  it('should get reviews that Donal Bebek has received', async () => {

    const response = await request(app)
      .get(entrypoints.myReviews)
      .set('access_token', applicant_access_token);

    expect(response.statusCode).toBe(200);

    const receivedReviews = response.body;
    expect(receivedReviews.length).toBe(2);
    expect(receivedReviews[0].employer).toBeDefined();
    // expect(receivedReviews[0].user).toBeDefined();
    expect(receivedReviews[0].jobPosting).toBeDefined();
    expect(receivedReviews[0].content).toBeDefined();
    expect(receivedReviews[0].rating).toBeDefined();
    
  });

  it('should get jobs that Gober Bebek has posted', async () => {

    const response = await request(app)
      .get(entrypoints.myJobPostings)
      .set('access_token', employer_access_token);

    expect(response.statusCode).toBe(200);

    const postedJobs = response.body;
    expect(postedJobs.length).toBe(4);
    expect(postedJobs[0].title).toBeDefined();
    expect(postedJobs[0].description).toBeDefined();
    expect(postedJobs[0].address).toBeDefined();
    expect(postedJobs[0].category).toBeDefined();
    expect(postedJobs[0].minSalary).toBeDefined();
    expect(postedJobs[0].maxSalary).toBeDefined();
    expect(postedJobs[0].author).toBeDefined();
    expect(postedJobs[0].requiredGender).toBeDefined();
    expect(postedJobs[0].maxAge).toBeDefined();
    expect(postedJobs[0].requiredEducation).toBeDefined();
    expect(postedJobs[0].status).toBeDefined();
    expect(postedJobs[0].isUrgent).toBeDefined();
    
  });

  it('should get applicants for jobs that Gober Bebek has posted', async () => {

    const response = await request(app)
      .get(entrypoints.myJobApplicants(1))
      .set('access_token', employer_access_token);

    expect(response.statusCode).toBe(200);

    const jobApplications = response.body;
    expect(jobApplications.length).toBe(2);
    const { applicationStatus, isEmployed, startDateOfEmployment, endDateOfEmployment, applicant } = jobApplications[0];
    const { name, telephone, email, address, imgUrl, gender, dateOfBirth, profileDescription, educationLevel } = applicant || {};
    expect(applicationStatus).toBeDefined();
    expect(isEmployed).toBeDefined();
    expect(startDateOfEmployment).toBeDefined();
    expect(endDateOfEmployment).toBeDefined();
    expect(applicant).toBeDefined();
    expect(name).toBeDefined();
    expect(telephone).toBeDefined();
    expect(email).toBeDefined();
    expect(address).toBeDefined();
    expect(imgUrl).toBeDefined();
    expect(gender).toBeDefined();
    expect(dateOfBirth).toBeDefined();
    expect(profileDescription).toBeDefined();
    expect(educationLevel).toBeDefined();
    
  });

  it('should fail to get user details without authentication', async () => {
    const response = await request(app)
      .get(entrypoints.me);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to get user\'s posted jobs without authentication', async () => {
    const response = await request(app)
      .get(entrypoints.myJobPostings);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to get user\'s applied jobs without authentication', async () => {
    const response = await request(app)
      .get(entrypoints.myJobApplications);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to get user details with invalid token', async () => {
    const response = await request(app)
      .get(entrypoints.me)
      .set('access_token', 'asal');
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to get user\'s posted jobs with invalid token', async () => {
    const response = await request(app)
      .get(entrypoints.myJobPostings)
      .set('access_token', 'asal');
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeDefined();
  });

  it('should fail to get user\'s applied jobs with invalid token', async () => {
    const response = await request(app)
      .get(entrypoints.myJobApplications)
      .set('access_token', 'asal');
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeDefined();
  });

})