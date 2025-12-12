import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Grid, List, Heart, Calendar, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image_url: string | null;
  stock_quantity: number;
  category_id: string | null;
  farmer_id: string;
  farmers?: {
    farm_name: string;
    farm_location: string;
  };
  categories?: {
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (user) {
      fetchWishlist();
    }
  }, [selectedCategory, sortBy, user]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select(`
        *,
        farmers (farm_name, farm_location),
        categories (name, slug)
      `)
      .eq('is_available', true);

    if (selectedCategory) {
      const categoryData = categories.find(c => c.slug === selectedCategory);
      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    if (sortBy === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'price-high') {
      query = query.order('price', { ascending: false });
    } else if (sortBy === 'name') {
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      let filteredData = data || [];
      if (searchQuery) {
        filteredData = filteredData.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (filteredData.length < 10) {
        const targetCategories = selectedCategory
          ? categories.filter(c => c.slug === selectedCategory)
          : categories
        const samples: Product[] = []
        targetCategories.forEach((cat) => {
          for (let i = 0; i < Math.max(10 - filteredData.length, 10); i++) {
            const id = `sample-${cat.slug}-${i + 1}`
            samples.push({
              id,
              name: `${cat.name} ${i + 1}`,
              description: 'Seasonal fresh produce',
              price: 2.5 + (i % 5),
              unit: 'kg',
              image_url: null,
              stock_quantity: 100 - i * 2,
              category_id: cat.id,
              farmer_id: 'sample',
              farmers: { farm_name: 'Demo Farm', farm_location: 'Local' },
              categories: { name: cat.name, slug: cat.slug },
            })
          }
        })
        filteredData = [...filteredData, ...samples].slice(0, 30)
      }
      setProducts(filteredData);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    if (category === selectedCategory) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.slug}
                checked={selectedCategory === category.slug}
                onCheckedChange={() => handleCategoryChange(category.slug)}
              />
              <Label htmlFor={category.slug} className="text-sm cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="in-stock" defaultChecked />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer">In Stock</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="pre-book" />
            <Label htmlFor="pre-book" className="text-sm cursor-pointer">Pre-Book Available</Label>
          </div>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => {
          setSelectedCategory('');
          setSearchQuery('');
          searchParams.delete('category');
          searchParams.delete('search');
          setSearchParams(searchParams);
        }}
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Fresh Products
          </h1>
          <p className="text-muted-foreground">
            Browse our selection of farm-fresh produce from local farmers
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden md:flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {selectedCategory && (
          <div className="flex gap-2 mb-6">
            <Badge variant="secondary" className="gap-1">
              {categories.find(c => c.slug === selectedCategory)?.name}
              <button 
                onClick={() => handleCategoryChange(selectedCategory)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <FilterSidebar />
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Button variant="outline" onClick={() => {
                  setSelectedCategory('');
                  setSearchQuery('');
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {products.map((product) => (
                  <Card 
                    key={product.id} 
                    className={`hover-lift overflow-hidden group ${viewMode === 'list' ? 'flex' : ''}`}
                  >
                    <Link 
                      to={`/products/${product.id}`}
                      className={viewMode === 'list' ? 'w-48 shrink-0' : ''}
                    >
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
                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                          <Badge className="absolute top-2 left-2 bg-warning text-warning-foreground">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    </Link>
                    
                    <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Link to={`/products/${product.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors">
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
                        
                        {product.farmers && (
                          <p className="text-sm text-muted-foreground mb-2">
                            by {product.farmers.farm_name}
                          </p>
                        )}
                        
                        {product.categories && (
                          <Badge variant="secondary" className="mb-2">
                            {product.categories.name}
                          </Badge>
                        )}

                        {viewMode === 'list' && product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-bold text-primary">
                          ${product.price.toFixed(2)}
                          <span className="text-sm font-normal text-muted-foreground">/{product.unit}</span>
                        </p>
                        
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/products/${product.id}`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              Book
                            </Link>
                          </Button>
                          <Button size="sm" onClick={() => {
                            addItem({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              unit: product.unit,
                              quantity: 1,
                              image_url: product.image_url,
                              farmer_name: product.farmers?.farm_name,
                            })
                            toast({ title: 'Added to cart', description: product.name })
                          }}>
                            <ShoppingCart className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Results count */}
            {!loading && products.length > 0 && (
              <p className="text-sm text-muted-foreground mt-6 text-center">
                Showing {products.length} products
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
