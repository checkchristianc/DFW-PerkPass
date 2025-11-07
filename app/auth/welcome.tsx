import { router } from 'expo-router';
import { User, Briefcase, Tag, ArrowRight } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/colors';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Tag size={56} color={Colors.accent} strokeWidth={2.5} />
            </LinearGradient>
          </View>
          <Text style={styles.title}>DFW PerkPass</Text>
          <Text style={styles.subtitle}>
            Discover thousands of exclusive deals and coupons in one place
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/auth/user-login')}
            activeOpacity={0.9}
            testID="user-card"
          >
            <View style={[styles.cardIconContainer, { backgroundColor: Colors.primary }]}>
              <User size={40} color={Colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I&apos;m a User</Text>
              <Text style={styles.cardDescription}>
                Browse and save coupons from local businesses
              </Text>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.cardArrowText}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/auth/business-login')}
            activeOpacity={0.9}
            testID="business-card"
          >
            <View style={[styles.cardIconContainer, { backgroundColor: Colors.secondary }]}>
              <Briefcase size={40} color={Colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I&apos;m a Business</Text>
              <Text style={styles.cardDescription}>
                Showcase your coupons to thousands of customers
              </Text>
              <View style={styles.subscriptionBadge}>
                <Text style={styles.subscriptionText}>$9.99/month</Text>
              </View>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.cardArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => router.push('/(tabs)/home')}
          activeOpacity={0.7}
          testID="skip-to-app"
        >
          <Text style={styles.testButtonText}>Skip to App (Testing)</Text>
          <ArrowRight size={20} color={Colors.primary} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://rork.app/2v8m2thbas1pjfqo1rail/privacy.html')}
            activeOpacity={0.7}
          >
            <Text style={styles.privacyLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    flex: 1,
    gap: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  subscriptionBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  subscriptionText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  cardArrow: {
    marginLeft: 12,
  },
  cardArrowText: {
    fontSize: 32,
    color: Colors.textSecondary,
    fontWeight: '300' as const,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginTop: 32,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  footer: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  privacyLink: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '600' as const,
    textDecorationLine: 'underline' as const,
  },
});
