import AppHeader from '@/components/AppHeader';
import ChatNotification from '@/components/ChatNotification';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useChatContext } from '@/contexts/ChatContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data for live matches
const liveMatches = [
  {
    id: '1',
    homeTeam: 'Wanderers',
    awayTeam: 'WOBSC',
    homeScore: 3,
    awayScore: 2,
    period: '3rd Quarter',
    time: '5:23',
    location: 'Wanderers Sports Ground',
  },
  {
    id: '2',
    homeTeam: 'NUST',
    awayTeam: 'West Coast Wolves',
    homeScore: 1,
    awayScore: 1,
    period: '2nd Quarter',
    time: '8:45',
    location: 'Windhoek High School Stadium',
  },
];

// Mock data for upcoming matches
const upcomingMatches = [
  {
    id: '3',
    homeTeam: 'Masters Ladies',
    awayTeam: 'SoEHC',
    date: '2025-05-15',
    time: '15:00',
    location: 'Windhoek High School Stadium',
  },
  {
    id: '4',
    homeTeam: 'Coastal Raiders',
    awayTeam: 'DTS',
    date: '2025-05-16',
    time: '14:30',
    location: 'MTC DOME',
  },
  {
    id: '5',
    homeTeam: 'Saints',
    awayTeam: 'NUST',
    date: '2025-05-18',
    time: '16:00',
    location: 'WAP astro',
  },
];

// Mock data for match highlights
const matchHighlights = [
  {
    id: '1',
    title: 'National Championship Finals',
    description: 'Saints defeat Coastal Raiders in an exciting final match',
    thumbnail: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    date: '2025-04-30',
  },
  {
    id: '2',
    title: 'Youth Tournament Highlights',
    description: 'Young talents showcase their skills in the annual youth tournament',
    thumbnail: 'https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    date: '2025-04-25',
  },
  {
    id: '3',
    title: 'Coastal Cup Semifinals',
    description: 'West Coast Wolves secure their place in the finals with a last-minute goal',
    thumbnail: 'https://images.unsplash.com/photo-1519766304817-4f37bda74b38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    date: '2025-04-20',
  },
];

