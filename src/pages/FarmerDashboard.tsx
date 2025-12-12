import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function FarmerDashboard() {
  const { user, farmerStatus } = useAuth()

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Farmer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your farm profile and product listings
          </p>
        </div>
        {!user ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Sign in to access your farmer tools.
              </p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Registration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {farmerStatus ? `Status: ${farmerStatus}` : 'Not registered as a farmer'}
                </p>
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link to="/become-farmer">Register as Farmer</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Manage Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add new products and update availability.
                </p>
                <div className="mt-4">
                  <Button asChild>
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}
