import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Calendar, Clock, Tag, ChevronLeft, TrendingUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useCoupons } from '@/contexts/CouponContext';
import { useAuth } from '@/contexts/AuthContext';

export default function RedemptionHistoryScreen() {
  const { redemptions, allCoupons, featuredCoupons } = useCoupons();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const userRedemptions = useMemo(() => {
    if (!user || user.type !== 'consumer') return [];

    const userReds = redemptions.filter(r => !r.userId || r.userId === user.id);

    return userReds.map(redemption => {
      const allAvailableCoupons = [...allCoupons, ...featuredCoupons];
      const uniqueCoupons = Array.from(new Map(allAvailableCoupons.map(c => [c.id, c])).values());
      const coupon = uniqueCoupons.find((c: any) => c.id === redemption.couponId);
      return coupon ? { ...coupon, redemption } : null;
    }).filter(Boolean);
  }, [redemptions, allCoupons, featuredCoupons, user]);

  const redemptionStats = useMemo(() => {
    const totalSavings = userRedemptions.length * 15;
    const thisMonth = userRedemptions.filter(r => {
      const redemptionDate = new Date(r.redemption.redeemedAt);
      const now = new Date();
      return redemptionDate.getMonth() === now.getMonth() && 
             redemptionDate.getFullYear() === now.getFullYear();
    }).length;

    return { totalSavings, thisMonth };
  }, [userRedemptions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!user || user.type !== 'consumer') {
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
            <Text style={styles.headerTitle}>Redemption History</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Tag size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Access Denied</Text>
            <Text style={styles.emptyText}>
              This feature is only available for consumer accounts
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
          <Text style={styles.headerTitle}>Redemption History</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Tag size={24} color={Colors.primary} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{userRedemptions.length}</Text>
                <Text style={styles.statLabel}>Total Redeemed</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color={Colors.success} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{redemptionStats.thisMonth}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
            </View>
          </View>

          <View style={styles.savingsCard}>
            <Text style={styles.savingsLabel}>Estimated Savings</Text>
            <Text style={styles.savingsValue}>${redemptionStats.totalSavings}</Text>
            <Text style={styles.savingsSubtext}>
              Based on average coupon value
            </Text>
          </View>

          {userRedemptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Tag size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No redemptions yet</Text>
              <Text style={styles.emptyText}>
                Your redeemed coupons will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>History</Text>
              {userRedemptions.map((item: any) => (
                <View key={item.redemption.id} style={styles.historyCard}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.couponImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.cardContent}>
                    <View style={styles.businessRow}>
                      <Text style={styles.businessName}>{item.businessName}</Text>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{item.discount}</Text>
                      </View>
                    </View>

                    <Text style={styles.couponTitle}>{item.title}</Text>

                    <View style={styles.redemptionInfo}>
                      <View style={styles.infoItem}>
                        <Calendar size={14} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>
                          {formatDate(item.redemption.redeemedAt)}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Clock size={14} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>
                          {formatTime(item.redemption.redeemedAt)}
                        </Text>
                      </View>
                    </View>

                    {item.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
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
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  savingsCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  savingsLabel: {
    fontSize: 14,
    color: Colors.accent,
    marginBottom: 8,
    opacity: 0.9,
  },
  savingsValue: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: Colors.accent,
    marginBottom: 4,
  },
  savingsSubtext: {
    fontSize: 12,
    color: Colors.accent,
    opacity: 0.8,
  },
  historySection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  couponImage: {
    width: '100%',
    height: 140,
  },
  cardContent: {
    padding: 16,
  },
  businessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  discountBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  couponTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  redemptionInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  categoryBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
});
