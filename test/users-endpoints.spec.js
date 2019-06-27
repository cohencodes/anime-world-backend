const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', function() {
  let db;

  const { testUsers } = helpers.makeFixtures();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe(`POST /api/users`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    const requiredFields = ['user_name', 'password'];

    requiredFields.forEach(field => {
      const attemptSignUpBody = {
        user_name: 'cohencodes',
        password: 'test-password'
      };
      it(`responds with 400 required error when ${field} is missing`, () => {
        delete attemptSignUpBody[field];

        return supertest(app)
          .post('/api/users')
          .send(attemptSignUpBody)
          .expect(400, {
            error: `Missing ${field} in request body`
          });
      });
    });

    it(`responds 400 'Password must be longer than 8 characters' when empty password`, () => {
      const userShortPassword = {
        user_name: 'test user_name',
        password: '1234567',
        full_name: 'test full_name'
      };
      return supertest(app)
        .post('/api/users')
        .send(userShortPassword)
        .expect(400, { error: `Password must be longer than 8 characters` });
    });

    it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
      const userLongPassword = {
        user_name: 'test user_name',
        password: '*'.repeat(73),
        full_name: 'test full_name'
      };
      return supertest(app)
        .post('/api/users')
        .send(userLongPassword)
        .expect(400, { error: `Password must be less than 72 characters` });
    });

    it(`responds 400 error when password starts with spaces`, () => {
      const userPasswordStartsSpaces = {
        user_name: 'test user_name',
        password: ' 1Aa!2Bb@',
        full_name: 'test full_name'
      };
      return supertest(app)
        .post('/api/users')
        .send(userPasswordStartsSpaces)
        .expect(400, {
          error: `Password must not start or end with empty spaces`
        });
    });

    it(`responds 400 error when password ends with spaces`, () => {
      const userPasswordEndsSpaces = {
        user_name: 'test user_name',
        password: '1Aa!2Bb@ ',
        full_name: 'test full_name'
      };
      return supertest(app)
        .post('/api/users')
        .send(userPasswordEndsSpaces)
        .expect(400, {
          error: `Password must not start or end with empty spaces`
        });
    });

    it(`responds 400 error when password isn't complex enough`, () => {
      const userPasswordNotComplex = {
        user_name: 'test user_name',
        password: '11AAaabb',
        full_name: 'test full_name'
      };
      return supertest(app)
        .post('/api/users')
        .send(userPasswordNotComplex)
        .expect(400, {
          error: `Password must contain one upper case letter, one number and one special character`
        });
    });

    it(`responds 400 'Username already taken' when user_name isn't unique`, () => {
      const duplicateUser = {
        user_name: testUser.user_name,
        password: '11AAaa!!',
        full_name: 'test full_name'
      };
      return supertest(app)
        .post('/api/users')
        .send(duplicateUser)
        .expect(400, { error: `Username already taken` });
    });
  });
});
