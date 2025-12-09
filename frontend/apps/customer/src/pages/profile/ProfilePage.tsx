import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  KeyRound,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Input, Modal } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { updateProfile, changePassword } from '@/api/auth';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle form change
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveError(null);
    setSaveSuccess(false);
  };

  // Handle save profile
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Call API to update profile
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });
      
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.first_name?.[0] || 
                       err.response?.data?.last_name?.[0] ||
                       err.response?.data?.detail ||
                       'Failed to update profile. Please try again.';
      setSaveError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
    setSaveError(null);
  };

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordError(null);

    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);

    try {
      // Call API to change password
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.current_password?.[0] ||
                       err.response?.data?.new_password?.[0] ||
                       err.response?.data?.confirm_password?.[0] ||
                       err.response?.data?.detail ||
                       'Failed to change password. Please try again.';
      setPasswordError(errorMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <p>Your changes have been saved successfully.</p>
          </div>
        )}

        {/* Error Message */}
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p>{saveError}</p>
          </div>
        )}

        {/* Profile Card */}
        <Card className="mb-6">
          {/* Avatar & Name Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-700'
                    : user.role === 'provider'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                leftIcon={<Edit2 className="w-4 h-4" />}
              >
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Information */}
          <div className="pt-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    leftIcon={<User className="w-4 h-4" />}
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.firstName}</span>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    leftIcon={<User className="w-4 h-4" />}
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.lastName}</span>
                  </div>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.email}</span>
                  <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                    Cannot be changed
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    leftIcon={<Phone className="w-4 h-4" />}
                    placeholder="+90 5XX XXX XXXX"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSaving}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Account Details Card */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Account Type</p>
                  <p className="text-sm text-gray-500 capitalize">{user.role} Account</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Member Since</p>
                  <p className="text-sm text-gray-500">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Card */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Security</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-500">Last changed: Never</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
          
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-gray-900">Sign Out</p>
                <p className="text-sm text-gray-500">Sign out from your account</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordError(null);
        }}
        title="Change Password"
      >
        <div className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{passwordError}</p>
            </div>
          )}

          <Input
            type="password"
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            placeholder="Enter current password"
          />

          <Input
            type="password"
            label="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            placeholder="Enter new password"
            helperText="At least 8 characters"
          />

          <Input
            type="password"
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="Confirm new password"
          />

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordError(null);
              }}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;

