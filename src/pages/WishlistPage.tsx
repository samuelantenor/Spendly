import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2, Plus, Trash2, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import type { Product } from '../types';

interface Wishlist {
  id: string;
  name: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface WishlistItem {
  id: string;
  product: Product;
  added_at: string;
  price_at_add: number;
  notify_on_sale: boolean;
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewWishlistModal, setShowNewWishlistModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchWishlists();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedWishlist) {
      fetchWishlistItems(selectedWishlist.id);
    }
  }, [selectedWishlist]);

  const fetchWishlists = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at');

      if (error) throw error;

      setWishlists(data || []);
      if (data && data.length > 0) {
        setSelectedWishlist(data[0]);
      }
    } catch (error) {
      console.error('Error fetching wishlists:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load wishlists',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistItems = async (wishlistId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          added_at,
          price_at_add,
          notify_on_sale,
          product:products (*)
        `)
        .eq('wishlist_id', wishlistId)
        .order('added_at', { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load wishlist items',
        type: 'error'
      });
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
      setSelectedWishlist(data);
      setShowNewWishlistModal(false);
      setNewWishlistName('');

      showToast({
        title: 'Success',
        description: 'Wishlist created successfully',
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

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
      showToast({
        title: 'Success',
        description: 'Item removed from wishlist',
        type: 'success'
      });
    } catch (error) {
      console.error('Error removing item:', error);
      showToast({
        title: 'Error',
        description: 'Failed to remove item',
        type: 'error'
      });
    }
  };

  const toggleWishlistPrivacy = async () => {
    if (!selectedWishlist) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .update({ is_public: !selectedWishlist.is_public })
        .eq('id', selectedWishlist.id);

      if (error) throw error;

      setSelectedWishlist({
        ...selectedWishlist,
        is_public: !selectedWishlist.is_public
      });

      showToast({
        title: 'Success',
        description: `Wishlist is now ${selectedWishlist.is_public ? 'private' : 'public'}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating wishlist privacy:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update wishlist privacy',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Heart className="h-8 w-8 text-red-500 mr-2" />
          My Wishlists
        </h1>
        <button
          onClick={() => setShowNewWishlistModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Wishlist
        </button>
      </div>

      {wishlists.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No wishlists yet</h2>
          <p className="text-gray-500 mb-4">
            Create your first wishlist to start saving items you love.
          </p>
          <button
            onClick={() => setShowNewWishlistModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Wishlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Wishlist Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">My Lists</h2>
              <div className="space-y-2">
                {wishlists.map((wishlist) => (
                  <button
                    key={wishlist.id}
                    onClick={() => setSelectedWishlist(wishlist)}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      selectedWishlist?.id === wishlist.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {wishlist.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Wishlist Items */}
          <div className="lg:col-span-3">
            {selectedWishlist && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900">
                      {selectedWishlist.name}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={toggleWishlistPrivacy}
                        className="flex items-center text-gray-600 hover:text-indigo-600"
                      >
                        <Settings className="h-5 w-5 mr-1" />
                        {selectedWishlist.is_public ? 'Make Private' : 'Make Public'}
                      </button>
                      {selectedWishlist.is_public && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/wishlist/${selectedWishlist.id}`
                            );
                            showToast({
                              title: 'Link Copied!',
                              description: 'Wishlist link copied to clipboard',
                              type: 'success'
                            });
                          }}
                          className="flex items-center text-gray-600 hover:text-indigo-600"
                        >
                          <Share2 className="h-5 w-5 mr-1" />
                          Share
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center">
                      <div className="flex-shrink-0 w-24 h-24">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.product.name}
                        </h3>
                        <div className="mt-1 flex items-center">
                          <span className="text-lg font-medium text-indigo-600">
                            ${item.product.price.toFixed(2)}
                          </span>
                          {item.product.price !== item.price_at_add && (
                            <span className="ml-2 text-sm text-gray-500">
                              {item.product.price > item.price_at_add ? '↑' : '↓'} from ${item.price_at_add.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center space-x-4">
                          <button
                            onClick={() => navigate(`/product/${item.product.id}`)}
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="text-sm text-red-600 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">
                        No items in this wishlist yet. Start adding items you love!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Wishlist Modal */}
      {showNewWishlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Create New Wishlist</h2>
            <input
              type="text"
              value={newWishlistName}
              onChange={(e) => setNewWishlistName(e.target.value)}
              placeholder="Wishlist Name"
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowNewWishlistModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={createWishlist}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}