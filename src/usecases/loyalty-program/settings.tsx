import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import TopNavbar from '../../components/TopNavbar';
import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';
import {useNodeScope} from '../../hooks/useNodeScope';
import {apiFetch} from '../../lib/api';
import {fetchOrgNodes} from '../../services/node_service';
import {colors, fontSize, radius, spacing} from '../../theme';

/** Loyalty settings — Super Admin configures the per-node loyalty threshold. */
export default function LoyaltySettingsPage() {
  const {can} = useAuth();
  const {showToast} = useToast();
  const {nodeId} = useNodeScope();
  const [nodes, setNodes] = useState<{id: string; name: string}[]>([]);
  const [selected, setSelected] = useState<string | null>(nodeId ?? null);
  const [threshold, setThreshold] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const editable = can('loyalty.edit');

  useEffect(() => {
    let cancelled = false;
    fetchOrgNodes()
      .then(v => {
        if (!cancelled) {
          setNodes(v);
          setSelected(prev => prev ?? v[0]?.id ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNodes([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selected) {
      return;
    }
    let cancelled = false;
    apiFetch<{loyalty_threshold?: number}>(`/loyalty/settings/${selected}`)
      .then(v => {
        if (!cancelled) {
          setThreshold(String(v.loyalty_threshold ?? ''));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setThreshold('');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const onSave = async () => {
    if (!selected) {
      return;
    }
    const t = parseInt(threshold, 10);
    if (Number.isNaN(t) || t < 1) {
      setMessage('Enter a threshold of at least 1.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await apiFetch(`/loyalty/settings/${selected}`, {
        method: 'PUT',
        body: {loyalty_threshold: t},
      });
      showToast('Loyalty threshold saved.', 'success');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <TopNavbar title="Loyalty Settings" back />
      <ScrollView contentContainerStyle={styles.content}>
        {!editable ? (
          <Text style={styles.note}>
            Only Super Admin (loyalty.edit) can change loyalty settings.
          </Text>
        ) : null}
        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" />
        ) : (
          <>
            <Text style={styles.label}>Node</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}>
              {nodes.map(n => (
                <TouchableOpacity
                  key={n.id}
                  style={[styles.chip, selected === n.id && styles.chipActive]}
                  onPress={() => setSelected(n.id)}>
                  <Text
                    style={selected === n.id ? styles.chipActiveLabel : styles.chipLabel}>
                    {n.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Loyalty threshold (visits)</Text>
            <TextInput
              style={styles.input}
              value={threshold}
              onChangeText={setThreshold}
              keyboardType="number-pad"
              editable={editable}
              placeholder="e.g. 5"
              placeholderTextColor={colors.muted}
            />
            {message ? <Text style={styles.message}>{message}</Text> : null}
            {editable ? (
              <TouchableOpacity
                style={[styles.btn, saving && styles.btnDisabled]}
                onPress={onSave}
                disabled={saving}>
                <Text style={styles.btnLabel}>
                  {saving ? 'Saving…' : 'Save Threshold'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.md},
  note: {color: colors.muted, fontSize: fontSize.md, marginBottom: spacing.md},
  loader: {marginTop: spacing.lg},
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chips: {gap: spacing.sm},
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {backgroundColor: colors.text, borderColor: colors.text},
  chipLabel: {color: colors.text},
  chipActiveLabel: {color: colors.white, fontWeight: '600'},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  message: {color: colors.success, marginTop: spacing.md, fontSize: fontSize.md},
  btn: {
    marginTop: spacing.md,
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  btnDisabled: {opacity: 0.6},
  btnLabel: {color: colors.white, fontSize: fontSize.lg, fontWeight: '600'},
});
