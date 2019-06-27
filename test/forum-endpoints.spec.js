const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Forum Endpoints', function() {
  let db;

  const { testUsers, testWatchLists, testComments } = helpers.makeFixtures();
  const testUser = testUsers[0];
  const testWatchList = testWatchLists[0];
  const testComment = testComments[0];

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

  describe(`POST /api/forum`, () => {
    beforeEach('insert watchlists', () =>
      helpers.seedWatchListsTables(db, testUsers, testWatchLists)
    );

    const requiredFields = ['user_name', 'user_id', 'comment', 'title'];

    requiredFields.forEach(field => {
      const attemptEntry = {
        user_name: testUser.user_name,
        user_id: testUser.id,
        comment: testComment.comment,
        title: testComment.title
      };
      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete attemptEntry[field];

        return supertest(app)
          .post('/api/forum')
          .send(attemptEntry)
          .expect(400, {
            error: `Missing ${field} in request body`
          });
      });
    });

    it(`inserts new comment when sufficient data and credentials are provided`, () => {
      const newComment = {
        user_name: testUser.user_name,
        user_id: testUser.id,
        comment: testComment.comment,
        title: testComment.title
      };

      return supertest(app)
        .post('/api/forum')
        .send(newComment)
        .expect(204);
    });
  });

  describe(`DELETE /api/forum/:comment_id`, () => {
    beforeEach('insert watchlists and comments', () =>
      helpers.seedWatchListsTables(db, testUsers, testWatchLists, testComments)
    );

    const sendData = {
      comment_id: testComment.id
    };

    it(`responds 202 status when deleting comment`, () => {
      return supertest(app)
        .delete(`/api/forum/${testUser.id}/${testComment.id}`)
        .send(sendData)
        .expect(202);
    });
  });

  describe(`Get /api/forum/:title`, () => {
    beforeEach('insert watchlists and comments', () =>
      helpers.seedWatchListsTables(db, testUsers, testWatchLists, testComments)
    );

    it(`gets comments for show title on request`, () => {
      console.log('testComment', testComment.title);
      const sendData = {
        title: testComment.title
      };

      return supertest(app)
        .get(`/api/forum/${testComment.title}`)
        .send(sendData)
        .expect(200, [{ ...testComment }]);
    });
  });
});
