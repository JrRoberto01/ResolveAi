import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUnreadNotificationCount } from '../../api/notifications.api';
import { colors } from '../../style/colors';
import { styles } from './HeaderStyle';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotification?: boolean;
  onNotificationPress?: () => void;
}

export function Header({ title, showBack, onBack, showNotification, onNotificationPress }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadUnreadCount() {
      if (!showNotification) {
        return;
      }

      try {
        const count = await getUnreadNotificationCount();

        if (isMounted) {
          setUnreadCount(count);
        }
      } catch {
        if (isMounted) {
          setUnreadCount(0);
        }
      }
    }

    void loadUnreadCount();
    const interval = setInterval(() => {
      void loadUnreadCount();
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showNotification]);

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconSpacer} />
      )}

      <Text style={styles.title}>{title}</Text>

      {showNotification ? (
        <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {unreadCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ) : (
        <View style={styles.iconSpacer} />
      )}
    </View>
  );
}
