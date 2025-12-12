import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Calendar, Heart, User, Store, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { user, loading, userRole, farmerStatus } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<{ id: string; total_amount: number; created_at: string; status: string }[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<{ id: string; booking_date: string; total_price: number; status: string }[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, created_at, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentOrders(orders || []);
      const today = new Date().toISOString().slice(0,10);
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, booking_date, total_price, status')
        .eq('user_id', user.id)
        .gte('booking_date', today)
        .order('booking_date', { ascending: true })
        .limit(5);
      setUpcomingBookings(bookings || []);
    };
    fetchData();
  }, [user]);

  if (loading) {
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

  if (!user) return null;

  const quickActions = [
    {
      title: 'Browse Products',
      description: 'Explore fresh produce from local farmers',
      icon: Package,
      href: '/products',
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'My Orders',
      description: 'View your order history',
      icon: Clock,
      href: '/orders',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Pre-Bookings',
      description: 'Manage your upcoming bookings',
      icon: Calendar,
      href: '/bookings',
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Wishlist',
      description: 'View your saved items',
      icon: Heart,
      href: '/wishlist',
      color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    },
  ];

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Manage your orders, bookings, and account settings
          </p>
        </div>

        {/* Farmer Status Banner */}
        {farmerStatus && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Farmer Account</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={farmerStatus === 'approved' ? 'default' : farmerStatus === 'pending' ? 'secondary' : 'destructive'}>
                        {farmerStatus.charAt(0).toUpperCase() + farmerStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                {farmerStatus === 'approved' && (
                  <Button asChild>
                    <Link to="/farmer/dashboard">
                      Go to Farmer Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {farmerStatus === 'pending' && (
                  <p className="text-sm text-muted-foreground">
                    Your application is under review. We'll notify you once approved.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="hover-lift h-full border-border/50 transition-all hover:border-primary/30">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif">Recent Orders</CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/products">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-medium">Order #{o.id.slice(0,8)}</span>
                        <Badge variant="secondary">{o.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{o.total_amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Account</CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{user.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {userRole || 'Customer'}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/settings">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
                
                {!farmerStatus && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/become-farmer">
                      <Store className="mr-2 h-4 w-4" />
                      Become a Farmer
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-serif">Upcoming Pre-Bookings</CardTitle>
            <CardDescription>Products you've reserved for future dates</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming bookings</p>
                <p className="text-sm mt-1">Pre-book seasonal items up to 3 months in advance</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/products">Browse Available Products</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">{b.booking_date}</span>
                      <Badge variant="secondary">{b.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ₹{b.total_price.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
