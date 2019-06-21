const express = require('express');
const WatchListService = require('./watchlist-service');
const requireAuth = require('../middleware/jwt-auth');

const watchListRouter = express.Router();
const jsonBodyParser = express.json();

watchListRouter
  .all(requireAuth)
  .route('/')
  .post(jsonBodyParser, (req, res, next) => {
    const { title, image_url, user_id } = req.body;

    const newEntry = {
      user_id,
      title,
      image_url
    };

    WatchListService.insertShow(req.app.get('db'), newEntry)
      .then(show => {
        console.log('show response', show);
        return res.status(201).json(WatchListService.serializeShow(show));
      })
      .catch(next);
  });

watchListRouter
  .all(requireAuth)
  .route('/:user_id')
  .get((req, res, next) => {
    console.log('req: ', req.params);
    const { user_id } = req.params;
    WatchListService.getWatchList(req.app.get('db'), user_id).then(
      watchList => {
        return res.status(200).json(watchList);
      }
    );
  });

module.exports = watchListRouter;
