from datetime import datetime, timedelta
from typing import Any, Union, Optional

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Configuration du contexte de cryptage
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Fonction pour créer un token d'accès JWT
def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Payload du token
    to_encode = {"exp": expire, "sub": str(subject)}
    
    # Encodage du token avec la clé secrète
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

# Vérification du mot de passe
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Hachage du mot de passe
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)