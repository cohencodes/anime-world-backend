const xss = require('xss');

const watchListService = {
  insertShow(title, image) {
    return db('anime_watchlist')
      .insert({ title, image })
      .where(user_id);
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
