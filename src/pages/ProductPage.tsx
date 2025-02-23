import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Truck, Shield } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import WishlistButton from '../components/WishlistButton';
import type { Product } from '../types';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
          <div className="mt-8 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Product not found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const finalPrice = product.is_flash_deal && product.discount_percentage
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
          {product.is_flash_deal && product.discount_percentage && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full">
              {product.discount_percentage}% OFF
            </div>
          )}
          <div className="absolute top-4 left-4">
            <WishlistButton product={product} />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <span className="text-gray-500">(128 reviews)</span>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-3xl font-bold text-gray-900">
                ${finalPrice.toFixed(2)}
              </p>
              {product.is_flash_deal && product.discount_percentage && (
                <p className="text-xl text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="prose prose-sm text-gray-500 mb-6">
            <p>{product.description}</p>
          </div>

          {/* Features */}
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">2-year warranty included</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            className="w-full bg-indigo-600 text-white py-4 px-8 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Additional Details */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Product Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Premium quality materials</li>
              <li>Designed for durability</li>
              <li>Modern and sleek design</li>
              <li>Easy to use and maintain</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Specifications</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <span className="text-gray-500">Category</span>
                <span className="text-gray-900">{product.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <span className="text-gray-500">Brand</span>
                <span className="text-gray-900">Premium Brand</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <span className="text-gray-500">Warranty</span>
                <span className="text-gray-900">2 Years</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}