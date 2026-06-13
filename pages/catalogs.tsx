import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Button, Input, Card, CardBody } from '@/components';
import { useAppStore } from '@/store';
import { translations } from '@/lib/translations';
import api, { getAssetUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';

interface Catalog {
  _id: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  version: string | null;
  image: string | null;
  file: string | null;
  is_active: boolean;
  order: number;
}

const initialFormState = {
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  version: '',
  image: '',
  file: '',
  is_active: true,
  order: 1,
};

const Catalogs = () => {
  const { language } = useAppStore();
  const t = translations[language];
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
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
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await api.get('/admin/catalogs');
      setCatalogs(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load catalogs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => fetchCatalogs(true);

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

  const handleOpenModal = (catalog?: Catalog) => {
    if (catalog) {
      setIsEditing(true);
      setEditId(catalog._id);
      setFormData({
        title_en: catalog.title_en || '',
        title_ar: catalog.title_ar || '',
        description_en: catalog.description_en || '',
        description_ar: catalog.description_ar || '',
        version: catalog.version || '',
        image: catalog.image || '',
        file: catalog.file || '',
        is_active: catalog.is_active,
        order: catalog.order || 1,
      });
    } else {
      setIsEditing(false);
      setEditId(null);
      setFormData({
        ...initialFormState,
        order: catalogs.length + 1
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing && editId) {
        await api.put(`/admin/catalogs/${editId}`, formData);
        toast.success(t.common.success);
      } else {
        await api.post('/admin/catalogs', formData);
        toast.success(t.common.success);
      }
      setShowModal(false);
      fetchCatalogs();
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
      await api.delete(`/admin/catalogs/${deleteId}`);
      toast.success(t.common.success);
      fetchCatalogs();
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setDeleting(false);
      setShowConfirmDialog(false);
      setDeleteId(null);
    }
  };

  const filteredCatalogs = catalogs.filter(c => 
    c.title_en.toLowerCase().includes(search.toLowerCase()) || 
    c.title_ar.includes(search)
  );

  return (
    <Layout title={t.catalogs.title}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-0">
          {t.catalogs.title}
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

      <div className="glass-card mb-6">
        <CardBody>
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
        </CardBody>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card animate-pulse">
              <CardBody>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </CardBody>
            </div>
          ))}
        </div>
      ) : filteredCatalogs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-gray-400 mb-4 flex justify-center"><FiSearch className="w-12 h-12" /></div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t.common.noData}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalogs.map((catalog) => (
            <Card key={catalog._id} className="relative overflow-hidden flex flex-col">
              <div className={`absolute top-0 left-0 w-1 h-full ${catalog.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <CardBody>
                {catalog.image && (
                  <div className="mb-4">
                    <img
                      src={getAssetUrl(catalog.image) || undefined}
                      alt={language === 'en' ? catalog.title_en : catalog.title_ar}
                      className="w-full h-40 object-cover rounded-xl border border-gray-200/60 dark:border-white/10"
                    />
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'en' ? catalog.title_en : catalog.title_ar}
                </h3>
                
                {catalog.version && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold rounded-lg">
                      v{catalog.version}
                    </span>
                  </div>
                )}
                
                {(catalog.description_en || catalog.description_ar) && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">
                    {language === 'en' ? catalog.description_en : catalog.description_ar}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200/60 dark:border-white/10">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    catalog.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {catalog.is_active ? 'Active' : 'Inactive'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleOpenModal(catalog)}
                      className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(catalog._id)}
                      className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

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
              label={`${t.catalogs.titleEn} *`}
              required
              value={formData.title_en}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title_en: e.target.value })}
            />

            <Input
              label={`${t.catalogs.titleAr} *`}
              required
              dir="rtl"
              value={formData.title_ar}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title_ar: e.target.value })}
            />

            <Input
              label={t.catalogs.version}
              value={formData.version}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, version: e.target.value })}
            />

            <Input
              label={t.catalogs.order}
              type="number"
              min="1"
              required
              value={formData.order}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            />

            <Input
              label={t.catalogs.descriptionEn}
              multiline
              rows={3}
              value={formData.description_en}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description_en: e.target.value })}
              className="custom-scrollbar"
            />

            <Input
              label={t.catalogs.descriptionAr}
              multiline
              rows={3}
              dir="rtl"
              value={formData.description_ar}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description_ar: e.target.value })}
              className="custom-scrollbar"
            />

            {/* Cover Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Image
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
                    src={getAssetUrl(formData.image) || undefined}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Catalog File */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catalog File (PDF)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const result = await handleFileUpload(file, 'document');
                    if (result) {
                      setFormData({ ...formData, file: result.url });
                    }
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {formData.file && (
                <div className="mt-4">
                  <a
                    href={getAssetUrl(formData.file) || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    View Catalog
                  </a>
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
                  {t.catalogs.isActive}
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
        title="Delete Catalog"
        message="Are you sure you want to delete this catalog? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleting}
        variant="danger"
      />
    </Layout>
  );
};

export default Catalogs;
