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

## Dependency code has been changed ?
If you're not using a tag but a branch name (or latest), latest code fetching by Deno can be skipped because the URL stay the same.
To ensure deno is not using cache on a modified dependance, run:
```bash
docker-compose build --no-cache
```

## Release process
This project uses CI/CD. Workflows are triggered when pushing a tag, and deploy code to Deno Deploy.

Things to do to prepare a release:
  - Merge target code into master branch
  - Create and push a tag named `version name`
  - (May not be needed) Go to deno deploy, and promote the deployment to production

## Run unit tests
```bash
docker-compose up -d
docker-compose exec web deno test --allow-env
```

## Backup the database
[Go to supabase and run the "Before backup" SQL command (ALTER USER postgres with superuser).] - Seems not to be mandatory from now on
Replace `[password]` with actual password in `backup/backup.sh` connection string. Then:
```bash
cd Cavity-backend
./backup.sh
sudo chown [user] backup/backup.sql
```

[Go to supabase and run the "After backup" SQL command (ALTER USER postgres with nosuperuser).] ] - Seems not to be mandatory from now on

Now you have `backup.sql` in `backup/backup.sql`

To restore it use:
```bash
docker-compose run --rm db bash
pg_restore -d <DB connection string> backup.sql
```
