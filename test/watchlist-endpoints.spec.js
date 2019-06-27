const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('WatchLists Endpoints', function() {
  let db;

  const { testUsers, testWatchLists } = helpers.makeFixtures();
  const testUser = testUsers[0];
  const testWatchList = testWatchLists[0];

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

  describe(`POST /api/watchlist`, () => {
    beforeEach('insert watchlists', () =>
      helpers.seedWatchListsTables(db, testUsers, testWatchLists)
    );

    const requiredFields = ['user_id', 'title', 'image_url'];

    requiredFields.forEach(field => {
      const attemptEntry = {
        user_id: testUser.id,
        title: testWatchList.title,
        image_url: testWatchList.image_url
      };
      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete attemptEntry[field];

        return supertest(app)
          .post('/api/watchlist')
          .send(attemptEntry)
          .expect(400, {
            error: `Missing ${field} in request body`
          });
      });
    });

    it(`responds with 400 'this is already in your watchlist! when entry is already there`, () => {
      const attemptEntry = {
        user_id: 1,
        title: 'First test post!',
        image_url: 'https://testimage.test/74432'
      };

      return supertest(app)
        .post('/api/watchlist')
        .send(attemptEntry)
        .expect(400, {
          error: `This is already in your watchlist!`
        });
    });

    it(`inserts new watchlist entry when sufficient data and credentials are provided`, () => {
      const newEntry = {
        user_id: 1,
        title: 'my new favorite anime show',
        image_url: 'https://testimage.test/74432'
      };

      return supertest(app)
        .post('/api/watchlist')
        .send(newEntry)
        .expect(201, newEntry);
    });
  });

  describe(`GET /api/watchlist/:user_id`, () => {
    beforeEach('insert watchlists', () =>
      helpers.seedWatchListsTables(db, testUsers, testWatchLists)
    );

    it(`responds with the correct watchlist on request`, () => {
      return supertest(app)
        .get(`/api/watchlist/${testUser.id}`)
        .expect([testWatchList]);
    });
  });

  describe(`PUT /api/watchlist/:user_id/change`, () => {
    beforeEach('insert watchlists', () =>
      helpers.seedWatchListsTables(db, testUsers, testWatchLists)
    );

    it(`changes episode_number on request`, () => {
      const sendData = {
        user_id: testUser.id,
        episode_number: 3,
        title: testWatchList.title
      };

      return supertest(app)
        .put(`/api/watchlist/${testUser.id}/change`)
        .send(sendData)
        .expect(204);
    });
  });

  describe(`DELETE /api/watchlist/:user_id/delete`, () => {
    beforeEach('insert watchlists', () =>
      helpers.seedWatchListsTables(db, testUsers, testWatchLists)
    );

    it(`deletes watchlist entry on request`, () => {
      const sendData = {
        user_id: testUser.id,
        title: testWatchList.title
      };

      return supertest(app)
        .delete(`/api/watchlist/${testUser.id}/delete`)
        .send(sendData)
        .expect(200);
    });
  });
});
