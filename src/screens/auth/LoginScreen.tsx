import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../../context/AuthContext';
import {colors, fontSize, radius, spacing} from '../../theme';
import type {RootStackParamList} from '../../navigation/types';

export default function LoginScreen() {
  const {login} = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [organization_slug, setOrganizationSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await login({
        organization_slug: organization_slug.trim(),
        email: email.trim(),
        password: password.trim(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>ARGUS</Text>
          <Text style={styles.subtitle}>Login</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Organization tenant ID"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          value={organization_slug}
          onChangeText={setOrganizationSlug}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={submitting}>
          <Text style={styles.buttonText}>
            {submitting ? 'Logging in…' : 'Log In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  container: {flex: 1, justifyContent: 'center', padding: spacing.lg},
  header: {marginBottom: spacing.xl},
  brand: {fontSize: fontSize.xxl, fontWeight: '800', color: colors.text},
  subtitle: {fontSize: fontSize.md, color: colors.muted, marginTop: spacing.xs},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },
  error: {color: colors.danger, marginBottom: spacing.md, fontSize: fontSize.md},
  button: {
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  buttonDisabled: {opacity: 0.6},
  buttonText: {color: colors.white, fontSize: fontSize.lg, fontWeight: '600'},
  link: {color: colors.accent, textAlign: 'center', marginTop: spacing.md},
});
