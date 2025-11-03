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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  User, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  ChevronRight, 
  CreditCard, 
  History,
  Settings,
  LogOut
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');

  const handleSave = () => {
    if (!editedName.trim() || !editedEmail.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert('Success', 'Profile updated successfully');
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

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.emptyContainer}>
          <User size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Not logged in</Text>
          <Text style={styles.emptyText}>Please log in to view your profile</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/auth/welcome')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileCard}>
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <User size={48} color={Colors.accent} strokeWidth={2} />
              </View>
              <View style={styles.userTypeBadge}>
                <Text style={styles.userTypeBadgeText}>
                  {user.type === 'business' ? 'Business' : 'Consumer'}
                </Text>
              </View>
            </View>

            {isEditing ? (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name</Text>
                  <View style={styles.inputWrapper}>
                    <User size={18} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder="Enter your name"
                      placeholderTextColor={Colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      value={editedEmail}
                      onChangeText={setEditedEmail}
                      placeholder="Enter your email"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsEditing(false);
                      setEditedName(user.name);
                      setEditedEmail(user.email);
                    }}
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
                    <User size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{user.name}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Mail size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user.email}</Text>
                  </View>
                </View>

                {user.businessName && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoIcon}>
                        <Settings size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Business Name</Text>
                        <Text style={styles.infoValue}>{user.businessName}</Text>
                      </View>
                    </View>
                  </>
                )}

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

          {user.type === 'consumer' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/user/redemption-history' as any)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <History size={20} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.menuItemTitle}>Redemption History</Text>
                    <Text style={styles.menuItemSubtitle}>View all your redeemed coupons</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => Alert.alert('Coming Soon', 'Payment methods management coming soon!')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <CreditCard size={20} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.menuItemTitle}>Payment Methods</Text>
                    <Text style={styles.menuItemSubtitle}>Manage your payment options</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {user.type === 'business' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Account</Text>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/business/dashboard')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <Settings size={20} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.menuItemTitle}>Business Dashboard</Text>
                    <Text style={styles.menuItemSubtitle}>Manage your coupons and offers</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.subscriptionInfo}>
                <View style={styles.subscriptionBadge}>
                  <Text style={styles.subscriptionBadgeText}>
                    {user.subscriptionActive ? 'Active Subscription' : 'Inactive'}
                  </Text>
                </View>
                {user.subscriptionActive && (
                  <Text style={styles.subscriptionText}>
                    Your subscription is active and renews automatically
                  </Text>
                )}
              </View>
            </View>
          )}

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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userTypeBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  userTypeBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  profileInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
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
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  subscriptionInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  subscriptionBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  subscriptionBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  subscriptionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  logoutMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  logoutIcon: {
    backgroundColor: `${Colors.danger}15`,
  },
  logoutText: {
    color: Colors.danger,
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
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
});
