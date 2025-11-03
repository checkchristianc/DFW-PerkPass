import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Plus, LogOut, Store, ImagePlus, X } from 'lucide-react-native';
import { useState } from 'react';
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

export default function BusinessDashboard() {
  const { user, logout } = useAuth();
  const { submitCoupon } = useCoupons();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        { text: 'OK' },
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
            <TouchableOpacity 
              onPress={() => {
                logout();
                router.replace('/auth/welcome');
              }}
              style={styles.logoutButton}
            >
              <LogOut size={18} color={Colors.accent} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                <Text style={styles.label}>Coupon Code (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., SAVE20"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.code}
                  onChangeText={(text) => setFormData({ ...formData, code: text })}
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

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Plus size={20} color={Colors.accent} />
                <Text style={styles.submitButtonText}>Create Coupon</Text>
              </TouchableOpacity>
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
    paddingBottom: 24,
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
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  createSection: {
    margin: 16,
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
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
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
});
