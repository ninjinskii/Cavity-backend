CREATE TABLE IF NOT EXISTS tasting_x_friend (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  tasting_id INT NOT NULL,
  friend_id INT NOT NULL,
  UNIQUE (account_id, id)
);