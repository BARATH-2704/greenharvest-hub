import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Calendar, Truck, ShieldCheck, Users, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';

const features = [
  {
    icon: Leaf,
    title: 'Farm Fresh Produce',
    description: 'Directly sourced from local farmers, ensuring maximum freshness and quality.',
  },
  {
    icon: Calendar,
    title: 'Pre-Book Up to 3 Months',
    description: 'Reserve your favorite seasonal items in advance and never miss out.',
  },
  {
    icon: Truck,
    title: 'Reliable Delivery',
    description: 'Fast and careful delivery right to your doorstep.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    description: 'Every product is verified for freshness and authenticity.',
  },
];

const categories = [
  { name: 'Vegetables', emoji: '🥬', color: 'bg-emerald-100 dark:bg-emerald-900/30', slug: 'vegetables' },
  { name: 'Fruits', emoji: '🍎', color: 'bg-red-100 dark:bg-red-900/30', slug: 'fruits' },
  { name: 'Grains', emoji: '🌾', color: 'bg-amber-100 dark:bg-amber-900/30', slug: 'grains' },
  { name: 'Flowers', emoji: '🌸', color: 'bg-pink-100 dark:bg-pink-900/30', slug: 'flowers' },
  { name: 'Organic', emoji: '🌿', color: 'bg-green-100 dark:bg-green-900/30', slug: 'organic' },
  { name: 'Dairy', emoji: '🥛', color: 'bg-blue-100 dark:bg-blue-900/30', slug: 'dairy' },
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Home Cook',
    content: 'The freshness of the produce is unmatched. I can really taste the difference!',
    rating: 5,
    avatar: '👩‍🍳',
  },
  {
    name: 'Michael R.',
    role: 'Restaurant Owner',
    content: 'GreenHarvest has transformed how we source ingredients. Our customers love it.',
    rating: 5,
    avatar: '👨‍🍳',
  },
  {
    name: 'Emily L.',
    role: 'Health Enthusiast',
    content: 'Knowing exactly where my food comes from gives me peace of mind.',
    rating: 5,
    avatar: '🧘‍♀️',
  },
];

const howItWorks = [
  { step: 1, title: 'Browse', description: 'Explore fresh produce from verified local farmers' },
  { step: 2, title: 'Order or Pre-Book', description: 'Buy now or reserve for future harvest dates' },
  { step: 3, title: 'Receive', description: 'Get farm-fresh products delivered to your door' },
];

const featuredFarmers = [
  { name: 'Green Valley Farm', location: 'California', specialty: 'Organic Vegetables', image: '🌱' },
  { name: 'Sunrise Orchards', location: 'Oregon', specialty: 'Fresh Fruits', image: '🍊' },
  { name: 'Golden Fields', location: 'Kansas', specialty: 'Premium Grains', image: '🌾' },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-20 md:py-32">
        <div className="absolute inset-0 pattern-dots opacity-50" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Leaf className="h-4 w-4" />
              Farm to Table, Made Simple
            </div>
            
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Fresh From the Farm,{' '}
              <span className="text-primary">Straight to You</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with local farmers and get the freshest produce delivered to your doorstep. 
              Buy now or pre-book your favorites up to 3 months in advance.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for vegetables, fruits, grains..."
                  className="pl-12 pr-4 py-6 text-base rounded-full border-2 border-border focus:border-primary"
                />
                <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full" asChild>
                  <Link to="/products">Search</Link>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base">
                <Link to="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link to="/become-farmer">Become a Seller</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-10 left-1/4 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-1/4 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of fresh, locally-sourced products
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/products?category=${category.slug}`}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="hover-lift border-border/50 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl transition-transform group-hover:scale-110`}>
                      {category.emoji}
                    </div>
                    <h3 className="font-medium text-sm">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting fresh produce has never been easier
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="text-center relative animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
                
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Why Choose GreenHarvest?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to bringing you the best from local farms
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="hover-lift border-border/50 animate-fade-in" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Farmers */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">
                Featured Farmers
              </h2>
              <p className="text-muted-foreground">
                Meet the farmers behind your food
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:inline-flex">
              <Link to="/farmers">
                View All Farmers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredFarmers.map((farmer, index) => (
              <Card 
                key={farmer.name} 
                className="hover-lift border-border/50 overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-4xl">
                    {farmer.image}
                  </div>
                  <div className="text-center">
                    <h3 className="font-serif text-lg font-semibold mb-1">{farmer.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{farmer.location}</p>
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {farmer.specialty}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/farmers">
                View All Farmers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of happy customers who trust GreenHarvest
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.name} 
                className="hover-lift border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Card className="bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute inset-0 pattern-leaves opacity-10" />
            <CardContent className="p-8 md:p-12 relative">
              <div className="max-w-2xl mx-auto text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                  Join Our Community
                </h2>
                <p className="text-primary-foreground/90 mb-8">
                  Whether you're a farmer looking to reach more customers or someone who 
                  appreciates fresh, local produce – we'd love to have you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/auth?mode=signup">Start Shopping</Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" 
                    asChild
                  >
                    <Link to="/become-farmer">Become a Farmer</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
