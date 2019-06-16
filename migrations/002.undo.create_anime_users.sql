ALTER TABLE anime_watchlist
  DROP COLUMN IF EXISTS user_id;

DROP TABLE IF EXISTS anime_users;