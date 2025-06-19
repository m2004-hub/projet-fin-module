from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db, Base, engine
from app.core.config import settings
from app.routers import auth, users, products

# Création des tables dans la base de données
Base.metadata.create_all(bind=engine)

# Création de l'application FastAPI
app = FastAPI(
    title="E-commerce API",
    description="API REST pour un site de vente d'articles en ligne",
    version="0.1.0",
)

# Configuration CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Inclusion des routeurs
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["products"])

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API E-commerce"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Vérification de l'état de l'API et de la connexion à la base de données.
    """
    try:
        # Exécuter une requête simple pour vérifier la connexion à la base de données
        db.execute("SELECT 1")
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "api_version": "0.1.0",
        "db_connection": db_status
    }

# En cas d'exécution en tant que script principal
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)