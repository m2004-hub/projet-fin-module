from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.core.deps import get_current_active_user, get_current_active_superuser
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Product])
def read_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
) -> Any:
    """
    Récupérer tous les produits.
    """
    query = db.query(models.Product)
    
    # Filtrage par catégorie
    if category_id:
        query = query.join(models.ProductCategory).filter(
            models.ProductCategory.category_id == category_id
        )
    
    # Recherche par nom
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    
    # Filtrage par prix
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    
    # Pagination
    products = query.offset(skip).limit(limit).all()
    
    # Récupération des catégories pour chaque produit
    result = []
    for product in products:
        # Récupération des catégories liées au produit
        categories = db.query(models.Category).join(
            models.ProductCategory,
            models.ProductCategory.category_id == models.Category.id
        ).filter(
            models.ProductCategory.product_id == product.id
        ).all()
        
        # Conversion du produit en dictionnaire
        product_dict = {c.name: getattr(product, c.name) for c in product.__table__.columns}
        product_dict["categories"] = categories
        
        result.append(product_dict)
    
    return result

@router.post("/", response_model=schemas.Product)
def create_product(
    *,
    db: Session = Depends(get_db),
    product_in: schemas.ProductCreate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Créer un nouveau produit.
    """
    # Création du produit
    product = models.Product(
        name=product_in.name,
        description=product_in.description,
        price=product_in.price,
        stock=product_in.stock,
        image_url=product_in.image_url,
        created_by=current_user.id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Ajout des catégories si spécifiées
    if product_in.category_ids:
        for category_id in product_in.category_ids:
            # Vérification si la catégorie existe
            category = db.query(models.Category).filter(models.Category.id == category_id).first()
            if not category:
                raise HTTPException(
                    status_code=404,
                    detail=f"Catégorie avec l'ID {category_id} non trouvée"
                )
            
            # Création de la relation produit-catégorie
            product_category = models.ProductCategory(
                product_id=product.id,
                category_id=category_id
            )
            db.add(product_category)
        
        db.commit()
    
    # Récupération des catégories pour la réponse
    categories = db.query(models.Category).join(
        models.ProductCategory,
        models.ProductCategory.category_id == models.Category.id
    ).filter(
        models.ProductCategory.product_id == product.id
    ).all()
    
    # Création de la réponse
    response = schemas.Product.from_orm(product)
    response.categories = categories
    
    return response

@router.get("/{product_id}", response_model=schemas.Product)
def read_product(
    *,
    db: Session = Depends(get_db),
    product_id: int,
) -> Any:
    """
    Récupérer un produit par son ID.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Produit non trouvé"
        )
    
    # Récupération des catégories pour la réponse
    categories = db.query(models.Category).join(
        models.ProductCategory,
        models.ProductCategory.category_id == models.Category.id
    ).filter(
        models.ProductCategory.product_id == product.id
    ).all()
    
    # Création de la réponse
    response = schemas.Product.from_orm(product)
    response.categories = categories
    
    return response

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    *,
    db: Session = Depends(get_db),
    product_id: int,
    product_in: schemas.ProductUpdate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Mettre à jour un produit.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Produit non trouvé"
        )
    
    # Mise à jour des attributs du produit
    if product_in.name is not None:
        product.name = product_in.name
    if product_in.description is not None:
        product.description = product_in.description
    if product_in.price is not None:
        product.price = product_in.price
    if product_in.stock is not None:
        product.stock = product_in.stock
    if product_in.image_url is not None:
        product.image_url = product_in.image_url
    
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Mise à jour des catégories si spécifiées
    if product_in.category_ids is not None:
        # Suppression des anciennes relations
        db.query(models.ProductCategory).filter(
            models.ProductCategory.product_id == product.id
        ).delete()
        
        # Ajout des nouvelles relations
        for category_id in product_in.category_ids:
            # Vérification si la catégorie existe
            category = db.query(models.Category).filter(models.Category.id == category_id).first()
            if not category:
                raise HTTPException(
                    status_code=404,
                    detail=f"Catégorie avec l'ID {category_id} non trouvée"
                )
            
            # Création de la relation produit-catégorie
            product_category = models.ProductCategory(
                product_id=product.id,
                category_id=category_id
            )
            db.add(product_category)
        
        db.commit()
    
    # Récupération des catégories pour la réponse
    categories = db.query(models.Category).join(
        models.ProductCategory,
        models.ProductCategory.category_id == models.Category.id
    ).filter(
        models.ProductCategory.product_id == product.id
    ).all()
    
    # Création de la réponse
    response = schemas.Product.from_orm(product)
    response.categories = categories
    
    return response

@router.delete("/{product_id}", response_model=schemas.Product)
def delete_product(
    *,
    db: Session = Depends(get_db),
    product_id: int,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Supprimer un produit.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Produit non trouvé"
        )
    
    # Suppression des relations produit-catégorie
    db.query(models.ProductCategory).filter(
        models.ProductCategory.product_id == product.id
    ).delete()
    
    # Suppression du produit
    db.delete(product)
    db.commit()
    
    return product

# Routes pour les catégories
@router.get("/categories/", response_model=List[schemas.Category])
def read_categories(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Récupérer toutes les catégories.
    """
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

@router.post("/categories/", response_model=schemas.Category)
def create_category(
    *,
    db: Session = Depends(get_db),
    category_in: schemas.CategoryCreate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Créer une nouvelle catégorie.
    """
    category = models.Category(**category_in.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/categories/{category_id}", response_model=schemas.Category)
def read_category(
    *,
    db: Session = Depends(get_db),
    category_id: int,
) -> Any:
    """
    Récupérer une catégorie par son ID.
    """
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Catégorie non trouvée"
        )
    
    return category

@router.put("/categories/{category_id}", response_model=schemas.Category)
def update_category(
    *,
    db: Session = Depends(get_db),
    category_id: int,
    category_in: schemas.CategoryUpdate,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Mettre à jour une catégorie.
    """
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Catégorie non trouvée"
        )
    
    # Mise à jour des attributs de la catégorie
    if category_in.name is not None:
        category.name = category_in.name
    if category_in.description is not None:
        category.description = category_in.description
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return category

@router.delete("/categories/{category_id}", response_model=schemas.Category)
def delete_category(
    *,
    db: Session = Depends(get_db),
    category_id: int,
    current_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Supprimer une catégorie.
    """
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Catégorie non trouvée"
        )
    
    # Suppression des relations produit-catégorie
    db.query(models.ProductCategory).filter(
        models.ProductCategory.category_id == category.id
    ).delete()
    
    # Suppression de la catégorie
    db.delete(category)
    db.commit()
    
    return category