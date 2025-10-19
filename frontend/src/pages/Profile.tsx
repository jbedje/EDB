import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Eye,
  EyeOff,
  Calendar,
  Shield,
  Bell,
  CheckCircle,
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderNotifications: boolean;
  marketingEmails: boolean;
}

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
    createdAt: '',
    emailVerified: false,
    phoneVerified: false,
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    reminderNotifications: true,
    marketingEmails: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      const data = response.data.data || response.data;
      setProfileData(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.put('/users/me', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
      });

      // Update user in store
      updateUser({
        ...user!,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      });

      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      await api.put('/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast.success('Mot de passe modifié avec succès');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleUpdateNotifications = async () => {
    try {
      await api.put('/users/me/notifications', notificationSettings);
      toast.success('Préférences de notifications mises à jour');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-1">Gérez vos informations personnelles et préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-primary-600" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-sm text-gray-600 mb-4">{user?.role}</p>

              {profileData.createdAt && (
                <div className="pt-4 border-t text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar size={16} />
                    <span>Membre depuis</span>
                  </div>
                  <p className="font-medium text-gray-900">{formatDate(profileData.createdAt)}</p>
                </div>
              )}

              {/* Verification Status */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-500" />
                    <span>Email</span>
                  </div>
                  {profileData.emailVerified ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <span className="text-xs text-yellow-600">Non vérifié</span>
                  )}
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-500" />
                    <span>Téléphone</span>
                  </div>
                  {profileData.phoneVerified ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <span className="text-xs text-yellow-600">Non vérifié</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={20} className="text-primary-600" />
              Informations personnelles
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    required
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="input"
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={profileData.bio || ''}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="input"
                  rows={4}
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <button type="submit" className="btn btn-primary flex items-center gap-2">
                <Save size={20} />
                Sauvegarder les modifications
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock size={20} className="text-primary-600" />
              Modifier le mot de passe
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel *
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({ ...showPassword, current: !showPassword.current })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="input pr-10"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 caractères, avec majuscule, chiffre et caractère spécial
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="input pr-10"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary flex items-center gap-2">
                <Shield size={20} />
                Modifier le mot de passe
              </button>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell size={20} className="text-primary-600" />
              Préférences de notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Notifications par email</p>
                  <p className="text-sm text-gray-600">
                    Recevez des emails pour les mises à jour importantes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Notifications par SMS</p>
                  <p className="text-sm text-gray-600">
                    Recevez des SMS pour les alertes urgentes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        smsNotifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Rappels d'échéance</p>
                  <p className="text-sm text-gray-600">
                    Rappels J-14, J-7 et J-1 avant expiration
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.reminderNotifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        reminderNotifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Emails marketing</p>
                  <p className="text-sm text-gray-600">
                    Recevez des offres et actualités
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.marketingEmails}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        marketingEmails: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <button
                onClick={handleUpdateNotifications}
                className="btn btn-primary flex items-center gap-2 mt-4"
              >
                <Save size={20} />
                Sauvegarder les préférences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
