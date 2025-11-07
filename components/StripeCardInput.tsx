import { CreditCard } from 'lucide-react-native';
import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

import Colors from '@/constants/colors';

export interface StripeCardInputRef {
  createPaymentMethod: () => Promise<string | null>;
  isCardComplete: boolean;
  isProcessing: boolean;
}

interface StripeCardInputProps {
  onCardComplete?: (isComplete: boolean) => void;
  onPaymentMethodCreated?: (paymentMethodId: string) => void;
  onError?: (error: string) => void;
}

const StripeCardInput = forwardRef<StripeCardInputRef, StripeCardInputProps>(
  ({ onPaymentMethodCreated, onCardComplete }, ref) => {
    const [isProcessing] = useState(false);

    const createPaymentMethodFromCard = useCallback(async () => {
      const testPaymentMethodId = 'pm_test_' + Date.now();
      console.log('Test mode: Using test payment method ID:', testPaymentMethodId);
      onPaymentMethodCreated?.(testPaymentMethodId);
      return testPaymentMethodId;
    }, [onPaymentMethodCreated]);

    useImperativeHandle(ref, () => ({
      createPaymentMethod: createPaymentMethodFromCard,
      isCardComplete: true,
      isProcessing,
    }));

    React.useEffect(() => {
      onCardComplete?.(true);
    }, [onCardComplete]);

    return (
      <View style={styles.container}>
        <View style={styles.labelContainer}>
          <CreditCard size={20} color={Colors.primary} />
          <Text style={styles.label}>Payment Card</Text>
        </View>

        <View style={styles.cardFieldContainer}>
          <View style={styles.webFallback}>
            <TextInput
              style={styles.webInput}
              placeholder="Card Number"
              placeholderTextColor={Colors.textSecondary}
              editable={false}
            />
            <Text style={styles.webNotice}>
              Payment integration placeholder - Using test mode for demo.
            </Text>
          </View>
        </View>

        <Text style={styles.helperText}>
          Your payment information is securely processed by Stripe
        </Text>
      </View>
    );
  }
);
StripeCardInput.displayName = 'StripeCardInput';

export default StripeCardInput;

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  cardFieldContainer: {
    position: 'relative',
  },
  cardField: {
    height: 50,
    marginVertical: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  webFallback: {
    gap: 8,
  },
  webInput: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
  },
  webNotice: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
