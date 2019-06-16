CREATE TABLE anime_users (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  user_name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  date_created TIMESTAMP DEFAULT now() NOT NULL,
  date_modified TIMESTAMP
);

ALTER TABLE anime_watchlist
  ADD COLUMN
    author_id INTEGER REFERENCES anime_users(id)
    ON DELETE SET NULL;