import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Truck, Calendar, Leaf } from 'lucide-react'

export default function HowItWorks() {
  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            How It Works
          </h1>
          <p className="text-muted-foreground">
            Buy fresh produce or pre-book seasonal items directly from local farmers
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Leaf className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Discover</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Browse verified farmers and fresh products curated for quality.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Pre-Book</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Reserve upcoming harvests up to 3 months in advance.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Get Delivered</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Enjoy doorstep delivery or pick up from nearby collection points.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Why GreenHarvest</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Fair pricing for farmers, fresher food for customers, transparent sourcing for all.
          </p>
        </div>
      </div>
    </Layout>
  )
}
