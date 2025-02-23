import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import WishlistButton from './WishlistButton';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth', { 
        state: { 
          returnTo: `/product/${product.id}`,
          message: 'Please sign in to add items to your cart'
        }
      });
      return;
    }
    addToCart(product);
  };

  const finalPrice = product.is_flash_deal && product.discount_percentage
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group">
      <div 
        className="relative aspect-square cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.is_flash_deal && product.discount_percentage && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
            {product.discount_percentage}% OFF
          </div>
        )}
        <div className="absolute top-2 left-2">
          <WishlistButton product={product} />
        </div>
      </div>
      <div className="p-4">
        <h3 
          className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </h3>
        <p className="text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-indigo-600">
              ${finalPrice.toFixed(2)}
            </span>
            {product.is_flash_deal && product.discount_percentage && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}