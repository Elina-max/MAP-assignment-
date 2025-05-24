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
  Dimensions,
  ScrollView
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
import { HockeyAnswers, SuggestedQuestions, findHockeyAnswer } from '@/constants/HockeyHelp';

// Define the ChatMessage interface
interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  is_bot: boolean;
  created_at: string;
}

// Help Chat Screen - Hockey Q&A Chatbot
export default function ChatScreen() {
  // Get the current user from AuthContext
  const { user } = useAuth();
  
  // Create a chat user object that updates when auth changes
  const [currentUser, setCurrentUser] = useState({
    id: 'anonymous',
    name: 'Anonymous User',
    is_admin: false
  });
  
  // Update current user whenever the auth user changes
  useEffect(() => {
    if (user) {
      const newUser = {
        id: user.id,
        name: user.email.split('@')[0], // Username part of email
        is_admin: user.role === 'admin' || false
      };
      setCurrentUser(newUser);
    } else {
      // Reset to anonymous if logged out
      setCurrentUser({
        id: 'anonymous',
        name: 'Anonymous User',
        is_admin: false
      });
    }
  }, [user]);
  
  const colorScheme = useColorScheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { resetUnreadCount } = useChatContext();
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

  // Initialize chat with welcome message
  useEffect(() => {
    initializeChat();
    
    // Reset unread count when chat screen is opened
    resetUnreadCount();
  }, [resetUnreadCount]);

  const initializeChat = async () => {
    setLoading(true);
    
    try {
      // Check if there are saved messages
      const storedMessagesJson = await AsyncStorage.getItem('hockey_help_messages');
      let initialMessages: ChatMessage[] = [];
      
      if (storedMessagesJson) {
        initialMessages = JSON.parse(storedMessagesJson);
      } else {
        // Welcome message
        initialMessages = [
          {
            id: '1',
            sender_id: 'bot',
            sender_name: 'Hockey Helper',
            message: 'Welcome to the Hockey Help Chat! Ask me any questions about hockey and I\'ll try to help you. You can also check out some suggested questions below.',
            is_bot: true,
            created_at: new Date().toISOString()
          }
        ];
        
        // Store the initial messages
        await AsyncStorage.setItem('hockey_help_messages', JSON.stringify(initialMessages));
      }
      
      // Sort messages by date
      initialMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      setMessages(initialMessages);
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      message: messageText.trim(),
      is_bot: false,
      created_at: new Date().toISOString()
    };
    
    // Clear input field immediately for better UX
    setMessageText('');
    
    // Update messages with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    try {
      // Get bot response
      setTimeout(() => {
        generateBotResponse(userMessage.message);
      }, 500);
      
      // Scroll to the bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  const generateBotResponse = async (userQuery: string) => {
    // Try to find a matching answer
    const answer = findHockeyAnswer(userQuery);
    
    let botResponse: ChatMessage;
    
    if (answer) {
      // We found a matching answer
      botResponse = {
        id: `bot-${Date.now()}`,
        sender_id: 'bot',
        sender_name: 'Hockey Helper',
        message: answer.answer,
        is_bot: true,
        created_at: new Date().toISOString()
      };
    } else {
      // No matching answer found
      botResponse = {
        id: `bot-${Date.now()}`,
        sender_id: 'bot',
        sender_name: 'Hockey Helper',
        message: "I'm sorry, I don't have information about that specific hockey question. Please try rephrasing or ask me about rules, equipment, positions, or local hockey in Namibia.",
        is_bot: true,
        created_at: new Date().toISOString()
      };
    }
    
    // Add bot response to messages - use a callback to ensure we're working with the latest state
    setMessages(currentMessages => {
      const updatedMessages = [...currentMessages, botResponse];
      
      // Store the updated messages
      AsyncStorage.setItem('hockey_help_messages', JSON.stringify(updatedMessages))
        .catch(error => console.error('Error saving messages:', error));
      
      return updatedMessages;
    });
    
    // Scroll to the bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSuggestedQuestionPress = (question: string) => {
    setMessageText(question);
    // Optional: Auto-send the question
    // setTimeout(() => {
    //   handleSendMessage();
    // }, 100);
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
    const isCurrentUser = !item.is_bot;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.botMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.botBubble,
          { 
            backgroundColor: isCurrentUser 
              ? Colors[colorScheme ?? 'light'].tint 
              : Colors[colorScheme ?? 'light'].adminBubble 
          }
        ]}>
          <ThemedText style={[styles.senderName, isCurrentUser ? styles.currentUserName : null]}>
            {item.sender_name}
          </ThemedText>
          <ThemedText style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.botText
          ]}>
            {item.message}
          </ThemedText>
          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.currentUserTime : styles.botTime
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
    initializeChat();
  };

  const renderSuggestedQuestions = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.suggestedQuestionsContainer}
    >
      {SuggestedQuestions.map((question, index) => (
        <TouchableOpacity 
          key={index} 
          style={[
            styles.suggestedQuestion,
            { backgroundColor: Colors[colorScheme ?? 'light'].cardLight }
          ]}
          onPress={() => handleSuggestedQuestionPress(question)}
        >
          <Text 
            style={[
              styles.suggestedQuestionText,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}
            numberOfLines={2}
          >
            {question}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Calculate the bottom padding to ensure the input is above the tab bar
  const tabBarHeight = 49; // Standard tab bar height
  const bottomPadding = Platform.OS === 'ios' ? 34 : 0; // Extra padding for iPhone X+ models
  const safeAreaBottom = tabBarHeight + bottomPadding;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Hockey Help" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={styles.loadingText}>Loading help chat...</ThemedText>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages ?? []}
            renderItem={renderMessageItem}
            keyExtractor={(item, index) => item.id ?? `${index}`}
            style={styles.messagesList}
            contentContainerStyle={[styles.messagesListContent, 
              { paddingBottom: keyboardVisible ? keyboardHeight : safeAreaBottom + 120 }
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors[colorScheme ?? 'light'].tint]}
                tintColor={Colors[colorScheme ?? 'light'].tint}
              />
            }
            ListHeaderComponent={renderSuggestedQuestions}
            onContentSizeChange={() => {
              if (messages.length > 1) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            onLayout={() => {
              if (messages.length > 1) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
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
            placeholder="Ask a question about hockey..."
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
  botMessage: {
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
  botBubble: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentUserText: {
    color: 'white',
  },
  botText: {
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
  botTime: {
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
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  suggestedQuestionsContainer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  suggestedQuestion: {
    padding: 12,
    borderRadius: 16,
    marginRight: 8,
    minWidth: 150,
    maxWidth: 200,
  },
  suggestedQuestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});