CREATE TABLE IF NOT EXISTS tasting (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  id INT NOT NULL,
  date BIGINT NOT NULL,
  is_midday BOOLEAN NOT NULL,
  opportunity VARCHAR NOT NULL,
  done BOOLEAN NOT NULL,
  UNIQUE (account_id, id)
);