import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { io } from 'socket.io-client';
import { CommodityCode, MarketSnapshot } from '@mcx/shared-types';
import { COMMODITY_NAMES, formatINR, formatPercent } from '@mcx/shared-utils';

const API_SERVER_URL = 'http://localhost:4000';

export default function App() {
  const [snapshots, setSnapshots] = useState<Record<string, MarketSnapshot>>({});
  const [status, setStatus] = useState<'CONNECTED' | 'RECONNECTING'>('RECONNECTING');

  useEffect(() => {
    const socket = io(API_SERVER_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setStatus('CONNECTED');
      socket.emit('subscribe', { rooms: ['market:all'] });
    });

    socket.on('disconnect', () => {
      setStatus('RECONNECTING');
    });

    socket.on('market:init', (data: { snapshots: MarketSnapshot[] }) => {
      if (data?.snapshots) {
        const map: Record<string, MarketSnapshot> = {};
        for (const s of data.snapshots) {
          map[s.commodity] = s;
        }
        setSnapshots(map);
      }
    });

    socket.on('market:snapshot', (s: MarketSnapshot) => {
      setSnapshots((prev) => ({ ...prev, [s.commodity]: s }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const items = Object.values(snapshots);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>MCX LIVE TERMINAL</Text>
        <View style={[styles.badge, status === 'CONNECTED' ? styles.badgeLive : styles.badgeReconnecting]}>
          <Text style={styles.badgeText}>{status}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.commodity}
        renderItem={({ item }) => {
          const isUp = item.change >= 0;
          return (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.symbol}>{COMMODITY_NAMES[item.commodity as CommodityCode]?.name || item.commodity}</Text>
                <Text style={styles.expiry}>{item.expiry}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.price}>{formatINR(item.ltp)}</Text>
                <Text style={[styles.change, isUp ? styles.up : styles.down]}>
                  {formatPercent(item.changePercent)}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070A11' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#1F2937' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#F59E0B' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeLive: { backgroundColor: '#064E3B' },
  badgeReconnecting: { backgroundColor: '#1E3A8A' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  card: { backgroundColor: '#111827', marginHorizontal: 16, marginVertical: 6, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1F2937' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  symbol: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  expiry: { fontSize: 12, color: '#9CA3AF' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#F3F4F6' },
  change: { fontSize: 14, fontWeight: 'bold' },
  up: { color: '#10B981' },
  down: { color: '#EF4444' },
});
