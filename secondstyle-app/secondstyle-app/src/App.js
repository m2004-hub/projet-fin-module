import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Heart, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  Menu,
  X,
  Upload,
  MapPin,
  Clock,
  Star
} from 'lucide-react';

// Context pour l'authentification
const AuthContext = React.createContext();

// Hook personnalisé pour l'authentification
const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider d'authentification
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  useEffect(() => {
    // Récupérer les données du localStorage au chargement
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedRegisteredUsers = localStorage.getItem('registeredUsers');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    if (savedRegisteredUsers) {
      setRegisteredUsers(JSON.parse(savedRegisteredUsers));
    }
  }, []);

  const register = (userData) => {
    // Ajouter l'utilisateur à la liste des utilisateurs enregistrés
    const newUser = {
      ...userData,
      id: Date.now(),
      registeredAt: new Date().toISOString()
    };
    
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    return newUser;
  };

  const login = (email, password) => {
    // Chercher l'utilisateur dans la liste des utilisateurs enregistrés
    const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const authToken = `token-${foundUser.id}-${Date.now()}`;
      setUser(foundUser);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(foundUser));
      localStorage.setItem('token', authToken);
      return { success: true, user: foundUser, token: authToken };
    }
    
    return { success: false, error: 'Email ou mot de passe incorrect' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, registeredUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

// Composant Header
const Header = ({ onMenuToggle, currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et navigation mobile */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center ml-2">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SecondStyle</span>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher des vêtements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={() => setCurrentPage('favorites')}
                  className="p-2 text-gray-600 hover:text-green-600 relative"
                >
                  <Heart size={24} />
                </button>
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                >
                  <User size={24} />
                  <span className="hidden md:block">{user.name}</span>
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <LogOut size={24} />
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage('login')}
                  className="px-4 py-2 text-green-600 hover:text-green-700 font-medium"
                >
                  Connexion
                </button>
                <button
                  onClick={() => setCurrentPage('register')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Composant de navigation latérale
const Sidebar = ({ isOpen, onClose, currentPage, setCurrentPage }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Accueil', icon: ShoppingBag },
    ...(user ? [
      { id: 'my-items', label: 'Mes articles', icon: User },
      { id: 'add-item', label: 'Vendre un article', icon: Plus },
      { id: 'favorites', label: 'Favoris', icon: Heart },
    ] : [])
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button onClick={onClose} className="md:hidden">
              <X size={24} />
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

// Composant carte produit
const ProductCard = ({ product, onFavorite, onEdit, onDelete, isOwner = false }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite && onFavorite(product.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={product.image || '/api/placeholder/300/300'}
          alt={product.title}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleFavorite}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
        >
          <Heart 
            size={20} 
            className={isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'} 
          />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-green-600">{product.price}€</span>
          <span className="text-sm text-gray-500">Taille {product.size}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin size={16} className="mr-1" />
          <span>{product.location}</span>
          <Clock size={16} className="ml-3 mr-1" />
          <span>{product.posted_date}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star size={16} className="text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{product.seller_rating}</span>
          </div>
          
          {isOwner && (
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant formulaire de connexion
const LoginForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Utiliser la vraie fonction de connexion
      const result = login(formData.email, formData.password);
      
      if (result.success) {
        onSuccess('home');
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Erreur de connexion' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        
        {errors.general && (
          <div className="text-red-600 text-sm">{errors.general}</div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};

// Composant formulaire d'inscription
const RegisterForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Enregistrer l'utilisateur
      register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Rediriger vers la page de connexion avec un message de succès
      onSuccess('login');
    } catch (error) {
      setErrors({ general: 'Erreur lors de l\'inscription' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Inscription</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>
        
        {errors.general && (
          <div className="text-red-600 text-sm">{errors.general}</div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  );
};

// Composant formulaire d'ajout/modification d'article
const ItemForm = ({ item = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    price: item?.price || '',
    size: item?.size || 'M',
    category: item?.category || 'T-shirt',
    condition: item?.condition || 'Très bon état',
    brand: item?.brand || '',
    color: item?.color || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {item ? 'Modifier l\'article' : 'Vendre un article'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix (€) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option>T-shirt</option>
              <option>Pantalon</option>
              <option>Robe</option>
              <option>Veste</option>
              <option>Chaussures</option>
              <option>Accessoires</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taille
            </label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({...formData, size: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option>XS</option>
              <option>S</option>
              <option>M</option>
              <option>L</option>
              <option>XL</option>
              <option>XXL</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              État
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({...formData, condition: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option>Neuf avec étiquettes</option>
              <option>Excellent état</option>
              <option>Très bon état</option>
              <option>Bon état</option>
              <option>État correct</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marque
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photos
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Cliquez pour ajouter des photos ou glissez-déposez
            </p>
            <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Enregistrement...' : (item ? 'Modifier' : 'Publier')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

// Composant Profile séparé pour éviter les erreurs de contexte
const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Mon profil</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
            <User size={32} className="text-gray-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user?.name || 'Utilisateur'}</h3>
            <p className="text-gray-600">{user?.email || 'email@example.com'}</p>
            <div className="flex items-center mt-1">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">4.8 (23 avis)</span>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Statistiques</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Articles vendus</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Articles en vente</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-600">Favoris</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal de l'application
const SecondHandClothingApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([
    {
      id: 1,
      title: 'T-shirt vintage Nike',
      description: 'T-shirt Nike des années 90 en excellent état',
      price: '25.00',
      size: 'M',
      category: 'T-shirt',
      condition: 'Excellent état',
      brand: 'Nike',
      color: 'Bleu',
      location: 'Paris',
      posted_date: 'Il y a 2 jours',
      seller_rating: '4.8',
      image: 'C:\Users\Hello\secondstyle-app\src\rob.jpg'
    },
    {
      id: 2,
      title: 'Robe d\'été Zara',
      description: 'Belle robe d\'été, portée une seule fois',
      price: '35.00',
      size: 'S',
      category: 'Robe',
      condition: 'Neuf avec étiquettes',
      brand: 'Zara',
      color: 'Rouge',
      location: 'Lyon',
      posted_date: 'Il y a 1 jour',
      seller_rating: '4.9',
      image: '/api/placeholder/300/300'
    }
  ]);
  const [editingItem, setEditingItem] = useState(null);

  const renderContent = () => {
    switch (currentPage) {
      case 'login':
        return <LoginForm onSuccess={setCurrentPage} />;
      case 'register':
        return <RegisterForm onSuccess={setCurrentPage} />;
      case 'add-item':
        return (
          <ItemForm
            onSubmit={(data) => {
              const newItem = {
                id: Date.now(),
                ...data,
                location: 'Paris',
                posted_date: 'Maintenant',
                seller_rating: '4.5',
                image: '/api/placeholder/300/300'
              };
              setProducts([...products, newItem]);
              setCurrentPage('my-items');
            }}
            onCancel={() => setCurrentPage('home')}
          />
        );
      case 'my-items':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Mes articles</h1>
              <button
                onClick={() => setCurrentPage('add-item')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Ajouter un article</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isOwner={true}
                  onEdit={(item) => {
                    setEditingItem(item);
                    setCurrentPage('edit-item');
                  }}
                  onDelete={(id) => {
                    setProducts(products.filter(p => p.id !== id));
                  }}
                />
              ))}
            </div>
          </div>
        );
      case 'edit-item':
        return (
          <ItemForm
            item={editingItem}
            onSubmit={(data) => {
              setProducts(products.map(p => 
                p.id === editingItem.id ? { ...p, ...data } : p
              ));
              setEditingItem(null);
              setCurrentPage('my-items');
            }}
            onCancel={() => {
              setEditingItem(null);
              setCurrentPage('my-items');
            }}
          />
        );
      case 'favorites':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Mes favoris</h1>
            <div className="text-center py-12">
              <Heart size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucun favori pour le moment</p>
            </div>
          </div>
        );
      case 'profile':
        return <ProfilePage />;
      default:
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 rounded-lg">
              <div className="max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Mode durable, style accessible
                </h1>
                <p className="text-lg mb-6">
                  Découvrez des vêtements de seconde main de qualité. 
                  Vendez facilement vos pièces inutilisées et participez à une mode plus responsable.
                </p>
                <div className="flex space-x-4">
                  <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
                    Commencer à vendre
                  </button>
                  <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600">
                    Parcourir
                  </button>
                </div>
              </div>
            </div>

            {/* Filtres */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Filtres</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option>Toutes catégories</option>
                  <option>T-shirts</option>
                  <option>Pantalons</option>
                  <option>Robes</option>
                  <option>Vestes</option>
                  <option>Chaussures</option>
                  <option>Accessoires</option>
                </select>
                
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option>Toutes tailles</option>
                  <option>XS</option>
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>XXL</option>
                </select>
                
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option>Prix: Tous</option>
                  <option>0 - 20€</option>
                  <option>20 - 50€</option>
                  <option>50 - 100€</option>
                  <option>100€+</option>
                </select>
                
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option>Tous états</option>
                  <option>Neuf avec étiquettes</option>
                  <option>Excellent état</option>
                  <option>Très bon état</option>
                  <option>Bon état</option>
                </select>
              </div>
            </div>

            {/* Liste des produits */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Articles récents</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Trier par:</span>
                  <select className="px-3 py-1 border border-gray-300 rounded">
                    <option>Plus récents</option>
                    <option>Prix croissant</option>
                    <option>Prix décroissant</option>
                    <option>Popularité</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onFavorite={(id) => console.log('Favori:', id)}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Précédent
                  </button>
                  <button className="px-3 py-2 bg-green-600 text-white rounded-lg">
                    1
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    3
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        
        <div className="flex">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
          
          <main className="flex-1 p-6 md:p-8">
            {renderContent()}
          </main>
        </div>
        
        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <ShoppingBag className="h-8 w-8 text-green-500" />
                  <span className="ml-2 text-xl font-bold">SecondStyle</span>
                </div>
                <p className="text-gray-400">
                  La plateforme de vente de vêtements de seconde main qui allie style et durabilité.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Acheter</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Femmes</a></li>
                  <li><a href="#" className="hover:text-white">Hommes</a></li>
                  <li><a href="#" className="hover:text-white">Enfants</a></li>
                  <li><a href="#" className="hover:text-white">Accessoires</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Vendre</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Comment vendre</a></li>
                  <li><a href="#" className="hover:text-white">Conseils photo</a></li>
                  <li><a href="#" className="hover:text-white">Politique de prix</a></li>
                  <li><a href="#" className="hover:text-white">Expédition</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Centre d'aide</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                  <li><a href="#" className="hover:text-white">CGV</a></li>
                  <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 SecondStyle. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default SecondHandClothingApp;