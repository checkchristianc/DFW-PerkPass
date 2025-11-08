import { router } from 'expo-router';
import { Briefcase, Mail, Lock, Building2, DollarSign, CheckCircle, CheckSquare, Square } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { PRIVACY_POLICY_URL } from '@/constants/config';
import { useAuth } from '@/contexts/AuthContext';

export default function BusinessLoginScreen() {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = () => {
    if (!email || !password || (isSignUp && (!businessName || !ownerName))) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && !agreedToTerms) {
      Alert.alert('Error', 'Please agree to the Privacy Policy to continue');
      return;
    }

    if (isSignUp) {
      router.push({
        pathname: '/auth/payment-setup',
        params: {
          businessName,
          ownerName,
          email,
        },
      });
    } else {
      const user = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        type: 'business' as const,
        businessName: businessName || 'My Business',
        subscriptionActive: true,
      };
      login(user);
      router.replace('/(business-tabs)/dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Briefcase size={48} color={Colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.title}>
              {isSignUp ? 'Business Sign Up' : 'Business Login'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Join DFW PerkPass and reach thousands of customers'
                : 'Sign in to manage your business coupons'}
            </Text>
          </View>

          {isSignUp && (
            <View style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <DollarSign size={32} color={Colors.primary} strokeWidth={2.5} />
                <Text style={styles.pricingPrice}>$9.99</Text>
                <Text style={styles.pricingPeriod}>/month</Text>
              </View>
              <Text style={styles.pricingDescription}>
                Everything you need to showcase your business
              </Text>
              <View style={styles.featuresList}>
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
                  <Text style={styles.featureText}>Analytics & insights</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={20} color={Colors.success} />
                  <Text style={styles.featureText}>Customer engagement tools</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.form}>
            {isSignUp && (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Building2 size={20} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Business Name"
                    placeholderTextColor={Colors.textSecondary}
                    value={businessName}
                    onChangeText={setBusinessName}
                    autoCapitalize="words"
                    testID="business-name-input"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Briefcase size={20} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Owner Name"
                    placeholderTextColor={Colors.textSecondary}
                    value={ownerName}
                    onChangeText={setOwnerName}
                    autoCapitalize="words"
                    testID="owner-name-input"
                  />
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Mail size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Business Email"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                testID="email-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Lock size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                testID="password-input"
              />
            </View>

            {isSignUp && (
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                activeOpacity={0.7}
              >
                {agreedToTerms ? (
                  <CheckSquare size={24} color={Colors.secondary} />
                ) : (
                  <Square size={24} color={Colors.textSecondary} />
                )}
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
              testID="submit-button"
            >
              <Text style={styles.submitButtonText}>
                {isSignUp ? 'Continue to Payment' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
              activeOpacity={0.7}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <Text style={styles.switchButtonTextBold}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Back to Selection</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  pricingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pricingPrice: {
    fontSize: 42,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginLeft: 8,
  },
  pricingPeriod: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
    marginLeft: 4,
  },
  pricingDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  switchButtonTextBold: {
    color: Colors.secondary,
    fontWeight: '700' as const,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.secondary,
    fontWeight: '600' as const,
    textDecorationLine: 'underline' as const,
  },
});
