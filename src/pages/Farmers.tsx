import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';

interface Farmer {
  id: string;
  farm_name: string;
  farm_description: string | null;
  farm_location: string | null;
  farm_image_url: string | null;
  user_id: string;
  product_count?: number;
}

export default function Farmers() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('status', 'approved')
      .order('farm_name');

    if (error) {
      console.error('Error fetching farmers:', error);
    } else {
      // Fetch product counts for each farmer
      const farmersWithCounts = await Promise.all(
        (data || []).map(async (farmer) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('farmer_id', farmer.id)
            .eq('is_available', true);
          return { ...farmer, product_count: count || 0 };
        })
      );
      setFarmers(farmersWithCounts);
    }
    setLoading(false);
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.farm_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farmer.farm_location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Our Farmers
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet the dedicated farmers who bring fresh, quality produce to your table. 
            Each one committed to sustainable and ethical farming practices.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search farmers by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Farmers Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4" />
                  <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredFarmers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No farmers found</p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarmers.map((farmer, index) => (
              <Link key={farmer.id} to={`/farmers/${farmer.id}`}>
                <Card 
                  className="hover-lift h-full animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-4xl overflow-hidden">
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
                    
                    <h3 className="font-serif text-xl font-semibold mb-2">
                      {farmer.farm_name}
                    </h3>
                    
                    {farmer.farm_location && (
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" />
                        {farmer.farm_location}
                      </p>
                    )}
                    
                    {farmer.farm_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {farmer.farm_description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{farmer.product_count} products available</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Become a Farmer CTA */}
        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="font-serif text-2xl font-bold mb-2">Want to Sell Your Produce?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join our community of local farmers and reach more customers who value fresh, quality produce.
            </p>
            <Button asChild>
              <Link to="/become-farmer">Become a Farmer</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
