import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Plus, LogOut, Store, ImagePlus, X, Settings, AlertCircle, Clock, CheckCircle, RefreshCw } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupons } from '@/contexts/CouponContext';
import { Category } from '@/types/coupon';
import { generateCouponCode } from '@/utils/couponCodeGenerator';

export default function BusinessDashboard() {
  const { user, logout } = useAuth();
  const { submitCoupon, pendingCoupons, allCoupons, deleteCoupon } = useCoupons();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const businessCoupons = useMemo(() => {
    const userBusinessName = user?.businessName;
    if (!userBusinessName) return [];
    
    const allBusinessCoupons = [...pendingCoupons, ...allCoupons];
    return allBusinessCoupons.filter(c => c.businessName === userBusinessName);
  }, [pendingCoupons, allCoupons, user?.businessName]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    category: 'Food & Dining' as Category,
    expiresAt: '',
    code: '',
    terms: '',
    redemptionInstructions: '',
    imageUrl: '',
  });

  const categories: Category[] = [
    'Food & Dining',
    'Shopping',
    'Entertainment',
    'Travel',
    'Beauty & Wellness',
    'Services',
    'Fitness',
    'Electronics',
  ];

  const pickImage = async () => {
    console.log('Requesting media library permissions');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos to upload a coupon image.');
      return;
    }

    console.log('Launching image picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('Image selected:', result.assets[0].uri);
      setFormData({ ...formData, imageUrl: result.assets[0].uri });
    }
  };

  const removeImage = () => {
    console.log('Removing image');
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleCancelMembership = () => {
    Alert.alert(
      'Cancel Membership',
      'Are you sure you want to cancel your subscription? You will lose access to creating new coupons at the end of your billing period.',
      [
        {
          text: 'Keep Subscription',
          style: 'cancel',
        },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => {
            console.log('Canceling subscription for user:', user?.email);
            console.log('Would cancel Stripe subscription here in production');
            
            Alert.alert(
              'Subscription Cancelled',
              'Your subscription has been cancelled and will remain active until the end of your current billing period. You can resubscribe at any time.',
              [
                { 
                  text: 'OK',
                  onPress: () => {
                    console.log('User acknowledged cancellation');
                  }
                }
              ]
            );
          },
        },
      ]
    );
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.discount) {
      Alert.alert('Missing Fields', 'Please fill in title, description, and discount');
      return;
    }

    submitCoupon({
      ...formData,
      businessName: user?.businessName || 'Unknown Business',
    });

    Alert.alert(
      'Coupon Created!',
      `Your coupon "${formData.title}" has been submitted for review.`,
      [
        {
          text: 'Create Another',
          onPress: () => {
            setFormData({
              title: '',
              description: '',
              discount: '',
              category: 'Food & Dining',
              expiresAt: '',
              code: '',
              terms: '',
              redemptionInstructions: '',
              imageUrl: '',
            });
          },
        },
        { 
          text: 'OK',
          onPress: () => {
            setShowAddForm(false);
            setFormData({
              title: '',
              description: '',
              discount: '',
              category: 'Food & Dining',
              expiresAt: '',
              code: '',
              terms: '',
              redemptionInstructions: '',
              imageUrl: '',
            });
          }
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                <Store size={20} color={Colors.accent} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Business Dashboard</Text>
                <Text style={styles.businessName}>{user?.businessName || 'My Business'}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => {
                  logout();
                  router.replace('/auth/welcome');
                }}
                style={styles.logoutButton}
              >
                <LogOut size={18} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.myCouponsSection}>
            <View style={styles.sectionHeader}>
              <Store size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>My Coupons</Text>
              <View style={styles.couponCount}>
                <Text style={styles.couponCountText}>{businessCoupons.length}</Text>
              </View>
            </View>

            {businessCoupons.length === 0 ? (
              <View style={styles.emptyState}>
                <Store size={48} color={Colors.textSecondary} strokeWidth={1.5} />
                <Text style={styles.emptyStateTitle}>No coupons yet</Text>
                <Text style={styles.emptyStateText}>Create your first coupon to start attracting customers</Text>
              </View>
            ) : (
              <View style={styles.couponsList}>
                {businessCoupons.map((coupon) => (
                  <View key={coupon.id} style={styles.couponItem}>
                    <Image
                      source={{ uri: coupon.imageUrl }}
                      style={styles.couponThumbnail}
                      contentFit="cover"
                    />
                    <View style={styles.couponDetails}>
                      <View style={styles.couponStatus}>
                        {coupon.status === 'pending' ? (
                          <View style={styles.statusBadgePending}>
                            <Clock size={12} color={Colors.warning} />
                            <Text style={styles.statusTextPending}>Pending Review</Text>
                          </View>
                        ) : (
                          <View style={styles.statusBadgeApproved}>
                            <CheckCircle size={12} color={Colors.success} />
                            <Text style={styles.statusTextApproved}>Active</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.couponItemTitle} numberOfLines={1}>{coupon.title}</Text>
                      <Text style={styles.couponItemDiscount}>{coupon.discount}</Text>
                      <Text style={styles.couponItemCategory}>{coupon.category}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeCouponButton}
                      onPress={() => {
                        Alert.alert(
                          'Delete Coupon',
                          `Are you sure you want to delete "${coupon.title}"? This action cannot be undone.`,
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: async () => {
                                console.log('Deleting coupon:', coupon.id);
                                const result = await deleteCoupon(coupon.id, user?.businessName || '');
                                if (result.success) {
                                  Alert.alert('Success', 'Coupon deleted successfully');
                                } else {
                                  Alert.alert('Error', 'Failed to delete coupon');
                                }
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <X size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.addCouponSection}>
            {!showAddForm ? (
              <TouchableOpacity 
                style={styles.addCouponButton}
                onPress={() => setShowAddForm(true)}
                activeOpacity={0.8}
              >
                <View style={styles.addButtonIcon}>
                  <Plus size={32} color={Colors.accent} strokeWidth={3} />
                </View>
                <Text style={styles.addCouponButtonText}>Add New Coupon</Text>
                <Text style={styles.addCouponButtonSubtext}>Create a new offer for your customers</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.createSection}>
            <View style={styles.sectionHeader}>
              <Plus size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Create New Coupon</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 20% Off Any Purchase"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your offer in detail"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Discount *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 20% OFF or $10 OFF"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.discount}
                  onChangeText={(text) => setFormData({ ...formData, discount: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Coupon Image (Optional)</Text>
                {formData.imageUrl ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: formData.imageUrl }}
                      style={styles.imagePreview}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={removeImage}
                    >
                      <X size={18} color={Colors.card} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.imagePickerButton}
                    onPress={pickImage}
                  >
                    <ImagePlus size={32} color={Colors.textSecondary} />
                    <Text style={styles.imagePickerText}>Tap to upload image</Text>
                    <Text style={styles.imagePickerHint}>Recommended: 16:9 aspect ratio</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.categoryGrid}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        formData.category === cat && styles.categoryChipSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, category: cat })}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          formData.category === cat && styles.categoryChipTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Coupon Code (Optional)</Text>
                  <TouchableOpacity
                    style={styles.generateCodeButton}
                    onPress={() => {
                      const newCode = generateCouponCode();
                      setFormData({ ...formData, code: newCode });
                    }}
                  >
                    <RefreshCw size={14} color={Colors.primary} />
                    <Text style={styles.generateCodeText}>Generate</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., SAVE20 or tap Generate"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.code}
                  onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Expiration Date (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Dec 31, 2025"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.expiresAt}
                  onChangeText={(text) => setFormData({ ...formData, expiresAt: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Redemption Instructions (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="How customers redeem this offer"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.redemptionInstructions}
                  onChangeText={(text) => setFormData({ ...formData, redemptionInstructions: text })}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Terms & Conditions (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any restrictions or requirements"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.terms}
                  onChangeText={(text) => setFormData({ ...formData, terms: text })}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelFormButton} 
                  onPress={() => {
                    setShowAddForm(false);
                    setFormData({
                      title: '',
                      description: '',
                      discount: '',
                      category: 'Food & Dining',
                      expiresAt: '',
                      code: '',
                      terms: '',
                      redemptionInstructions: '',
                      imageUrl: '',
                    });
                  }}
                >
                  <Text style={styles.cancelFormButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Plus size={20} color={Colors.accent} />
                  <Text style={styles.submitButtonText}>Create Coupon</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
            )}
          </View>

          <View style={styles.settingsSection}>
            <View style={styles.sectionHeader}>
              <Settings size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Account Settings</Text>
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <AlertCircle size={20} color={Colors.danger} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Cancel Membership</Text>
                  <Text style={styles.settingDescription}>
                    Cancel your subscription and stop future billing
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelMembership}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>

              <View style={styles.cancelInfo}>
                <Text style={styles.cancelInfoText}>
                  ⚠️ Your subscription will remain active until the end of your current billing period.
                  You can resubscribe at any time.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.secondary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  businessName: {
    fontSize: 14,
    color: Colors.accent,
    opacity: 0.8,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: `${Colors.primary}25`,
    borderRadius: 8,
  },
  createSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: Platform.OS === 'ios' ? 12 : 12,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  categoryChipSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  imagePickerButton: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed' as const,
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePickerText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 8,
  },
  imagePickerHint: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  imagePreviewContainer: {
    position: 'relative' as const,
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    backgroundColor: Colors.danger,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsSection: {
    margin: 16,
    marginTop: 8,
  },
  settingsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.danger}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cancelButton: {
    backgroundColor: Colors.danger,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.card,
  },
  cancelInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: `${Colors.danger}10`,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${Colors.danger}30`,
  },
  cancelInfoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  generateCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.primary}15`,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  generateCodeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  myCouponsSection: {
    margin: 16,
    marginBottom: 8,
  },
  couponCount: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto' as const,
  },
  couponCountText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed' as const,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  couponsList: {
    gap: 12,
  },
  couponItem: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  couponThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  couponDetails: {
    flex: 1,
    gap: 4,
  },
  couponStatus: {
    marginBottom: 4,
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.warning}20`,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start' as const,
  },
  statusTextPending: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.warning,
  },
  statusBadgeApproved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.success}20`,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start' as const,
  },
  statusTextApproved: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.success,
  },
  couponItemTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  couponItemDiscount: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  couponItemCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeCouponButton: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    backgroundColor: Colors.card,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addCouponSection: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  addCouponButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  addButtonIcon: {
    backgroundColor: Colors.accent,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCouponButtonText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  addCouponButtonSubtext: {
    fontSize: 14,
    color: Colors.accent,
    opacity: 0.8,
    textAlign: 'center' as const,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelFormButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelFormButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
});
