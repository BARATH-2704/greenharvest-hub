import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  booking_date: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
  products: {
    id: string;
    name: string;
    unit: string;
    image_url: string | null;
  };
  farmers: {
    farm_name: string;
  };
}

type BookingStatusKey = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
type IconComponent = React.ComponentType<{ className?: string }>
const statusConfig: Record<BookingStatusKey, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: IconComponent }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'default', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
  completed: { label: 'Completed', variant: 'outline', icon: Package },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
};

export default function Bookings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        products (id, name, unit, image_url),
        farmers (farm_name)
      `)
      .eq('user_id', user.id)
      .order('booking_date', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings((data as unknown as Booking[]) || []);
    }
    setLoading(false);
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking.',
        variant: 'destructive',
      });
    } else {
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
      toast({ title: 'Booking cancelled' });
    }
  };

  const upcomingBookings = bookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status) && 
    new Date(b.booking_date) >= new Date()
  );
  
  const pastBookings = bookings.filter(b => 
    !['pending', 'confirmed'].includes(b.status) || 
    new Date(b.booking_date) < new Date()
  );

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

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const status = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const isPast = new Date(booking.booking_date) < new Date();
    const canCancel = ['pending', 'confirmed'].includes(booking.status) && !isPast;

    return (
      <Card className="hover-lift">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 overflow-hidden">
              {booking.products.image_url ? (
                <img 
                  src={booking.products.image_url} 
                  alt={booking.products.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">🥬</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <Link 
                  to={`/products/${booking.products.id}`}
                  className="font-semibold hover:text-primary transition-colors truncate"
                >
                  {booking.products.name}
                </Link>
                <Badge variant={status.variant} className="shrink-0">
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                by {booking.farmers.farm_name}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                </div>
                <div>
                  <span className="text-muted-foreground">Qty:</span>{' '}
                  <span className="font-medium">{booking.quantity} {booking.products.unit}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>{' '}
                  <span className="font-medium text-primary">${booking.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {canCancel && (
            <div className="mt-4 pt-4 border-t flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive hover:text-destructive"
                onClick={() => cancelBooking(booking.id)}
              >
                Cancel Booking
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            My Pre-Bookings
          </h1>
          <p className="text-muted-foreground">
            Manage your pre-booked products
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="font-serif text-xl font-semibold mb-2">No pre-bookings yet</h2>
              <p className="text-muted-foreground mb-6">
                Reserve your favorite products up to 3 months in advance
              </p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No upcoming bookings</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No past bookings</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
