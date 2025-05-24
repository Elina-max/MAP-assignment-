import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useChatContext } from '@/contexts/ChatContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ChatBadgeProps {
  size?: number;
}

export const ChatBadge: React.FC<ChatBadgeProps> = ({ size = 18 }) => {
  const { unreadCount } = useChatContext();
  const colorScheme = useColorScheme();

  if (unreadCount === 0) {
    return null;
  }

  // Format the count for display (e.g., show 9+ if more than 9)
  const displayCount = unreadCount > 9 ? '9+' : unreadCount.toString();

  return (
    <View style={[
      styles.badge,
      { 
        width: size, 
        height: size,
        borderRadius: size / 2,
        backgroundColor: Colors[colorScheme ?? 'light'].tint,
        // Adjust position for larger numbers
        right: displayCount.length > 1 ? -6 : -4,
      }
    ]}>
      <Text style={styles.badgeText}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ChatBadge;
