FROM node:20

# Créer le dossier de travail
WORKDIR /app

# Installer git
RUN apt-get update && apt-get install -y git

# Cloner le repo complet
RUN git clone https://github.com/cedli74/InstaOnly.git repo

# Se déplacer dans le sous-dossier /back
WORKDIR /app/repo/back

# Installer les dépendances du back uniquement
RUN npm install

# Expose le port attendu
EXPOSE 3001

# Commande de lancement
CMD [ "npm", "run", "dev" ]
