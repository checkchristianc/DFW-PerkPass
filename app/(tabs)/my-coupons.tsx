import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Calendar, Clock, QrCode, Tag } from 'lucide-react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useCoupons } from '@/contexts/CouponContext';
import { useAuth } from '@/contexts/AuthContext';



const QRCodeDisplay = ({ value, size = 200 }: { value: string; size?: number }) => {
  const cellSize = size / 25;
  const pattern = generateQRPattern(value);

  return (
    <View style={styles.qrContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect x={0} y={0} width={size} height={size} fill="white" />
        {pattern.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <Rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="black"
              />
            ) : null
          )
        )}
      </Svg>
      <Text style={styles.qrLabel}>Scan to Verify</Text>
    </View>
  );
};

function generateQRPattern(value: string): boolean[][] {
  const size = 25;
  const pattern: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false));

  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash = hash & hash;
  }

  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  for (let y = 3; y < size - 3; y++) {
    for (let x = 3; x < size - 3; x++) {
      pattern[y][x] = random(hash + x * 100 + y) > 0.5;
    }
  }

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const isOutline = i === 0 || i === 6 || j === 0 || j === 6;
      const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
      pattern[i][j] = isOutline || isInner;
      pattern[i][size - 1 - j] = isOutline || isInner;
      pattern[size - 1 - i][j] = isOutline || isInner;
    }
  }

  return pattern;
}

