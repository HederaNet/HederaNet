import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/index';
import { colors, spacing, typography } from '../theme/index';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:4000';

interface NetworkStats {
  totalActiveHotspots: number;
  totalUsers: number;
  energyTradedKwhToday: number;
  totalHbarSettled: number;
}

export function HomeScreen() {
  const { accountId, hbarBalance } = useSelector((state: RootState) => state.wallet);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/network/stats`);
      const data = (await res.json()) as { data: NetworkStats };
      setStats(data.data);
    } catch {
      // Fail silently — show cached
    }
  };

  useEffect(() => {
    void fetchStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.accountId}>{accountId ?? 'Not connected'}</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>HBAR Balance</Text>
          <Text style={styles.balanceAmount}>{hbarBalance?.toFixed(4) ?? '0.0000'} ℏ</Text>
          <Text style={styles.balanceUsd}>≈ ${((hbarBalance ?? 0) * 0.075).toFixed(2)} USD</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { label: 'Buy Energy', icon: '⚡', color: '#f59e0b' },
              { label: 'Sell Energy', icon: '☀️', color: '#10b981' },
              { label: 'Subscribe', icon: '📶', color: '#3b82f6' },
              { label: 'Governance', icon: '🗳️', color: '#8b5cf6' },
            ].map((action) => (
              <TouchableOpacity key={action.label} style={[styles.actionButton, { borderColor: action.color }]}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Network Stats */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Network Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalActiveHotspots}</Text>
                <Text style={styles.statLabel}>Active Nodes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalUsers}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.energyTradedKwhToday.toFixed(1)}</Text>
                <Text style={styles.statLabel}>kWh Today</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalHbarSettled.toFixed(0)}</Text>
                <Text style={styles.statLabel}>ℏ Settled</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md },
  header: { marginBottom: spacing.lg },
  greeting: { ...typography.h2, color: colors.text },
  accountId: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  balanceLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balanceAmount: { fontSize: 36, fontWeight: '700', color: '#fff', fontFamily: 'System' },
  balanceUsd: { ...typography.caption, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  actionIcon: { fontSize: 28, marginBottom: 6 },
  actionLabel: { ...typography.caption, color: colors.text, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
});
