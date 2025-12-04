import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button, Card, Badge, Modal, Input, Select } from '@/components/ui';
import { formatPrice } from '@/utils/format';
import { PACKAGE_CATEGORIES, type Package, type PackageCategory } from '@/types';

const PackageManagement = () => {
  const [packages, setPackages] = useState<Package[]>([
    {
      id: '1',
      providerId: '1',
      name: 'Premium Dental Implants Package',
      description: 'Complete dental implant treatment',
      category: 'dental',
      price: 1500,
      currency: 'USD',
      duration: '5-7 days',
      includes: ['Consultation', 'X-ray', 'Implant', 'Crown'],
      excludes: ['Flights'],
      images: ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400'],
      isActive: true,
      rating: 4.9,
      reviewCount: 124,
      bookingCount: 89,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      providerId: '1',
      name: 'Hollywood Smile Package',
      description: 'Transform your smile with premium veneers',
      category: 'dental',
      price: 3500,
      currency: 'USD',
      duration: '7-10 days',
      includes: ['20 Veneers', 'Consultation', 'Hotel'],
      excludes: ['Flights'],
      images: ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400'],
      isActive: false,
      rating: 4.8,
      reviewCount: 67,
      bookingCount: 45,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const categoryOptions = Object.entries(PACKAGE_CATEGORIES).map(([value, label]) => ({
    value,
    label,
  }));

  const handleToggleStatus = (id: string) => {
    setPackages(packages.map((pkg) =>
      pkg.id === id ? { ...pkg, isActive: !pkg.isActive } : pkg
    ));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      setPackages(packages.filter((pkg) => pkg.id !== id));
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <Button 
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingPackage(null);
              setShowModal(true);
            }}
          >
            Add Package
          </Button>
        </div>

        {/* Package List */}
        <div className="grid gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={pkg.images[0] || 'https://via.placeholder.com/200'}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(pkg)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pkg.id)}
                        className="text-error hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                      <p className="font-medium text-gray-900">{pkg.bookingCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="font-medium text-gray-900">⭐ {pkg.rating}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {packages.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-gray-500 mb-4">No packages created yet</p>
              <Button onClick={() => setShowModal(true)}>
                Create Your First Package
              </Button>
            </Card>
          )}
        </div>

        {/* Package Form Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingPackage ? 'Edit Package' : 'Create Package'}
          size="lg"
        >
          <form className="space-y-4">
            <Input
              label="Package Name"
              placeholder="e.g., Premium Dental Implants"
              defaultValue={editingPackage?.name}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                options={categoryOptions}
                defaultValue={editingPackage?.category}
                required
              />
              <Input
                label="Duration"
                placeholder="e.g., 5-7 days"
                defaultValue={editingPackage?.duration}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (USD)"
                type="number"
                placeholder="0"
                defaultValue={editingPackage?.price}
                required
              />
              <Select
                label="Currency"
                options={[
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'GBP', label: 'GBP' },
                ]}
                defaultValue={editingPackage?.currency || 'USD'}
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
                defaultValue={editingPackage?.description}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingPackage ? 'Update Package' : 'Create Package'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default PackageManagement;

