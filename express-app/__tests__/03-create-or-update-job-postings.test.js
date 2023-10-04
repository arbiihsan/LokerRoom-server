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
/* 
 * END SEED DATA
 */

beforeAll(async () => {
  await sequelize.queryInterface.bulkInsert('EducationLevels', educationLevels);
  await sequelize.queryInterface.bulkInsert('Categories', categories);
  await sequelize.queryInterface.bulkInsert('Users', users.map(el => {
    return {...el, password: encrypt(el.password)}
  }));
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

describe('POST Job Posting', () => {  

  let access_token;
  beforeAll(async () => {
    const response = await request(app)
      .post(entrypoints.login)
      .send({
        telephone: users[0].telephone,
        password: users[0].password
      });
    access_token = response.body.access_token;
  });

  it('should successfully add a job posting', async () => {

    const testData = {
      title: "URGENT!!!!",
      description: "Butuh orang cepat",
      address: "Jakarta",
      long: 1009.3,
      lat: 67.2,
      categoryId: 1,
      minSalary: 300_000,
      maxSalary: 800_000,
      requiredGender: "Male",
      maxAge: 30,
      requiredEducation: 1,
      isUrgent: true
    };

    const response = await request(app)
      .post(entrypoints.addJobPosting)
      .set('access_token', access_token)
      .send(testData);
    expect(response.statusCode).toBe(201);

    const fetchResponse = await request(app)
      .get(entrypoints.jobPosting(1));
    expect(fetchResponse.statusCode).toBe(200);
    const { 
      title, description, address, long, lat, category,
      minSalary, maxSalary, author, requiredGender, 
      maxAge, requiredEducation, isUrgent
    } = fetchResponse.body;
    expect(title).toBe(testData.title);
    expect(description).toBe(testData.description); 
    expect(address).toBe(testData.address);
    expect(long).toBe(testData.long);
    expect(lat).toBe(testData.lat);
    expect(category.id).toBe(testData.categoryId);
    expect(minSalary).toBe(testData.minSalary);
    expect(maxSalary).toBe(testData.maxSalary);
    expect(author.id).toBe(1);
    expect(requiredGender).toBe(testData.requiredGender);
    expect(maxAge).toBe(testData.maxAge);
    expect(requiredEducation.id).toBe(testData.requiredEducation);
    expect(isUrgent).toBe(testData.isUrgent);

  });

  it('should successfully add a job posting', async () => {

    const testData = {
      title: "URGENT!!!!",
      description: "Butuh orang cepat",
      address: "Jakarta",
      categoryId: 1,
    };

    const response = await request(app)
      .post(entrypoints.addJobPosting)
      .set('access_token', access_token)
      .send(testData);
    expect(response.statusCode).toBe(201);

    const fetchResponse = await request(app)
      .get(entrypoints.jobPosting(2));
    expect(fetchResponse.statusCode).toBe(200);
    const { 
      title, description, address, long, lat, category, 
      minSalary, maxSalary, author, requiredGender, 
      maxAge, requiredEducation, isUrgent
    } = fetchResponse.body;
    expect(title).toBe(testData.title);
    expect(description).toBe(testData.description); 
    expect(address).toBe(testData.address);
    expect(long).toBeNull();
    expect(lat).toBeNull();
    expect(category.id).toBe(testData.categoryId);
    expect(minSalary).toBeNull();
    expect(maxSalary).toBeNull();
    expect(author.id).toBe(1);
    expect(requiredGender).toBeNull();
    expect(maxAge).toBeNull();
    expect(requiredEducation).toBeNull();
    expect(isUrgent).toBe(false);

  });

  it('should fail to add a job posting without authentication', async () => {

    const testData = {
      title: "URGENT!!!!",
      description: "Butuh orang cepat",
      address: "Jakarta",
      long: 107.2,
      lat: 3.2,
      categoryId: 1,
      minSalary: 300_000,
      maxSalary: 800_000,
      requiredGender: "Male",
      maxAge: 30,
      requiredEducation: 1,
      isUrgent: true
    };

    const response = await request(app)
      .post(entrypoints.addJobPosting)
      .send(testData);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeDefined();

  });

  it('should fail to add a job posting without title', async () => {

    const testData = {
      title: "",
      description: "Butuh orang cepat",
      address: "Jakarta",
      categoryId: 1,
    };

    const response = await request(app)
      .post(entrypoints.addJobPosting)
      .set('access_token', access_token)
      .send(testData);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();

  });

  it('should fail to add a job posting without description', async () => {

    const testData = {
      title: "URGENT!!!!",
      description: "",
      address: "Jakarta",
      categoryId: 1,
    };

    const response = await request(app)
      .post(entrypoints.addJobPosting)
      .set('access_token', access_token)
      .send(testData);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();

  });

  it('should fail to add a job posting without location', async () => {

    const testData = {
      title: "URGENT!!!!",
      description: "Butuh orang cepat",
      address: "",
      categoryId: 1,
    };

    const response = await request(app)
      .post(entrypoints.addJobPosting)
      .set('access_token', access_token)
      .send(testData);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();

  });

  it('should successfully add a job posting without category', async () => {

    const testData = {
      title: "URGENT!!!!",
      description: "Butuh orang cepat",
      address: "Depok",
      categoryId: "",
    };

    const response = await request(app)
      .post(entrypoints.addJobPosting)
      .set('access_token', access_token)
      .send(testData);
    expect(response.statusCode).toBe(201);

  });

});

describe('PUT Job Posting', () => {  

  let access_token;
  beforeAll(async () => {
    const response = await request(app)
      .post(entrypoints.login)
      .send({
        telephone: users[0].telephone,
        password: users[0].password
      });
    access_token = response.body.access_token;
  });

  it('should successfully update a job posting', async () => {

    const testData = {
      title: "Kera kode",
      description: "Butuh kera kode yang bekerja pagi siang malam",
      address: "Jakarta",
      long: 76.1,
      lat: 90.1,
      categoryId: 1,
      minSalary: 1000_000,
      maxSalary: 1800_000,
      requiredGender: null,
      maxAge: null,
      requiredEducation: null,
      isUrgent: true
    };

    const response = await request(app)
      .put(entrypoints.editJobPosting(1))
      .set('access_token', access_token)
      .send(testData);
    expect(response.statusCode).toBe(200);

    const fetchResponse = await request(app)
      .get(entrypoints.jobPosting(1));
    expect(fetchResponse.statusCode).toBe(200);
    const { 
      title, description, address, long, lat, category,
      minSalary, maxSalary, author, requiredGender, 
      maxAge, requiredEducation, isUrgent
    } = fetchResponse.body;
    expect(title).toBe(testData.title);
    expect(description).toBe(testData.description); 
    expect(address).toBe(testData.address);
    expect(long).toBe(testData.long);
    expect(lat).toBe(testData.lat);
    expect(category.id).toBe(testData.categoryId);
    expect(minSalary).toBe(testData.minSalary);
    expect(maxSalary).toBe(testData.maxSalary);
    expect(author.id).toBe(1);
    expect(requiredGender).toBe(testData.requiredGender);
    expect(maxAge).toBe(testData.maxAge);
    expect(requiredEducation).toBeNull();
    expect(isUrgent).toBe(testData.isUrgent);

  });

  it('should fail to update a job posting without authentication', async () => {

    const testData = {
      title: "Kera kode",
      description: "Butuh kera kode yang bekerja pagi siang malam",
      address: "Jakarta",
      long: 76.1,
      lat: 90.1,
      categoryId: 1,
      minSalary: 1000_000,
      maxSalary: 1800_000,
      requiredGender: null,
      maxAge: null,
      requiredEducation: null,
      isUrgent: true
    };

    const response = await request(app)
      .put(entrypoints.editJobPosting(1))
      .send(testData);
    expect(response.statusCode).toBe(401);

  });

  it('should forbid to update a job posting without correct authentication', async () => {

    const loginResponse = await request(app)
      .post(entrypoints.login)
      .send({
        telephone: users[1].telephone,
        password: users[1].password
      });
    access_token = loginResponse.body.access_token;

    const testData = {
      title: "Kera kode",
      description: "Butuh kera kode yang bekerja pagi siang malam",
      address: "Jakarta",
      long: 76.1,
      lat: 90.1,
      categoryId: 1,
      minSalary: 1000_000,
      maxSalary: 1800_000,
      requiredGender: null,
      maxAge: null,
      requiredEducation: null,
      isUrgent: true
    };

    const response = await request(app)
      .put(entrypoints.editJobPosting(1))
      .set('access_token', access_token)
      .send(testData);
    expect(response.statusCode).toBe(403);

  });

});

describe('PATCH Job Posting', () => {  

  let access_token;
  beforeAll(async () => {
    const response = await request(app)
      .post(entrypoints.login)
      .send({
        telephone: users[0].telephone,
        password: users[0].password
      });
    access_token = response.body.access_token;
  });

  it('should successfully update a job posting\'s status', async () => {

    const response = await request(app)
      .patch(entrypoints.editJobPosting(1))
      .set('access_token', access_token)
      .send({
        status: 'Filled'
      });
    expect(response.statusCode).toBe(200);

    const fetchResponse = await request(app)
      .get(entrypoints.jobPosting(1));
    expect(fetchResponse.statusCode).toBe(200);
    const { status } = fetchResponse.body;
    expect(status).toBe('Filled');

  });

  it('should fail to update a job posting without authentication', async () => {
    const response = await request(app)
      .patch(entrypoints.editJobPosting(1))
      .send({
        status: 'Filled'
      });
    expect(response.statusCode).toBe(401);
  });

  it('should forbid to update a job posting without correct authentication', async () => {

    const loginResponse = await request(app)
      .post(entrypoints.login)
      .send({
        telephone: users[1].telephone,
        password: users[1].password
      });
    access_token = loginResponse.body.access_token;

    const response = await request(app)
      .put(entrypoints.editJobPosting(1))
      .set('access_token', access_token)
      .send({
        status: 'Filled'
      });
    expect(response.statusCode).toBe(403);

  });

});