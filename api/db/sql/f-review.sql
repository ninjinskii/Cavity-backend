CREATE TABLE IF NOT EXISTS f_review (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  bottle_id INT NOT NULL,
  review_id INT NOT NULL,
  value INT NOT NULL,
  UNIQUE (account_id, bottle_id, review_id)
);