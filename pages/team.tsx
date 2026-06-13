import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Button, Input } from '@/components';
import { useAppStore } from '@/store';
import { translations } from '@/lib/translations';
import api, { getAssetUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';

interface TeamMember {
  _id: string;
  name_en: string;
  name_ar: string;
  position_en: string;
  position_ar: string;
  bio_en: string | null;
  bio_ar: string | null;
  email: string | null;
  linkedin: string | null;
  image: string | null;
  is_active: boolean;
  order: number;
}

const initialFormState = {
  name_en: '',
  name_ar: '',
  position_en: '',
  position_ar: '',
  bio_en: '',
  bio_ar: '',
  email: '',
  linkedin: '',
  image: '',
  is_active: true,
  order: 1,
};

const Team = () => {
  const { language } = useAppStore();
  const t = translations[language];
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(initialFormState);
  const [saving, setSaving] = useState(false);

  // Confirm Dialog State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await api.get('/admin/team-members');
      setTeamMembers(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => fetchTeamMembers(true);

  const handleFileUpload = async (file: File, type: 'image' | 'document' = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to upload file');
      return null;
    }
  };

  const handleOpenModal = (member?: TeamMember) => {
    if (member) {
      setIsEditing(true);
      setEditId(member._id);
      setFormData({
        name_en: member.name_en || '',
        name_ar: member.name_ar || '',
        position_en: member.position_en || '',
        position_ar: member.position_ar || '',
        bio_en: member.bio_en || '',
        bio_ar: member.bio_ar || '',
        email: member.email || '',
        linkedin: member.linkedin || '',
        image: member.image || '',
        is_active: member.is_active,
        order: member.order || 1,
      });
    } else {
      setIsEditing(false);
      setEditId(null);
      setFormData({
        ...initialFormState,
        order: teamMembers.length + 1
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing && editId) {
        await api.put(`/admin/team-members/${editId}`, formData);
        toast.success(t.common.success);
      } else {
        await api.post('/admin/team-members', formData);
        toast.success(t.common.success);
      }
      setShowModal(false);
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/team-members/${deleteId}`);
      toast.success(t.common.success);
      fetchTeamMembers();
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setDeleting(false);
      setShowConfirmDialog(false);
      setDeleteId(null);
    }
  };

  const filteredTeamMembers = teamMembers.filter(m => 
    m.name_en.toLowerCase().includes(search.toLowerCase()) || 
    m.name_ar.includes(search)
  );

  return (
    <Layout title={t.team.title}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-0">
          {t.team.title}
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl transition-all"
            title="Refresh"
          >
            <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Button
            onClick={() => handleOpenModal()}
            leftIcon={<FiPlus className="w-5 h-5" />}
          >
            {t.common.add}
          </Button>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/60 dark:border-white/10">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <Input
              type="text"
              placeholder={t.common.search}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : filteredTeamMembers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4 flex justify-center"><FiSearch className="w-12 h-12" /></div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t.common.noData}</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {language === 'en' ? 'Name' : 'الاسم'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {language === 'en' ? 'Position' : 'المنصب'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.team.email}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredTeamMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.image ? (
                        <img
                          src={getAssetUrl(member.image)}
                          alt={language === 'en' ? member.name_en : member.name_ar}
                          className="w-16 h-16 object-cover rounded-full border border-gray-200 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-gray-400">👤</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {language === 'en' ? member.name_en : member.name_ar}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'en' ? member.position_en : member.position_ar}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center w-fit px-2.5 py-1 rounded-full text-xs font-medium ${
                        member.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${member.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={() => handleOpenModal(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member._id)}
                          className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? t.common.edit : t.common.add}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={`${t.team.nameEn} *`}
              required
              value={formData.name_en}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name_en: e.target.value })}
            />

            <Input
              label={`${t.team.nameAr} *`}
              required
              dir="rtl"
              value={formData.name_ar}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name_ar: e.target.value })}
            />

            <Input
              label={`${t.team.positionEn} *`}
              required
              value={formData.position_en}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, position_en: e.target.value })}
            />

            <Input
              label={`${t.team.positionAr} *`}
              required
              dir="rtl"
              value={formData.position_ar}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, position_ar: e.target.value })}
            />

            <Input
              label={t.team.email}
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label={t.team.linkedin}
              type="url"
              value={formData.linkedin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, linkedin: e.target.value })}
            />

            <Input
              label={t.team.order}
              type="number"
              min="1"
              required
              value={formData.order}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            />

            <Input
              label={t.team.bioEn}
              multiline
              rows={3}
              value={formData.bio_en}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio_en: e.target.value })}
              className="custom-scrollbar"
            />

            <Input
              label={t.team.bioAr}
              multiline
              rows={3}
              dir="rtl"
              value={formData.bio_ar}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio_ar: e.target.value })}
              className="custom-scrollbar"
            />

            {/* Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const result = await handleFileUpload(file);
                    if (result) {
                      setFormData({ ...formData, image: result.url });
                    }
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {formData.image && (
                <div className="mt-4">
                  <img
                    src={getAssetUrl(formData.image)}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="md:col-span-2 flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_active ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.team.isActive}
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200/60 dark:border-white/10">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" isLoading={saving}>
              {saving ? t.common.loading : t.common.save}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Team Member"
        message="Are you sure you want to delete this team member? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleting}
        variant="danger"
      />
    </Layout>
  );
};

export default Team;
