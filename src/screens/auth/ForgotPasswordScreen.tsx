import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {colors, fontSize, radius, spacing} from '../../theme';

/**
 * Forgot Password — email input + reset button (from the board).
 * Backend reset endpoint is wired when it is available; for now the screen
 * submits locally.
 */
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const onReset = () => {
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your email and we&apos;ll send reset instructions.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {sent ? <Text style={styles.note}>Reset link sent (demo).</Text> : null}
      <TouchableOpacity style={styles.button} onPress={onReset}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background, padding: spacing.lg},
  title: {fontSize: fontSize.xl, fontWeight: '700', color: colors.text},
  subtitle: {fontSize: fontSize.md, color: colors.muted, marginTop: spacing.sm},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.lg,
    color: colors.text,
    marginTop: spacing.lg,
  },
  note: {color: colors.success, marginTop: spacing.md, fontSize: fontSize.md},
  button: {
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {color: colors.white, fontSize: fontSize.lg, fontWeight: '600'},
});