export default function MyCouponsScreen() {
  const couponContext = useCoupons();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [expandedCouponId, setExpandedCouponId] = useState<string | null>(null);

  const businessCoupons = useMemo(() => {
    if (!user?.businessName) {
      console.log('No user or businessName');
      return [];
    }
    
    console.log('User businessName:', user.businessName);
    console.log('Pending coupons count:', couponContext.pendingCoupons.length);
    console.log('All coupons count:', couponContext.allCoupons.length);
    console.log('Pending coupons:', JSON.stringify(couponContext.pendingCoupons.map(c => ({ id: c.id, businessName: c.businessName, title: c.title })), null, 2));
    console.log('All coupons:', JSON.stringify(couponContext.allCoupons.map(c => ({ id: c.id, businessName: c.businessName, title: c.title })), null, 2));
    
    const allBusinessCoupons = [...couponContext.pendingCoupons, ...couponContext.allCoupons];
    console.log('Combined coupons count:', allBusinessCoupons.length);
    
    const filtered = allBusinessCoupons.filter(c => {
      const matches = c.businessName === user.businessName;
      console.log(`Coupon "${c.title}" businessName: "${c.businessName}" matches user businessName "${user.businessName}": ${matches}`);
      return matches;
    });
    
    console.log('Filtered business coupons count:', filtered.length);
    return filtered;
  }, [couponContext.pendingCoupons, couponContext.allCoupons, user?.businessName]);

  const redeemedCoupons = useMemo(() => {
    if (!user || user.businessName) return [];

    const userRedemptions = couponContext.redemptions.filter(r => !r.userId || r.userId === user.id);

    return userRedemptions.map(redemption => {
      const allCoupons = [...couponContext.coupons, ...couponContext.featuredCoupons];
      const uniqueCoupons = Array.from(new Map(allCoupons.map(c => [c.id, c])).values());
      const coupon = uniqueCoupons.find((c: any) => c.id === redemption.couponId);
      return coupon ? { ...coupon, redemption } : null;
    }).filter(Boolean);
  }, [couponContext.redemptions, couponContext.coupons, couponContext.featuredCoupons, user]);

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

  const isExpired = (expiresAt: string) => {
    if (expiresAt === 'No expiration') return false;
    return new Date(expiresAt) < new Date();
  };

  const toggleExpanded = (couponId: string) => {
    setExpandedCouponId(expandedCouponId === couponId ? null : couponId);
  };

  const generateRedemptionCode = (redemptionId: string) => {
    return redemptionId.substring(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Coupons</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Tag size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Please log in</Text>
          <Text style={styles.emptyText}>Log in to view your coupons</Text>
        </View>
      </View>
    );
  }

  if (user.businessName) {
    if (businessCoupons.length === 0) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Coupons</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Tag size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No coupons created yet</Text>
            <Text style={styles.emptyText}>
              Go to the Business Dashboard to create your first coupon
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerTitle}>My Coupons</Text>
          <Text style={styles.headerSubtitle}>
            {businessCoupons.length} {businessCoupons.length === 1 ? 'coupon' : 'coupons'} created
          </Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {businessCoupons.map((item: any) => {
            const stats = couponContext.getCouponStats(item.id);
            const isPending = item.status === 'pending';

            return (
              <View
                key={item.id}
                style={[styles.businessCouponCard, isPending && styles.pendingCard]}
              >
                <View style={styles.cardHeader}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.couponImage}
                    resizeMode="cover"
                  />
                  {isPending && (
                    <View style={styles.pendingBadge}>
                      <Clock size={14} color="#fff" />
                      <Text style={styles.pendingBadgeText}>PENDING REVIEW</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.businessRow}>
                    <Text style={styles.businessName}>{item.businessName}</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{item.discount}</Text>
                    </View>
                  </View>

                  <Text style={styles.couponTitle}>{item.title}</Text>
                  <Text style={styles.couponDescription} numberOfLines={2}>{item.description}</Text>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.views}</Text>
                      <Text style={styles.statLabel}>Views</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.redemptions}</Text>
                      <Text style={styles.statLabel}>Redeemed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.conversionRate}%</Text>
                      <Text style={styles.statLabel}>Conv. Rate</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.infoItem}>
                      <Calendar size={12} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>
                        Created {formatDate(item.submittedAt || new Date().toISOString())}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  if (redeemedCoupons.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Coupons</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Tag size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No redeemed coupons yet</Text>
          <Text style={styles.emptyText}>
            Your redeemed coupons will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>My Coupons</Text>
        <Text style={styles.headerSubtitle}>
          {redeemedCoupons.length} {redeemedCoupons.length === 1 ? 'coupon' : 'coupons'} redeemed
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {redeemedCoupons.map((item: any) => {
          const expired = isExpired(item.expiresAt);
          const expanded = expandedCouponId === item.id;
          const redemptionCode = generateRedemptionCode(item.redemption.id);

          return (
            <TouchableOpacity
              key={item.redemption.id}
              style={[styles.couponCard, expired && styles.expiredCard]}
              onPress={() => toggleExpanded(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.couponImage}
                  resizeMode="cover"
                />
                {expired && (
                  <View style={styles.expiredBadge}>
                    <Text style={styles.expiredBadgeText}>EXPIRED</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardContent}>
                <View style={styles.businessRow}>
                  <Text style={styles.businessName}>{item.businessName}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                  </View>
                </View>

                <Text style={styles.couponTitle}>{item.title}</Text>

                <View style={styles.infoRow}>
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

                {item.expiresAt && item.expiresAt !== 'No expiration' && (
                  <View style={styles.expirationRow}>
                    <Text style={[styles.expirationText, expired && styles.expiredText]}>
                      {expired ? 'Expired' : 'Expires'}: {formatDate(item.expiresAt)}
                    </Text>
                  </View>
                )}

                {expanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Coupon Details</Text>
                    <Text style={styles.description}>{item.description}</Text>

                    {item.terms && (
                      <>
                        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
                        <Text style={styles.terms}>{item.terms}</Text>
                      </>
                    )}

                    <Text style={styles.sectionTitle}>Redemption Instructions</Text>
                    <Text style={styles.instructions}>{item.redemptionInstructions}</Text>

                    <View style={styles.divider} />

                    {item.code && (
                      <View style={styles.codeSection}>
                        <View style={styles.codeLabelRow}>
                          <Tag size={18} color={Colors.primary} />
                          <Text style={styles.sectionTitle}>Coupon Code</Text>
                        </View>
                        <View style={styles.codeBox}>
                          <Text style={styles.codeText}>{item.code}</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.redemptionSection}>
                      <View style={styles.codeLabelRow}>
                        <QrCode size={18} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Redemption Verification</Text>
                      </View>
                      
                      <QRCodeDisplay
                        value={`COUPON:${item.id}:REDEMPTION:${redemptionCode}`}
                        size={220}
                      />

                      <View style={styles.redemptionCodeBox}>
                        <Text style={styles.redemptionCodeLabel}>Redemption ID</Text>
                        <Text style={styles.redemptionCodeText}>{redemptionCode}</Text>
                      </View>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => toggleExpanded(item.id)}
                >
                  <Text style={styles.expandButtonText}>
                    {expanded ? 'Show Less' : 'View Details & QR Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
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
    textAlign: 'center',
  },
  couponCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  expiredCard: {
    opacity: 0.6,
  },
  cardHeader: {
    position: 'relative',
  },
  couponImage: {
    width: '100%',
    height: 160,
  },
  expiredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  expiredBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700' as const,
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  couponTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
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
  expirationRow: {
    marginTop: 4,
  },
  expirationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  expiredText: {
    color: '#dc2626',
    fontWeight: '600' as const,
  },
  expandButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
    textAlign: 'center',
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  terms: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  instructions: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  codeSection: {
    marginBottom: 20,
  },
  codeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
    letterSpacing: 2,
  },
  redemptionSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrLabel: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  redemptionCodeBox: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  redemptionCodeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  redemptionCodeText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  businessCouponCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pendingCard: {
    opacity: 0.8,
  },
  pendingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(251, 146, 60, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  couponDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
