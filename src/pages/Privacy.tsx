import { Layout } from '@/components/layout/Layout'

export default function Privacy() {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          We respect your privacy and only use your data to deliver services you request.
        </p>
      </div>
    </Layout>
  )
}
