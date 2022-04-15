CREATE TABLE IF NOT EXISTS county (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  id INT NOT NULL,
  name VARCHAR NOT NULL,
  pref_order INT NOT NULL,
  UNIQUE (account_id, id)
);