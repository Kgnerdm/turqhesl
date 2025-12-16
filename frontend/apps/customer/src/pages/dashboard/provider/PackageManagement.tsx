import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  X,
  Save,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { Button, Card, Badge, Modal, Input, Select, CardSkeleton } from '@/components/ui';
import { formatPrice } from '@/utils/format';
import { PACKAGE_CATEGORIES, type Package, type PackageCategory, type Provider } from '@/types';
import { 
  getMyPackages, 
  createPackage, 
  updatePackage, 
  deletePackage, 
  togglePackageStatus 
} from '@/api/packages';
import { getMyProvider } from '@/api/providers';

interface PackageFormData {
  name: string;
  description: string;
  category: PackageCategory;
  price: number;
  currency: string;
  duration: string;
  includes: string[];
  excludes: string[];
}

const initialFormData: PackageFormData = {
  name: '',
  description: '',
  category: 'dental',
  price: 0,
  currency: 'USD',
  duration: '',
  includes: [],
  excludes: [],
};

const PackageManagement = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(initialFormData);
  const [includesInput, setIncludesInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [providerProfile, setProviderProfile] = useState<Provider | null>(null);

  const categoryOptions = Object.entries(PACKAGE_CATEGORIES).map(([value, label]) => ({
    value,
    label,
  }));

  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'TRY', label: 'TRY' },
  ];

  // Load packages and provider profile
  const loadPackages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [packagesData, providerData] = await Promise.all([
        getMyPackages(),
        getMyProvider()
      ]);
      setPackages(packagesData);
      setProviderProfile(providerData);
    } catch (err: any) {
      console.error('Failed to load packages:', err);
      setError(err.response?.data?.detail || 'Failed to load packages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  // Open modal for create/edit
  const handleOpenModal = (pkg?: Package) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description,
        category: pkg.category,
        price: pkg.price,
        currency: pkg.currency,
        duration: pkg.duration,
        includes: pkg.includes || [],
        excludes: pkg.excludes || [],
      });
      setIncludesInput(pkg.includes?.join(', ') || '');
    } else {
      setEditingPackage(null);
      setFormData(initialFormData);
      setIncludesInput('');
    }
    setSaveError(null);
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    // Parse includes from comma-separated input
    const includes = includesInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const packageData = {
      ...formData,
      includes,
    };

    try {
      if (editingPackage) {
        // Update existing package
        await updatePackage(editingPackage.id, packageData);
      } else {
        // Create new package
        await createPackage(packageData);
      }

      setShowModal(false);
      await loadPackages();
    } catch (err: any) {
      console.error('Failed to save package:', err);
      setSaveError(err.response?.data?.detail || 'Failed to save package');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle package status
  const handleToggleStatus = async (id: string) => {
    setIsToggling(id);
    
    try {
      await togglePackageStatus(id);
      await loadPackages();
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      setError(err.response?.data?.detail || 'Failed to update package status');
    } finally {
      setIsToggling(null);
    }
  };

  // Delete package
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this package?')) {
      return;
    }

    setIsDeleting(id);
    
    try {
      await deletePackage(id);
      await loadPackages();
    } catch (err: any) {
      console.error('Failed to delete package:', err);
      setError(err.response?.data?.detail || 'Failed to delete package');
    } finally {
      setIsDeleting(null);
    }
  };

  if (error && !isLoading && packages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Packages</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadPackages}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = providerProfile?.isVerified ?? false;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Verification Pending Banner */}
        {providerProfile && !isVerified && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Clock className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">Verification Pending</h3>
              <p className="text-amber-700 text-sm mt-1">
                Your provider profile is awaiting admin verification. You cannot create packages until your account is verified.
                This usually takes 1-2 business days.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Package Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage your treatment packages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadPackages}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            {isVerified ? (
              <Button 
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => handleOpenModal()}
              >
                Add Package
              </Button>
            ) : (
              <Button 
                leftIcon={<ShieldAlert className="w-4 h-4" />}
                disabled
                title="Only verified providers can create packages"
              >
                Add Package
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Package List */}
        {isLoading ? (
          <div className="space-y-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=200'}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {pkg.name}
                          </h3>
                          <Badge 
                            variant={pkg.isActive ? 'success' : 'default'}
                            size="sm"
                          >
                            {pkg.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <Badge variant="secondary" size="sm">
                          {PACKAGE_CATEGORIES[pkg.category]}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isToggling === pkg.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(pkg.id)}
                            title={pkg.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {pkg.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(pkg)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {isDeleting === pkg.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-red-400" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(pkg.id)}
                            className="text-error hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {pkg.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="font-semibold text-primary-500">
                          {formatPrice(pkg.price, pkg.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900">{pkg.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Bookings</p>
                        <p className="font-medium text-gray-900">{pkg.bookingCount || 0}</p>
                      </div>
                    </div>

                    {/* Includes */}
                    {pkg.includes && pkg.includes.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {pkg.includes.slice(0, 4).map((item, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full"
                          >
                            ✓ {item}
                          </span>
                        ))}
                        {pkg.includes.length > 4 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            +{pkg.includes.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {packages.length === 0 && (
              <Card className="text-center py-12">
                {isVerified ? (
                  <>
                    <Plus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No packages created yet</p>
                    <Button onClick={() => handleOpenModal()}>
                      Create Your First Package
                    </Button>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium mb-2">Verification Required</p>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                      Only verified providers can create packages. Your account is currently pending verification.
                    </p>
                    <Button disabled>
                      Create Your First Package
                    </Button>
                  </>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Package Form Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingPackage ? 'Edit Package' : 'Create Package'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{saveError}</p>
              </div>
            )}

            <Input
              label="Package Name"
              placeholder="e.g., Premium Dental Implants"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                options={categoryOptions}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as PackageCategory })}
                required
              />
              <Input
                label="Duration"
                placeholder="e.g., 5-7 days"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                placeholder="0"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
              <Select
                label="Currency"
                options={currencyOptions}
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Describe your package..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                What's Included (comma-separated)
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Consultation, X-ray, Surgery, Medication, Hotel Accommodation"
                value={includesInput}
                onChange={(e) => setIncludesInput(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate each item with a comma
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowModal(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSaving}
                leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              >
                {isSaving ? 'Saving...' : editingPackage ? 'Update Package' : 'Create Package'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default PackageManagement;
