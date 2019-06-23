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
  deleteShow(db, data) {
    return db('anime_watchlists')
      .where('user_id', data.user_id)
      .where('title', data.title)
      .delete();
  },
  getWatchList(db, user_id) {
    return db('anime_watchlists')
      .select('*')
      .where({ user_id });
  },
  insertEpisodeNumber(db, data) {
    return db('anime_watchlists')
      .where('title', data.title)
      .where('user_id', data.user_id)
      .update('episode_number', data.episode_number);
  }
};

module.exports = watchListService;
