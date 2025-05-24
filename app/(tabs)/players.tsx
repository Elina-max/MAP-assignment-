import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Player, playerService, teamService } from '@/services/supabaseRest';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data for players
const initialPlayers = [
  { 
    id: '1', 
    name: 'David Muller', 
    team: 'Windhoek Warriors', 
    position: 'Forward', 
    goals: 12, 
    assists: 8, 
    yellow_cards: 1, 
    red_cards: 0,
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  { 
    id: '2', 
    name: 'Sophia Nekwaya', 
    team: 'Swakopmund Strikers', 
    position: 'Midfielder', 
    goals: 8, 
    assists: 14, 
    yellow_cards: 2, 
    red_cards: 0,
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  { 
    id: '3', 
    name: 'Thomas Shilongo', 
    team: 'Walvis Bay Wolves', 
    position: 'Defender', 
    goals: 2, 
    assists: 5, 
    yellow_cards: 3, 
    red_cards: 1,
    image: 'https://randomuser.me/api/portraits/men/67.jpg'
  },
  { 
    id: '4', 
    name: 'Anna Shipanga', 
    team: 'Otjiwarongo Owls', 
    position: 'Goalkeeper', 
    goals: 0, 
    assists: 0, 
    yellow_cards: 0, 
    red_cards: 0,
    image: 'https://randomuser.me/api/portraits/women/28.jpg'
  },
];

// Mock data for teams (for registration dropdown)
const teams = [
  'Windhoek Warriors', 
  'Swakopmund Strikers', 
  'Walvis Bay Wolves', 
  'Otjiwarongo Owls'
];

export default function PlayersScreen() {
  const colorScheme = useColorScheme();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ 
    id: '',
    name: '', 
    team_id: '', 
    position: '',
    jersey_number: 0
  });
  const [teamsList, setTeamsList] = useState<string[]>([]);
  const [teamsData, setTeamsData] = useState<any[]>([]);
  
  // Position options for dropdown
  const positions = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Utility'];
  
  // Load players and teams on component mount
  React.useEffect(() => {
    loadPlayers();
    loadTeams();
  }, []);
  
  // Reload teams whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('Players screen focused, reloading teams');
      loadTeams();
      return () => {};
    }, [])
  );
  
  const loadPlayers = async () => {
    setLoading(true);
    try {
      const fetchedPlayers = await playerService.getPlayers();
      setPlayers(fetchedPlayers || []);
    } catch (error) {
      console.error('Error loading players:', error);
      Alert.alert('Error', 'Failed to load players. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const loadTeams = async () => {
    try {
      // Get teams from our teamService
      const fetchedTeams = await teamService.getTeams();
      if (fetchedTeams && fetchedTeams.length > 0) {
        // Save the full teams data
        setTeamsData(fetchedTeams);
        // Extract team names for the dropdown
        const teamNames = fetchedTeams.map(team => team.name);
        console.log('Loaded teams for dropdown:', teamNames);
        setTeamsList(teamNames);
      } else {
        // Fallback to mock data if no teams found
        setTeamsList(teams);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      setTeamsList(teams); // Use mock data as fallback
    }
  };

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (player.team_id && player.team_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterPlayer = async () => {
    if (!newPlayer.name || !newPlayer.team_id || !newPlayer.position) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Find the actual team ID from the team name
      let teamId = newPlayer.team_id;
      const selectedTeam = teamsData.find(team => team.name === teamId);
      if (selectedTeam && selectedTeam.id) {
        teamId = selectedTeam.id;
      }
      
      // Prepare the player data according to the interface
      const playerData: Partial<Player> = {
        name: newPlayer.name,
        team_id: teamId,
        position: newPlayer.position,
        jersey_number: newPlayer.jersey_number || Math.floor(Math.random() * 99) + 1,
        stats: {
          goals: 0,
          assists: 0
        }
      };
      
      let result;
      
      if (newPlayer.id) {
        // We're updating an existing player
        console.log('Updating player:', newPlayer.id);
        result = await playerService.updatePlayer(newPlayer.id, playerData);
        if (result) {
          Alert.alert('Success', 'Player updated successfully!');
        }
      } else {
        // We're creating a new player
        console.log('Creating new player');
        const createData = {
          ...playerData,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        } as Player;
        
        result = await playerService.createPlayer(createData);
        if (result) {
          Alert.alert('Success', 'Player registered successfully!');
        }
      }
      
      // Reset form and reload players
      setNewPlayer({ id: '', name: '', team_id: '', position: '', jersey_number: 0 });
      setShowRegistrationForm(false);
      loadPlayers();
    } catch (error) {
      console.error(newPlayer.id ? 'Error updating player:' : 'Error registering player:', error);
      Alert.alert('Error', newPlayer.id ? 'Failed to update player. Please try again.' : 'Failed to register player. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teamsData.find(t => t.id === teamId);
    return team ? team.name : teamId;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <AppHeader title="Players" />
        <TouchableOpacity 
          style={[styles.registerButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={() => setShowRegistrationForm(!showRegistrationForm)}
        >
          <Text style={styles.registerButtonText}>
            {showRegistrationForm ? 'Cancel' : 'Register Player'}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.searchInput, { 
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          color: Colors[colorScheme ?? 'light'].text,
          borderColor: Colors[colorScheme ?? 'light'].border
        }]}
        placeholder="Search players..."
        placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {showRegistrationForm && (
        <View style={[styles.registrationForm, { 
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderColor: Colors[colorScheme ?? 'light'].border
        }]}>
          <Text style={[styles.formTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Player Registration
          </Text>
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].border
            }]}
            placeholder="Player Name"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={newPlayer.name}
            onChangeText={(text) => setNewPlayer({...newPlayer, name: text})}
          />
          
          {/* Simple dropdown simulation */}
          <View style={[styles.dropdownContainer, { 
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderColor: Colors[colorScheme ?? 'light'].border
          }]}>
            <Text style={[styles.dropdownLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Select Team:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamOptions}>
              {teamsList.map((team, index) => (
                <TouchableOpacity 
                  key={team}
                  style={[
                    styles.teamOption, 
                    newPlayer.team_id === team && { backgroundColor: Colors[colorScheme ?? 'light'].tint }
                  ]}
                  onPress={() => setNewPlayer({...newPlayer, team_id: team})}
                >
                  <Text style={[
                    styles.teamOptionText, 
                    newPlayer.team_id === team && { color: 'white' }
                  ]}>
                    {team}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Position Dropdown */}
          <View style={[styles.dropdownContainer, { 
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderColor: Colors[colorScheme ?? 'light'].border
          }]}>
            <Text style={[styles.dropdownLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Select Position:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamOptions}>
              {positions.map((position) => (
                <TouchableOpacity 
                  key={position}
                  style={[
                    styles.teamOption, 
                    newPlayer.position === position && { backgroundColor: Colors[colorScheme ?? 'light'].tint }
                  ]}
                  onPress={() => setNewPlayer({...newPlayer, position})}
                >
                  <Text style={[
                    styles.teamOptionText, 
                    newPlayer.position === position && { color: 'white' }
                  ]}>
                    {position}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Jersey Number Input */}
          <TextInput
            style={[styles.input, { 
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].border
            }]}
            placeholder="Jersey Number (optional)"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={newPlayer.jersey_number ? newPlayer.jersey_number.toString() : ''}
            onChangeText={(text) => setNewPlayer({...newPlayer, jersey_number: parseInt(text) || 0})}
            keyboardType="numeric"
          />
          
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={handleRegisterPlayer}
          >
            <Text style={styles.submitButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.playersList}>
        {filteredPlayers.map(player => (
          <View 
            key={player.id} 
            style={[styles.playerCard, { 
              backgroundColor: Colors[colorScheme ?? 'light'].card,
              borderColor: Colors[colorScheme ?? 'light'].border
            }]}
          >
            <View style={styles.playerHeader}>
              <Image 
                source={{ uri: `https://randomuser.me/api/?nat=gb&gender=${Math.random() > 0.5 ? 'men' : 'women'}/${parseInt(player.id) % 99}.jpg` }} 
                style={styles.playerImage} 
              />
              <View style={styles.playerInfo}>
                <Text style={[styles.playerName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {player.name}
                </Text>
                <Text style={[styles.playerTeam, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  #{player.jersey_number} • {player.position}
                </Text>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.cardStatValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {player.stats?.goals || 0}
                </Text>
                <Text style={[styles.cardStatLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  Goals
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.cardStatValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {player.stats?.assists || 0}
                </Text>
                <Text style={[styles.cardStatLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  Assists
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.cardStatValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {player.jersey_number}
                </Text>
                <Text style={[styles.cardStatLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  Jersey #
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.cardStatValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {player.team_id ? getTeamName(player.team_id) : '-'}
                </Text>
                <Text style={[styles.cardStatLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  Team
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.viewButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
              onPress={() => {
                Alert.alert(
                  'Player Profile',
                  `View and manage ${player.name}'s profile`,
                  [
                    {
                      text: 'Edit',
                      onPress: () => {
                        // Populate form with player data for editing
                        setNewPlayer({
                          id: player.id,
                          name: player.name,
                          team_id: player.team_id || '',
                          position: player.position,
                          jersey_number: player.jersey_number || 0
                        });
                        setShowRegistrationForm(true);
                      }
                    },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await playerService.deletePlayer(player.id);
                          Alert.alert('Success', 'Player deleted successfully');
                          loadPlayers(); // Reload the list
                        } catch (error) {
                          console.error('Error deleting player:', error);
                          Alert.alert('Error', 'Failed to delete player');
                        }
                      }
                    },
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    }
                  ]
                );
              }}
            >
              <Text style={styles.viewButtonText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  playerDetailSection: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 100,
  },
  detailValue: {
    flex: 1,
  },
  playerStats: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeModalButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  noDataContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  addFirstButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  playerPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  registerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'absolute',
    right: 16,
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  playersList: {
    paddingHorizontal: 16,
  },
  playerCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerTeam: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  cardStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardStatLabel: {
    fontSize: 12,
  },
  viewButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  registrationForm: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  dropdownLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  teamOptions: {
    flexDirection: 'row',
  },
  teamOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  teamOptionText: {
    color: '#333',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
