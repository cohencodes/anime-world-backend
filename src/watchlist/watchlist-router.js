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

    for (const [key, value] of Object.entries(newEntry)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing ${key} in request body`
        });
      }
    }

    WatchListService.getWatchList(req.app.get('db'), user_id)
      .then(watchlist => {
        const checkIfExists = watchlist.filter(show => show.title === title);
        if (checkIfExists.length > 0) {
          return res.status(400).json({
            error: `This is already in your watchlist!`
          });
        }
        WatchListService.insertShow(req.app.get('db'), newEntry).then(show => {
          return res.status(201).json(WatchListService.serializeShow(show));
        });
      })
      .catch(next);
  });

watchListRouter
  .all(requireAuth)
  .route('/:user_id')
  .get((req, res, next) => {
    console.log('req: ', req.params);
    const { user_id } = req.params;
    WatchListService.getWatchList(req.app.get('db'), user_id)
      .then(watchList => {
        return res.status(200).json(watchList);
      })
      .catch(next);
  });

watchListRouter
  .all(requireAuth)
  .route('/:user_id/change')
  .put(jsonBodyParser, (req, res, next) => {
    const { user_id, episode_number, title } = req.body;

    const data = {
      user_id,
      episode_number,
      title
    };

    console.log('data is: ', data);

    WatchListService.insertEpisodeNumber(req.app.get('db'), data)
      .then(episode => {
        return res.status(204).json(episode);
      })
      .catch(next);
  });

watchListRouter
  .all(requireAuth)
  .route('/:user_id/delete')
  .delete(jsonBodyParser, (req, res, next) => {
    const { title, user_id } = req.body;

    const data = {
      user_id,
      title
    };

    WatchListService.deleteShow(req.app.get('db'), data)
      .then(show => {
        return res.status(200).json(show);
      })
      .catch(next);
  });

module.exports = watchListRouter;
