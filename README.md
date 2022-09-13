# Cavity backup API
A server for Cavity Android app to make backups of user's data

## Run the project locally
Make sure [traefik](https://github.com/ninjinskii/traefik) is running.

```bash
cd Cavity-backend
docker-compose up -d
```

You can now acces the project at https://cavity.njk.localhost

## Make a request from another device
You can use the api while serving it with a mobile device for example.
You first need to find out your ip on your local network:

```bash
hostname -I | awk '{print $1}'
```

Access the app from http://ip:5000

## Run tests
```bash
docker-compose up -d
docker-compose exec web deno test --allow-env /app/tests
```

## Dependency code has been changed ?
If you're not using a tag but a branch name (or latest), latest code fetching by Deno can be skipped because the URL stay the same.
To ensure deno is not using cache on a modified dependance, run:
```bash
docker-compose build --no-cache
```

## Backup the database
Go to supabase and run the "Before backup" SQL command. Then:
```bash
cd Cavity-backend
./backup.sh
```

Go to supabase and run the "After backup" SQL command.

Now you have backup.sql in ./backup/backup.sql

To restore it use:
```bash
docker-compose run --rm db bash
pg_restore -d <DB connection string> backup.sql
```
