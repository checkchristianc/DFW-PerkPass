import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { 
  Store, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  MapPin,
  Phone,
  Clock,
  Globe,
  User,
  Camera,
  LogOut,
  ChevronRight
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

interface BusinessProfile {
  businessName: string;
  email: string;
  ownerName: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  storeHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export default function BusinessProfileScreen() {
  const { user, logout, updateProfilePicture } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<BusinessProfile>({
    businessName: user?.businessName || '',
    email: user?.email || '',
    ownerName: user?.name || '',
    phone: '',
    address: '',
    website: '',
    description: '',
    storeHours: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed',
    },
  });

  const [editedProfile, setEditedProfile] = useState<BusinessProfile>(profile);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photos to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as const,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        updateProfilePicture(base64Image);
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const handleSave = () => {
    if (!editedProfile.businessName.trim() || !editedProfile.email.trim()) {
      Alert.alert('Error', 'Business name and email are required');
      return;
    }

    setProfile(editedProfile);
    setIsEditing(false);
    Alert.alert('Success', 'Business profile updated successfully');
    console.log('Updated business profile:', editedProfile);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/welcome');
          },
        },
      ]
    );
  };

  if (!user || user.type !== 'business') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.headerTitle}>Business Profile</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Store size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Access Denied</Text>
            <Text style={styles.emptyText}>Only business accounts can access this page</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerTitle}>Business Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your business information</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileCard}>
            <View style={styles.avatarSection}>
              <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
                {user.profilePicture ? (
                  <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatar}>
                    <Store size={48} color={Colors.accent} strokeWidth={2} />
                  </View>
                )}
                <View style={styles.cameraButton}>
                  <Camera size={16} color={Colors.accent} />
                </View>
              </TouchableOpacity>
              <Text style={styles.businessName}>{profile.businessName}</Text>
              <View style={styles.businessTypeBadge}>
                <Text style={styles.businessTypeBadgeText}>Business Account</Text>
              </View>
            </View>

            {isEditing ? (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Business Name *</Text>
                  <View style={styles.inputWrapper}>
                    <Store size={18} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={editedProfile.businessName}
                      onChangeText={(text) => setEditedProfile({ ...editedProfile, businessName: text })}
                      placeholder="Enter business name"
                      placeholderTextColor={Colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Owner Name</Text>
                  <View style={styles.inputWrapper}>
                    <User size={18} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={editedProfile.ownerName}
                      onChangeText={(text) => setEditedProfile({ ...editedProfile, ownerName: text })}
                      placeholder="Enter owner name"
                      placeholderTextColor={Colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={editedProfile.email}
                      onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
                      placeholder="Enter email"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.inputWrapper}>
                    <Phone size={18} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={editedProfile.phone}
                      onChangeText={(text) => setEditedProfile({ ...editedProfile, phone: text })}
                      placeholder="Enter phone number"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Address</Text>
                  <View style={styles.inputWrapper}>
                    <MapPin size={18} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={editedProfile.address}
                      onChangeText={(text) => setEditedProfile({ ...editedProfile, address: text })}
                      placeholder="Enter business address"
                      placeholderTextColor={Colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Website</Text>
                  <View style={styles.inputWrapper}>
                    <Globe size={18} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={editedProfile.website}
                      onChangeText={(text) => setEditedProfile({ ...editedProfile, website: text })}
                      placeholder="https://yourwebsite.com"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.inputWrapper, styles.textArea]}
                    value={editedProfile.description}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, description: text })}
                    placeholder="Describe your business"
                    placeholderTextColor={Colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.storeHoursSection}>
                  <Text style={styles.sectionLabel}>Store Hours</Text>
                  {Object.entries(editedProfile.storeHours).map(([day, hours]) => (
                    <View key={day} style={styles.hoursRow}>
                      <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                      <TextInput
                        style={styles.hoursInput}
                        value={hours}
                        onChangeText={(text) => setEditedProfile({
                          ...editedProfile,
                          storeHours: { ...editedProfile.storeHours, [day]: text }
                        })}
                        placeholder="e.g., 9:00 AM - 5:00 PM"
                        placeholderTextColor={Colors.textSecondary}
                      />
                    </View>
                  ))}
                </View>

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <X size={18} color={Colors.textPrimary} />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                  >
                    <Save size={18} color={Colors.accent} />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.profileInfo}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Store size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Business Name</Text>
                    <Text style={styles.infoValue}>{profile.businessName}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {profile.ownerName && (
                  <>
                    <View style={styles.infoRow}>
                      <View style={styles.infoIcon}>
                        <User size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Owner</Text>
                        <Text style={styles.infoValue}>{profile.ownerName}</Text>
                      </View>
                    </View>
                    <View style={styles.divider} />
                  </>
                )}

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Mail size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{profile.email}</Text>
                  </View>
                </View>

                {profile.phone && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoIcon}>
                        <Phone size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{profile.phone}</Text>
                      </View>
                    </View>
                  </>
                )}

                {profile.address && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoIcon}>
                        <MapPin size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Address</Text>
                        <Text style={styles.infoValue}>{profile.address}</Text>
                      </View>
                    </View>
                  </>
                )}

                {profile.website && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoIcon}>
                        <Globe size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Website</Text>
                        <Text style={styles.infoValue}>{profile.website}</Text>
                      </View>
                    </View>
                  </>
                )}

                {profile.description && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>About</Text>
                        <Text style={styles.infoValue}>{profile.description}</Text>
                      </View>
                    </View>
                  </>
                )}

                <View style={styles.divider} />

                <View style={styles.storeHoursCard}>
                  <View style={styles.storeHoursHeader}>
                    <Clock size={18} color={Colors.primary} />
                    <Text style={styles.storeHoursTitle}>Store Hours</Text>
                  </View>
                  {Object.entries(profile.storeHours).map(([day, hours]) => (
                    <View key={day} style={styles.hoursViewRow}>
                      <Text style={styles.dayText}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Text>
                      <Text style={styles.hoursText}>{hours}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Edit3 size={18} color={Colors.primary} />
                  <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.logoutMenuItem}
              onPress={handleLogout}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, styles.logoutIcon]}>
                  <LogOut size={20} color={Colors.danger} />
                </View>
                <Text style={[styles.menuItemTitle, styles.logoutText]}>Logout</Text>
              </View>
              <ChevronRight size={20} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.secondary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.accent,
    opacity: 0.8,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative' as const,
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute' as const,
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.card,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  businessTypeBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  businessTypeBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  profileInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  storeHoursCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  storeHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  storeHoursTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  hoursViewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textTransform: 'capitalize' as const,
  },
  hoursText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${Colors.primary}15`,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  editProfileButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 14 : 12,
  },
  storeHoursSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    width: 100,
    textTransform: 'capitalize' as const,
  },
  hoursInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    backgroundColor: `${Colors.danger}15`,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  logoutText: {
    color: Colors.danger,
  },
});
