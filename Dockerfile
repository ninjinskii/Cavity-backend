FROM denoland/deno:debian-1.24.3

EXPOSE 5000

WORKDIR /app

USER deno

ADD . .

RUN ls api

RUN deno cache ./api/main.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--watch", "./api/main.ts", "./api/main.ts"]
