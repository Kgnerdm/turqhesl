import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Image,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Clock,
  BadgeCheck,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Input, Badge, ImageUploader, GalleryUploader } from '@/components/ui';
import { TURKISH_CITIES, PACKAGE_CATEGORIES, type Provider } from '@/types';
import { getMyProvider, createProvider, updateProvider } from '@/api/providers';
import {
  uploadProviderLogo,
  uploadProviderCover,
  uploadProviderGallery,
  deleteProviderGalleryImage,
} from '@/api/uploads';

// Provider categories for selection
const PROVIDER_CATEGORIES = Object.entries(PACKAGE_CATEGORIES).map(([value, label]) => ({
  value,
  label,
}));

// Days of the week
const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

type DayKey = typeof DAYS_OF_WEEK[number]['key'];

interface WorkingHoursForm {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

const ProviderProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    coverImageUrl: '',
    categories: [] as string[],
  });
  
  const [workingHours, setWorkingHours] = useState<WorkingHoursForm>(() => {
    const initial: WorkingHoursForm = {};
    DAYS_OF_WEEK.forEach(day => {
      initial[day.key] = { isOpen: false, openTime: '09:00', closeTime: '18:00' };
    });
    return initial;
  });
  
  const [isVerified, setIsVerified] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Load provider data
  useEffect(() => {
    const loadProviderData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const provider = await getMyProvider();
        setHasProfile(true);
        setProviderId(provider.id);
        setIsVerified(provider.isVerified);
        
        // Populate form
        setFormData({
          businessName: provider.businessName,
          description: provider.description,
          city: provider.city,
          address: provider.address,
          phone: provider.phone,
          email: provider.email,
          website: provider.website || '',
          logoUrl: provider.logoUrl || '',
          coverImageUrl: provider.coverImageUrl || '',
          categories: provider.categories,
        });

        // Populate gallery
        if (provider.images && Array.isArray(provider.images)) {
          setGalleryImages(provider.images);
        }
        
        // Populate working hours
        if (provider.workingHours) {
          const hours: WorkingHoursForm = {};
          DAYS_OF_WEEK.forEach(day => {
            const dayData = provider.workingHours[day.key as keyof typeof provider.workingHours];
            hours[day.key] = {
              isOpen: dayData?.isOpen || false,
              openTime: dayData?.openTime || '09:00',
              closeTime: dayData?.closeTime || '18:00',
            };
          });
          setWorkingHours(hours);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          // No provider profile yet - show create form
          setHasProfile(false);
          // Pre-fill email from user
          if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }));
          }
        } else {
          console.error('Failed to load provider:', err);
          setError('Failed to load provider profile. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProviderData();
  }, [user?.email]);

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccessMessage(null);
  };

  // Handle category toggle
  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
    setSuccessMessage(null);
  };

  // Handle working hours change
  const handleWorkingHoursChange = (day: DayKey, field: string, value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setSuccessMessage(null);
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!formData.businessName.trim()) return 'Business name is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.city) return 'City is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.email.trim()) return 'Email is required';
    if (formData.categories.length === 0) return 'Please select at least one category';
    return null;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const providerData: Partial<Provider> = {
        businessName: formData.businessName,
        description: formData.description,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || undefined,
        logoUrl: formData.logoUrl || undefined,
        coverImageUrl: formData.coverImageUrl || undefined,
        categories: formData.categories,
      };
      
      if (hasProfile && providerId) {
        // Update existing profile
        await updateProvider(providerId, providerData);
        setSuccessMessage('Profile updated successfully! Redirecting...');
        // Redirect after short delay to show success message
        setTimeout(() => {
          window.location.href = '/dashboard/provider';
        }, 1500);
      } else {
        // Create new profile
        const newProvider = await createProvider(providerData);
        setHasProfile(true);
        setProviderId(newProvider.id);
        setSuccessMessage('Profile created successfully! Redirecting...');
        // Redirect after short delay to show success message
        setTimeout(() => {
          window.location.href = '/dashboard/provider';
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to save provider:', err);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.message 
        || 'Failed to save profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading provider profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/provider')}
            className="flex items-center text-sm text-gray-600 hover:text-primary-500 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {hasProfile ? 'Edit Provider Profile' : 'Create Provider Profile'}
              </h1>
              <p className="text-gray-600 mt-1">
                {hasProfile 
                  ? 'Update your clinic or hospital information'
                  : 'Set up your provider profile to start offering packages'
                }
              </p>
            </div>
            
            {/* Verification Badge */}
            {hasProfile && (
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    <BadgeCheck className="w-4 h-4" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Pending Verification
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-700">{successMessage}</p>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-500">General details about your clinic</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  id="business-name"
                  label="Business Name *"
                  value={formData.businessName}
                  onChange={(e) => handleFieldChange('businessName', e.target.value)}
                  placeholder="e.g., Istanbul Dental Center"
                  leftIcon={<Building2 className="w-4 h-4" />}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe your clinic, specialties, experience, and what makes you unique..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="">Select a city</option>
                  {TURKISH_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  id="address"
                  label="Address *"
                  value={formData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Full address"
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                <p className="text-sm text-gray-500">How patients can reach you</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                id="phone"
                label="Phone Number *"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+90 212 XXX XXXX"
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                id="email"
                label="Email Address *"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="clinic@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="md:col-span-2">
                <Input
                  id="website"
                  label="Website (Optional)"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleFieldChange('website', e.target.value)}
                  placeholder="https://www.yourwebsite.com"
                  leftIcon={<Globe className="w-4 h-4" />}
                />
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Images</h2>
                <p className="text-sm text-gray-500">Add your logo and cover image URLs</p>
              </div>
            </div>

            {hasProfile ? (
              <div className="grid md:grid-cols-3 gap-4">
                <ImageUploader
                  label="Logo"
                  value={formData.logoUrl || null}
                  aspectRatio="1/1"
                  rounded="2xl"
                  onSelect={async (file) => {
                    const asset = await uploadProviderLogo(file);
                    handleFieldChange('logoUrl', asset.url);
                  }}
                />
                <div className="md:col-span-2">
                  <ImageUploader
                    label="Cover Image"
                    value={formData.coverImageUrl || null}
                    aspectRatio="16/9"
                    onSelect={async (file) => {
                      const asset = await uploadProviderCover(file);
                      handleFieldChange('coverImageUrl', asset.url);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900">
                <strong>Save your profile first</strong> to enable image uploads. After saving the basic information, you'll be able to upload your logo, cover, and gallery images.
              </div>
            )}
          </Card>

          {/* Gallery */}
          {hasProfile && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Image className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Photo Gallery</h2>
                  <p className="text-sm text-gray-500">Showcase your facility — patients see these on your profile</p>
                </div>
              </div>
              <GalleryUploader
                images={galleryImages}
                onUpload={async (files) => {
                  const result = await uploadProviderGallery(files);
                  setGalleryImages((prev) => [...prev, ...result.uploaded.map((u) => u.url)]);
                }}
                onRemove={async (url) => {
                  await deleteProviderGalleryImage(url);
                  setGalleryImages((prev) => prev.filter((u) => u !== url));
                }}
              />
            </Card>
          )}

          {/* Categories */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Service Categories *</h2>
                <p className="text-sm text-gray-500">Select the treatments you offer</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {PROVIDER_CATEGORIES.map(({ value, label }) => {
                const isSelected = formData.categories.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleCategoryToggle(value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-4 h-4 inline mr-1" />}
                    {label}
                  </button>
                );
              })}
            </div>
            
            {formData.categories.length === 0 && (
              <p className="text-sm text-red-500 mt-2">Please select at least one category</p>
            )}
          </Card>

          {/* Working Hours */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Working Hours</h2>
                <p className="text-sm text-gray-500">Set your availability (optional)</p>
              </div>
            </div>

            <div className="space-y-3">
              {DAYS_OF_WEEK.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 min-w-[140px]">
                    <input
                      type="checkbox"
                      checked={workingHours[key].isOpen}
                      onChange={(e) => handleWorkingHoursChange(key, 'isOpen', e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="font-medium text-gray-700">{label}</span>
                  </label>
                  
                  {workingHours[key].isOpen && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={workingHours[key].openTime}
                        onChange={(e) => handleWorkingHoursChange(key, 'openTime', e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={workingHours[key].closeTime}
                        onChange={(e) => handleWorkingHoursChange(key, 'closeTime', e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  
                  {!workingHours[key].isOpen && (
                    <span className="text-sm text-gray-400">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/provider')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            >
              {isSaving 
                ? 'Saving...' 
                : hasProfile 
                  ? 'Save Changes' 
                  : 'Create Profile'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderProfilePage;

