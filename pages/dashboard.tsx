import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardBody } from '@/components/Card';
import { LoadingSpinner, Skeleton } from '@/components/Loading';
import { FadeIn, StaggerGrid, StaggerItem } from '@/components/Motion';
import { useAppStore } from '@/store';
import { translations } from '@/lib/translations';
import api from '@/lib/api';
import { FiPackage, FiLayers, FiMail, FiAward, FiPlus, FiEdit, FiTrash2, FiCheckCircle } from 'react-icons/fi';

interface ActivityItem {
  id: string;
  type: 'product' | 'category' | 'message' | 'certificate';
  title: string;
  description: string;
  time: string;
  icon: any;
  color: string;
}

const Dashboard = () => {
  const { language } = useAppStore();
  const t = translations[language];
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    messages: 0,
    certificates: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, categoriesRes, messagesRes, certificatesRes] = await Promise.all([
        api.get('/admin/products?limit=5'),
        api.get('/admin/categories?limit=5'),
        api.get('/admin/contact-messages?limit=5'),
        api.get('/admin/certificates?limit=5'),
      ]);

      const products = productsRes.data.data || [];
      const categories = categoriesRes.data.data || [];
      const messages = messagesRes.data.data || [];
      const certificates = certificatesRes.data.data || [];

      setStats({
        products: productsRes.data.total || products.length,
        categories: categoriesRes.data.total || categories.length,
        messages: messagesRes.data.total || messages.length,
        certificates: certificatesRes.data.total || certificates.length,
      });

      // Create recent activity list
      const newActivities: ActivityItem[] = [];

      // Add recent products
      products.forEach((product: any) => {
        newActivities.push({
          id: product._id,
          type: 'product',
          title: language === 'en' ? product.name_en : product.name_ar,
          description: 'Product created',
          time: product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Recently',
          icon: FiPackage,
          color: 'text-blue-600 dark:text-blue-400',
        });
      });

      // Add recent categories
      categories.forEach((category: any) => {
        newActivities.push({
          id: category._id,
          type: 'category',
          title: language === 'en' ? category.name_en : category.name_ar,
          description: 'Category created',
          time: category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'Recently',
          icon: FiLayers,
          color: 'text-emerald-600 dark:text-emerald-400',
        });
      });

      // Add recent messages
      messages.forEach((message: any) => {
        newActivities.push({
          id: message._id,
          type: 'message',
          title: message.name,
          description: 'New message received',
          time: message.createdAt ? new Date(message.createdAt).toLocaleDateString() : 'Recently',
          icon: FiMail,
          color: 'text-violet-600 dark:text-violet-400',
        });
      });

      // Add recent certificates
      certificates.forEach((certificate: any) => {
        newActivities.push({
          id: certificate._id,
          type: 'certificate',
          title: language === 'en' ? certificate.title_en : certificate.title_ar,
          description: 'Certificate added',
          time: certificate.createdAt ? new Date(certificate.createdAt).toLocaleDateString() : 'Recently',
          icon: FiAward,
          color: 'text-amber-600 dark:text-amber-400',
        });
      });

      // Sort by time (newest first) and take first 10
      newActivities.sort((a, b) => {
        // Parse dates properly
        const dateA = a.time !== 'Recently' ? new Date(a.time).getTime() : 0;
        const dateB = b.time !== 'Recently' ? new Date(b.time).getTime() : 0;
        return dateB - dateA;
      });

      setActivities(newActivities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        products: 0,
        categories: 0,
        messages: 0,
        certificates: 0,
      });
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: t.dashboard.totalProducts,
      value: stats.products,
      icon: FiPackage,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/15 dark:bg-blue-500/20 ring-1 ring-blue-500/20',
    },
    {
      title: t.dashboard.totalCategories,
      value: stats.categories,
      icon: FiLayers,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/15 dark:bg-emerald-500/20 ring-1 ring-emerald-500/20',
    },
    {
      title: t.dashboard.totalMessages,
      value: stats.messages,
      icon: FiMail,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-500/15 dark:bg-violet-500/20 ring-1 ring-violet-500/20',
    },
    {
      title: t.dashboard.totalCertificates,
      value: stats.certificates,
      icon: FiAward,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/15 dark:bg-amber-500/20 ring-1 ring-amber-500/20',
    },
  ];

  return (
    <Layout title={t.nav.dashboard}>
      <FadeIn className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t.nav.dashboard}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {language === 'ar'
            ? 'مرحباً بعودتك! إليك نظرة عامة على لوحة التحكم.'
            : "Welcome back! Here's your dashboard overview."}
        </p>
      </FadeIn>

      {loading ? (
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} animate={false}>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <StaggerGrid className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <StaggerItem key={index}>
                <Card hoverable>
                  <CardBody className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {card.title}
                        </p>
                        <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
                          {card.value}
                        </p>
                      </div>
                      <div className={`rounded-xl p-3 ${card.bgColor}`}>
                        <Icon className={`h-7 w-7 ${card.color}`} />
                      </div>
                    </div>
                    <div className="border-t border-white/40 pt-2 dark:border-white/10">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'ar' ? 'تم التحديث للتو' : 'Updated just now'}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      )}

      <FadeIn delay={0.2}>
        <Card hoverable={false}>
          <div className="glass-card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t.dashboard.recentActivity}
            </h2>
          </div>
          <CardBody>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <div className={`p-3 rounded-full ${activity.color} bg-gray-100 dark:bg-gray-600`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.description}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {activity.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">{t.common.noData}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </FadeIn>
    </Layout>
  );
};

export default Dashboard;
