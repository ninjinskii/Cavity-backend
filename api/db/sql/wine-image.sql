CREATE TABLE IF NOT EXISTS wine_image (
  _id serial PRIMARY KEY,
  account_id INT NOT NULL,
  wine_id INT NOT NULL,
  image bytea NOT NULL,
  extension VARCHAR NOT NULL
);