import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import { Filter } from 'lucide-react-native';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { CouponCard } from '@/components/CouponCard';
import Colors from '@/constants/colors';
import { useCoupons } from '@/contexts/CouponContext';
import { Coupon, Category } from '@/types/coupon';

export default function CategoriesScreen() {
  const { coupons, selectedCategory, setSelectedCategory, categories } = useCoupons();
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
              <View style={styles.filterIcon}>
                <Filter size={20} color={Colors.accent} />
              </View>
              <Text style={styles.headerTitle}>Categories</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Browse coupons by category
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category as Category | 'All')}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {coupons.length} {coupons.length === 1 ? 'coupon' : 'coupons'} found
            </Text>
          </View>

          <FlashList
            data={coupons}
            renderItem={({ item }: { item: Coupon }) => <CouponCard coupon={item} />}
            keyExtractor={(item: Coupon) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No coupons found</Text>
                <Text style={styles.emptyText}>
                  Try selecting a different category
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
  filterIcon: {
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
  categoryScroll: {
    marginTop: 12,
    marginBottom: 0,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: Colors.card,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    height: 32,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  categoryChipTextActive: {
    color: Colors.card,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
