import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { Shield, CheckCircle, XCircle, Clock, LogOut } from 'lucide-react-native';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useCoupons } from '@/contexts/CouponContext';
import { useAuth } from '@/contexts/AuthContext';
import { Coupon } from '@/types/coupon';
import { Image } from 'expo-image';

export default function AdminReviewScreen() {
  const { pendingCoupons, approveCoupon, denyCoupon } = useCoupons();
  const { logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const handleApprove = (couponId: string) => {
    Alert.alert(
      'Approve Coupon',
      'Are you sure you want to approve this coupon?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: () => {
            approveCoupon(couponId);
            setSelectedCoupon(null);
            Alert.alert('Success', 'Coupon has been approved!');
          },
        },
      ]
    );
  };

  const handleDeny = (couponId: string) => {
    Alert.alert(
      'Deny Coupon',
      'Are you sure you want to deny this coupon? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deny',
          style: 'destructive',
          onPress: () => {
            denyCoupon(couponId);
            setSelectedCoupon(null);
            Alert.alert('Success', 'Coupon has been denied.');
          },
        },
      ]
    );
  };

  const renderCouponCard = ({ item }: { item: Coupon }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedCoupon(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{item.businessName}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.statusText}>Pending Review</Text>
          </View>
          <Text style={styles.submittedText}>
            {new Date(item.submittedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item.id)}
          >
            <CheckCircle size={20} color={Colors.accent} />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.denyButton]}
            onPress={() => handleDeny(item.id)}
          >
            <XCircle size={20} color="#ff4444" />
            <Text style={styles.denyButtonText}>Deny</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
                <Shield size={20} color={Colors.accent} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Admin Review</Text>
                <Text style={styles.headerSubtitle}>Review pending coupons</Text>
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

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingCoupons.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {pendingCoupons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CheckCircle size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>No pending coupons to review</Text>
          </View>
        ) : (
          <FlashList
            data={pendingCoupons}
            renderItem={renderCouponCard}
            keyExtractor={(item: Coupon) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <Modal
        visible={selectedCoupon !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedCoupon(null)}
      >
        {selectedCoupon && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Coupon Details</Text>
              <TouchableOpacity onPress={() => setSelectedCoupon(null)}>
                <XCircle size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: selectedCoupon.imageUrl }}
                style={styles.modalImage}
                contentFit="cover"
              />
              <View style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Business</Text>
                  <Text style={styles.modalValue}>{selectedCoupon.businessName}</Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Title</Text>
                  <Text style={styles.modalValue}>{selectedCoupon.title}</Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Description</Text>
                  <Text style={styles.modalValue}>{selectedCoupon.description}</Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Discount</Text>
                  <Text style={styles.modalValue}>{selectedCoupon.discount}</Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Category</Text>
                  <Text style={styles.modalValue}>{selectedCoupon.category}</Text>
                </View>
                {selectedCoupon.code && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Code</Text>
                    <Text style={styles.modalValue}>{selectedCoupon.code}</Text>
                  </View>
                )}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Expires At</Text>
                  <Text style={styles.modalValue}>{selectedCoupon.expiresAt}</Text>
                </View>
                {selectedCoupon.redemptionInstructions && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Redemption Instructions</Text>
                    <Text style={styles.modalValue}>
                      {selectedCoupon.redemptionInstructions}
                    </Text>
                  </View>
                )}
                {selectedCoupon.terms && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Terms & Conditions</Text>
                    <Text style={styles.modalValue}>{selectedCoupon.terms}</Text>
                  </View>
                )}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Submitted</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selectedCoupon.submittedAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalApproveButton]}
                onPress={() => handleApprove(selectedCoupon.id)}
              >
                <CheckCircle size={22} color={Colors.accent} />
                <Text style={styles.modalApproveText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalDenyButton]}
                onPress={() => handleDeny(selectedCoupon.id)}
              >
                <XCircle size={22} color="#ff4444" />
                <Text style={styles.modalDenyText}>Deny</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
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
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  headerSubtitle: {
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
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '600' as const,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  businessInfo: {
    flex: 1,
    gap: 6,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  categoryBadge: {
    backgroundColor: `${Colors.secondary}30`,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600' as const,
  },
  discountBadge: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  discountText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  submittedText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  approveButton: {
    backgroundColor: Colors.primary,
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  denyButton: {
    backgroundColor: '#ff444410',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  denyButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#ff4444',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 240,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalApproveButton: {
    backgroundColor: Colors.primary,
  },
  modalApproveText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  modalDenyButton: {
    backgroundColor: '#ff444410',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  modalDenyText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#ff4444',
  },
});
