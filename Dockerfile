FROM denoland/deno:debian

EXPOSE 5000

WORKDIR /app

USER deno

COPY deps.ts .
COPY deps_dev.ts .

RUN deno cache deps.ts
RUN deno cache deps_dev.ts

ADD . .
RUN deno cache main.ts

CMD ["run", "--allow-net", "main.ts"]
