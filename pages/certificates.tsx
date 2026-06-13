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

interface Certificate {
  _id: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  issuer: string | null;
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
  issuer: '',
  image: '',
  file: '',
  is_active: true,
  order: 1,
};

const Certificates = () => {
  const { language } = useAppStore();
  const t = translations[language];
  const [certificates, setCertificates] = useState<Certificate[]>([]);
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
    fetchCertificates();
  }, []);

  const fetchCertificates = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await api.get('/admin/certificates');
      setCertificates(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => fetchCertificates(true);

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

  const handleOpenModal = (certificate?: Certificate) => {
    if (certificate) {
      setIsEditing(true);
      setEditId(certificate._id);
      setFormData({
        title_en: certificate.title_en || '',
        title_ar: certificate.title_ar || '',
        description_en: certificate.description_en || '',
        description_ar: certificate.description_ar || '',
        issuer: certificate.issuer || '',
        image: certificate.image || '',
        file: certificate.file || '',
        is_active: certificate.is_active,
        order: certificate.order || 1,
      });
    } else {
      setIsEditing(false);
      setEditId(null);
      setFormData({
        ...initialFormState,
        order: certificates.length + 1
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing && editId) {
        await api.put(`/admin/certificates/${editId}`, formData);
        toast.success(t.common.success);
      } else {
        await api.post('/admin/certificates', formData);
        toast.success(t.common.success);
      }
      setShowModal(false);
      fetchCertificates();
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
      await api.delete(`/admin/certificates/${deleteId}`);
      toast.success(t.common.success);
      fetchCertificates();
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setDeleting(false);
      setShowConfirmDialog(false);
      setDeleteId(null);
    }
  };

  const filteredCertificates = certificates.filter(c => 
    c.title_en.toLowerCase().includes(search.toLowerCase()) || 
    c.title_ar.includes(search)
  );

  return (
    <Layout title={t.certificates.title}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-0">
          {t.certificates.title}
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
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </CardBody>
            </div>
          ))}
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-gray-400 mb-4 flex justify-center"><FiSearch className="w-12 h-12" /></div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t.common.noData}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => (
            <Card key={cert._id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${cert.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <CardBody>
                {cert.image && (
                  <div className="mb-4">
                    <img
                      src={getAssetUrl(cert.image)}
                      alt={language === 'en' ? cert.title_en : cert.title_ar}
                      className="w-full h-40 object-cover rounded-xl border border-gray-200/60 dark:border-white/10"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'en' ? cert.title_en : cert.title_ar}
                </h3>
                {cert.issuer && (
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-4">
                    Issuer: {cert.issuer}
                  </p>
                )}
                {(cert.description_en || cert.description_ar) && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">
                    {language === 'en' ? cert.description_en : cert.description_ar}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-auto">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    cert.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {cert.is_active ? 'Active' : 'Inactive'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleOpenModal(cert)}
                      className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(cert._id)}
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
              label={`${t.certificates.titleEn} *`}
              required
              value={formData.title_en}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title_en: e.target.value })}
            />

            <Input
              label={`${t.certificates.titleAr} *`}
              required
              dir="rtl"
              value={formData.title_ar}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title_ar: e.target.value })}
            />

            <Input
              label={t.certificates.issuer}
              value={formData.issuer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, issuer: e.target.value })}
            />

            <Input
              label={t.certificates.order}
              type="number"
              min="1"
              required
              value={formData.order}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            />

            <Input
              label={t.certificates.descriptionEn}
              multiline
              rows={3}
              value={formData.description_en}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description_en: e.target.value })}
              className="custom-scrollbar"
            />

            <Input
              label={t.certificates.descriptionAr}
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
                    src={getAssetUrl(formData.image)}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                  />
                </div>
              )}
            </div>

            {/* PDF File */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PDF File
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
                    href={getAssetUrl(formData.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    View PDF
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
                  {t.certificates.isActive}
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
        title="Delete Certificate"
        message="Are you sure you want to delete this certificate? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleting}
        variant="danger"
      />
    </Layout>
  );
};

export default Certificates;
