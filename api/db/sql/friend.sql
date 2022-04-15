CREATE TABLE IF NOT EXISTS friend (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  id INT NOT NULL,
  name VARCHAR NOT NULL,
  img_path VARCHAR NOT NULL,
  UNIQUE (account_id, id)
);