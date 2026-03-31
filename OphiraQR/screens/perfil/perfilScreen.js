import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import { api } from '../../services/api';

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_USER = {
  id_usuario: 42,
  nombre_usuario: 'María Fernanda',
  apellido_paterno: 'Ramírez',
  apellido_materno: 'Torres',
  correo: 'mramirez@empresa.com',
  telefono: '+52 442 123 4567',
  id_rol: 2,
  id_puesto: 1,
  activo: true,
  fecha_registro: '2024-03-15',
  puesto: 'Gerente TI',
  area: 'Tecnología',
  rol: 'Técnico',
};

// ─── InfoRow ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon, accent = '#3b82f6', index, fullWidth = false }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, delay: index * 55, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 320, delay: index * 55, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.infoRow,
        fullWidth && styles.infoRowFull,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={[styles.infoIconWrap, { backgroundColor: accent + '18' }]}>
        <MaterialIcons name={icon} size={13} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={2}>
          {value || '—'}
        </Text>
      </View>
    </Animated.View>
  );
};

// ─── Section ─────────────────────────────────────────────────────────────────
const Section = ({ title, icon, accent = '#3b82f6', children, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 380, delay: index * 90, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
      <View style={[styles.sectionBar, { backgroundColor: accent }]} />
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, { backgroundColor: accent + '20' }]}>
          <MaterialIcons name={icon} size={15} color={accent} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionGrid}>{children}</View>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function UserProfileScreen({ route, navigation }) {
  // En producción: const user = route?.params?.user || MOCK_USER;
  const user = MOCK_USER;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(avatarAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const initials = [user.nombre_usuario?.[0], user.apellido_paterno?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      {/* Glows decorativos */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* ── Header ── */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
          },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={14} color="#4a6fa8" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>MI CUENTA</Text>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: user.activo ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)' }]}>
          <View style={[styles.statusDot, { backgroundColor: user.activo ? '#10b981' : '#ef4444' }]} />
          <Text style={[styles.statusText, { color: user.activo ? '#10b981' : '#ef4444' }]}>
            {user.activo ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Avatar Card ── */}
        <Animated.View
          style={[
            styles.avatarCard,
            {
              opacity: avatarAnim,
              transform: [{ scale: avatarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.93, 1] }) }],
            },
          ]}
        >
          <View style={styles.avatarGradientWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.avatarOnline} />
          </View>

          <Text style={styles.avatarName}>
            {user.nombre_usuario} {user.apellido_paterno} {user.apellido_materno}
          </Text>
          <Text style={styles.avatarRole}>{user.puesto} · {user.area}</Text>

          <View style={styles.avatarMeta}>
            <View style={styles.avatarMetaItem}>
              <MaterialIcons name="badge" size={12} color="#4a6fa8" />
              <Text style={styles.avatarMetaText}>#{user.id_usuario}</Text>
            </View>
            <View style={styles.avatarMetaDivider} />
            <View style={styles.avatarMetaItem}>
              <MaterialIcons name="security" size={12} color="#4a6fa8" />
              <Text style={styles.avatarMetaText}>{user.rol}</Text>
            </View>
            <View style={styles.avatarMetaDivider} />
            <View style={styles.avatarMetaItem}>
              <MaterialIcons name="calendar-today" size={12} color="#4a6fa8" />
              <Text style={styles.avatarMetaText}>{formatDate(user.fecha_registro)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Identidad ── */}
        <Section title="Identidad" icon="person" accent="#3b82f6" index={0}>
          <InfoRow label="Nombre(s)" value={user.nombre_usuario} icon="badge" accent="#3b82f6" index={1} />
          <InfoRow label="Apellido Paterno" value={user.apellido_paterno} icon="badge" accent="#3b82f6" index={2} />
          <InfoRow label="Apellido Materno" value={user.apellido_materno} icon="badge" accent="#3b82f6" index={3} />
        </Section>

        {/* ── Contacto ── */}
        <Section title="Contacto" icon="alternate-email" accent="#10b981" index={1}>
          <InfoRow label="Correo electrónico" value={user.correo} icon="mail-outline" accent="#10b981" index={4} fullWidth />
          <InfoRow label="Teléfono" value={user.telefono} icon="phone" accent="#10b981" index={5} />
        </Section>

        {/* ── Rol y Puesto ── */}
        <Section title="Rol y Puesto" icon="work" accent="#f59e0b" index={2}>
          <InfoRow label="Rol del sistema" value={user.rol} icon="security" accent="#f59e0b" index={6} />
          <InfoRow label="Puesto" value={user.puesto} icon="corporate-fare" accent="#f59e0b" index={7} />
          <InfoRow label="Área" value={user.area} icon="domain" accent="#f59e0b" index={8} />
        </Section>

        {/* ── Registro ── */}
        <Section title="Registro" icon="history" accent="#8b5cf6" index={3}>
          <InfoRow label="Fecha de registro" value={formatDate(user.fecha_registro)} icon="calendar-today" accent="#8b5cf6" index={9} fullWidth />
        </Section>

        {/* ── Nota de solo lectura ── */}
        <Animated.View style={[styles.readonlyNote, { opacity: headerAnim }]}>
          <MaterialIcons name="lock-outline" size={13} color="#3a5070" />
          <Text style={styles.readonlyText}>
            Esta información es de solo lectura. Contacta a tu administrador para solicitar cambios.
          </Text>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b1120',
    paddingTop: 54,
    paddingHorizontal: 16,
  },
  glow1: {
    position: 'absolute', top: -80, right: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#0044cc', opacity: 0.045,
  },
  glow2: {
    position: 'absolute', bottom: -60, left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#8b5cf6', opacity: 0.035,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    gap: 10,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#111827',
    borderWidth: 1, borderColor: '#1a2a42',
    alignItems: 'center', justifyContent: 'center',
  },
  headerSub: {
    fontSize: 9, color: '#4a6fa8',
    letterSpacing: 1.5, fontWeight: '700', marginBottom: 3,
  },
  headerTitle: {
    fontSize: 22, fontWeight: '700',
    color: '#f0f4ff', letterSpacing: 0.2,
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, gap: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  scroll: { paddingBottom: 16 },

  // ── Avatar Card ──
  avatarCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a2a42',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarGradientWrap: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 82, height: 82, borderRadius: 41,
    backgroundColor: '#1d3461',
    borderWidth: 2, borderColor: '#2563eb',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: {
    color: '#dce8f5',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
  avatarOnline: {
    position: 'absolute',
    bottom: 3, right: 3,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2, borderColor: '#111827',
  },
  avatarName: {
    color: '#f0f4ff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginBottom: 6,
  },
  avatarRole: {
    color: '#4a6fa8',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginBottom: 18,
  },
  avatarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1829',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a2a42',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  avatarMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatarMetaText: { color: '#5a7a9e', fontSize: 10, fontWeight: '600' },
  avatarMetaDivider: { width: 1, height: 14, backgroundColor: '#1a2a42' },

  // ── Section ──
  section: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a2a42',
    marginBottom: 14,
    overflow: 'hidden',
  },
  sectionBar: { height: 3, width: '100%', opacity: 0.85 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0d1829',
    gap: 10,
  },
  sectionIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: {
    color: '#dce8f5', fontSize: 13,
    fontWeight: '700', letterSpacing: 0.2,
  },
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 8,
  },

  // ── InfoRow ──
  infoRow: {
    width: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0d1829',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a2a42',
    padding: 11,
    gap: 9,
  },
  infoRowFull: {
    width: '100%',
  },
  infoIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  infoLabel: {
    color: '#3a5070',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    color: '#dce8f5',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  // ── Readonly note ──
  readonlyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0d1829',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a2a42',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  readonlyText: {
    color: '#3a5070',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});