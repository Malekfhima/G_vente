FROM node:18-alpine as build

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Stage de production avec Nginx
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Utiliser la configuration Nginx par défaut (SPA servie depuis /usr/share/nginx/html)

# Exposer le port HTTP par défaut de Nginx
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]

