import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

export default function Cart() {
  const { items, updateQuantity, removeItem, clear, total } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const [address, setAddress] = useState('')
  const [placing, setPlacing] = useState(false)

  const placeOrder = async () => {
    if (!user) {
      toast({ title: 'Sign in required', variant: 'destructive' })
      return
    }
    if (!address.trim()) {
      toast({ title: 'Enter delivery address', variant: 'destructive' })
      return
    }
    setPlacing(true)
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: total,
        status: 'pending',
        shipping_address: address.trim(),
      })
      .select()
      .single()
    setPlacing(false)
    if (error) {
      toast({ title: 'Order failed', description: error.message, variant: 'destructive' })
    } else {
      for (const item of items) {
        await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: item.id.startsWith('sample-') ? null : item.id,
          farmer_id: null,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        })
      }
      toast({ title: 'Order placed', description: 'We will notify you with updates.' })
      clear()
      setAddress('')
    }
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            Review your items and proceed to checkout
          </p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="font-serif text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add items from the products page
              </p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="hover-lift">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">🥬</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.farmer_name && (
                            <p className="text-sm text-muted-foreground">by {item.farmer_name}</p>
                          )}
                          <Badge variant="secondary" className="mt-2">
                            ₹{item.price.toLocaleString('en-IN')}/{item.unit}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="font-bold text-primary">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <Input 
                      placeholder="Delivery address (street, city, pincode)" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" onClick={placeOrder} disabled={placing}>
                      {placing ? 'Placing...' : 'Checkout'}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={clear}>
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
