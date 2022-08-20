CREATE TABLE IF NOT EXISTS q_grape (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  bottle_id INT NOT NULL,
  grape_id INT NOT NULL,
  percentage INT NOT NULL,
  UNIQUE (account_id, bottle_id, grape_id)
);