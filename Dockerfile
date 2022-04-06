FROM denoland/deno:debian

EXPOSE 5000

WORKDIR /app

USER deno

ADD . .

RUN ls api

RUN deno cache ./api/main.ts

CMD ["run", "--allow-net", "./api/main.ts"]
