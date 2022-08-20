CREATE TABLE IF NOT EXISTS review (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  id INT NOT NULL,
  contest_name VARCHAR NOT NULL,
  type INT NOT NULL,
  UNIQUE (account_id, id)
);