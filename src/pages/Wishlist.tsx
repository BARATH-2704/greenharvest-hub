import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    image_url: string | null;
    stock_quantity: number;
    is_available: boolean;
    farmers: {
      farm_name: string;
    };
    categories: {
      name: string;
    } | null;
  };
}

export default function Wishlist() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchWishlist();
    }
  }, [user, authLoading, navigate]);

  const fetchWishlist = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        product_id,
        products (
          id,
          name,
          description,
          price,
          unit,
          image_url,
          stock_quantity,
          is_available,
          farmers (farm_name),
          categories (name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
    } else {
      setItems((data as unknown as WishlistItem[]) || []);
    }
    setLoading(false);
  };

  const removeFromWishlist = async (itemId: string) => {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist.',
        variant: 'destructive',
      });
    } else {
      setItems(prev => prev.filter(item => item.id !== itemId));
      toast({ title: 'Removed from wishlist' });
    }
  };

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            Products you've saved for later
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="font-serif text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Save your favorite products to buy them later
              </p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {items.length} item{items.length !== 1 ? 's' : ''} in your wishlist
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="hover-lift overflow-hidden group">
                  <Link to={`/products/${item.products.id}`}>
                    <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                      {item.products.image_url ? (
                        <img 
                          src={item.products.image_url} 
                          alt={item.products.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🥬
                        </div>
                      )}
                      {!item.products.is_available && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <Badge variant="secondary">Unavailable</Badge>
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/products/${item.products.id}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                          {item.products.name}
                        </h3>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      by {item.products.farmers?.farm_name}
                    </p>
                    
                    {item.products.categories && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {item.products.categories.name}
                      </Badge>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <p className="font-bold text-primary">
                        ${item.products.price.toFixed(2)}
                        <span className="text-xs font-normal text-muted-foreground">/{item.products.unit}</span>
                      </p>
                      
                      {item.products.is_available && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/products/${item.products.id}`}>
                              <Calendar className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button size="sm">
                            <ShoppingCart className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
