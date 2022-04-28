CREATE TABLE IF NOT EXISTS bottle_pdf (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  bottle_id INT NOT NULL,
  content TEXT NOT NULL
);