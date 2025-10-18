import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Calendar,
  Filter,
  Eye,
  X,
  UserPlus,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

interface Cohort {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  maxStudents: number | null;
  createdAt: string;
  _count?: {
    members: number;
  };
  members?: CohortMember[];
}

interface CohortMember {
  id: string;
  userId: string;
  progress: number;
  enrolledAt: string;
  completedAt: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const COHORT_STATUS = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Active',
  COMPLETED: 'Terminée',
  ARCHIVED: 'Archivée',
};

const FORMATION_TYPES = {
  TRADING_BASICS: 'Trading de base',
  ADVANCED_TRADING: 'Trading avancé',
  RISK_MANAGEMENT: 'Gestion des risques',
  TECHNICAL_ANALYSIS: 'Analyse technique',
  FUNDAMENTAL_ANALYSIS: 'Analyse fondamentale',
  CUSTOM: 'Personnalisé',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  ARCHIVED: 'bg-purple-100 text-purple-800',
};

export default function Cohorts() {
  const { user } = useAuthStore();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [filteredCohorts, setFilteredCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'TRADING_BASICS',
    status: 'DRAFT',
    startDate: '',
    endDate: '',
    maxStudents: '',
  });

  // Members management
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchCohorts();
  }, []);

  useEffect(() => {
    filterCohorts();
  }, [cohorts, searchTerm, statusFilter, typeFilter]);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cohorts');
      setCohorts(response.data.data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des cohortes');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/users');
      setAvailableUsers(response.data.data.filter((u: User) => u.role === 'APPRENANT'));
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const fetchCohortDetails = async (cohortId: string) => {
    try {
      const response = await api.get(`/cohorts/${cohortId}`);
      setSelectedCohort(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
    }
  };

  const filterCohorts = () => {
    let filtered = cohorts;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((c) => c.type === typeFilter);
    }

    setFilteredCohorts(filtered);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cohorts', {
        ...formData,
        maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : null,
      });
      toast.success('Cohorte créée avec succès');
      setShowCreateModal(false);
      resetForm();
      fetchCohorts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCohort) return;

    try {
      await api.put(`/cohorts/${selectedCohort.id}`, {
        ...formData,
        maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : null,
      });
      toast.success('Cohorte mise à jour avec succès');
      setShowEditModal(false);
      resetForm();
      fetchCohorts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (cohortId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette cohorte ?')) return;

    try {
      await api.delete(`/cohorts/${cohortId}`);
      toast.success('Cohorte supprimée avec succès');
      fetchCohorts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleAddMember = async () => {
    if (!selectedCohort || !selectedUserId) return;

    try {
      await api.post(`/cohorts/${selectedCohort.id}/members`, { userId: selectedUserId });
      toast.success('Membre ajouté avec succès');
      setSelectedUserId('');
      fetchCohortDetails(selectedCohort.id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout du membre");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedCohort) return;
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return;

    try {
      await api.delete(`/cohorts/${selectedCohort.id}/members/${userId}`);
      toast.success('Membre retiré avec succès');
      fetchCohortDetails(selectedCohort.id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du retrait du membre');
    }
  };

  const handleUpdateProgress = async (userId: string, progress: number) => {
    if (!selectedCohort) return;

    try {
      await api.put(`/cohorts/${selectedCohort.id}/members/${userId}/progress`, { progress });
      toast.success('Progression mise à jour');
      fetchCohortDetails(selectedCohort.id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setFormData({
      name: cohort.name,
      description: cohort.description || '',
      type: cohort.type,
      status: cohort.status,
      startDate: cohort.startDate.split('T')[0],
      endDate: cohort.endDate ? cohort.endDate.split('T')[0] : '',
      maxStudents: cohort.maxStudents?.toString() || '',
    });
    setShowEditModal(true);
  };

  const openDetailsModal = async (cohort: Cohort) => {
    setSelectedCohort(cohort);
    await fetchCohortDetails(cohort.id);
    setShowDetailsModal(true);
  };

  const openMembersModal = async (cohort: Cohort) => {
    setSelectedCohort(cohort);
    await Promise.all([fetchCohortDetails(cohort.id), fetchAvailableUsers()]);
    setShowMembersModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'TRADING_BASICS',
      status: 'DRAFT',
      startDate: '',
      endDate: '',
      maxStudents: '',
    });
    setSelectedCohort(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cohortes</h1>
        {isAdmin && (
          <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Nouvelle cohorte
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
            <option value="">Tous les statuts</option>
            {Object.entries(COHORT_STATUS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input">
            <option value="">Tous les types</option>
            {Object.entries(FORMATION_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter || typeFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setTypeFilter('');
              }}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Filter size={20} />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Cohorts List */}
      {loading ? (
        <div className="card">
          <p className="text-center text-gray-500">Chargement...</p>
        </div>
      ) : filteredCohorts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Aucune cohorte trouvée</p>
          {isAdmin && (
            <button onClick={openCreateModal} className="btn btn-primary">
              Créer la première cohorte
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCohorts.map((cohort) => (
            <div key={cohort.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{cohort.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[cohort.status]}`}>
                  {COHORT_STATUS[cohort.status as keyof typeof COHORT_STATUS]}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{cohort.description || 'Aucune description'}</p>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen size={16} className="text-primary-600" />
                  <span>{FORMATION_TYPES[cohort.type as keyof typeof FORMATION_TYPES]}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-primary-600" />
                  <span>{formatDate(cohort.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} className="text-primary-600" />
                  <span>
                    {cohort._count?.members || 0}
                    {cohort.maxStudents && ` / ${cohort.maxStudents}`} membres
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openDetailsModal(cohort)}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Eye size={16} />
                  Détails
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => openMembersModal(cohort)}
                      className="btn btn-secondary text-sm p-2"
                      title="Gérer les membres"
                    >
                      <Users size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(cohort)}
                      className="btn btn-secondary text-sm p-2"
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cohort.id)}
                      className="btn bg-red-100 hover:bg-red-200 text-red-600 text-sm p-2"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Créer une cohorte</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de formation *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input"
                  >
                    {Object.entries(FORMATION_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                  >
                    {Object.entries(COHORT_STATUS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de début *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre maximum d'apprenants</label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn btn-primary">
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCohort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Modifier la cohorte</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {/* Same form fields as create */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de formation *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input"
                  >
                    {Object.entries(FORMATION_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                  >
                    {Object.entries(COHORT_STATUS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de début *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre maximum d'apprenants</label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn btn-primary">
                  Mettre à jour
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCohort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedCohort.name}</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">
                    {FORMATION_TYPES[selectedCohort.type as keyof typeof FORMATION_TYPES]}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[selectedCohort.status]
                    }`}
                  >
                    {COHORT_STATUS[selectedCohort.status as keyof typeof COHORT_STATUS]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de début</p>
                  <p className="font-medium">{formatDate(selectedCohort.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de fin</p>
                  <p className="font-medium">{selectedCohort.endDate ? formatDate(selectedCohort.endDate) : 'Non définie'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Membres</p>
                  <p className="font-medium">
                    {selectedCohort.members?.length || 0}
                    {selectedCohort.maxStudents && ` / ${selectedCohort.maxStudents}`}
                  </p>
                </div>
              </div>

              {selectedCohort.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700">{selectedCohort.description}</p>
                </div>
              )}

              {selectedCohort.members && selectedCohort.members.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Liste des membres</h3>
                  <div className="space-y-3">
                    {selectedCohort.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Progression</p>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{ width: `${member.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{member.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Members Management Modal */}
      {showMembersModal && selectedCohort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Gérer les membres - {selectedCohort.name}</h2>
              <button onClick={() => setShowMembersModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Add Member */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <UserPlus size={20} className="text-blue-600" />
                  Ajouter un membre
                </h3>
                <div className="flex gap-2">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="input flex-1"
                  >
                    <option value="">Sélectionner un apprenant...</option>
                    {availableUsers
                      .filter((u) => !selectedCohort.members?.some((m) => m.userId === u.id))
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                  </select>
                  <button onClick={handleAddMember} disabled={!selectedUserId} className="btn btn-primary">
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div>
                <h3 className="font-semibold mb-4">
                  Membres actuels ({selectedCohort.members?.length || 0})
                </h3>
                {selectedCohort.members && selectedCohort.members.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCohort.members.map((member) => (
                      <div key={member.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">
                              {member.user.firstName} {member.user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{member.user.email}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Inscrit le {formatDate(member.enrolledAt)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            className="btn bg-red-100 hover:bg-red-200 text-red-600 text-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">Progression</label>
                            <span className="text-sm font-semibold text-primary-600">{member.progress}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={member.progress}
                              onChange={(e) => handleUpdateProgress(member.userId, parseInt(e.target.value))}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucun membre dans cette cohorte</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
