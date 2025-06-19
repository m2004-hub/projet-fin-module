from passlib.context import CryptContext

# On prépare l'outil de hashage
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Ton vrai mot de passe ici
mot_de_passe = "motdepasse123"

# On crée le hash sécurisé
hash = pwd_context.hash(mot_de_passe)

# On affiche le résultat
print("Voici le hash sécurisé à mettre dans MySQL :")
print(hash)
