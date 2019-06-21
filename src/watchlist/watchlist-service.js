const xss = require('xss');

const watchListService = {
  serializeShow(show) {
    return {
      user_id: show.user_id,
      title: xss(show.title),
      image_url: xss(show.image_url)
    };
  },
  insertShow(db, newEntry) {
    return db('anime_watchlists')
      .insert(newEntry)
      .returning('*')
      .then(([show]) => show);
  },
  deleteShow(db, id) {
    return db('anime_watchlists')
      .where({ id })
      .delete();
  },
  getWatchList(db, user_id) {
    return db('anime_watchlists AS show')
      .select('*')
      .where({ user_id });
  }
};

module.exports = watchListService;
