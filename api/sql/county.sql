CREATE TABLE IF NOT EXISTS county (
  _id serial PRIMARY KEY,
  user_id INT NOT NULL,
  id BIGINT NOT NULL,
  name VARCHAR NOT NULL,
  pref_order INT NOT NULL
);