const xss = require('xss');

const watchListService = {
  insertShow(db, newEntry) {
    return db('anime_watchlists')
      .insert(newEntry)
      .returning('*')
      .then(([show]) => show);
  },
  serializeShow(show) {
    return {
      user_id: show.user_id,
      title: xss(show.title),
      image_url: xss(show.image_url)
    };
  }
};

module.exports = watchListService;
