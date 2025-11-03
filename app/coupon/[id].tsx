import { Image } from 'expo-image';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Calendar, Tag, Heart, Copy, MapPin, Info, CheckCircle2, Ticket, ArrowLeft } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

import Colors from '@/constants/colors';
import { useCoupons } from '@/contexts/CouponContext';
import { MOCK_COUPONS } from '@/mocks/coupons';

export default function CouponDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggleFavorite, isFavorite, redeemCoupon, trackView, getCouponStats } = useCoupons();
  const [copied, setCopied] = useState<boolean>(false);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [hasRedeemed, setHasRedeemed] = useState<boolean>(false);

  const coupon = MOCK_COUPONS.find((c) => c.id === id);

  useEffect(() => {
    if (id) {
      console.log('Tracking view for coupon:', id);
      trackView(id);
    }
  }, [id, trackView]);

  if (!coupon) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Coupon not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const favorite = isFavorite(coupon.id);

  const handleCopyCode = async () => {
    if (coupon.code) {
      await Clipboard.setStringAsync(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Copied!', 'Coupon code copied to clipboard');
      }
    }
  };

  const handleFavoritePress = () => {
    toggleFavorite(coupon.id);
  };

  const handleRedeem = async () => {
    if (hasRedeemed) {
      Alert.alert('Already Redeemed', 'You have already redeemed this coupon!');
      return;
    }

    setIsRedeeming(true);
    const result = await redeemCoupon(coupon.id);
    setIsRedeeming(false);

    if (result.success) {
      setHasRedeemed(true);
      Alert.alert(
        'Coupon Redeemed!',
        'Your coupon has been successfully redeemed. Show this to the cashier.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', 'Failed to redeem coupon. Please try again.');
    }
  };

  const stats = getCouponStats(coupon.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Coupon Details',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: coupon.imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.discountOverlay}>
          <Text style={styles.discountText}>{coupon.discount}</Text>
          <Text style={styles.discountLabel}>OFF</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Tag size={14} color={Colors.accent} />
            <Text style={styles.categoryText}>{coupon.category}</Text>
          </View>
          
          <TouchableOpacity
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
            testID={`favorite-button-${coupon.id}`}
          >
            <Heart
              size={24}
              color={favorite ? Colors.danger : Colors.textSecondary}
              fill={favorite ? Colors.danger : 'transparent'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.businessName}>{coupon.businessName}</Text>
        <Text style={styles.title}>{coupon.title}</Text>
        <Text style={styles.description}>{coupon.description}</Text>

        {coupon.code && (
          <View style={styles.codeContainer}>
            <View style={styles.codeInner}>
              <Text style={styles.codeLabel}>Coupon Code</Text>
              <Text style={styles.code}>{coupon.code}</Text>
            </View>
            <TouchableOpacity
              onPress={handleCopyCode}
              style={styles.copyButton}
            >
              {copied ? (
                <CheckCircle2 size={20} color={Colors.success} />
              ) : (
                <Copy size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Calendar size={20} color={Colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Expires</Text>
              <Text style={styles.infoValue}>{formatDate(coupon.expiresAt)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MapPin size={20} color={Colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>Available at all locations</Text>
            </View>
          </View>
        </View>

        <View style={styles.redemptionSection}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>How to Redeem</Text>
          </View>
          <Text style={styles.redemptionText}>{coupon.redemptionInstructions}</Text>
        </View>

        {coupon.terms && (
          <View style={styles.termsSection}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>{coupon.terms}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.redeemButton,
            (hasRedeemed || isRedeeming) && styles.redeemButtonDisabled,
          ]}
          onPress={handleRedeem}
          disabled={hasRedeemed || isRedeeming}
        >
          <Ticket size={20} color={Colors.card} />
          <Text style={styles.redeemButtonText}>
            {hasRedeemed ? 'Redeemed' : isRedeeming ? 'Redeeming...' : 'Redeem Coupon'}
          </Text>
        </TouchableOpacity>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.views}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.redemptions}</Text>
            <Text style={styles.statLabel}>Redemptions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.conversionRate}%</Text>
            <Text style={styles.statLabel}>Conversion</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    position: 'relative' as const,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountOverlay: {
    position: 'absolute' as const,
    top: 20,
    left: 20,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  discountText: {
    color: Colors.card,
    fontSize: 28,
    fontWeight: '800' as const,
  },
  discountLabel: {
    color: Colors.card,
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  categoryText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  favoriteButton: {
    padding: 8,
  },
  businessName: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  codeInner: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  code: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: `${Colors.primary}15`,
    padding: 12,
    borderRadius: 8,
  },
  infoSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  redemptionSection: {
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  redemptionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  termsSection: {
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
  redeemButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  redeemButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.6,
  },
  redeemButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.card,
  },
  statsSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  headerBackButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
