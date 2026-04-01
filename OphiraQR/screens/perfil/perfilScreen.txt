import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '../../services/api';

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
        <Text style={styles.infoValue} numberOfLines={2}>{value || '—'}</Text>
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

// ─── Skeleton placeholder ─────────────────────────────────────────────────────
const Skeleton = ({ width, height, style }) => {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[{ width, height, borderRadius: 8, backgroundColor: '#1a2a42', opacity: pulse }, style]}
    />
  );
};

// ─── Loading state ────────────────────────────────────────────────────────────
const LoadingView = () => (
  <View style={styles.loadingCard}>
    <Skeleton width={82} height={82} style={{ borderRadius: 41, marginBottom: 14 }} />
    <Skeleton width={180} height={16} style={{ marginBottom: 8 }} />
    <Skeleton width={120} height={11} style={{ marginBottom: 20 }} />
    <Skeleton width={260} height={36} style={{ borderRadius: 12 }} />
  </View>
);

// ─── Error state ──────────────────────────────────────────────────────────────
const ErrorView = ({ onRetry }) => (
  <View style={styles.errorCard}>
    <View style={styles.errorIconWrap}>
      <MaterialIcons name="wifi-off" size={28} color="#ef4444" />
    </View>
    <Text style={styles.errorTitle}>Sin conexión</Text>
    <Text style={styles.errorDesc}>No se pudo cargar tu perfil. Verifica tu conexión e intenta de nuevo.</Text>
    <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.75}>
      <MaterialIcons name="refresh" size={14} color="#3b82f6" />
      <Text style={styles.retryText}>Reintentar</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function UserProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const fetchUser = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.get('/usuarios/me');
      setUser(data);
      // Animar entrada solo al cargar con éxito
      Animated.parallel([
        Animated.timing(headerAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(avatarAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }),
      ]).start();
    } catch (e) {
      console.error('Error al cargar perfil:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const initials = user
    ? [user.nombre_usuario?.[0], user.apellido_paterno?.[0]].filter(Boolean).join('').toUpperCase()
    : '';

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* ── Header siempre visible ── */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: loading ? 1 : headerAnim,
            transform: [{
              translateY: loading ? 0 : headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }),
            }],
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
          {user && (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.75}
            >
              <MaterialIcons name="logout" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Loading ── */}
        {loading && <LoadingView />}

        {/* ── Error ── */}
        {!loading && error && <ErrorView onRetry={fetchUser} />}

        {/* ── Contenido ── */}
        {!loading && !error && user && (
          <>
            {/* Avatar Card */}
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
                {user.activo && <View style={styles.avatarOnline} />}
              </View>

              <Text style={styles.avatarName}>
                {[user.nombre_usuario, user.apellido_paterno, user.apellido_materno].filter(Boolean).join(' ')}
              </Text>
              <Text style={styles.avatarRole}>
                {[user.puesto, user.area].filter(Boolean).join(' · ')}
              </Text>

              <View style={styles.avatarMeta}>
                <View style={styles.avatarMetaItem}>
                  <MaterialIcons name="badge" size={12} color="#4a6fa8" />
                  <Text style={styles.avatarMetaText}>#{user.id_usuario}</Text>
                </View>
                <View style={styles.avatarMetaDivider} />
                <View style={styles.avatarMetaItem}>
                  <MaterialIcons name="calendar-today" size={12} color="#4a6fa8" />
                  <Text style={styles.avatarMetaText}>{formatDate(user.fecha_registro)}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Identidad */}
            <Section title="Identidad" icon="person" accent="#3b82f6" index={0}>
              <InfoRow label="Nombre(s)" value={user.nombre_usuario} icon="badge" accent="#3b82f6" index={1} />
              <InfoRow label="Apellido Paterno" value={user.apellido_paterno} icon="badge" accent="#3b82f6" index={2} />
              <InfoRow label="Apellido Materno" value={user.apellido_materno} icon="badge" accent="#3b82f6" index={3} />
            </Section>

            {/* Contacto */}
            <Section title="Contacto" icon="alternate-email" accent="#10b981" index={1}>
              <InfoRow label="Correo electrónico" value={user.correo} icon="mail-outline" accent="#10b981" index={4} fullWidth />
              <InfoRow label="Teléfono" value={user.telefono} icon="phone" accent="#10b981" index={5} />
            </Section>

            {/* Rol y Puesto */}
            <Section title="Rol y Puesto" icon="work" accent="#f59e0b" index={2}>
              <InfoRow label="Puesto" value={user.puesto} icon="corporate-fare" accent="#f59e0b" index={6} />
              <InfoRow label="Área" value={user.area} icon="domain" accent="#f59e0b" index={7} />
            </Section>

            {/* Registro */}
            <Section title="Registro" icon="history" accent="#8b5cf6" index={3}>
              <InfoRow label="Fecha de registro" value={formatDate(user.fecha_registro)} icon="calendar-today" accent="#8b5cf6" index={8} fullWidth />
            </Section>

            {/* Nota */}
            <Animated.View style={[styles.readonlyNote, { opacity: headerAnim }]}>
              <MaterialIcons name="lock-outline" size={13} color="#3a5070" />
              <Text style={styles.readonlyText}>
                Esta información es de solo lectura. Contacta a tu administrador para solicitar cambios.
              </Text>
            </Animated.View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1120', paddingTop: 54, paddingHorizontal: 16 },
  glow1: { position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: '#0044cc', opacity: 0.045 },
  glow2: { position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: '#8b5cf6', opacity: 0.035 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 22, gap: 10 },
  backBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2a42', alignItems: 'center', justifyContent: 'center' },
  headerSub: { fontSize: 9, color: '#4a6fa8', letterSpacing: 1.5, fontWeight: '700', marginBottom: 3 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#f0f4ff', letterSpacing: 0.2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  scroll: { paddingBottom: 16 },

  // ── Loading ──
  loadingCard: { backgroundColor: '#111827', borderRadius: 20, borderWidth: 1, borderColor: '#1a2a42', alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20, marginBottom: 16 },

  // ── Error ──
  errorCard: { backgroundColor: '#111827', borderRadius: 20, borderWidth: 1, borderColor: '#2a1a1a', alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, marginTop: 20 },
  errorIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  errorTitle: { color: '#f0f4ff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  errorDesc: { color: '#5a7a9e', fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#1d3461', borderWidth: 1, borderColor: '#2563eb', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  retryText: { color: '#3b82f6', fontSize: 13, fontWeight: '700' },

  // ── Avatar ──
  avatarCard: { backgroundColor: '#111827', borderRadius: 20, borderWidth: 1, borderColor: '#1a2a42', alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, marginBottom: 16, overflow: 'hidden' },
  avatarGradientWrap: { position: 'relative', marginBottom: 16 },
  avatarCircle: { width: 82, height: 82, borderRadius: 41, backgroundColor: '#1d3461', borderWidth: 2, borderColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#dce8f5', fontSize: 28, fontWeight: '700', letterSpacing: 1 },
  avatarOnline: { position: 'absolute', bottom: 3, right: 3, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#111827' },
  avatarName: { color: '#f0f4ff', fontSize: 18, fontWeight: '700', letterSpacing: 0.2, textAlign: 'center', marginBottom: 6 },
  avatarRole: { color: '#4a6fa8', fontSize: 12, fontWeight: '500', letterSpacing: 0.3, marginBottom: 18 },
  avatarMeta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1829', borderRadius: 12, borderWidth: 1, borderColor: '#1a2a42', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  avatarMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatarMetaText: { color: '#5a7a9e', fontSize: 10, fontWeight: '600' },
  avatarMetaDivider: { width: 1, height: 14, backgroundColor: '#1a2a42' },

  // ── Section ──
  section: { backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1a2a42', marginBottom: 14, overflow: 'hidden' },
  sectionBar: { height: 3, width: '100%', opacity: 0.85 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#0d1829', gap: 10 },
  sectionIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: '#dce8f5', fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  sectionGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 8 },

  // ── InfoRow ──
  infoRow: { width: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#0d1829', borderRadius: 12, borderWidth: 1, borderColor: '#1a2a42', padding: 11, gap: 9 },
  infoRowFull: { width: '100%' },
  infoIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  infoLabel: { color: '#3a5070', fontSize: 9, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 4 },
  infoValue: { color: '#dce8f5', fontSize: 13, fontWeight: '600', lineHeight: 18 },

  // ── Readonly note ──
  readonlyNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0d1829', borderRadius: 12, borderWidth: 1, borderColor: '#1a2a42', paddingHorizontal: 14, paddingVertical: 12, marginTop: 4 },
  readonlyText: { color: '#3a5070', fontSize: 11, lineHeight: 16, flex: 1 },

  logoutBtn: {
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: '#111827',
  borderWidth: 1,
  borderColor: '#2a1a1a',
  alignItems: 'center',
  justifyContent: 'center',
},
});