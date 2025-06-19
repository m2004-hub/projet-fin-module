from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.deps import get_current_active_superuser, get_current_active_user
from app.core import security
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Récupérer tous les utilisateurs.
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Récupérer un utilisateur par son ID.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if user == current_user:
        return user
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="L'utilisateur n'a pas les privilèges suffisants"
        )
    
    if not user:
        raise HTTPException(
            status_code=404, detail="Utilisateur non trouvé"
        )
    
    return user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Mettre à jour un utilisateur.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=404, detail="Utilisateur non trouvé"
        )
    
    if user.id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="L'utilisateur n'a pas les privilèges suffisants"
        )
    
    user_data = jsonable_encoder(user)
    update_data = user_in.dict(exclude_unset=True)
    
    for field in user_data:
        if field in update_data:
            if field == "password" and update_data[field]:
                setattr(user, "hashed_password", security.get_password_hash(update_data[field]))
            elif field != "password":
                setattr(user, field, update_data[field])
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}", response_model=schemas.User)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Supprimer un utilisateur.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=404, detail="Utilisateur non trouvé"
        )
    
    db.delete(user)
    db.commit()
    
    return user