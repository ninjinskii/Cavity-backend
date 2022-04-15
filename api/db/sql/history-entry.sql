CREATE TABLE IF NOT EXISTS history_entry (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  id INT NOT NULL,
  date BIGINT NOT NULL,
  bottle_id INT NOT NULL,
  tasting_id INT,
  comment VARCHAR NOT NULL,
  type INT NOT NULL,
  favorite INT NOT NULL,
  UNIQUE (account_id, id)
);