import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AppHeader from '@/components/AppHeader';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useChatContext } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';

// Define the ChatMessage interface
interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_email: string; // Added email for better identification
  message: string;
  is_admin: boolean;
  created_at: string;
  read_by_ids: string[];
}

// User data should come from the AuthContext

// Global Chat Screen - All users can see all messages
export default function ChatScreen() {
  // Get the current user from AuthContext
  const { user } = useAuth();
  
  // Create a chat user object that updates when auth changes
  const [currentUser, setCurrentUser] = useState({
    id: 'anonymous',
    name: 'Anonymous User',
    email: '',
    is_admin: false
  });
  
  // Update current user whenever the auth user changes
  useEffect(() => {
    console.log('Auth user changed:', user?.email || 'No user');
    if (user) {
      const newUser = {
        id: user.id,
        name: user.email.split('@')[0], // Username part of email
        email: user.email,
        is_admin: user.role === 'admin' || false
      };
      console.log('Setting current user to:', newUser.email);
      setCurrentUser(newUser);
    } else {
      // Reset to anonymous if logged out
      console.log('Setting current user to anonymous');
      setCurrentUser({
        id: 'anonymous',
        name: 'Anonymous User',
        email: '',
        is_admin: false
      });
    }
  }, [user]);
  
  // Reset messages when user changes to avoid showing previous user's messages as current user
  useEffect(() => {
    console.log('Current user changed, refreshing messages');
    fetchMessages(true);
  }, [currentUser.id]);
  const colorScheme = useColorScheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { resetUnreadCount, setLastMessage } = useChatContext();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const windowHeight = Dimensions.get('window').height;
  
  // Listen for keyboard events to adjust the UI
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    
    // Reset unread count when chat screen is opened
    resetUnreadCount();
    
    // Set up a timer to periodically check for new messages
    const intervalId = setInterval(() => {
      fetchMessages(false);
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [resetUnreadCount]);

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      // In a real implementation, this would use the chatService
      // const fetchedMessages = await chatService.getMessages();
      
      // For now, we'll use mock data or local storage
      const storedMessagesJson = await AsyncStorage.getItem('local_chat_messages');
      let fetchedMessages: ChatMessage[] = [];
      
      if (storedMessagesJson) {
        fetchedMessages = JSON.parse(storedMessagesJson);
      } else {
        // Sample mock data if no messages exist
        fetchedMessages = [
          {
            id: '1',
            sender_id: 'admin1',
            sender_name: 'Admin',
            sender_email: 'admin@namibiahockey.com',
            message: 'Welcome to the Global Hockey Chat! All messages are visible to everyone.',
            is_admin: true,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            read_by_ids: [currentUser.id]
          },
          {
            id: '2',
            sender_id: 'coach456',
            sender_name: 'Coach Johnson',
            sender_email: 'coach.johnson@namibiahockey.com',
            message: 'Hi everyone! Use this chat to communicate with the whole team.',
            is_admin: false,
            created_at: new Date(Date.now() - 3000000).toISOString(),
            read_by_ids: [currentUser.id]
          }
        ];
        
        // Store the mock data
        await AsyncStorage.setItem('local_chat_messages', JSON.stringify(fetchedMessages));
      }
      
      // Sort messages by date
      fetchedMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_email: currentUser.email, // Include email in the message
      message: messageText.trim(),
      is_admin: currentUser.is_admin,
      created_at: new Date().toISOString(),
      read_by_ids: [currentUser.id]
    };
    
    try {
      // In a real implementation, this would use the chatService
      // await chatService.sendMessage(newMessage);
      
      // For now, we'll just update local storage
      const updatedMessages = [...messages, newMessage];
      await AsyncStorage.setItem('local_chat_messages', JSON.stringify(updatedMessages));
      
      // Update state
      setMessages(updatedMessages);
      setMessageText('');
      
      // Set the last message for notifications to other users
      setLastMessage({
        sender: `${currentUser.name} (${currentUser.email})`,
        message: newMessage.message
      });
      
      // Scroll to the bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isCurrentUser = item.sender_id === currentUser.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          { backgroundColor: isCurrentUser 
            ? Colors[colorScheme ?? 'light'].tint 
            : item.is_admin 
              ? Colors[colorScheme ?? 'light'].adminBubble 
              : Colors[colorScheme ?? 'light'].otherBubble 
          }
        ]}>
          <ThemedText style={[styles.senderName, isCurrentUser ? styles.currentUserName : null]}>
            {item.sender_name} {item.is_admin && '(Admin)'}
          </ThemedText>
          <ThemedText style={[styles.senderEmail, isCurrentUser ? styles.currentUserEmail : null]}>
            {item.sender_email}
          </ThemedText>
          <ThemedText style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {item.message}
          </ThemedText>
          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime
          ]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  const renderDateSeparator = (date: string) => (
    <View style={styles.dateSeparator}>
      <ThemedText style={styles.dateSeparatorText}>{date}</ThemedText>
    </View>
  );

  const renderMessageItem = ({ item, index }: { item: ChatMessage, index: number }) => {
    const currentDate = formatDate(item.created_at);
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const previousDate = previousMessage ? formatDate(previousMessage.created_at) : null;
    
    return (
      <>
        {(!previousDate || currentDate !== previousDate) && renderDateSeparator(currentDate)}
        {renderMessage({ item })}
      </>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages(false);
  };

  // Calculate the bottom padding to ensure the input is above the tab bar
  const tabBarHeight = 49; // Standard tab bar height
  const bottomPadding = Platform.OS === 'ios' ? 34 : 0; // Extra padding for iPhone X+ models
  const safeAreaBottom = tabBarHeight + bottomPadding;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Global Team Chat" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={styles.loadingText}>Loading messages...</ThemedText>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages ?? []}
            renderItem={renderMessageItem}
            keyExtractor={(item, index) => item.id ?? `${index}`}
            style={styles.messagesList}
            contentContainerStyle={[styles.messagesListContent, 
              { paddingBottom: keyboardVisible ? keyboardHeight : safeAreaBottom + 60 }
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors[colorScheme ?? 'light'].tint]}
                tintColor={Colors[colorScheme ?? 'light'].tint}
              />
            }
            onContentSizeChange={() => {
              if (!keyboardVisible) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
            onLayout={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
          />
        )}
        
        <View style={[styles.inputContainer, { marginBottom: keyboardVisible ? 0 : safeAreaBottom }]}>
          <TextInput
            style={[
              styles.input,
              { 
                color: Colors[colorScheme ?? 'light'].text,
                backgroundColor: Colors[colorScheme ?? 'light'].inputBackground,
                borderColor: Colors[colorScheme ?? 'light'].border
              }
            ]}
            placeholder="Type a message to the team..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].placeholderText}
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              { backgroundColor: Colors[colorScheme ?? 'light'].tint }
            ]} 
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <IconSymbol name="arrow.up.circle.fill" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 8,
  },
  currentUserBubble: {
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 1,
  },
  senderEmail: {
    fontSize: 11,
    marginBottom: 3,
    opacity: 0.8,
  },
  currentUserEmail: {
    textAlign: 'right',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentUserText: {
    color: 'white',
  },
  otherUserText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  currentUserName: {
    color: 'white',
    textAlign: 'right',
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Username dialog styles
  usernameDialogContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  usernameDialog: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  usernameDialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  usernameDialogSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  usernameInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  usernameButton: {
    width: '100%',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  usernameButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});