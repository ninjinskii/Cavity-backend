CREATE TABLE IF NOT EXISTS history_x_friend (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  history_entry_id INT NOT NULL,
  friend_id INT NOT NULL,
  UNIQUE (account_id, id)
);