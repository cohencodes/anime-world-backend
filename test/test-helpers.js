const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 2,
      user_name: 'test-user-2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 3,
      user_name: 'test-user-3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 4,
      user_name: 'test-user-4',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    }
  ];
}

function makeWatchListArray(users) {
  return [
    {
      id: 1,
      title: 'First test post!',
      image_url: 'https://testimage.test/74432',
      user_id: users[0].id,
      episode_number: '',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 2,
      title: 'Second test post!',
      image_url: 'https://testimage.test/74432',
      user_id: users[1].id,
      episode_number: null,
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 3,
      title: 'Third test post!',
      image_url: 'https://testimage.test/74432',
      user_id: users[2].id,
      episode_number: null,
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 4,
      title: 'Fourth test post!',
      image_url: 'https://testimage.test/74432',
      user_id: users[3].id,
      episode_number: null,
      date_created: new Date('2029-01-22T16:28:32.615Z')
    }
  ];
}

function makeCommentsArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      user_name: 'test-user-1',
      title: 'Naruto',
      comment: 'First test comment!',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 2,
      user_id: users[1].id,
      user_name: 'test-user-2',
      title: 'Dragon Ball Z',
      comment: 'First test comment!',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 3,
      user_id: users[2].id,
      user_name: 'test-user-3',
      title: 'Full Metal Alchemist',
      comment: 'First test comment!',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    },
    {
      id: 4,
      user_id: users[3].id,
      user_name: 'test-user-4',
      title: 'Akame Ga Kill',
      comment: 'First test comment!',
      date_created: new Date('2029-01-22T16:28:32.615Z')
    }
  ];
}

function makeFixtures() {
  const testUsers = makeUsersArray();
  const testWatchLists = makeWatchListArray(testUsers);
  const testComments = makeCommentsArray(testUsers, testWatchLists);
  return { testUsers, testWatchLists, testComments };
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into('anime_users')
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('anime_users_id_seq', ?)`, [
        users[users.length - 1].id
      ])
    );
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx
      .raw(
        `TRUNCATE
        anime_watchlists,
        anime_users,
        anime_forum
      `
      )
      .then(() =>
        Promise.all([
          trx.raw(
            `ALTER SEQUENCE anime_watchlists_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`ALTER SEQUENCE anime_users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE anime_forum_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('anime_watchlists_id_seq', 0)`),
          trx.raw(`SELECT setval('anime_users_id_seq', 0)`),
          trx.raw(`SELECT setval('anime_forum_id_seq', 0)`)
        ])
      )
  );
}

function seedWatchListsTables(db, users, watchlists, comments = []) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into('anime_watchlists').insert(watchlists);
    // update the auto sequence to match the forced id values
    await trx.raw(`SELECT setval('anime_watchlists_id_seq', ?)`, [
      watchlists[watchlists.length - 1].id
    ]);
    // only insert comments if there are some, also update the sequence counter
    if (comments.length) {
      await trx.into('anime_forum').insert(comments);
      await trx.raw(`SELECT setval('anime_forum_id_seq', ?)`, [
        comments[comments.length - 1].id
      ]);
    }
  });
}

module.exports = {
  makeUsersArray,
  makeWatchListArray,
  makeCommentsArray,
  makeFixtures,
  seedUsers,
  cleanTables,
  seedWatchListsTables
};
