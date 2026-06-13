import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Button, Input, Card, CardBody } from '@/components';
import { useAppStore } from '@/store';
import { translations } from '@/lib/translations';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiEye, FiCheckCircle, FiTrash2, FiMail, FiInbox, FiSearch, FiRefreshCw } from 'react-icons/fi';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

type FilterTab = 'all' | 'unread' | 'read';

const Messages = () => {
  const { language } = useAppStore();
  const t = translations[language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Detail Modal
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Confirm Dialog State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await api.get('/admin/contact-messages');
      setMessages(response.data.data || []);
    } catch (error) {
      setMessages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => fetchMessages(true);

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/admin/contact-messages/${id}/read`);
      toast.success(t.common.success);
      fetchMessages();
    } catch (error) {
      toast.error(t.common.error);
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
      await api.delete(`/admin/contact-messages/${deleteId}`);
      toast.success(t.common.success);
      fetchMessages();
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setDeleting(false);
      setShowConfirmDialog(false);
      setDeleteId(null);
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'read', label: 'Read' },
  ];

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.email.toLowerCase().includes(search.toLowerCase()) ||
      (msg.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      msg.message.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'unread') return !msg.is_read;
    if (activeTab === 'read') return msg.is_read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Layout title={t.messages.title}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-0">
          {t.messages.title}
          {unreadCount > 0 && (
            <span className="ml-3 text-sm font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2.5 py-0.5 rounded-full align-middle">
              {unreadCount} {language === 'en' ? 'new' : 'جديد'}
            </span>
          )}
        </h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl transition-all"
          title="Refresh"
        >
          <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <Input
              type="text"
              placeholder={`${t.common.search} ${t.messages.title.toLowerCase()}...`}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-12"
            />
          </div>
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.key === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card animate-pulse">
                  <CardBody>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardBody>
                </div>
              ))}
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <FiInbox className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t.common.noData}</p>
          </div>
        ) : (
          <div className="grid gap-3 p-6">
            {activeTab === 'all' ? (
              <>
                {filteredMessages.filter((m) => !m.is_read).length > 0 && (
                  <div className="mb-2">
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Unread
                    </h3>
                  </div>
                )}
                {filteredMessages
                  .filter((m) => !m.is_read)
                  .map((msg) => (
                    <MessageCard
                      key={msg._id}
                      msg={msg}
                      language={language}
                      formatDate={formatDate}
                      onView={setSelectedMessage}
                      onMarkRead={markAsRead}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                {filteredMessages.filter((m) => m.is_read).length > 0 && (
                  <div className="mb-2 mt-6">
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Read
                    </h3>
                  </div>
                )}
                {filteredMessages
                  .filter((m) => m.is_read)
                  .map((msg) => (
                    <MessageCard
                      key={msg._id}
                      msg={msg}
                      language={language}
                      formatDate={formatDate}
                      onView={setSelectedMessage}
                      onMarkRead={markAsRead}
                      onDelete={handleDeleteClick}
                    />
                  ))}
              </>
            ) : (
              filteredMessages.map((msg) => (
                <MessageCard
                  key={msg._id}
                  msg={msg}
                  language={language}
                  formatDate={formatDate}
                  onView={setSelectedMessage}
                  onMarkRead={markAsRead}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <Modal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title={t.messages.message}
        maxWidth="max-w-2xl"
      >
        {selectedMessage && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {t.messages.name}
                </p>
                <p className="text-gray-900 dark:text-white font-medium">{selectedMessage.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {t.messages.email}
                </p>
                <p className="text-gray-900 dark:text-white">{selectedMessage.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Date
                </p>
                <p className="text-gray-900 dark:text-white">{formatDate(selectedMessage.created_at)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Status
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedMessage.is_read
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}
                >
                  {selectedMessage.is_read ? t.messages.isRead : 'Unread'}
                </span>
              </div>
            </div>

            {selectedMessage.subject && (
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {t.messages.subject}
                </p>
                <p className="text-gray-900 dark:text-white font-medium">{selectedMessage.subject}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                {t.messages.message}
              </p>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/60 dark:border-white/10 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200/60 dark:border-white/10">
              {!selectedMessage.is_read && (
                <Button
                  variant="success"
                  leftIcon={<FiCheckCircle className="w-4 h-4" />}
                  onClick={() => {
                    markAsRead(selectedMessage._id);
                    setSelectedMessage(null);
                  }}
                >
                  {t.messages.markAsRead}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleting}
        variant="danger"
      />
    </Layout>
  );
};

interface MessageCardProps {
  msg: Message;
  language: string;
  formatDate: (date: string) => string;
  onView: (msg: Message) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const MessageCard = ({ msg, language, formatDate, onView, onMarkRead, onDelete }: MessageCardProps) => {
  return (
    <Card className={`relative overflow-hidden ${msg.is_read ? 'opacity-80' : ''}`}>
      <div
        className={`absolute top-0 left-0 w-1 h-full rounded-r-sm ${
          msg.is_read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-primary-500'
        }`}
      />
      <CardBody className={`pl-5 ${language === 'ar' ? '!pr-5 !pl-6' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FiMail className={`w-4 h-4 shrink-0 ${msg.is_read ? 'text-gray-400' : 'text-primary-500'}`} />
              <h3
                className={`truncate ${
                  msg.is_read
                    ? 'text-sm font-medium text-gray-700 dark:text-gray-400'
                    : 'text-sm font-semibold text-gray-900 dark:text-white'
                }`}
              >
                {msg.name}
              </h3>
              {!msg.is_read && (
                <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0"></span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">{msg.email}</p>
            {msg.subject && (
              <p
                className={`text-sm truncate mb-1 ${
                  msg.is_read
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-700 dark:text-gray-300 font-medium'
                }`}
              >
                {msg.subject}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2 mb-2">
              {msg.message}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">{formatDate(msg.created_at)}</p>
          </div>
          <div className="flex items-start space-x-1 shrink-0 pt-1">
            <button
              onClick={() => onView(msg)}
              className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="View"
            >
              <FiEye className="w-4 h-4" />
            </button>
            {!msg.is_read && (
              <button
                onClick={() => onMarkRead(msg._id)}
                className="p-2 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                title="Mark as Read"
              >
                <FiCheckCircle className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(msg._id)}
              className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Delete"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default Messages;