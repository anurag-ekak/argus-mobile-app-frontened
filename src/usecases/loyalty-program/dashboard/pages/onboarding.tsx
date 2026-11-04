import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import ScreenHeader from '../../../../components/ScreenHeader';
import {useNodeScope} from '../../../../hooks/useNodeScope';
import {onboardMember} from '../../../../services/loyalty_service';
import {useToast} from '../../../../context/ToastContext';
import {colors, fontSize, radius, spacing} from '../../../../theme';
import type {RootStackParamList} from '../../../../navigation/types';

export default function LoyaltyOnboardingPage() {
  const route = useRoute<RouteProp<RootStackParamList, 'LoyaltyOnboarding'>>();
  const {nodeId} = useNodeScope();
  const {showToast} = useToast();
  const [visitorId, setVisitorId] = useState(route.params?.visitorId ?? '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    const targetNode = route.params?.nodeId ?? nodeId;
    if (!visitorId.trim() || !targetNode) {
      setMessage('Visitor and node are required.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await onboardMember({
        visitor_id: visitorId.trim(),
        node_id: targetNode,
        name,
        email,
        phone,
      });
      showToast('Member onboarded successfully.', 'success');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Onboarding failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}>
      <ScreenHeader title="Loyalty Onboarding" />
      <ScrollView contentContainerStyle={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Visitor ID"
          value={visitorId}
          onChangeText={setVisitorId}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={submitting}>
          <Text style={styles.buttonLabel}>
            {submitting ? 'Saving…' : 'Save New Loyalty Member'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  form: {padding: spacing.md},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },
  message: {color: colors.success, marginBottom: spacing.md, fontSize: fontSize.md},
  button: {
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  buttonDisabled: {opacity: 0.6},
  buttonLabel: {color: colors.white, fontSize: fontSize.lg, fontWeight: '600'},
});
