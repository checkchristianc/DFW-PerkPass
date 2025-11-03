import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { Search, Sparkles, LogOut, Briefcase, Shield } from 'lucide-react-native';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { CouponCard } from '@/components/CouponCard';
import Colors from '@/constants/colors';
import { useCoupons } from '@/contexts/CouponContext';
import { useAuth } from '@/contexts/AuthContext';
import { Coupon } from '@/types/coupon';

export default function HomeScreen() {
  const { featuredCoupons, searchQuery, setSearchQuery } = useCoupons();
  const { logout } = useAuth();
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState<string>(searchQuery);
  const insets = useSafeAreaInsets();

  const handleSearchSubmit = () => {
    setSearchQuery(localSearch);
  };

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
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>DFW PerkPass</Text>
                <View style={styles.badge}>
                  <Sparkles size={16} color={Colors.accent} />
                </View>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  onPress={() => router.push('/admin/review')}
                  style={styles.adminButton}
                >
                  <Shield size={18} color={Colors.accent} />
                  <Text style={styles.adminButtonText}>Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => router.push('/business/dashboard')}
                  style={styles.testButton}
                >
                  <Briefcase size={18} color={Colors.accent} />
                  <Text style={styles.testButtonText}>Business</Text>
                </TouchableOpacity>
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
            <Text style={styles.headerSubtitle}>
              Discover amazing deals from thousands of businesses
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search coupons, businesses..."
              placeholderTextColor={Colors.textSecondary}
              value={localSearch}
              onChangeText={setLocalSearch}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {localSearch.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Deals</Text>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>{featuredCoupons.length} deals</Text>
            </View>
          </View>

          <FlashList
            data={featuredCoupons}
            renderItem={({ item }: { item: Coupon }) => <CouponCard coupon={item} />}
            keyExtractor={(item: Coupon) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No featured deals available</Text>
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
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  badge: {
    backgroundColor: Colors.primary,
    padding: 6,
    borderRadius: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.accent,
    lineHeight: 20,
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  clearButton: {
    paddingHorizontal: 8,
  },
  clearText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  featuredBadge: {
    backgroundColor: `${Colors.secondary}25`,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  featuredBadgeText: {
    color: Colors.secondary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  headerButtons: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
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
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: `${Colors.secondary}40`,
    borderRadius: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: `${Colors.primary}30`,
    borderRadius: 8,
  },
  adminButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
});
