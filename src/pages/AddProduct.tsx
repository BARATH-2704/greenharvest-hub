import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

export default function AddProduct() {
  const { user, farmerStatus } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [farmerId, setFarmerId] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [unit, setUnit] = useState('kg')
  const [stock, setStock] = useState<number>(100)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: cats } = await supabase.from('categories').select('id, name, slug').order('name')
      setCategories(cats || [])
      if (user) {
        const { data: farmer } = await supabase
          .from('farmers')
          .select('id, status')
          .eq('user_id', user.id)
          .maybeSingle()
        if (farmer?.status === 'approved') {
          setFarmerId(farmer.id)
        }
      }
    }
    init()
  }, [user])

  const save = async () => {
    if (!user || farmerStatus !== 'approved' || !farmerId) {
      toast({ title: 'Farmer approval required', variant: 'destructive' })
      return
    }
    if (!name.trim() || !price || !categoryId) {
      toast({ title: 'Fill required fields', variant: 'destructive' })
      return
    }
    setSaving(true)
    const { error } = await supabase.from('products').insert({
      name: name.trim(),
      description: description.trim(),
      price,
      unit,
      stock_quantity: stock,
      image_url: imageUrl.trim() || null,
      category_id: categoryId,
      farmer_id: farmerId,
      is_available: true,
    })
    setSaving(false)
    if (error) {
      toast({ title: 'Failed to add product', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Product added' })
      navigate('/products')
    }
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Add Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label>Price (INR)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input type="number" value={stock} onChange={(e) => setStock(parseInt(e.target.value) || 0)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Category</Label>
                  <Select value={categoryId || ''} onValueChange={(v) => setCategoryId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem value={c.id} key={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Image URL</Label>
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => navigate('/farmer/dashboard')}>Cancel</Button>
                <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Add Product'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
