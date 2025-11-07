import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  ChevronLeft,
  Calendar,
  BarChart3,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

export default function AdminRevenueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const revenueData = useMemo(() => {
    const subscriptionPrice = 29.99;
    const activeSubscriptions = 127;
    const newThisMonth = 23;
    const cancelledThisMonth = 5;
    const totalRevenue = activeSubscriptions * subscriptionPrice;
    const monthlyGrowth = ((newThisMonth - cancelledThisMonth) / (activeSubscriptions - newThisMonth)) * 100;
    
    return {
      subscriptionPrice,
      activeSubscriptions,
      newThisMonth,
      cancelledThisMonth,
      totalRevenue,
      monthlyGrowth,
      averageLifetimeValue: subscriptionPrice * 8,
      churnRate: (cancelledThisMonth / activeSubscriptions) * 100,
    };
  }, []);

  const monthlyRevenueHistory = useMemo(() => [
    { month: 'Jan', revenue: 2400, subscribers: 80 },
    { month: 'Feb', revenue: 2850, subscribers: 95 },
    { month: 'Mar', revenue: 3300, subscribers: 110 },
    { month: 'Apr', revenue: 3810, subscribers: 127 },
  ], []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
          <Text style={styles.headerTitle}>Revenue Tracking</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <DollarSign size={32} color={Colors.primary} />
              <Text style={styles.overviewTitle}>Total Monthly Revenue</Text>
            </View>
            <Text style={styles.overviewValue}>{formatCurrency(revenueData.totalRevenue)}</Text>
            <View style={styles.growthBadge}>
              <TrendingUp size={16} color={Colors.success} />
              <Text style={styles.growthText}>
                +{revenueData.monthlyGrowth.toFixed(1)}% growth
              </Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Users size={24} color={Colors.primary} />
              </View>
              <Text style={styles.metricValue}>{revenueData.activeSubscriptions}</Text>
              <Text style={styles.metricLabel}>Active Subscriptions</Text>
              <View style={styles.metricDetail}>
                <Text style={styles.metricDetailText}>
                  +{revenueData.newThisMonth} this month
                </Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <CreditCard size={24} color={Colors.accent} />
              </View>
              <Text style={styles.metricValue}>{formatCurrency(revenueData.subscriptionPrice)}</Text>
              <Text style={styles.metricLabel}>Price per Month</Text>
              <View style={styles.metricDetail}>
                <Text style={styles.metricDetailText}>Standard plan</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <BarChart3 size={24} color={Colors.success} />
              </View>
              <Text style={styles.metricValue}>{formatCurrency(revenueData.averageLifetimeValue)}</Text>
              <Text style={styles.metricLabel}>Avg. Lifetime Value</Text>
              <View style={styles.metricDetail}>
                <Text style={styles.metricDetailText}>~8 month avg.</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, styles.metricIconDanger]}>
                <TrendingUp size={24} color={Colors.danger} />
              </View>
              <Text style={styles.metricValue}>{revenueData.churnRate.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Churn Rate</Text>
              <View style={styles.metricDetail}>
                <Text style={styles.metricDetailText}>
                  {revenueData.cancelledThisMonth} cancelled
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Revenue History</Text>
            </View>
            
            <View style={styles.historyList}>
              {monthlyRevenueHistory.map((item, index) => (
                <View key={item.month} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyMonth}>{item.month} 2025</Text>
                    <Text style={styles.historySubscribers}>
                      {item.subscribers} subscribers
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyRevenue}>
                      {formatCurrency(item.revenue)}
                    </Text>
                    {index > 0 && (
                      <Text style={styles.historyGrowth}>
                        +{(((item.revenue - monthlyRevenueHistory[index - 1].revenue) / monthlyRevenueHistory[index - 1].revenue) * 100).toFixed(1)}%
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Projections</Text>
            </View>
            
            <View style={styles.projectionCard}>
              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>Next Month (Projected)</Text>
                <Text style={styles.projectionValue}>
                  {formatCurrency(revenueData.totalRevenue * 1.18)}
                </Text>
              </View>
              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>Q2 2025 (Projected)</Text>
                <Text style={styles.projectionValue}>
                  {formatCurrency(revenueData.totalRevenue * 3.5)}
                </Text>
              </View>
              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>Annual Run Rate</Text>
                <Text style={styles.projectionValue}>
                  {formatCurrency(revenueData.totalRevenue * 12)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Revenue Insights</Text>
            <Text style={styles.infoText}>
              • Strong subscriber growth with {revenueData.newThisMonth} new businesses this month{'\n'}
              • Low churn rate of {revenueData.churnRate.toFixed(1)}% indicates good retention{'\n'}
              • Average lifetime value of {formatCurrency(revenueData.averageLifetimeValue)} per customer{'\n'}
              • Projected to reach 150 subscribers by end of Q2
            </Text>
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
  overviewCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  overviewTitle: {
    fontSize: 16,
    color: Colors.accent,
    opacity: 0.9,
  },
  overviewValue: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: Colors.accent,
    marginBottom: 12,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.success}30`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start' as const,
  },
  growthText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.success,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconDanger: {
    backgroundColor: `${Colors.danger}20`,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  metricDetail: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start' as const,
  },
  metricDetailText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  historyLeft: {
    flex: 1,
  },
  historyMonth: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  historySubscribers: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyRevenue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 2,
  },
  historyGrowth: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600' as const,
  },
  projectionCard: {
    gap: 12,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  projectionLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  projectionValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  infoCard: {
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
