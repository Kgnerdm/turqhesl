import { Link } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Shield, 
  Award, 
  Globe, 
  Heart,
  Star,
  Users,
  Building2,
  Stethoscope
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { PACKAGE_CATEGORIES, type PackageCategory } from '@/types';

const HomePage = () => {
  const stats = [
    { label: 'Happy Patients', value: '50,000+', icon: Users },
    { label: 'Verified Clinics', value: '500+', icon: Building2 },
    { label: 'Treatments', value: '200+', icon: Stethoscope },
    { label: 'Countries', value: '80+', icon: Globe },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Providers',
      description: 'All healthcare providers are thoroughly verified and certified',
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Premium healthcare services at competitive prices',
    },
    {
      icon: Globe,
      title: 'Complete Support',
      description: 'From consultation to aftercare, we are with you every step',
    },
  ];

  const categories: { key: PackageCategory; icon: string; image: string }[] = [
    { key: 'dental', icon: '🦷', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400' },
    { key: 'hair_transplant', icon: '💇', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400' },
    { key: 'cosmetic_surgery', icon: '✨', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400' },
    { key: 'eye_surgery', icon: '👁️', image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400' },
    { key: 'checkup', icon: '🩺', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400' },
    { key: 'fertility', icon: '👶', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400' },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      country: 'UK',
      treatment: 'Dental Implants',
      rating: 5,
      text: 'Absolutely amazing experience! The clinic was world-class and I saved over 60% compared to UK prices.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'Michael K.',
      country: 'Germany',
      treatment: 'Hair Transplant',
      rating: 5,
      text: 'Professional service from start to finish. The results exceeded my expectations.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'Emma L.',
      country: 'Netherlands',
      treatment: 'Eye Surgery',
      rating: 5,
      text: 'TurqHeal made everything so easy. The coordinator was helpful and the surgery was a success!',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-secondary-500/90" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Premium Healthcare in{' '}
              <span className="text-primary-200">Turkey</span>
            </h1>
            <p className="mt-6 text-xl text-primary-100 max-w-2xl">
              Connect with world-class medical facilities and save up to 70% on treatments. 
              Your health journey starts here.
            </p>

            {/* Search Box */}
            <div className="mt-10 bg-white rounded-2xl p-2 shadow-2xl max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search treatments, clinics..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 text-gray-900"
                  />
                </div>
                <Link to="/packages">
                  <Button size="lg" className="w-full sm:w-auto px-8">
                    Search
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-8 h-8 text-primary-200 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-primary-200">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Popular Treatments
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Explore our wide range of medical and aesthetic treatments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(({ key, icon, image }) => (
              <Link
                key={key}
                to={`/packages?category=${key}`}
                className="group"
              >
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <img
                    src={image}
                    alt={PACKAGE_CATEGORIES[key]}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <span className="text-2xl mb-1 block">{icon}</span>
                    <h3 className="text-sm font-semibold text-white">
                      {PACKAGE_CATEGORIES[key]}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/packages">
              <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Treatments
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose TurqHeal?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We make health tourism simple, safe, and affordable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              What Our Patients Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Real experiences from real patients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">
                      {testimonial.treatment} • {testimonial.country}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-16 h-16 text-primary-400 mx-auto mb-6" fill="currentColor" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied patients who have transformed their lives with TurqHeal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/packages">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Treatments
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

