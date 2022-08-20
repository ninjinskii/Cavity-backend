CREATE TABLE IF NOT EXISTS wine (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  id INT NOT NULL,
  name VARCHAR NOT NULL,
  naming VARCHAR NOT NULL,
  color VARCHAR NOT NULL,
  cuvee VARCHAR NOT NULL,
  is_oganic INT NOT NULL,
  img_path VARCHAR NOT NULL,
  county_id INT NOT NULL,
  hidden INT NOT NULL,
  UNIQUE (account_id, id)
);