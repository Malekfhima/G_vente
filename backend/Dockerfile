FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances (inclure devDependencies pour Prisma CLI)
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Optionnel: retirer les devDependencies pour l'image finale
RUN npm prune --production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "start"]

