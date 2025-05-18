import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { playerService, Team, teamService } from '@/services/supabaseRest';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Team detail modal component
const TeamDetailModal = ({ team, visible, onClose }: { team: Team | null, visible: boolean, onClose: () => void }) => {
  const colorScheme = useColorScheme();
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (team && visible) {
      loadTeamPlayers(team.id!);
    }
  }, [team, visible]);

  const loadTeamPlayers = async (teamId: string) => {
    setLoading(true);
    try {
      const teamPlayers = await playerService.getPlayersByTeam(teamId);
      setPlayers(teamPlayers);
    } catch (error) {
      console.error('Error loading team players:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!team) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>{team.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 18 }}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.teamDetailSection}>
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Division:</Text>
            <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].text }]}>{team.division}</Text>
          </View>

          <View style={styles.teamDetailSection}>
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Coach:</Text>
            <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].text }]}>{team.coach}</Text>
          </View>

          <View style={styles.teamDetailSection}>
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Players:</Text>
            <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'light'].text }]}>{players.length}</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text, marginTop: 16 }]}>Team Roster</Text>

          {loading ? (
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} style={{ marginTop: 20 }} />
          ) : (
            <ScrollView style={styles.playersList}>
              {players.length > 0 ? (
                players.map((player, index) => (
                  <View key={player.id || index} style={[styles.playerItem, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
                    <Text style={[styles.playerName, { color: Colors[colorScheme ?? 'light'].text }]}>{player.name}</Text>
                    <Text style={[styles.playerPosition, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>{player.position}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.noPlayersText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>No players registered for this team yet.</Text>
              )}
            </ScrollView>
          )}

          <TouchableOpacity 
            style={[styles.closeModalButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={onClose}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function TeamsScreen() {
  const colorScheme = useColorScheme();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [newTeam, setNewTeam] = useState({ id: '', name: '', division: '', coach: '' });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Division options for dropdown
  const divisions = ["Premier", "Division 1", "Division 2", "Junior League", "Women's League"];
  
  // Load teams from Supabase on component mount
  useEffect(() => {
    loadTeams();
  }, []);
  
  const loadTeams = async () => {
    setLoading(true);
    try {
      const teamsData = await teamService.getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading teams:', error);
      Alert.alert('Error', 'Failed to load teams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.coach.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleViewTeamDetails = (team: Team) => {
    setSelectedTeam(team);
    setModalVisible(true);
  };
  
  const handleEditTeam = (team: Team) => {
    setNewTeam({
      id: team.id || '',
      name: team.name,
      division: team.division,
      coach: team.coach
    });
    setIsEditing(true);
    setShowRegistrationForm(true);
  };
  
  const handleDeleteTeam = async (teamId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this team? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const success = await teamService.deleteTeam(teamId);
              if (success) {
                // Remove from local state
                setTeams(teams.filter(team => team.id !== teamId));
                Alert.alert('Success', 'Team has been deleted successfully.');
              } else {
                Alert.alert('Error', 'Failed to delete team. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting team:', error);
              Alert.alert('Error', 'An unexpected error occurred while deleting the team.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRegisterTeam = async () => {
    if (!newTeam.name || !newTeam.division || !newTeam.coach) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && newTeam.id) {
        // Update existing team
        const updatedTeam = await teamService.updateTeam(newTeam.id, {
          name: newTeam.name,
          division: newTeam.division,
          coach: newTeam.coach,
        });

        if (updatedTeam) {
          // Update in local state
          setTeams(teams.map(team => team.id === newTeam.id ? updatedTeam : team));
          setNewTeam({ id: '', name: '', division: '', coach: '' });
          setShowRegistrationForm(false);
          setIsEditing(false);
          Alert.alert('Success', `Team ${newTeam.name} has been updated successfully!`);
        } else {
          Alert.alert('Error', 'Failed to update team. Please try again.');
        }
      } else {
        // Create new team
        const createdTeam = await teamService.createTeam({
          name: newTeam.name,
          division: newTeam.division,
          coach: newTeam.coach,
        });

        if (createdTeam) {
          // Update local state
          setTeams([...teams, createdTeam]);
          setNewTeam({ id: '', name: '', division: '', coach: '' });
          setShowRegistrationForm(false);
          Alert.alert('Success', `Team ${newTeam.name} has been registered successfully!`);
        } else {
          Alert.alert('Error', 'Failed to register team. Please try again.');
        }
      }
    } catch (error) {
      console.error(isEditing ? 'Error updating team:' : 'Error registering team:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <AppHeader title="Teams" />
        <TouchableOpacity 
          style={[styles.registerButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={() => {
            if (showRegistrationForm) {
              // Reset form when canceling
              setNewTeam({ id: '', name: '', division: '', coach: '' });
              setIsEditing(false);
            }
            setShowRegistrationForm(!showRegistrationForm);
          }}
        >
          <Text style={styles.registerButtonText}>
            {showRegistrationForm ? 'Cancel' : 'Register Team'}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.searchInput, { 
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          color: Colors[colorScheme ?? 'light'].text,
          borderColor: Colors[colorScheme ?? 'light'].border
        }]}
        placeholder="Search teams..."
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
            {isEditing ? 'Edit Team' : 'Team Registration'}
          </Text>
          
          <TextInput
            style={[styles.input, { borderColor: Colors[colorScheme ?? 'light'].border, color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Team Name"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={newTeam.name}
            onChangeText={(text) => setNewTeam({...newTeam, name: text})}
          />
            
          <View style={[styles.dropdownContainer, { borderColor: Colors[colorScheme ?? 'light'].border }]}>
            <Text style={[styles.dropdownLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Division:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
              {divisions.map((division) => (
                <TouchableOpacity
                  key={division}
                  style={[styles.optionItem, {
                    backgroundColor: newTeam.division === division ? Colors[colorScheme ?? 'light'].tint : '#f0f0f0',
                  }]}
                  onPress={() => setNewTeam({ ...newTeam, division })}
                >
                  <Text style={[styles.optionText, {
                    color: newTeam.division === division ? 'white' : '#333',
                  }]}>
                    {division}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <TextInput
            style={[styles.input, { borderColor: Colors[colorScheme ?? 'light'].border, color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Coach Name"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={newTeam.coach}
            onChangeText={(text) => setNewTeam({...newTeam, coach: text})}
          />
          
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={handleRegisterTeam}
          >
            <Text style={styles.submitButtonText}>{isEditing ? 'Update' : 'Register'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>Loading teams...</Text>
        </View>
      ) : (
        <ScrollView style={styles.teamsList}>
          {filteredTeams.length > 0 ? (
            filteredTeams.map(team => (
              <View 
                key={team.id} 
                style={[styles.teamCard, { 
                  backgroundColor: Colors[colorScheme ?? 'light'].card,
                  borderColor: Colors[colorScheme ?? 'light'].border
                }]}
              >
                <Text style={[styles.teamName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {team.name}
                </Text>
                <Text style={[styles.teamDetails, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Division: {team.division}
                </Text>
                <Text style={[styles.teamDetails, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Players: {team.players_count || 0}
                </Text>
                <Text style={[styles.teamDetails, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Coach: {team.coach}
                </Text>
                <View style={styles.teamActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                    onPress={() => handleViewTeamDetails(team)}
                  >
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#F9A826' }]}
                    onPress={() => handleEditTeam(team)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#E53935' }]}
                    onPress={() => handleDeleteTeam(team.id!)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {searchQuery ? 'No teams match your search criteria.' : 'No teams available yet.'}
              </Text>
              <TouchableOpacity 
                style={[styles.addFirstButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                onPress={() => setShowRegistrationForm(true)}
              >
                <Text style={styles.addFirstButtonText}>Register First Team</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
      
      {/* Team Detail Modal */}
      <TeamDetailModal 
        team={selectedTeam} 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
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
  teamDetailSection: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 80,
  },
  detailValue: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  playersList: {
    maxHeight: 200,
  },
  playerItem: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  playerPosition: {
    fontSize: 14,
    marginTop: 2,
  },
  noPlayersText: {
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
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
  teamsList: {
    paddingHorizontal: 16,
  },
  teamCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  teamDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  viewButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
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
  // Dropdown styles
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
  optionsContainer: {
    flexDirection: 'row',
  },
  optionItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    color: '#333',
  },
  teamActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
