# Cavity backup API
A server for Cavity Android app to make backups of user's data

## Run the project locally
Make sure [traefik](https://github.com/ninjinskii/traefik) is running.
Install supabase CLI.

```bash
cd Cavity-backend
supabase start
docker-compose up -d
```

You can now acces the project at https://cavity.njk.localhost
Supabase UI URL is displayed when running supabase start

Make sure docker compose variables `SUPABASE_URL` & `SUPABASE_ANON_KEY` are filled with the values given by supabase start
(Most of the time, http://172.17.0.1:54321 works the best)

## Make a request from another device
You can use the api while serving it with a mobile device for example.
You first need to find out your ip on your local network:

```bash
hostname -I | awk '{print $1}'
```

For Android, update network_security_config file to allow unsecured http to run on this ip:
```xml
<network-security-config>
    <base-config>
        ...
    </base-config>

    <!-- Test locally -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">[ip]</domain>
    </domain-config>
</network-security-config>
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
  - Update sentry's release property to match upcoming `version name`
  - Merge target code into master branch
  - Create and push a tag named `version name`
  - (May not be needed) Go to deno deploy, and promote the deployment to production

## Sentry
Checkout (issue)[https://github.com/getsentry/sentry-javascript/issues/10521]
Sentry is configured for this project.
Note however that it would not work in dev mode, nor in a dev container

## Run unit tests
```bash
docker-compose up -d
docker-compose exec web deno test --allow-env
```

## Backup the database
```bash
dc exec db pg_dump postgresql://postgres.pyjhfmsgwwdcdcmyiffc:<PASSWORD>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres > ./backup.sql
```

To restore it use:
```bash
pg_restore -d <DB connection string> ./backup.sql
```
