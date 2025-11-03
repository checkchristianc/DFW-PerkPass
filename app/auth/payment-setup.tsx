import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, DollarSign, Shield, CheckCircle, AlertCircle } from 'lucide-react-native';
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';


import StripeCardInput, { StripeCardInputRef } from '@/components/StripeCardInput';
import Colors from '@/constants/colors';
import { STRIPE_CONFIG } from '@/constants/stripe';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentSetupScreen() {
  const params = useLocalSearchParams();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isCardComplete, setIsCardComplete] = useState(false);
  const cardInputRef = useRef<StripeCardInputRef>(null);

  const businessData = {
    businessName: params.businessName as string,
    ownerName: params.ownerName as string,
    email: params.email as string,
  };

  const handleCardComplete = useCallback((complete: boolean) => {
    console.log('Card complete status:', complete);
    setIsCardComplete(complete);
    if (complete) {
      setError('');
    }
  }, []);

  const handlePaymentMethodCreated = useCallback((pmId: string) => {
    console.log('Payment method created callback:', pmId);
  }, []);

  const handleError = useCallback((err: string) => {
    console.error('Card input error:', err);
    setError(err);
  }, []);

  const handleSetupPayment = async () => {
    if (!cardInputRef.current?.isCardComplete) {
      setError('Please complete your card details');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const pmId = await cardInputRef.current?.createPaymentMethod();

      if (!pmId) {
        setError('Failed to process payment method');
        setIsSubmitting(false);
        return;
      }

      console.log('Setting up subscription with payment method:', pmId);

      const subscriptionResponse = await fetch('https://api.stripe.com/v1/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          customer: 'cus_placeholder',
          payment_method: pmId,
          price: 'price_placeholder',
        }).toString(),
      });

      if (!subscriptionResponse.ok) {
        throw new Error('Failed to create subscription');
      }

      const user = {
        id: Date.now().toString(),
        email: businessData.email,
        name: businessData.ownerName,
        type: 'business' as const,
        businessName: businessData.businessName,
        subscriptionActive: true,
        stripeCustomerId: 'cus_placeholder',
        stripePaymentMethodId: pmId,
        stripeConnectedAccountId: '',
      };

      login(user);

      Alert.alert(
        'Success!',
        'Your business account has been activated. Welcome to DFW PerkPass!',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/business/dashboard'),
          },
        ]
      );
    } catch (err) {
      console.error('Payment setup error:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <CreditCard size={48} color={Colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.title}>Setup Payment</Text>
            <Text style={styles.subtitle}>
              Complete your subscription to activate your business account
            </Text>
          </View>

          <View style={styles.businessInfo}>
            <Text style={styles.businessInfoLabel}>Business Account</Text>
            <Text style={styles.businessInfoValue}>{businessData.businessName}</Text>
            <Text style={styles.businessInfoEmail}>{businessData.email}</Text>
          </View>

          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <DollarSign size={28} color={Colors.primary} strokeWidth={2.5} />
              <Text style={styles.pricingPrice}>${STRIPE_CONFIG.monthlySubscriptionPrice}</Text>
              <Text style={styles.pricingPeriod}>/month</Text>
            </View>
            <Text style={styles.pricingDescription}>
              Full access to all business features
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={styles.featureText}>Unlimited coupon listings</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={styles.featureText}>Featured placement options</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={styles.featureText}>Customer analytics dashboard</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={styles.featureText}>Cancel anytime</Text>
            </View>
          </View>

          <View style={styles.cardSection}>
            <StripeCardInput
              ref={cardInputRef}
              onCardComplete={handleCardComplete}
              onPaymentMethodCreated={handlePaymentMethodCreated}
              onError={handleError}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={18} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.securityNote}>
            <Shield size={16} color={Colors.textSecondary} />
            <Text style={styles.securityText}>
              Secured by Stripe. Your payment information is encrypted and secure.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isCardComplete || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSetupPayment}
            disabled={!isCardComplete || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.accent} />
            ) : (
              <>
                <CreditCard size={20} color={Colors.accent} />
                <Text style={styles.submitButtonText}>
                  Activate Subscription - ${STRIPE_CONFIG.monthlySubscriptionPrice}/mo
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  businessInfo: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  businessInfoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  businessInfoValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  businessInfoEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pricingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginLeft: 8,
  },
  pricingPeriod: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    marginLeft: 4,
  },
  pricingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  features: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  cardSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.error}15`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
});
