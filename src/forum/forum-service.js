const xss = require('xss');

const ForumService = {
  serializeComment(comment) {
    return {
      user_id: comment.user_id,
      title: xss(comment.title),
      comment: xss(comment.comment),
      user_name: xss(comment.user_name)
    };
  },
  insertComment(db, newComment) {
    return db('anime_forum')
      .insert(newComment)
      .returning('*')
      .then(([comment]) => comment);
  },
  deleteShow(db, data) {
    return db('anime_watchlists')
      .where('user_id', data.user_id)
      .where('title', data.title)
      .delete();
  },
  getComments(db, title) {
    return db('anime_forum')
      .select('*')
      .where({ title });
  },
  insertEpisodeNumber(db, data) {
    return db('anime_watchlists')
      .where('title', data.title)
      .where('user_id', data.user_id)
      .update('episode_number', data.episode_number);
  }
};

module.exports = ForumService;
