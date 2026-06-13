import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button, Input } from '@/components';
import { useAppStore } from '@/store';
import { translations } from '@/lib/translations';
import api, { getAssetUrl } from '@/lib/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { language, user, setUser } = useAppStore();
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', formData);
      setUser(response.data);
      toast.success(t.common.success);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout title={t.settings.title}>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          {t.settings.title}
        </h1>
      </div>

      <div className="max-w-2xl glass-card">
        <div className="glass-card-header">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t.settings.profile}
          </h2>
        </div>
        <div className="glass-card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const result = await handleFileUpload(file);
                    if (result) {
                      setFormData({ ...formData, avatar: result.url });
                    }
                  }
                }}
              />
              {formData.avatar && (
                <div className="mt-4">
                  <img
                    src={getAssetUrl(formData.avatar)}
                    alt="Avatar Preview"
                    className="w-24 h-24 object-cover rounded-full border border-gray-200/60 dark:border-white/10"
                  />
                </div>
              )}
            </div>

            <Input
              label={t.settings.name}
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <Input
              label={t.settings.email}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <div className="pt-6 border-t border-gray-200/60 dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.settings.password}
              </h3>

              <div className="space-y-4">
                <Input
                  label={t.settings.password}
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />

                <Input
                  label={t.settings.newPassword}
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />

                <Input
                  label={t.settings.confirmPassword}
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
            >
              {loading ? t.common.loading : t.common.save}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
