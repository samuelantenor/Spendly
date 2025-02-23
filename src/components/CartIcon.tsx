import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function CartIcon() {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  return (
    <button
      onClick={() => navigate('/cart')}
      className="relative bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-indigo-700"
    >
      <ShoppingCart className="h-5 w-5" />
      <span>Cart</span>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
}