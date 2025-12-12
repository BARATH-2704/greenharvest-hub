import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Leaf, Users } from 'lucide-react'

export default function About() {
  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            About Us
          </h1>
          <p className="text-muted-foreground">
            GreenHarvest connects local farmers with communities seeking fresh, sustainable produce.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Leaf className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Our Mission</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Support smallholder farmers and make nutritious food accessible to everyone.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Community</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                A marketplace built on trust, transparency, and shared prosperity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
