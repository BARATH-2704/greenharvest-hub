import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Calendar, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Farmer {
  id: string;
  farm_name: string;
  farm_description: string | null;
  farm_location: string | null;
  farm_image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image_url: string | null;
  stock_quantity: number;
  categories?: {
    name: string;
  };
}

export default function FarmerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchFarmer();
      fetchProducts();
      if (user) {
        fetchWishlist();
      }
    }
  }, [id, user]);

  const fetchFarmer = async () => {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error) {
      console.error('Error fetching farmer:', error);
      navigate('/farmers');
    } else {
      setFarmer(data);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories (name)')
      .eq('farmer_id', id)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchWishlist = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.id);
    if (data) {
      setWishlistIds(data.map(w => w.product_id));
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your wishlist.',
        variant: 'destructive',
      });
      return;
    }

    const isInWishlist = wishlistIds.includes(productId);
    
    if (isInWishlist) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      setWishlistIds(prev => prev.filter(id => id !== productId));
      toast({ title: 'Removed from wishlist' });
    } else {
      await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: productId });
      setWishlistIds(prev => [...prev, productId]);
      toast({ title: 'Added to wishlist' });
    }
  };

  if (!farmer) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8" />
            <div className="h-48 bg-muted rounded mb-8" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Back Link */}
        <Link 
          to="/farmers" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Farmers
        </Link>

        {/* Farmer Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-card border-4 border-background flex items-center justify-center text-6xl overflow-hidden shadow-lg">
                {farmer.farm_image_url ? (
                  <img 
                    src={farmer.farm_image_url} 
                    alt={farmer.farm_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  '🧑‍🌾'
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
                  {farmer.farm_name}
                </h1>
                {farmer.farm_location && (
                  <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mb-4">
                    <MapPin className="h-4 w-4" />
                    {farmer.farm_location}
                  </p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-primary" />
                    {products.length} Products
                  </span>
                </div>
              </div>
            </div>
          </div>
          {farmer.farm_description && (
            <CardContent className="p-6">
              <h2 className="font-semibold mb-2">About the Farm</h2>
              <p className="text-muted-foreground">{farmer.farm_description}</p>
            </CardContent>
          )}
        </Card>

        {/* Products Section */}
        <div>
          <h2 className="font-serif text-2xl font-bold mb-6">
            Products from {farmer.farm_name}
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No products available yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover-lift overflow-hidden group">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🥬
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart 
                          className={`h-4 w-4 ${wishlistIds.includes(product.id) ? 'fill-destructive text-destructive' : ''}`} 
                        />
                      </Button>
                    </div>
                    
                    {product.categories && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {product.categories.name}
                      </Badge>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-bold text-primary">
                        ₹{product.price.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
                      </p>
                      
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/products/${product.id}`}>
                            <Calendar className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button size="sm">
                          <ShoppingCart className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
