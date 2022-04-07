CREATE TABLE IF NOT EXISTS account (
  id serial PRIMARY KEY,
  email VARCHAR (255) UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  registation_code INT
);
