FROM denoland/deno:debian-1.24.3

EXPOSE 5000

WORKDIR /app

USER deno

COPY deps.ts .
RUN deno cache ./api/deps.ts

ADD . .

RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--watch", "./api/main.ts", "./api/main.ts"]
