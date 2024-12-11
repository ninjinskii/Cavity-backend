FROM denoland/deno:debian-1.46.3

EXPOSE 5000

WORKDIR /app

USER deno

COPY deps.ts .
RUN deno cache deps.ts

ADD . .

RUN deno cache ./api/main.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-sys", "--watch", "./api/main.ts", "./api/main.ts"]
