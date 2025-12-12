import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone } from 'lucide-react'

export default function Support() {
  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Support
          </h1>
          <p className="text-muted-foreground">
            Contact our team for help with orders or listings
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Email</h2>
              </div>
              <p className="text-sm text-muted-foreground">hello@greenharvest.com</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Phone</h2>
              </div>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
