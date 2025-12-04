import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    treatments: [
      { label: 'Dental Care', href: '/packages?category=dental' },
      { label: 'Hair Transplant', href: '/packages?category=hair_transplant' },
      { label: 'Cosmetic Surgery', href: '/packages?category=cosmetic_surgery' },
      { label: 'Eye Surgery', href: '/packages?category=eye_surgery' },
      { label: 'Health Checkup', href: '/packages?category=checkup' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'For Clinics', href: '/for-clinics' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy', href: '/refund-policy' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-900 text-white overflow-hidden">
      {/* Accent Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400/5 rounded-full blur-3xl" />

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Heart className="relative w-10 h-10 text-primary-400" fill="currentColor" />
              </div>
              <span className="text-2xl font-bold">
                Turq<span className="text-primary-400">Heal</span>
              </span>
            </Link>
            <p className="text-gray-300 text-base mb-8 max-w-sm leading-relaxed">
              Your trusted partner for premium health tourism in Turkey. 
              Connect with verified clinics and world-class medical professionals.
            </p>
            <div className="space-y-4">
              <a
                href="mailto:info@turqheal.com"
                className="flex items-center gap-3 text-gray-300 hover:text-primary-400 transition-colors group"
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span>info@turqheal.com</span>
              </a>
              <a
                href="tel:+902121234567"
                className="flex items-center gap-3 text-gray-300 hover:text-primary-400 transition-colors group"
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <span>+90 212 123 45 67</span>
              </a>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span>Istanbul, Turkey</span>
              </div>
            </div>
          </div>

          {/* Treatments */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">
              Treatments
            </h4>
            <ul className="space-y-4">
              {footerLinks.treatments.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">
              Company
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">
              Support
            </h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-400 hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-gray-400">
              © {currentYear} TurqHeal. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white hover:scale-110 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
