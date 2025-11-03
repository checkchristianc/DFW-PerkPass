import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import {
  TrendingUp,
  Users,
  DollarSign,
  Ticket,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Store,
  ArrowLeft,
  BarChart3,
} from 'lucide-react-native';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

interface Business {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  signupDate: string;
  subscriptionActive: boolean;
  totalCoupons: number;
  totalRedemptions: number;
  revenue: number;
}

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const analyticsQuery = trpc.admin.businessAnalytics.useQuery();

  console.log('Analytics query state:', {
    isLoading: analyticsQuery.isLoading,
    isError: analyticsQuery.isError,
    error: analyticsQuery.error,
    hasData: !!analyticsQuery.data,
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderBusinessCard = ({ item }: { item: Business }) => (
    <View style={styles.businessCard}>
      <View style={styles.businessHeader}>
        <View style={styles.businessIcon}>
          <Store size={24} color={Colors.primary} />
        </View>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{item.businessName}</Text>
          <Text style={styles.ownerName}>{item.ownerName}</Text>
        </View>
        <View style={[styles.statusBadge, item.subscriptionActive ? styles.activeBadge : styles.inactiveBadge]}>
          {item.subscriptionActive ? (
            <CheckCircle size={16} color={Colors.success} />
          ) : (
            <XCircle size={16} color="#ff4444" />
          )}
          <Text style={[styles.statusText, item.subscriptionActive ? styles.activeText : styles.inactiveText]}>
            {item.subscriptionActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.businessDetails}>
        <View style={styles.detailRow}>
          <Mail size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>Signed up: {formatDateTime(item.signupDate)}</Text>
        </View>
      </View>

      <View style={styles.businessStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.totalCoupons}</Text>
          <Text style={styles.statLabel}>Coupons</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.totalRedemptions}</Text>
          <Text style={styles.statLabel}>Redemptions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${(item.revenue ?? 0).toFixed(2)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>
    </View>
  );

  if (analyticsQuery.isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={Colors.accent} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Business Analytics</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        </View>
      </>
    );
  }

  if (analyticsQuery.error) {
    const errorMessage = analyticsQuery.error?.message || 'Failed to load analytics';
    
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={Colors.accent} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Business Analytics</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.errorContainer}>
            <XCircle size={64} color="#ff4444" />
            <Text style={styles.errorTitle}>Error Loading Analytics</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                console.log('Retrying analytics fetch...');
                analyticsQuery.refetch();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  const data = analyticsQuery.data;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.accent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Business Analytics</Text>
          <TouchableOpacity
            style={styles.revenueIconButton}
            onPress={() => router.push('/admin/revenue' as any)}
          >
            <BarChart3 size={24} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.overviewSection}>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <View style={styles.overviewIconContainer}>
                <Users size={24} color={Colors.primary} />
              </View>
              <Text style={styles.overviewValue}>{data?.totalBusinesses || 0}</Text>
              <Text style={styles.overviewLabel}>Total Businesses</Text>
            </View>

            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconContainer, { backgroundColor: `${Colors.success}20` }]}>
                <CheckCircle size={24} color={Colors.success} />
              </View>
              <Text style={styles.overviewValue}>{data?.activeSubscriptions || 0}</Text>
              <Text style={styles.overviewLabel}>Active Subs</Text>
            </View>

            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconContainer, { backgroundColor: `${Colors.secondary}20` }]}>
                <DollarSign size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.overviewValue}>${(data?.totalRevenue ?? 0).toFixed(2)}</Text>
              <Text style={styles.overviewLabel}>Total Revenue</Text>
            </View>

            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconContainer, { backgroundColor: '#FF6B3520' }]}>
                <Ticket size={24} color="#FF6B35" />
              </View>
              <Text style={styles.overviewValue}>{data?.totalCoupons || 0}</Text>
              <Text style={styles.overviewLabel}>Total Coupons</Text>
            </View>

            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconContainer, { backgroundColor: '#4ECDC420' }]}>
                <TrendingUp size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.overviewValue}>{data?.totalRedemptions || 0}</Text>
              <Text style={styles.overviewLabel}>Redemptions</Text>
            </View>

            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconContainer, { backgroundColor: '#95E1D320' }]}>
                <TrendingUp size={24} color="#95E1D3" />
              </View>
              <Text style={styles.overviewValue}>{Math.round(data?.avgRedemptionsPerBusiness ?? 0)}</Text>
              <Text style={styles.overviewLabel}>Avg Per Biz</Text>
            </View>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>All Businesses</Text>
          <Text style={styles.listCount}>{data?.businesses.length || 0} total</Text>
        </View>

        {data?.businesses && data.businesses.length > 0 ? (
          <FlashList
            data={data.businesses}
            renderItem={renderBusinessCard}
            keyExtractor={(item: Business) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Users size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Businesses Yet</Text>
            <Text style={styles.emptyText}>Businesses will appear here once they sign up</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.secondary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  overviewSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  listCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  businessCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: `${Colors.success}15`,
  },
  inactiveBadge: {
    backgroundColor: '#ff444415',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  activeText: {
    color: Colors.success,
  },
  inactiveText: {
    color: '#ff4444',
  },
  businessDetails: {
    gap: 8,
    marginBottom: 12,
    paddingLeft: 60,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  businessStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  revenueIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
