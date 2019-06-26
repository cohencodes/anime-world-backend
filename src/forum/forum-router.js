const express = require('express');
const ForumService = require('./forum-service');
const requireAuth = require('../middleware/jwt-auth');

const forumRouter = express.Router();
const jsonBodyParser = express.json();

forumRouter
  .all(requireAuth)
  .route('/')
  .post(jsonBodyParser, (req, res, next) => {
    console.log('req.body: ', req.body);
    const { user_name, user_id, comment, title } = req.body;

    const newComment = {
      user_name,
      user_id,
      comment,
      title
    };

    for (const [key, value] of Object.entries(newComment)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing ${key} in request body`
        });
      }
    }

    ForumService.insertComment(req.app.get('db'), newComment)
      .then(comment => {
        return res.status(204).json(comment);
      })
      .catch(next);
  });

forumRouter
  .all(requireAuth)
  .route('/:user_id/:comment_id')
  .delete(jsonBodyParser, (req, res, next) => {
    const { comment_id } = req.body;

    ForumService.deleteComment(req.app.get('db'), comment_id)
      .then(comment => {
        return res.status(202).json(comment);
      })
      .catch(next);
  });

forumRouter
  .all(requireAuth)
  .route('/:title')
  .get((req, res, next) => {
    const { title } = req.params;
    ForumService.getComments(req.app.get('db'), title)
      .then(comments => {
        res.status(200).json(comments);
      })
      .catch(next);
  });

module.exports = forumRouter;
