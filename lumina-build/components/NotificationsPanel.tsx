import React from 'react';
import { Notification } from '../types';
import { GlassCard } from './GlassCard';
import { Bell, AlertTriangle, Info, AlertCircle, X, Check, Trash2 } from 'lucide-react';
import { markNotificationRead, clearAllNotifications } from '../services/hubitatService';

interface NotificationsPanelProps {
  notifications: Notification[];
  onUpdate: () => void;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications, 
  onUpdate,
  onClose 
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={16} className="text-red-400" />;
      case 'warning': return <AlertCircle size={16} className="text-yellow-400" />;
      case 'info': return <Info size={16} className="text-blue-400" />;
    }
  };

  const getBgColor = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-white/5';
    switch (type) {
      case 'alert': return 'bg-red-500/10 border-l-2 border-red-500';
      case 'warning': return 'bg-yellow-500/10 border-l-2 border-yellow-500';
      case 'info': return 'bg-blue-500/10 border-l-2 border-blue-500';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    onUpdate();
  };

  const handleClearAll = () => {
    if (confirm('Limpar todas as notificações?')) {
      clearAllNotifications();
      onUpdate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <GlassCard className="relative w-full max-w-md max-h-[70vh] overflow-hidden bg-black/90 border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={20} className="text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Notificações</h3>
              <p className="text-[10px] text-white/50">{unreadCount} não lidas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title="Limpar tudo"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(70vh-80px)] p-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/30">
              <Bell size={32} className="mb-3 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg ${getBgColor(notification.type, notification.read)} transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.read ? 'text-white/60' : 'text-white'}`}>
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-white/40 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-green-400 transition-colors"
                        title="Marcar como lida"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default NotificationsPanel;
