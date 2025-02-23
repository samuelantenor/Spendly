import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  const calculateItemPrice = (item: typeof items[0]) => {
    const basePrice = item.price;
    if (item.is_flash_deal && item.discount_percentage) {
      const discountMultiplier = 1 - (item.discount_percentage / 100);
      return basePrice * discountMultiplier;
    }
    return basePrice;
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-sm text-gray-500">
          Start adding some items to your cart and they will appear here
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Continue Shopping
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm"
          >
            <div 
              className="flex-shrink-0 w-24 h-24 cursor-pointer relative"
              onClick={() => navigate(`/product/${item.id}`)}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover rounded-md"
              />
              {item.is_flash_deal && item.discount_percentage && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.discount_percentage}% OFF
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-medium text-gray-900 cursor-pointer hover:text-indigo-600"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                {item.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{item.category}</p>
              <div className="mt-1">
                <span className="text-lg font-medium text-indigo-600">
                  ${calculateItemPrice(item).toFixed(2)}
                </span>
                {item.is_flash_deal && item.discount_percentage && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ${item.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-center min-w-[3rem]">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Subtotal</p>
          <p>${totalPrice.toFixed(2)}</p>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          This is a simulated purchase. No actual payment will be processed.
        </p>
        <button
          onClick={() => navigate('/checkout')}
          className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}