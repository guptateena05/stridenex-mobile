import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Users, Search, Plus, X, Globe, Lock, ArrowLeft, Folder, Tag, TrendingUp, MessageSquare } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { api } from '@/api/api.services';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  
  const [selectedChannel, setSelectedChannel] = useState<Community | null>(null);
  const [channelDetails, setChannelDetails] = useState<any>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const [isTagsExpanded, setIsTagsExpanded] = useState(true);
  const [isMembersExpanded, setIsMembersExpanded] = useState(true);
  
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
      const email = await AsyncStorage.getItem('userEmail') || await AsyncStorage.getItem('userName') || await AsyncStorage.getItem('currentUser') || '';
      const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);
      const response = await api.post('method/stridenex_app.stridenex_app.doctype.community.community.get_communities', {
        user: email,
        user_type: capitalizedUserType
      });
      if (response.data) {
        let communitiesArray = response.data?.message?.data || response.data?.data?.data || response.data?.data || response.data?.message || [];
        if (!Array.isArray(communitiesArray)) {
          if (Array.isArray(response.data?.message?.communities)) communitiesArray = response.data.message.communities;
          else if (Array.isArray(response.data?.data?.communities)) communitiesArray = response.data.data.communities;
          else communitiesArray = [];
        }
        setCommunities(Array.isArray(communitiesArray) ? communitiesArray : []);
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunityClick = async (community: Community) => {
    setSelectedChannel(community);
    setIsFetchingDetails(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || await AsyncStorage.getItem('userName') || await AsyncStorage.getItem('currentUser') || '';
      const response = await api.post('method/stridenex_app.stridenex_app.doctype.community.community.get_community', {
        community: community.name
      });
      if (response.data) {
        const data = response.data?.message?.data || response.data?.data?.data || response.data?.message;
        if (data) {
          setChannelDetails(data);
        } else {
          setChannelDetails(community);
        }
      }
    } catch (error) {
      console.error("Error fetching community details:", error);
      setChannelDetails(community); // Fallback
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!formData.community_name || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || await AsyncStorage.getItem('userName') || await AsyncStorage.getItem('currentUser') || '';
      const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);
      const response = await api.post('method/stridenex_app.stridenex_app.doctype.community.community.create_community', {
        ...formData,
        user_type: capitalizedUserType,
        community_owner: email
      });
      
      const successMsg = response.data?.message?.message || response.data?.message || "Community created successfully!";
      Alert.alert('Success', typeof successMsg === 'string' ? successMsg : "Community created successfully!");
      setIsModalVisible(false);
      setFormData({ community_name: '', description: '', community_type: 'Public' });
      fetchCommunities();
    } catch (error: any) {
      console.error("Error creating community:", error);
      const errMsg = error?.response?.data?.message?.message || error?.response?.data?.message || error.message || 'Failed to create community.';
      Alert.alert('Error', typeof errMsg === 'string' ? errMsg : 'Failed to create community.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCommunities: Community[] = (communities || []).filter(c => 
    c.community_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedChannel) {
    return (
      <SafeAreaView style={styles.forumContainer} edges={['top', 'bottom']}>
        {/* Forum Header */}
        <View style={styles.forumHeader}>
          <TouchableOpacity 
            onPress={() => {
              setSelectedChannel(null);
              setChannelDetails(null);
            }} 
            style={styles.forumBackBtn}
          >
            <ArrowLeft size={20} color="#94A3B8" />
            <Text style={styles.forumBackTxt}>Back</Text>
          </TouchableOpacity>
          <View style={styles.forumTitleGroup}>
            <Text style={styles.forumTitle} numberOfLines={1}>
              {selectedChannel.community_name || selectedChannel.name}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.forumBody} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Header Greeting Banner */}
          <View style={styles.forumGreetingCard}>
            <Text style={styles.forumGreetingTitle}>Welcome to discussions!</Text>
            <Text style={styles.forumGreetingSub}>
              {channelDetails?.description || selectedChannel.description || 'A space to collaborate, support each other, and grow.'}
            </Text>
          </View>

          {/* Categories Accordion */}
          <View style={styles.accordionContainer}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              style={styles.accordionHeader}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Folder size={16} color="#FF6B00" />
                <Text style={styles.accordionTitle}>Categories</Text>
              </View>
              <Text style={styles.accordionArrow}>{isCategoriesExpanded ? "▼" : "▶"}</Text>
            </TouchableOpacity>
            
            {isCategoriesExpanded && (
              <View style={styles.accordionContent}>
                {!channelDetails ? (
                  <ActivityIndicator size="small" color="#FF6B00" style={{ marginVertical: 12 }} />
                ) : (channelDetails.categories && channelDetails.categories.length > 0) ? (
                  channelDetails.categories.map((cat: any, idx: number) => (
                    <View key={cat.name || idx} style={styles.accordionItem}>
                      <View style={styles.accordionBullet} />
                      <Text style={styles.accordionItemText}>{cat.category_name || cat.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noCategoriesText}>No categories defined</Text>
                )}
              </View>
            )}
          </View>

          {/* Tags Accordion */}
          <View style={styles.accordionContainer}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setIsTagsExpanded(!isTagsExpanded)}
              style={[styles.accordionHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Tag size={16} color="#FF6B00" />
                <Text style={styles.accordionTitle}>Tags</Text>
              </View>
              <Text style={styles.accordionArrow}>{isTagsExpanded ? "▼" : "▶"}</Text>
            </TouchableOpacity>
            
            {isTagsExpanded && (
              <View style={[styles.accordionContent, { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 8 }]}>
                {!channelDetails ? (
                  <ActivityIndicator size="small" color="#FF6B00" />
                ) : (channelDetails.tags && channelDetails.tags.length > 0) ? (
                  channelDetails.tags.map((tag: any, idx: number) => (
                    <View key={tag.name || idx} style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>#{tag.title || tag.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#64748B', fontSize: 12 }}>No tags defined</Text>
                )}
              </View>
            )}
          </View>
          
           {/* Members Info */}
           <View style={styles.accordionContainer}>
             <View style={styles.accordionHeader}>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 <Users size={16} color="#FF6B00" />
                 <Text style={styles.accordionTitle}>Community Info</Text>
               </View>
             </View>
             <View style={styles.accordionContent}>
                <Text style={{ color: '#94A3B8', fontSize: 14 }}>
                   Members: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{channelDetails?.member_count || selectedChannel.member_count || 1}</Text>
                </Text>
                <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 6 }}>
                   Type: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{channelDetails?.community_type || selectedChannel.community_type || 'Public'}</Text>
                </Text>
                <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 6 }}>
                   Owner: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{channelDetails?.community_owner || selectedChannel.community_owner}</Text>
                </Text>
             </View>
           </View>

           {/* Members List Accordion */}
           <View style={styles.accordionContainer}>
             <TouchableOpacity 
               activeOpacity={0.7}
               onPress={() => setIsMembersExpanded(!isMembersExpanded)}
               style={styles.accordionHeader}
             >
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 <Users size={16} color="#FF6B00" />
                 <Text style={styles.accordionTitle}>Members ({channelDetails?.members?.length || 0})</Text>
               </View>
               <Text style={styles.accordionArrow}>{isMembersExpanded ? "▼" : "▶"}</Text>
             </TouchableOpacity>
             
             {isMembersExpanded && (
               <View style={styles.accordionContent}>
                 {!channelDetails ? (
                   <ActivityIndicator size="small" color="#FF6B00" style={{ marginVertical: 12 }} />
                 ) : (channelDetails.members && channelDetails.members.length > 0) ? (
                   channelDetails.members.map((member: any, idx: number) => (
                     <View key={idx} style={[styles.accordionItem, { borderBottomWidth: idx < channelDetails.members.length - 1 ? 1 : 0, borderBottomColor: '#1F2023', paddingVertical: 12 }]}>
                       <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2023', borderColor: '#334155', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                         <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{(member.member || "G")[0].toUpperCase()}</Text>
                       </View>
                       <View style={{ flex: 1, marginLeft: 12 }}>
                         <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>{member.member}</Text>
                         <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>Joined: {new Date(member.joined_on).toLocaleDateString()}</Text>
                       </View>
                       <View style={{ alignItems: 'flex-end', gap: 4 }}>
                         <View style={{ backgroundColor: member.role === 'Admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                           <Text style={{ color: member.role === 'Admin' ? '#60A5FA' : '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                             {member.role || "Member"}
                           </Text>
                         </View>
                         <View style={{ backgroundColor: member.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                           <Text style={{ color: member.status === 'Approved' ? '#34D399' : '#FBBF24', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                             {member.status || "Pending"}
                           </Text>
                         </View>
                       </View>
                     </View>
                   ))
                 ) : (
                   <Text style={styles.noCategoriesText}>No members found</Text>
                 )}
               </View>
             )}
           </View>
         </ScrollView>
      </SafeAreaView>
    );
  }

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
        <Search size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities..."
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} style={{ marginTop: 40 }} />
      ) : filteredCommunities.length > 0 ? (
        <ScrollView contentContainerStyle={styles.listContainer}>
            {filteredCommunities.map((community: any, index: number) => (
              <TouchableOpacity key={community.name || index} style={styles.card} onPress={() => handleCommunityClick(community)}>
                {isFetchingDetails && (selectedChannel as any)?.name === community.name && (
                  <View style={StyleSheet.absoluteFillObject}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                      <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                    </View>
                  </View>
                )}
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                  {community.community_type === 'Private' ? (
                    <Lock size={20} color={colors.primary.DEFAULT} />
                  ) : (
                    <Globe size={20} color={colors.primary.DEFAULT} />
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Users size={48} color={colors.text.secondary} />
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
                  <Globe size={16} color={formData.community_type === 'Public' ? colors.primary.DEFAULT : colors.text.secondary} />
                  <Text style={[styles.typeButtonText, formData.community_type === 'Public' && styles.typeButtonTextActive]}>Public</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, formData.community_type === 'Private' && styles.typeButtonActive]}
                  onPress={() => setFormData({...formData, community_type: 'Private'})}
                >
                  <Lock size={16} color={formData.community_type === 'Private' ? colors.primary.DEFAULT : colors.text.secondary} />
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
    backgroundColor: colors.background.light,
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
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: typography.fontWeight.semibold,
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
    fontWeight: typography.fontWeight.medium,
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
    backgroundColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: typography.fontWeight.normal,
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
    fontWeight: typography.fontWeight.medium,
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
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.normal,
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
    fontWeight: typography.fontWeight.bold,
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
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
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
    borderColor: colors.primary.DEFAULT,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  typeButtonTextActive: {
    color: colors.primary.DEFAULT,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.border,
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
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: '#FFF',
  },
  forumContainer: {
    flex: 1,
    backgroundColor: '#0E0F10',
  },
  forumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2023',
    backgroundColor: '#121315',
  },
  forumBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  forumBackTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  forumTitleGroup: {
    flex: 1,
    alignItems: 'center',
  },
  forumTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    maxWidth: 160,
  },
  forumBody: {
    flex: 1,
    padding: 16,
  },
  forumGreetingCard: {
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.1)',
    marginBottom: 20,
  },
  forumGreetingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  forumGreetingSub: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
  },
  accordionContainer: {
    backgroundColor: '#121315',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2023',
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#16171A',
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accordionArrow: {
    fontSize: 10,
    color: '#64748B',
  },
  accordionContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2023',
  },
  accordionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  accordionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  accordionItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  noCategoriesText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  tagBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
