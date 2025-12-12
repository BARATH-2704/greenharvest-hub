import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Store, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';

const farmerSchema = z.object({
  farmName: z.string().min(2, 'Farm name must be at least 2 characters').max(100, 'Farm name is too long'),
  farmDescription: z.string().max(500, 'Description is too long').optional(),
  farmLocation: z.string().max(200, 'Location is too long').optional(),
});

type FarmerFormData = z.infer<typeof farmerSchema>;

export default function BecomeFarmer() {
  const { user, loading, farmerStatus, registerAsFarmer } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FarmerFormData>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      farmName: '',
      farmDescription: '',
      farmLocation: '',
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=signup');
    }
  }, [user, loading, navigate]);

  const onSubmit = async (data: FarmerFormData) => {
    setIsSubmitting(true);
    const { error } = await registerAsFarmer({
      farmName: data.farmName,
      farmDescription: data.farmDescription,
      farmLocation: data.farmLocation,
    });
    setIsSubmitting(false);
    
    if (!error) {
      // Refresh to show pending status
      window.location.reload();
    }
  };

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

  // Already registered as farmer
  if (farmerStatus) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-lg mx-auto">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <Card className="text-center">
              <CardContent className="p-8">
                {farmerStatus === 'approved' ? (
                  <>
                    <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="font-serif text-2xl font-bold mb-2">You're a Verified Farmer!</h2>
                    <p className="text-muted-foreground mb-6">
                      Your farmer account is active. Start adding products to your store.
                    </p>
                    <Button asChild>
                      <Link to="/farmer/dashboard">Go to Farmer Dashboard</Link>
                    </Button>
                  </>
                ) : farmerStatus === 'pending' ? (
                  <>
                    <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="font-serif text-2xl font-bold mb-2">Application Pending</h2>
                    <p className="text-muted-foreground mb-6">
                      Your farmer application is being reviewed by our team. 
                      We'll notify you once it's approved.
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/dashboard">Back to Dashboard</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Store className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h2 className="font-serif text-2xl font-bold mb-2">Application Rejected</h2>
                    <p className="text-muted-foreground mb-6">
                      Unfortunately, your application was not approved. 
                      Please contact support for more information.
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/dashboard">Back to Dashboard</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Link
            to={user ? '/dashboard' : '/'}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {user ? 'Back to dashboard' : 'Back to home'}
          </Link>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl">Become a Farmer</CardTitle>
              <CardDescription>
                Join our community of local farmers and reach more customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Benefits */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8 p-4 bg-secondary/50 rounded-lg">
                {[
                  { title: 'Reach Customers', desc: 'Access our growing customer base' },
                  { title: 'Easy Management', desc: 'Simple tools to manage products' },
                  { title: 'Pre-Bookings', desc: 'Accept advance orders' },
                ].map((benefit) => (
                  <div key={benefit.title} className="text-center">
                    <h4 className="font-medium text-sm">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="farmName">Farm Name *</Label>
                  <Input
                    id="farmName"
                    placeholder="e.g., Green Valley Farm"
                    {...form.register('farmName')}
                  />
                  {form.formState.errors.farmName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.farmName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farmLocation">Farm Location</Label>
                  <Input
                    id="farmLocation"
                    placeholder="e.g., Green Valley, California"
                    {...form.register('farmLocation')}
                  />
                  {form.formState.errors.farmLocation && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.farmLocation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farmDescription">About Your Farm</Label>
                  <Textarea
                    id="farmDescription"
                    placeholder="Tell customers about your farm, what you grow, and your farming practices..."
                    rows={4}
                    {...form.register('farmDescription')}
                  />
                  {form.formState.errors.farmDescription && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.farmDescription.message}
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                  <p>
                    <strong>Note:</strong> Your application will be reviewed by our team. 
                    This typically takes 1-2 business days. You'll be notified via email once approved.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
