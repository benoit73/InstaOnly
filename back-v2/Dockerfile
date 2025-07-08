FROM node:20

# Dossier de travail pour tout
WORKDIR /app

# Installer git si nécessaire
RUN apt-get update && apt-get install -y git

# Clone le repo complet
RUN git clone https://github.com/cedli74/InstaOnly.git

# Changer de dossier de travail vers /back
WORKDIR /app/InstaOnly/back

# Installer uniquement les dépendances du back
RUN npm install

# Exposer le port (Cloud Run attend $PORT → ton serveur doit l'écouter)
EXPOSE 3001

# Commande de démarrage
CMD [ "npm", "run", "dev" ]
