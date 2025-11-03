import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Heart, Calendar, Tag } from 'lucide-react-native';
import { memo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable, Platform } from 'react-native';

import Colors from '@/constants/colors';
import { useCoupons } from '@/contexts/CouponContext';
import { Coupon } from '@/types/coupon';

interface CouponCardProps {
  coupon: Coupon;
}

export const CouponCard = memo(({ coupon }: CouponCardProps) => {
  const { toggleFavorite, isFavorite } = useCoupons();
  const favorite = isFavorite(coupon.id);

  const handlePress = () => {
    router.push(`/coupon/${coupon.id}` as any);
  };

  const handleFavoritePress = () => {
    toggleFavorite(coupon.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && Platform.OS === 'ios' && styles.cardPressed
      ]}
      testID={`coupon-card-${coupon.id}`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: coupon.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{coupon.discount}</Text>
          <Text style={styles.discountLabel}>OFF</Text>
        </View>
        <TouchableOpacity
          onPress={handleFavoritePress}
          style={styles.favoriteButton}
          testID={`favorite-button-${coupon.id}`}
        >
          <Heart
            size={22}
            color={favorite ? Colors.danger : Colors.card}
            fill={favorite ? Colors.danger : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.categoryBadge}>
          <Tag size={12} color={Colors.accent} />
          <Text style={styles.categoryText}>{coupon.category}</Text>
        </View>
        
        <Text style={styles.businessName} numberOfLines={1}>{coupon.businessName}</Text>
        <Text style={styles.title} numberOfLines={2}>{coupon.title}</Text>
        
        <View style={styles.footer}>
          <View style={styles.expiryContainer}>
            <Calendar size={14} color={Colors.textSecondary} />
            <Text style={styles.expiryText}>Expires {formatDate(coupon.expiresAt)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

CouponCard.displayName = 'CouponCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative' as const,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  discountText: {
    color: Colors.card,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  discountLabel: {
    color: Colors.card,
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  favoriteButton: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start' as const,
    marginBottom: 8,
  },
  categoryText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  businessName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expiryText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
