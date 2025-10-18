import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Users as UsersIcon, User, Search, Edit, Trash2, UserCheck, UserX,
  Eye, X, Mail,
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

interface UserData {
  id: string; email: string; firstName: string; lastName: string;
  role: string; status: string; phone: string | null; bio: string | null;
  emailVerified: boolean; createdAt: string;
}

const USER_ROLES = { ADMIN: 'Administrateur', COACH: 'Coach', APPRENANT: 'Apprenant' };
const USER_STATUS = { ACTIVE: 'Actif', INACTIVE: 'Inactif', SUSPENDED: 'Suspendu' };
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800', INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800', COACH: 'bg-blue-100 text-blue-800',
  APPRENANT: 'bg-yellow-100 text-yellow-800',
};

export default function Users() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', bio: '', role: 'APPRENANT', password: '',
  });

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { filterUsers(); }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter((u) =>
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter) filtered = filtered.filter((u) => u.role === roleFilter);
    if (statusFilter) filtered = filtered.filter((u) => u.status === statusFilter);
    setFilteredUsers(filtered);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || undefined,
      });
      toast.success('Utilisateur créé avec succès');
      setShowCreateModal(false);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', bio: '', role: 'APPRENANT', password: '' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
      };
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.bio) updateData.bio = formData.bio;

      await api.put(`/users/${selectedUser.id}`, updateData);
      toast.success('Utilisateur mis à jour');
      setShowEditModal(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    if (!confirm(`Changer le statut de cet utilisateur ?`)) return;
    try {
      await api.put(`/users/${userId}/status`, { status: newStatus });
      toast.success('Statut mis à jour');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const openEditModal = (userData: UserData) => {
    setSelectedUser(userData);
    setFormData({
      firstName: userData.firstName, lastName: userData.lastName, email: userData.email,
      phone: userData.phone || '', bio: userData.bio || '', role: userData.role, password: '',
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600 mt-1">Gérez les utilisateurs de la plateforme</p>
        </div>
        <button
          onClick={() => {
            setFormData({ firstName: '', lastName: '', email: '', phone: '', bio: '', role: 'APPRENANT', password: '' });
            setShowCreateModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <User size={20} />
          Nouvel utilisateur
        </button>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Rechercher..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input">
            <option value="">Tous les rôles</option>
            {Object.entries(USER_ROLES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
            <option value="">Tous les statuts</option>
            {Object.entries(USER_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card"><p className="text-center text-gray-500">Chargement...</p></div>
      ) : filteredUsers.length === 0 ? (
        <div className="card text-center py-12">
          <UsersIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Utilisateur</th>
                <th className="text-left p-4 font-semibold">Rôle</th>
                <th className="text-left p-4 font-semibold">Statut</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Date d'inscription</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userData) => (
                <tr key={userData.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {userData.firstName[0]}{userData.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{userData.firstName} {userData.lastName}</p>
                        {userData.phone && <p className="text-sm text-gray-500">{userData.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[userData.role]}`}>
                      {USER_ROLES[userData.role as keyof typeof USER_ROLES]}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[userData.status]}`}>
                      {USER_STATUS[userData.status as keyof typeof USER_STATUS]}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      {userData.email}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{formatDate(userData.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setSelectedUser(userData); setShowDetailsModal(true); }}
                        className="btn btn-secondary text-sm p-2" title="Voir détails">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => openEditModal(userData)}
                        className="btn btn-secondary text-sm p-2" title="Modifier">
                        <Edit size={16} />
                      </button>
                      {userData.status === 'ACTIVE' && (
                        <button onClick={() => handleUpdateStatus(userData.id, 'SUSPENDED')}
                          className="btn bg-orange-100 hover:bg-orange-200 text-orange-600 text-sm p-2" title="Suspendre">
                          <UserX size={16} />
                        </button>
                      )}
                      {userData.status === 'SUSPENDED' && (
                        <button onClick={() => handleUpdateStatus(userData.id, 'ACTIVE')}
                          className="btn bg-green-100 hover:bg-green-200 text-green-600 text-sm p-2" title="Activer">
                          <UserCheck size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(userData.id)}
                        className="btn bg-red-100 hover:bg-red-200 text-red-600 text-sm p-2" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails de l'utilisateur</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-xl">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rôle</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[selectedUser.role]}`}>
                    {USER_ROLES[selectedUser.role as keyof typeof USER_ROLES]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Statut</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedUser.status]}`}>
                    {USER_STATUS[selectedUser.status as keyof typeof USER_STATUS]}
                  </span>
                </div>
                {selectedUser.phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email vérifié</p>
                  <p className="font-medium">{selectedUser.emailVerified ? 'Oui' : 'Non'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date d'inscription</p>
                  <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
              {selectedUser.bio && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Biographie</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedUser.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Modifier l'utilisateur</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input type="text" required value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input type="text" required value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input type="tel" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle *</label>
                <select required value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input">
                  {Object.entries(USER_ROLES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biographie</label>
                <textarea rows={3} value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="input" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn btn-primary">Mettre à jour</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 btn btn-secondary">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Créer un utilisateur</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input type="text" required value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input type="text" required value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                <input type="password" required value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input"
                  placeholder="Minimum 8 caractères"
                  minLength={8} />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères, avec majuscule, chiffre et caractère spécial</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input type="tel" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle *</label>
                <select required value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input">
                  {Object.entries(USER_ROLES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn btn-primary">Créer l'utilisateur</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn btn-secondary">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
