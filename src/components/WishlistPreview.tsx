import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

interface WishlistPreviewProps {
  userId: string;
}

interface WishlistItem {
  id: string;
  product: Product;
  added_at: string;
  price_at_add: number;
}

export default function WishlistPreview({ userId }: WishlistPreviewProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistItems();
  }, [userId]);

  const fetchWishlistItems = async () => {
    try {
      // First, ensure a default wishlist exists
      const { data: existingWishlist } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('name', 'Default')
        .maybeSingle();

      let wishlistId;
      
      if (!existingWishlist) {
        // Create default wishlist if it doesn't exist
        const { data: newWishlist, error: createError } = await supabase
          .from('wishlists')
          .insert({
            user_id: userId,
            name: 'Default',
            is_public: false
          })
          .select()
          .single();

        if (createError) throw createError;
        wishlistId = newWishlist.id;
      } else {
        wishlistId = existingWishlist.id;
      }

      // Get the latest 4 items from the wishlist
      const { data: wishlistItems } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          added_at,
          price_at_add,
          product:products (*)
        `)
        .eq('wishlist_id', wishlistId)
        .order('added_at', { ascending: false })
        .limit(4);

      setItems(wishlistItems || []);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
        <p className="text-gray-500 mb-4">
          Start adding items you love to your wishlist while browsing.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          Browse Products
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer group"
            onClick={() => navigate(`/product/${item.product.id}`)}
          >
            <div className="aspect-square relative">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {item.product.is_flash_deal && item.product.discount_percentage && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.product.discount_percentage}% OFF
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.product.name}
              </h3>
              <div className="mt-1 flex items-center">
                <span className="text-sm font-medium text-indigo-600">
                  ${item.product.price.toFixed(2)}
                </span>
                {item.product.price !== item.price_at_add && (
                  <span className="ml-2 text-xs text-gray-500">
                    {item.product.price > item.price_at_add ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => navigate('/wishlist')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          View All Wishlist Items
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}