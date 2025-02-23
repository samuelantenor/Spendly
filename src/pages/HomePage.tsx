import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ProductGrid from '../components/ProductGrid';
import CategoryFilter from '../components/CategoryFilter';
import { Search, Sparkles, Clock, Siren as Fire, TrendingUp, Package } from 'lucide-react';
import type { Product } from '../types';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchTrendingProducts();

    // Set up real-time subscription for flash deal updates
    const channel = supabase
      .channel('flash-deals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: 'is_flash_deal=eq.true'
        },
        () => {
          fetchProducts(); // Refresh products when flash deals change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process flash deals
      const now = new Date();
      const processedProducts = data?.map(product => {
        if (product.is_flash_deal && product.flash_deal_end) {
          const dealEndDate = new Date(product.flash_deal_end);
          if (dealEndDate <= now) {
            // Deal has expired - reset discount but keep the product
            return {
              ...product,
              is_flash_deal: false,
              discount_percentage: null,
              flash_deal_end: null
            };
          }
        }
        return product;
      }) || [];

      setProducts(processedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingProducts = async () => {
    try {
      // Get products ordered by purchase count
      const { data, error } = await supabase
        .rpc('get_most_purchased_products', { limit_count: 4 });

      if (error) throw error;
      setTrendingProducts(data || []);
    } catch (error) {
      console.error('Error fetching trending products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');

      if (error) throw error;
      setCategories(data.map(c => c.name));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Active flash deals only
  const now = new Date();
  const flashDeals = products.filter(p => 
    p.is_flash_deal && 
    p.flash_deal_end && 
    new Date(p.flash_deal_end) > now
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-96 bg-gray-200 rounded-2xl"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-8 py-16 sm:px-16 sm:py-24">
          <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
            Save Money.<br />
            Shop Smarter.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Experience the thrill of shopping without spending real money. 
            Earn points, unlock achievements, and compete with others.
          </p>
        </div>
      </div>

      {/* Search and Categories */}
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
          />
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Flash Deals */}
      {flashDeals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Fire className="h-6 w-6 text-red-500 mr-2" />
              Flash Deals
            </h2>
            <Clock className="h-5 w-5 text-gray-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {flashDeals.map(deal => (
              <div
                key={deal.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/product/${deal.id}`)}
              >
                <div className="relative">
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                    {deal.discount_percentage}% OFF
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{deal.name}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(deal.price * (1 - (deal.discount_percentage || 0) / 100)).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 line-through">
                        ${deal.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm text-red-500">
                      Ends {new Date(deal.flash_deal_end!).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Most Popular Products */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
          Most Popular Products
        </h2>
        {trendingProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map(product => (
              <div
                key={product.id}
                className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                    Popular
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="mt-2 text-xl font-bold text-indigo-600">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Popular Products Yet</h3>
            <p className="text-gray-500">
              Start shopping to help determine our most popular items!
            </p>
          </div>
        )}
      </section>

      {/* All Products */}
      {filteredProducts.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
          <ProductGrid products={filteredProducts} />
        </section>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No products found. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
}