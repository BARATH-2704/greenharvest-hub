import { Layout } from '@/components/layout/Layout'

export default function Terms() {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          By using GreenHarvest, you agree to fair-use and community guidelines.
        </p>
      </div>
    </Layout>
  )
}
