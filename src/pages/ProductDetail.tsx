import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Calendar, MapPin, Star, Minus, Plus, Check } from 'lucide-react';
import { format, addDays, addMonths, isBefore, isAfter } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  farmers?: { farm_name: string };
}

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
    id: string;
    farm_name: string;
    farm_location: string;
    farm_description: string;
    user_id: string;
  };
  categories?: {
    name: string;
    slug: string;
  };
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);

  useEffect(() => {
    if (!id) return
    if (id.startsWith('sample-')) {
      const name = id.split('-').slice(2).join(' ') || 'Sample Product'
      const sample: Product = {
        id,
        name,
        description: 'Fresh seasonal produce',
        price: 3.99,
        unit: 'kg',
        image_url: null,
        stock_quantity: 100,
        category_id: null,
        farmer_id: 'sample',
        farmers: { id: 'sample', farm_name: 'Demo Farm', farm_location: 'Local', farm_description: '', user_id: 'sample' },
        categories: { name: 'Assorted', slug: 'assorted' }
      }
      setProduct(sample)
      setLoading(false)
      return
    }
    fetchProduct();
    if (user) {
      checkWishlist();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        farmers (id, farm_name, farm_location, farm_description, user_id),
        categories (name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } else {
      setProduct(data);
      // Fetch related products
      if (data.category_id) {
        const { data: related } = await supabase
          .from('products')
          .select('*, farmers (farm_name)')
          .eq('category_id', data.category_id)
          .neq('id', id)
          .eq('is_available', true)
          .limit(4);
        if (related) setRelatedProducts(related);
      }
    }
    setLoading(false);
  };

  const checkWishlist = async () => {
    if (!user || !id) return;
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .maybeSingle();
    setIsInWishlist(!!data);
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your wishlist.',
        variant: 'destructive',
      });
      return;
    }

    if (isInWishlist) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', id);
      setIsInWishlist(false);
      toast({ title: 'Removed from wishlist' });
    } else {
      await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: id });
      setIsInWishlist(true);
      toast({ title: 'Added to wishlist' });
    }
  };

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity,
      image_url: product.image_url,
      farmer_name: product.farmers?.farm_name,
    })
    toast({
      title: 'Added to cart',
      description: `${quantity} ${product.unit} of ${product.name} added to your cart.`,
    })
  }

  const handlePreBook = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to pre-book items.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedDate || !product) return;

    setIsBooking(true);
    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      product_id: product.id,
      farmer_id: product.farmer_id,
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      quantity: bookingQuantity,
      unit_price: product.price,
      total_price: product.price * bookingQuantity,
    });

    setIsBooking(false);

    if (error) {
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Pre-booking confirmed!',
        description: `Your booking for ${bookingQuantity} ${product.unit} on ${format(selectedDate, 'MMM d, yyyy')} has been submitted.`,
      });
      setIsBookingOpen(false);
      setSelectedDate(undefined);
      setBookingQuantity(1);
    }
  };

  const minDate = addDays(new Date(), 1);
  const maxDate = addMonths(new Date(), 3);

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/products" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-secondary/50">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  🥬
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.categories && (
                <Badge variant="secondary" className="mb-2">
                  {product.categories.name}
                </Badge>
              )}
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
                {product.name}
              </h1>
              {product.farmers && (
                <Link 
                  to={`/farmers/${product.farmers.id}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  by {product.farmers.farm_name}
                </Link>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground">per {product.unit}</span>
            </div>

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_quantity > 0 ? (
                <>
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm">
                    In Stock ({product.stock_quantity} {product.unit} available)
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{product.unit}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              
              <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="flex-1">
                    <Calendar className="mr-2 h-5 w-5" />
                    Pre-Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Pre-Book {product.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Reserve this product for a future date (up to 3 months ahead)
                    </p>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => 
                        isBefore(date, minDate) || isAfter(date, maxDate)
                      }
                      className="rounded-md border mx-auto"
                    />
                    {selectedDate && (
                      <div className="space-y-3">
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-sm font-medium">Selected Date</p>
                          <p className="text-primary font-semibold">
                            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setBookingQuantity(Math.max(1, bookingQuantity - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={bookingQuantity}
                              onChange={(e) => setBookingQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20 text-center"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setBookingQuantity(bookingQuantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">{product.unit}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-muted-foreground">Total</span>
                          <span className="font-bold text-lg text-primary">
                            ${(product.price * bookingQuantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handlePreBook}
                      disabled={!selectedDate || isBooking}
                      className="w-full"
                    >
                      {isBooking ? 'Confirming...' : 'Confirm Pre-Booking'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                size="lg"
                variant="outline"
                onClick={toggleWishlist}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-destructive text-destructive' : ''}`} />
              </Button>
            </div>

            {/* Farmer Info */}
            {product.farmers && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                      🧑‍🌾
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.farmers.farm_name}</h3>
                      {product.farmers.farm_location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {product.farmers.farm_location}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/farmers/${product.farmers.id}`}>View Farm</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mt-12">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  {product.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <dl className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium">{product.categories?.name || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Unit</dt>
                    <dd className="font-medium">{product.unit}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Farm</dt>
                    <dd className="font-medium">{product.farmers?.farm_name || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-medium">{product.farmers?.farm_location || 'N/A'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-serif text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((related) => (
                <Link key={related.id} to={`/products/${related.id}`}>
                  <Card className="hover-lift overflow-hidden">
                    <div className="aspect-square bg-secondary/50">
                      {related.image_url ? (
                        <img 
                          src={related.image_url} 
                          alt={related.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🥬</div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm truncate">{related.name}</h3>
                      <p className="text-primary font-semibold">${related.price.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
