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
You can use the api while serving it with a mobile device for example
You first need to find out your ip on your local network and then use this IP to make a connection explicitly using http (not https)