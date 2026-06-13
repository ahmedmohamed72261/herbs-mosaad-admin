import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useAppStore } from '@/store';
import { translations } from '@/lib/translations';
import api, { getAssetUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiSave } from 'react-icons/fi';

interface Category {
  _id: string;
  name_en: string;
  name_ar: string;
}

interface Product {
  _id: string;
  name_en: string;
  name_ar: string;
  category_id: string;
  category: {
    name_en: string;
    name_ar: string;
  };
  description_en: string;
  description_ar: string;
  short_description_en: string;
  short_description_ar: string;
  price: number;
  sku: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  order: number;
  image: string | null;
  images: string[] | null;
}

const initialFormState = {
  name_en: '',
  name_ar: '',
  category_id: '',
  description_en: '',
  description_ar: '',
  short_description_en: '',
  short_description_ar: '',
  price: 0,
  sku: '',
  stock: 0,
  is_active: true,
  is_featured: false,
  order: 0,
  slug: '',
  image: '',
  images: [],
};

const Products = () => {
  const { language } = useAppStore();
  const t = translations[language];
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/categories')
      ]);
      setProducts(productsRes.data.data || productsRes.data || []);
      setCategories(categoriesRes.data.data || categoriesRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

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

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setIsEditing(true);
      setEditId(product._id);
      setFormData({
        name_en: product.name_en || '',
        name_ar: product.name_ar || '',
        category_id: product.category_id || '',
        description_en: product.description_en || '',
        description_ar: product.description_ar || '',
        short_description_en: product.short_description_en || '',
        short_description_ar: product.short_description_ar || '',
        price: product.price || 0,
        sku: product.sku || '',
        stock: product.stock || 0,
        is_active: product.is_active,
        is_featured: product.is_featured,
        order: product.order || 0,
        slug: product.name_en ? product.name_en.toLowerCase().replace(/\s+/g, '-') : '',
        image: product.image || '',
        images: product.images || [],
      });
    } else {
      setIsEditing(false);
      setEditId(null);
      setFormData(initialFormState);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSubmit = {
        ...formData,
        slug: formData.name_en.toLowerCase().replace(/\s+/g, '-'),
      };

      if (isEditing && editId) {
        await api.put(`/admin/products/${editId}`, dataToSubmit);
        toast.success(t.common.success);
      } else {
        await api.post('/admin/products', dataToSubmit);
        toast.success(t.common.success);
      }
      setShowModal(false);
      fetchData();
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
      await api.delete(`/admin/products/${deleteId}`);
      toast.success(t.common.success);
      fetchData();
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setDeleting(false);
      setShowConfirmDialog(false);
      setDeleteId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name_en.toLowerCase().includes(search.toLowerCase()) || 
    p.name_ar.includes(search)
  );

  return (
    <Layout title={t.products.title}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-0">
          {t.products.title}
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>{t.common.add}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t.common.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
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
                    {t.products.category}
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
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image ? (
                        <img
                          src={getAssetUrl(product.image)}
                          alt={language === 'en' ? product.name_en : product.name_ar}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">🌿</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {language === 'en' ? product.name_en : product.name_ar}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          SKU: {product.sku || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {language === 'en' ? product.category?.name_en : product.category?.name_ar}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center w-fit px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {product.is_featured && (
                          <span className="inline-flex items-center w-fit px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product._id)}
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
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.products.nameEn} *
              </label>
              <input
                type="text"
                required
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Arabic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.products.nameAr} *
              </label>
              <input
                type="text"
                required
                dir="rtl"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.products.category} *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {language === 'en' ? cat.name_en : cat.name_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* SKU */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div> */}

            {/* Price */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div> */}

            {/* Stock */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div> */}
            
            {/* English Short Desc */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Short Description (EN)
              </label>
              <input
                type="text"
                value={formData.short_description_en}
                onChange={(e) => setFormData({ ...formData, short_description_en: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Arabic Short Desc */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Short Description (AR)
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.short_description_ar}
                onChange={(e) => setFormData({ ...formData, short_description_ar: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* English Desc */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.products.descriptionEn}
              </label>
              <textarea
                rows={3}
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all custom-scrollbar"
              />
            </div>

            {/* Arabic Desc */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.products.descriptionAr}
              </label>
              <textarea
                rows={3}
                dir="rtl"
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all custom-scrollbar"
              />
            </div>

            {/* Main Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Main Image
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

            {/* Gallery Images */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gallery Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const newImages = [...formData.images];
                    for (const file of Array.from(files)) {
                      const result = await handleFileUpload(file);
                      if (result) {
                        newImages.push(result.url);
                      }
                    }
                    setFormData({ ...formData, images: newImages });
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {formData.images && formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {formData.images.map((img: string, index: number) => (
                    <div key={index} className="relative">
                      <img
                        src={getAssetUrl(img)}
                        alt={`Gallery ${index}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_: string, i: number) => i !== index);
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="md:col-span-2 flex items-center space-x-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
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
                  {t.products.isActive}
                </div>
              </label>

              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_featured ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_featured ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.products.isFeatured}
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-70"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiSave className="w-5 h-5" />
              )}
              <span>{saving ? t.common.loading : t.common.save}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleting}
        variant="danger"
      />
    </Layout>
  );
};

export default Products;
