# Utiliser une image Python officielle comme base
FROM python:3.9-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier requirements.txt dans l'image
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le reste du code
COPY . .

# Exposer le port (si ton app écoute sur un port, par exemple 8000)
EXPOSE 8000

# Commande pour démarrer ton application (ajuste selon ton projet)
CMD ["python", "app.py"]
