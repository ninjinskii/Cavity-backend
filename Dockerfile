FROM denoland/deno:debian-2.6.7

EXPOSE 5000
WORKDIR /app

# Copier les fichiers de configuration et lock avant le code
COPY deno.json deno.lock* ./

# Installer les dépendances
RUN deno install

# Copier le reste du code
ADD . .

# Cache final du point d'entrée
RUN deno cache ./api/main.ts

CMD ["task", "dev"]