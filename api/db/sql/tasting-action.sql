CREATE TABLE IF NOT EXISTS tasting_action (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  id INT NOT NULL,
  type VARCHAR NOT NULL,
  bottle_id INT NOT NULL,
  done INT NOT NULL,
  UNIQUE (account_id, id)
);