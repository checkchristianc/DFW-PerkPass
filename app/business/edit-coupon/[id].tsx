import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Save, ImagePlus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupons } from '@/contexts/CouponContext';
import { Category } from '@/types/coupon';

export default function EditCouponScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { allCoupons, pendingCoupons } = useCoupons();
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

  useEffect(() => {
    const allBusinessCoupons = [...allCoupons, ...pendingCoupons];
    const coupon = allBusinessCoupons.find(c => c.id === id);
    
    if (coupon) {
      setFormData({
        title: coupon.title,
        description: coupon.description,
        discount: coupon.discount,
        category: coupon.category,
        expiresAt: coupon.expiresAt === 'No expiration' ? '' : coupon.expiresAt,
        code: coupon.code || '',
        terms: coupon.terms || '',
        redemptionInstructions: coupon.redemptionInstructions || '',
        imageUrl: coupon.imageUrl,
      });
    }
  }, [id, allCoupons, pendingCoupons]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos to upload a coupon image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, imageUrl: result.assets[0].uri });
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.discount) {
      Alert.alert('Missing Fields', 'Please fill in title, description, and discount');
      return;
    }

    Alert.alert(
      'Coupon Updated',
      'Your coupon has been updated successfully. Note: This is a local update. In production, this would sync with your backend.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
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
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Coupon</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Access Denied</Text>
            <Text style={styles.emptyText}>
              This feature is only available for business accounts
            </Text>
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Coupon</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
              <Text style={styles.label}>Coupon Image</Text>
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

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={20} color={Colors.accent} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
    backgroundColor: Colors.card,
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
    backgroundColor: Colors.card,
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
  imagePickerButton: {
    backgroundColor: Colors.card,
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
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 17,
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
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
});
