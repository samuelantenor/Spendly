import React, { useState, useRef, useEffect } from 'react';
import { Heart, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import type { Product } from '../types';

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

interface Wishlist {
  id: string;
  name: string;
}

export default function WishlistButton({ product, className = '' }: WishlistButtonProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [showNewWishlistInput, setShowNewWishlistInput] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    fetchWishlists();
    checkWishlistStatus();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowNewWishlistInput(false);
        setNewWishlistName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user, product.id]);

  const fetchWishlists = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setWishlists(data || []);
    } catch (error) {
      console.error('Error fetching wishlists:', error);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const { data: items, error } = await supabase
        .from('wishlist_items')
        .select('wishlist_id')
        .eq('product_id', product.id)
        .in('wishlist_id', wishlists.map(w => w.id));

      if (error) throw error;
      setIsInWishlist(items && items.length > 0);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWishlist = async () => {
    if (!newWishlistName.trim()) {
      showToast({
        title: 'Error',
        description: 'Please enter a wishlist name',
        type: 'error'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user?.id,
          name: newWishlistName.trim(),
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;

      setWishlists([...wishlists, data]);
      setShowNewWishlistInput(false);
      setNewWishlistName('');
      
      // Add product to the newly created wishlist
      await addToWishlist(data.id);

      showToast({
        title: 'Success',
        description: `Created new wishlist "${data.name}" and added item`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error creating wishlist:', error);
      showToast({
        title: 'Error',
        description: 'Failed to create wishlist',
        type: 'error'
      });
    }
  };

  const addToWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          wishlist_id: wishlistId,
          product_id: product.id,
          price_at_add: product.price
        });

      if (error) throw error;

      setIsInWishlist(true);
      setShowDropdown(false);

      const wishlist = wishlists.find(w => w.id === wishlistId);
      showToast({
        title: 'Added to wishlist',
        description: `${product.name} has been added to "${wishlist?.name}"`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showToast({
        title: 'Error',
        description: 'Failed to add item to wishlist',
        type: 'error'
      });
    }
  };

  const removeFromWishlist = async () => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('product_id', product.id);

      if (error) throw error;

      setIsInWishlist(false);
      showToast({
        title: 'Removed from wishlist',
        description: `${product.name} has been removed from your wishlist`,
        type: 'info'
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast({
        title: 'Error',
        description: 'Failed to remove item from wishlist',
        type: 'error'
      });
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your wishlist',
        type: 'error'
      });
      return;
    }

    if (isInWishlist) {
      removeFromWishlist();
    } else {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleButtonClick}
        disabled={loading}
        className={`relative p-2 rounded-full transition-colors ${
          isInWishlist
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${className}`}
        title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`}
        />
      </button>

      {showDropdown && !isInWishlist && (
        <div className="absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {wishlists.map((wishlist) => (
              <button
                key={wishlist.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToWishlist(wishlist.id);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {wishlist.name}
              </button>
            ))}
            
            {showNewWishlistInput ? (
              <div className="px-4 py-2">
                <input
                  type="text"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  placeholder="Enter wishlist name"
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      createWishlist();
                    }
                  }}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => {
                      setShowNewWishlistInput(false);
                      setNewWishlistName('');
                    }}
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createWishlist}
                    className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowNewWishlistInput(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Wishlist
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}