// Mock data for notifications
const notifications = [
  {
    id: '1',
    title: 'Match Starting Soon',
    message: 'Saints vs NUST starts in 30 minutes',
    time: '30 min ago',
  },
  {
    id: '2',
    title: 'Goal Alert!',
    message: 'David Muller scores for Saints!',
    time: '45 min ago',
  },
  {
    id: '3',
    title: 'Registration Reminder',
    message: 'National Championship registration closes tomorrow',
    time: '2 hours ago',
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [scoreAnimation] = useState(new Animated.Value(1));
  const [showChatNotification, setShowChatNotification] = useState(false);
  const [chatNotification, setChatNotification] = useState({ sender: '', message: '' });
  const { incrementUnreadCount, lastMessage } = useChatContext();

  // We've removed the auto message notification as requested
  // Users will only see real messages
  
  // Display notifications when new messages are received in the global chat
  useEffect(() => {
    if (lastMessage && lastMessage.sender && lastMessage.message) {
      setChatNotification({
        sender: lastMessage.sender,
        message: lastMessage.message
      });
      setShowChatNotification(true);
      incrementUnreadCount();
    }
  }, [lastMessage, incrementUnreadCount]);

  // Simulate live score updates with animation
  useEffect(() => {
    const interval = setInterval(() => {
      // Animate score change
      Animated.sequence([
        Animated.timing(scoreAnimation, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scoreAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {showChatNotification && (
        <ChatNotification
          sender={chatNotification.sender}
          message={chatNotification.message}
          onDismiss={() => setShowChatNotification(false)}
        />
      )}

      <View style={styles.header}>
        <AppHeader 
          title="Namibia Hockey" 
          subtitle="Stay updated with the latest matches" 
        />
        
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <View style={styles.profileIcon}>
            <IconSymbol size={24} name="person.crop.circle" color={Colors[colorScheme ?? 'light'].text} />
          </View>
        </TouchableOpacity>

      </View>
      
      <TouchableOpacity 
        style={[styles.chatButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
        onPress={() => router.push('/chat')}
      >
        <IconSymbol name="questionmark.circle.fill" size={20} color="white" />
        <Text style={styles.chatButtonText}>Need help?</Text>
      </TouchableOpacity>

      {showNotifications && (
        <View style={[styles.notificationsContainer, { 
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderColor: Colors[colorScheme ?? 'light'].border
        }]}>
          <View style={styles.notificationsHeader}>
            <Text style={[styles.notificationsTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Notifications</Text>
            <TouchableOpacity>
              <Text style={[styles.clearAllText, { color: Colors[colorScheme ?? 'light'].tint }]}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {notifications.map(notification => (
            <View 
              key={notification.id} 
              style={[styles.notificationItem, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}
            >
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {notification.title}
                </Text>
                <Text style={[styles.notificationMessage, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {notification.message}
                </Text>
                <Text style={[styles.notificationTime, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  {notification.time}
                </Text>
              </View>
              <TouchableOpacity>
                <IconSymbol size={16} name="xmark" color={Colors[colorScheme ?? 'light'].tabIconDefault} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { 
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderColor: Colors[colorScheme ?? 'light'].border
        }]}>
          <IconSymbol size={20} name="magnifyingglass" color={Colors[colorScheme ?? 'light'].tabIconDefault} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Search teams, players, matches..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Live Matches Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Live Matches</Text>
            <View style={[styles.liveBadge, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.liveMatchesContainer}>
            {liveMatches.map(match => (
              <View 
                key={match.id} 
                style={[styles.liveMatchCard, { 
                  backgroundColor: Colors[colorScheme ?? 'light'].card,
                  borderColor: Colors[colorScheme ?? 'light'].border
                }]}
              >
                <View style={styles.matchTeams}>
                  <Text style={[styles.teamName, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {match.homeTeam}
                  </Text>
                  <Text style={[styles.vsText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>VS</Text>
                  <Text style={[styles.teamName, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {match.awayTeam}
                  </Text>
                </View>

                <View style={styles.scoreContainer}>
                  <Animated.Text 
                    style={[styles.scoreText, { 
                      color: Colors[colorScheme ?? 'light'].text,
                      transform: [{ scale: scoreAnimation }]
                    }]}
                  >
                    {match.homeScore} - {match.awayScore}
                  </Animated.Text>
                </View>

                <View style={styles.matchInfo}>
                  <Text style={[styles.periodText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                    {match.period} • {match.time}
                  </Text>
                  <Text style={[styles.locationText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                    {match.location}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[styles.watchButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                >
                  <Text style={styles.watchButtonText}>Watch Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Matches Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Upcoming Matches</Text>

          {upcomingMatches.map(match => (
            <View 
              key={match.id} 
              style={[styles.upcomingMatchCard, { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderColor: Colors[colorScheme ?? 'light'].border
              }]}
            >
              <View style={styles.upcomingMatchDate}>
                <Text style={[styles.upcomingMatchDay, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {formatDate(match.date)}
                </Text>
                <Text style={[styles.upcomingMatchTime, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  {match.time}
                </Text>
              </View>

              <View style={styles.upcomingMatchTeams}>
                <Text style={[styles.upcomingTeamName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {match.homeTeam}
                </Text>
                <Text style={[styles.upcomingVsText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>vs</Text>
                <Text style={[styles.upcomingTeamName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {match.awayTeam}
                </Text>
              </View>

              <View style={styles.upcomingMatchLocation}>
                <IconSymbol size={16} name="mappin" color={Colors[colorScheme ?? 'light'].tabIconDefault} />
                <Text style={[styles.upcomingLocationText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  {match.location}
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.reminderButton, { borderColor: Colors[colorScheme ?? 'light'].tint }]}
              >
                <Text style={[styles.reminderButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>Set Reminder</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Match Highlights Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Match Highlights</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsContainer}>
            {matchHighlights.map(highlight => (
              <TouchableOpacity 
                key={highlight.id} 
                style={[styles.highlightCard, { 
                  backgroundColor: Colors[colorScheme ?? 'light'].card,
                  borderColor: Colors[colorScheme ?? 'light'].border
                }]}
              >
                <ExpoImage source={{ uri: highlight.thumbnail }} style={styles.highlightThumbnail} />
                <View style={styles.playButton}>
                  <IconSymbol size={24} name="play.fill" color="white" />
                </View>

                <View style={styles.highlightInfo}>
                  <Text style={[styles.highlightTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={1}>
                    {highlight.title}
                  </Text>
                  <Text style={[styles.highlightDate, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                    {formatDate(highlight.date)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  notificationIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  profileIcon: {
    padding: 1,
    marginRight: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#CC0000',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  notificationsContainer: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: '90%',
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearAllText: {
    fontSize: 14,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  liveMatchesContainer: {
    flexDirection: 'row',
    marginLeft: -8,
    paddingLeft: 8,
  },
  liveMatchCard: {
    width: 280,
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
  },
  matchTeams: {
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 12,
    marginVertical: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  matchInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  periodText: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
  },
  watchButton: {
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  watchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  upcomingMatchCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  upcomingMatchDate: {
    marginBottom: 8,
  },
  upcomingMatchDay: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  upcomingMatchTime: {
    fontSize: 14,
  },
  upcomingMatchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingTeamName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  upcomingVsText: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  upcomingMatchLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  upcomingLocationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  reminderButton: {
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  reminderButtonText: {
    fontWeight: 'bold',
  },
  highlightsContainer: {
    flexDirection: 'row',
    marginLeft: -8,
    paddingLeft: 8,
  },
  highlightCard: {
    width: 200,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  highlightThumbnail: {
    width: '100%',
    height: 120,
  },
  playButton: {
    position: 'absolute',
    top: 48,
    left: 88,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightInfo: {
    padding: 12,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  highlightDate: {
    fontSize: 12,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
