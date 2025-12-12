import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function FarmerGuide() {
  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Seller Guide
          </h1>
          <p className="text-muted-foreground">
            Best practices for listing products and fulfilling orders
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Getting Started</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete your farm profile, add clear product images, and keep availability updated.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
