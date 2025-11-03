import { Stack } from 'expo-router';
import { TrendingUp, Eye, Ticket, Percent, Calendar, BarChart3 } from 'lucide-react-native';
import { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupons } from '@/contexts/CouponContext';

const { width } = Dimensions.get('window');

export default function BusinessAnalyticsScreen() {
  const { user } = useAuth();
  const { redemptions, views, allCoupons } = useCoupons();
  const insets = useSafeAreaInsets();

  const businessCoupons = useMemo(() => {
    return allCoupons.filter(
      (c) => c.businessName === user?.businessName && c.status === 'approved'
    );
  }, [allCoupons, user?.businessName]);

  const analytics = useMemo(() => {
    let totalViews = 0;
    let totalRedemptions = 0;

    businessCoupons.forEach((coupon) => {
      totalViews += views[coupon.id] || 0;
      totalRedemptions += redemptions.filter((r) => r.couponId === coupon.id).length;
    });

    const conversionRate =
      totalViews > 0 ? ((totalRedemptions / totalViews) * 100).toFixed(1) : '0.0';

    const couponStats = businessCoupons.map((coupon) => {
      const couponViews = views[coupon.id] || 0;
      const couponRedemptions = redemptions.filter((r) => r.couponId === coupon.id).length;
      const couponConversion =
        couponViews > 0 ? ((couponRedemptions / couponViews) * 100).toFixed(1) : '0.0';

      return {
        id: coupon.id,
        title: coupon.title,
        views: couponViews,
        redemptions: couponRedemptions,
        conversion: couponConversion,
      };
    });

    const topPerformer = [...couponStats].sort((a, b) => b.redemptions - a.redemptions)[0];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyRedemptions = last7Days.map((date) => {
      const count = redemptions.filter((r) => {
        const redemptionDate = new Date(r.redeemedAt).toISOString().split('T')[0];
        return redemptionDate === date;
      }).length;
      return { date, count };
    });

    return {
      totalCoupons: businessCoupons.length,
      totalViews,
      totalRedemptions,
      conversionRate,
      couponStats,
      topPerformer,
      dailyRedemptions,
    };
  }, [businessCoupons, views, redemptions]);

  const maxDailyRedemptions = Math.max(...analytics.dailyRedemptions.map((d) => d.count), 1);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Analytics Dashboard</Text>
            <Text style={styles.headerSubtitle}>{user?.businessName}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardLarge]}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{analytics.totalRedemptions}</Text>
              <Text style={styles.statLabel}>Total Redemptions</Text>
            </View>

            <View style={[styles.statCard, styles.statCardSmall]}>
              <View style={styles.statIconContainer}>
                <Eye size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.statValue}>{analytics.totalViews}</Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </View>

            <View style={[styles.statCard, styles.statCardSmall]}>
              <View style={styles.statIconContainer}>
                <Ticket size={20} color={Colors.success} />
              </View>
              <Text style={styles.statValue}>{analytics.totalCoupons}</Text>
              <Text style={styles.statLabel}>Active Coupons</Text>
            </View>

            <View style={[styles.statCard, styles.statCardLarge]}>
              <View style={styles.statIconContainer}>
                <Percent size={24} color={Colors.accent} />
              </View>
              <Text style={styles.statValue}>{analytics.conversionRate}%</Text>
              <Text style={styles.statLabel}>Conversion Rate</Text>
            </View>
          </View>

          <View style={styles.chartSection}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Last 7 Days</Text>
            </View>
            <View style={styles.chartContainer}>
              {analytics.dailyRedemptions.map((day, index) => {
                const heightPercentage = (day.count / maxDailyRedemptions) * 100;
                const barHeight = Math.max(heightPercentage, 5);
                const dayLabel = new Date(day.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                });

                return (
                  <View key={index} style={styles.barWrapper}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${barHeight}%`,
                            backgroundColor:
                              day.count > 0 ? Colors.primary : Colors.border,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{dayLabel}</Text>
                    <Text style={styles.barValue}>{day.count}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {analytics.topPerformer && (
            <View style={styles.topPerformerSection}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Top Performer</Text>
              </View>
              <View style={styles.topPerformerCard}>
                <Text style={styles.topPerformerTitle} numberOfLines={2}>
                  {analytics.topPerformer.title}
                </Text>
                <View style={styles.topPerformerStats}>
                  <View style={styles.topPerformerStat}>
                    <Text style={styles.topPerformerStatValue}>
                      {analytics.topPerformer.views}
                    </Text>
                    <Text style={styles.topPerformerStatLabel}>Views</Text>
                  </View>
                  <View style={styles.topPerformerStat}>
                    <Text style={styles.topPerformerStatValue}>
                      {analytics.topPerformer.redemptions}
                    </Text>
                    <Text style={styles.topPerformerStatLabel}>Redemptions</Text>
                  </View>
                  <View style={styles.topPerformerStat}>
                    <Text style={styles.topPerformerStatValue}>
                      {analytics.topPerformer.conversion}%
                    </Text>
                    <Text style={styles.topPerformerStatLabel}>Conversion</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.couponListSection}>
            <View style={styles.sectionHeader}>
              <Ticket size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Coupon Performance</Text>
            </View>
            {analytics.couponStats.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No active coupons yet. Create a coupon to see analytics.
                </Text>
              </View>
            ) : (
              analytics.couponStats.map((coupon) => (
                <View key={coupon.id} style={styles.couponStatCard}>
                  <Text style={styles.couponStatTitle} numberOfLines={1}>
                    {coupon.title}
                  </Text>
                  <View style={styles.couponStatRow}>
                    <View style={styles.couponStatItem}>
                      <Text style={styles.couponStatValue}>{coupon.views}</Text>
                      <Text style={styles.couponStatLabel}>Views</Text>
                    </View>
                    <View style={styles.couponStatDivider} />
                    <View style={styles.couponStatItem}>
                      <Text style={styles.couponStatValue}>{coupon.redemptions}</Text>
                      <Text style={styles.couponStatLabel}>Redemptions</Text>
                    </View>
                    <View style={styles.couponStatDivider} />
                    <View style={styles.couponStatItem}>
                      <Text style={styles.couponStatValue}>{coupon.conversion}%</Text>
                      <Text style={styles.couponStatLabel}>Rate</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.bottomSpacer} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.secondary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flex: 1,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCardLarge: {
    width: (width - 44) / 2,
  },
  statCardSmall: {
    width: (width - 44) / 2,
  },
  statIconContainer: {
    backgroundColor: `${Colors.primary}15`,
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  chartSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 20,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barContainer: {
    flex: 1,
    width: '80%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  barValue: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '700' as const,
  },
  topPerformerSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  topPerformerCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  topPerformerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginBottom: 16,
  },
  topPerformerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  topPerformerStat: {
    alignItems: 'center',
  },
  topPerformerStatValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.accent,
    marginBottom: 4,
  },
  topPerformerStatLabel: {
    fontSize: 12,
    color: Colors.accent,
    opacity: 0.8,
    fontWeight: '600' as const,
  },
  couponListSection: {
    marginHorizontal: 16,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  couponStatCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  couponStatTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  couponStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  couponStatItem: {
    alignItems: 'center',
  },
  couponStatValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  couponStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  couponStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  bottomSpacer: {
    height: 40,
  },
});
