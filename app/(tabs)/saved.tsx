import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import { Heart, HeartOff } from 'lucide-react-native';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { CouponCard } from '@/components/CouponCard';
import Colors from '@/constants/colors';
import { useCoupons } from '@/contexts/CouponContext';
import { Coupon } from '@/types/coupon';

export default function SavedScreen() {
  const { favoriteCoupons } = useCoupons();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.heartIcon}>
                <Heart size={20} color={Colors.accent} fill={Colors.accent} />
              </View>
              <Text style={styles.headerTitle}>Saved</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Your favorite coupons in one place
            </Text>
          </View>

          {favoriteCoupons.length > 0 && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {favoriteCoupons.length} saved {favoriteCoupons.length === 1 ? 'coupon' : 'coupons'}
              </Text>
            </View>
          )}

          <FlashList
            data={favoriteCoupons}
            renderItem={({ item }: { item: Coupon }) => <CouponCard coupon={item} />}
            keyExtractor={(item: Coupon) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <HeartOff size={64} color={Colors.textSecondary} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No saved coupons yet</Text>
                <Text style={styles.emptyText}>
                  Start saving your favorite coupons by tapping the heart icon
                </Text>
              </View>
            }
          />
        </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.secondary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  heartIcon: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.accent,
    lineHeight: 20,
    opacity: 0.9,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
