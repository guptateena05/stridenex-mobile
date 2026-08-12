import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Users, Search, Plus, X, Globe, Lock } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { api } from '@/api/api.services';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Community {
  name: string;
  community_name: string;
  description: string;
  community_type: string;
  user_type: string;
  community_owner: string;
  member_count?: number;
}

interface SharedCommunityScreenProps {
  userType: 'mentor' | 'college' | 'industry';
}

export const SharedCommunityScreen = ({ userType }: SharedCommunityScreenProps) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    community_name: '',
    description: '',
    community_type: 'Public',
  });

  useEffect(() => {
    fetchCommunities();
  }, [userType]);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || '';
      const response = await api.post('method/stridenex_app.stridenex_app.doctype.community.community.get_communities', {
        user: email,
        user_type: userType
      });
      if (response.data) {
        if (Array.isArray(response.data.message)) {
          setCommunities(response.data.message);
        } else if (Array.isArray(response.data.data)) {
          setCommunities(response.data.data);
        } else if (response.data.message && Array.isArray(response.data.message.communities)) {
          setCommunities(response.data.message.communities);
        } else if (response.data.data && Array.isArray(response.data.data.communities)) {
          setCommunities(response.data.data.communities);
        } else {
          setCommunities([]);
        }
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!formData.community_name || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || '';
      await api.post('method/stridenex_app.stridenex_app.doctype.community.community.create_community', {
        ...formData,
        user_type: userType,
        community_owner: email
      });
      Alert.alert('Success', 'Community created successfully!');
      setIsModalVisible(false);
      setFormData({ community_name: '', description: '', community_type: 'Public' });
      fetchCommunities();
    } catch (error) {
      console.error("Error creating community:", error);
      Alert.alert('Error', 'Failed to create community.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCommunities = (Array.isArray(communities) ? communities : []).filter(c => 
    c.community_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Communities</Text>
          <Text style={styles.subtitle}>Connect and collaborate with peers.</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={() => setIsModalVisible(true)}>
          <Plus size={20} color="#FFF" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary.main} style={{ marginTop: 40 }} />
      ) : filteredCommunities.length > 0 ? (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {filteredCommunities.map((community, index) => (
            <View key={community.name || index} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  {community.community_type === 'Private' ? (
                    <Lock size={20} color={colors.primary.main} />
                  ) : (
                    <Globe size={20} color={colors.primary.main} />
                  )}
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{community.community_type || 'Public'}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{community.community_name}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {community.description || "No description provided."}
              </Text>
              <View style={styles.cardFooter}>
                <Users size={14} color={colors.text.secondary} />
                <Text style={styles.memberText}>{community.member_count || 1} members</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Users size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No communities found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try adjusting your search terms.' : "You haven't created or joined any communities yet."}
          </Text>
        </View>
      )}

      {/* Create Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Community</Text>
              <TouchableOpacity onPress={() => !isSubmitting && setIsModalVisible(false)} style={styles.closeButton}>
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.label}>Community Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. React Developers"
                value={formData.community_name}
                onChangeText={(text) => setFormData({...formData, community_name: text})}
              />
              
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What is this community about?"
                multiline
                numberOfLines={3}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                textAlignVertical="top"
              />
              
              <Text style={styles.label}>Privacy Type</Text>
              <View style={styles.typeButtonsRow}>
                <TouchableOpacity
                  style={[styles.typeButton, formData.community_type === 'Public' && styles.typeButtonActive]}
                  onPress={() => setFormData({...formData, community_type: 'Public'})}
                >
                  <Globe size={16} color={formData.community_type === 'Public' ? colors.primary.main : colors.text.secondary} />
                  <Text style={[styles.typeButtonText, formData.community_type === 'Public' && styles.typeButtonTextActive]}>Public</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, formData.community_type === 'Private' && styles.typeButtonActive]}
                  onPress={() => setFormData({...formData, community_type: 'Private'})}
                >
                  <Lock size={16} color={formData.community_type === 'Private' ? colors.primary.main : colors.text.secondary} />
                  <Text style={[styles.typeButtonText, formData.community_type === 'Private' && styles.typeButtonTextActive]}>Private</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setIsModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
                onPress={handleCreateCommunity}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.text.secondary,
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    color: '#FFF',
    fontFamily: typography.semiBold,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: typography.medium,
    fontSize: 14,
    color: colors.text.primary,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 29, 149, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: typography.semiBold,
    color: colors.text.secondary,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: colors.text.primary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: typography.regular,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 6,
  },
  memberText: {
    fontSize: 13,
    fontFamily: typography.medium,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: typography.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.text.primary,
  },
  textArea: {
    height: 100,
  },
  typeButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: 'rgba(76, 29, 149, 0.05)',
    borderColor: colors.primary.main,
  },
  typeButtonText: {
    fontSize: 14,
    fontFamily: typography.semiBold,
    color: colors.text.secondary,
  },
  typeButtonTextActive: {
    color: colors.primary.main,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background.secondary,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: typography.bold,
    color: colors.text.secondary,
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: typography.bold,
    color: '#FFF',
  },
});
