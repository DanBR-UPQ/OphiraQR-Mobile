import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState, useMemo, useRef } from 'react';
import { api } from '../../services/api';

/* ─── Animated Donut ─────────────────────────────────────────────────────── */
const DonutChart = ({ data, size = 120, strokeWidth = 14 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const colors = ['#3b82f6', '#06b6d4', '#a78bfa', '#34d399', '#f97316'];
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  let cumulativePercent = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1a2a42"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {data.map((item, index) => {
          const strokeDasharray = `${item.percent * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercent * circumference;
          cumulativePercent += item.percent;
          return (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors[index % colors.length]}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          );
        })}
      </Svg>
      <View style={[styles.donutCenter, { top: size / 2 - 22, left: 0, right: 0 }]}>
        <Text style={styles.donutLabel}>Total</Text>
        <Text style={styles.donutValue}>100%</Text>
      </View>
    </View>
  );
};

/* ─── Stat Pill ──────────────────────────────────────────────────────────── */
const StatPill = ({ icon, value, label, color, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statPill,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
        <MaterialIcons name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

/* ─── Asset Row ──────────────────────────────────────────────────────────── */
const AssetRow = ({ item, onPress, isLast, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isActivo = item.estado === 'Activo';
  const statusColor = isActivo ? '#34d399' : '#f87171';

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      <TouchableOpacity
        style={[styles.assetRow, isLast && { borderBottomWidth: 0 }]}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        {/* Left: icon + name */}
        <View style={styles.assetRowLeft}>
          <View style={styles.assetIconWrap}>
            <MaterialIcons name="inventory" size={15} color="#4a6fa8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.assetName} numberOfLines={1}>{item.nombre}</Text>
            <Text style={styles.assetMeta}>
              {item.categoria} · #{item.id}
            </Text>
          </View>
        </View>

        {/* Right: status + location */}
        <View style={styles.assetRowRight}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.assetStatus, { color: statusColor }]}>
            {item.estado}
          </Text>
          <Text style={styles.assetLoc}>{item.ubicacion}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function HomeScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivo, setSelectedActivo] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const modalAnim = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;
  const glowAnim = useRef(new Animated.Value(0.04)).current;

  /* Ambient glow pulse */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.09,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.04,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  /* Header entrance */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openModal = (item) => {
    setSelectedActivo(item);
    setDetailVisible(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      tension: 70,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setDetailVisible(false));
  };

  const cargarDatos = async () => {
    try {
      const datos = await api.get('/assets/activosUser');
      const formateado = datos.rows.map((item) => ({
        id: item.id_activo,
        nombre: item.nombre,
        descripcion: item.descripcion,
        estado: item.estado_nombre,
        categoria: item.categoria_nombre,
        ubicacion: item.id_aula,
        tipoAula: item.tipo_aula,
        numeroAula: item.numero_aula,
        fecha: item.fecha_compra,
        modelo: item.modelo,
        numeroSerie: item.numero_serie,
        precioCompra: item.precio_compra,
        valorActual: item.valor_actual,
        vidaUtilAnios: item.vida_util_anios,
        fechaRegistro: item.fecha_registro,
        multiparte: item.multiparte,
      }));
      setData(formateado);
    } catch (e) {
      console.log('ERROR:', e);
      Alert.alert('Error', 'No se pudieron cargar los activos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const activos = data.filter((d) => d.estado === 'Activo').length;
  const inactivos = data.filter((d) => d.estado !== 'Activo').length;
  const colors = ['#3b82f6', '#06b6d4', '#a78bfa', '#34d399', '#f97316'];

  const recientes = data.filter((d) => {
    const fecha = new Date(d.fecha);
    const hoy = new Date();
    const diff = (hoy - fecha) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const categoriasCount = useMemo(() => {
    const counts = {};
    data.forEach((d) => {
      counts[d.categoria] = (counts[d.categoria] || 0) + 1;
    });
    return counts;
  }, [data]);

  const categoriasPercent = Object.entries(categoriasCount).map(
    ([cat, count]) => ({
      nombre: cat,
      percent: data.length ? count / data.length : 0,
    })
  );

  const recientesLista = [...data]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#5a7a9e', fontSize: 14 }}>Cargando activos…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 48 }}
    >
      {/* Ambient glow */}
      <Animated.View style={[styles.bgGlow, { opacity: glowAnim }]} />
      <Animated.View style={[styles.bgGlow2, { opacity: glowAnim }]} />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerEyebrow}>PANEL DE CONTROL</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Perfil')} activeOpacity={0.7}>
            <MaterialIcons name="person" size={18} color="#4a6fa8" />
          </TouchableOpacity>
        </View>

        {/* Quick summary line */}
        <View style={styles.summaryLine}>
          <View style={styles.summaryDot} />
          <Text style={styles.summaryText}>
            {activos} activos operando ·{' '}
            {Object.keys(categoriasCount).length} categorías
          </Text>
        </View>
      </Animated.View>

      {/* ── Stat Strip ──────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statStrip}
        contentContainerStyle={styles.statStripContent}
      >
        <StatPill
          icon="inventory-2"
          value={data.length}
          label="Total"
          color="#3b82f6"
          delay={100}
        />
        <StatPill
          icon="check-circle"
          value={activos}
          label="Activos"
          color="#34d399"
          delay={180}
        />
        <StatPill
          icon="warning"
          value={inactivos}
          label="Inactivos"
          color="#f97316"
          delay={260}
        />
        <StatPill
          icon="schedule"
          value={recientes}
          label="Recientes"
          color="#a78bfa"
          delay={340}
        />
        <StatPill
          icon="category"
          value={Object.keys(categoriasCount).length}
          label="Categorías"
          color="#06b6d4"
          delay={420}
        />
      </ScrollView>

      {/* ── Distribución ────────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Distribución de Activos</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.chartRow}>
            <DonutChart data={categoriasPercent} />
            <View style={styles.legend}>
              {categoriasPercent.map((cat, i) => (
                <View key={i} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: colors[i % colors.length] },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.legendName} numberOfLines={1}>
                      {cat.nombre}
                    </Text>
                    <View style={styles.legendBarTrack}>
                      <View
                        style={[
                          styles.legendBarFill,
                          {
                            width: `${Math.round(cat.percent * 100)}%`,
                            backgroundColor: colors[i % colors.length],
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.legendPct,
                      { color: colors[i % colors.length] },
                    ]}
                  >
                    {Math.round(cat.percent * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* ── Activos Recientes ────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activos Recientes</Text>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate('Activos')}
          >
            <Text style={styles.viewAllText}>Ver todo</Text>
            <MaterialIcons name="arrow-forward" size={12} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {recientesLista.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={28} color="#1e2d45" />
              <Text style={styles.emptyText}>Sin actividad reciente</Text>
            </View>
          ) : (
            recientesLista.map((item, i) => (
              <AssetRow
                key={item.id}
                item={item}
                onPress={openModal}
                isLast={i === recientesLista.length - 1}
                delay={i * 80}
              />
            ))
          )}
        </View>
      </View>

      {/* ── Modal (untouched) ────────────────────────────────────────── */}
      <Modal visible={detailVisible} animationType="none" transparent>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <Animated.View
            style={[
              styles.modal,
              {
                transform: [
                  {
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
                opacity: modalAnim,
              },
            ]}
          >
            {selectedActivo &&
              (() => {
                const isActivo = selectedActivo.estado === 'Activo';
                const accent =
                  isActivo
                    ? '#10b981'
                    : selectedActivo.estado === 'Mantenimiento'
                    ? '#f59e0b'
                    : '#ef4444';

                const formatCurrency = (val) =>
                  val
                    ? `$${parseFloat(val).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}`
                    : '—';

                const formatDate = (iso) => {
                  if (!iso) return '—';
                  const d = new Date(iso);
                  return d.toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                };

                const ubicacionLabel = [
                  selectedActivo.tipoAula,
                  selectedActivo.numeroAula,
                  selectedActivo.ubicacion,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <TouchableOpacity activeOpacity={1}>
                    <View
                      style={[
                        styles.modalHeader,
                        { borderBottomColor: accent + '33' },
                      ]}
                    >
                      <View
                        style={[
                          styles.modalHeaderAccent,
                          { backgroundColor: accent },
                        ]}
                      />
                      <View
                        style={[
                          styles.modalIconCircle,
                          { backgroundColor: accent + '20' },
                        ]}
                      >
                        <MaterialIcons
                          name="inventory-2"
                          size={20}
                          color={accent}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.modalNombre} numberOfLines={2}>
                          {selectedActivo.nombre}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            marginTop: 5,
                          }}
                        >
                          <View
                            style={[
                              styles.modalStatusPill,
                              {
                                backgroundColor: accent + '20',
                                borderColor: accent + '40',
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.modalStatusDot,
                                { backgroundColor: accent },
                              ]}
                            />
                            <Text
                              style={[
                                styles.modalStatusText,
                                { color: accent },
                              ]}
                            >
                              {selectedActivo.estado}
                            </Text>
                          </View>
                          <Text style={styles.modalIdChip}>
                            #{selectedActivo.id}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {selectedActivo.descripcion ? (
                      <View style={styles.modalDescRow}>
                        <Text style={styles.modalDesc}>
                          {selectedActivo.descripcion}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.modalGrid}>
                      <View style={styles.modalGridItem}>
                        <Text style={styles.modalGridLabel}>Categoría</Text>
                        <Text style={styles.modalGridValue}>
                          {selectedActivo.categoria || '—'}
                        </Text>
                      </View>
                      <View style={styles.modalGridItem}>
                        <Text style={styles.modalGridLabel}>Ubicación</Text>
                        <Text style={styles.modalGridValue}>
                          {ubicacionLabel || '—'}
                        </Text>
                      </View>
                      <View style={styles.modalGridItem}>
                        <Text style={styles.modalGridLabel}>Modelo</Text>
                        <Text style={styles.modalGridValue}>
                          {selectedActivo.modelo || '—'}
                        </Text>
                      </View>
                      <View style={styles.modalGridItem}>
                        <Text style={styles.modalGridLabel}>No. Serie</Text>
                        <Text style={styles.modalGridValue}>
                          {selectedActivo.numeroSerie || '—'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalDivider} />

                    <View style={styles.modalFinancialRow}>
                      <View style={styles.modalFinancialItem}>
                        <Text style={styles.modalGridLabel}>Precio Compra</Text>
                        <Text
                          style={[
                            styles.modalFinancialValue,
                            { color: '#f0f4ff' },
                          ]}
                        >
                          {formatCurrency(selectedActivo.precioCompra)}
                        </Text>
                      </View>
                      <View style={styles.modalFinancialDivider} />
                      <View style={styles.modalFinancialItem}>
                        <Text style={styles.modalGridLabel}>Valor Actual</Text>
                        <Text
                          style={[
                            styles.modalFinancialValue,
                            { color: accent },
                          ]}
                        >
                          {formatCurrency(selectedActivo.valorActual)}
                        </Text>
                      </View>
                      <View style={styles.modalFinancialDivider} />
                      <View style={styles.modalFinancialItem}>
                        <Text style={styles.modalGridLabel}>Vida Útil</Text>
                        <Text
                          style={[
                            styles.modalFinancialValue,
                            { color: '#f0f4ff' },
                          ]}
                        >
                          {selectedActivo.vidaUtilAnios
                            ? `${selectedActivo.vidaUtilAnios} años`
                            : '—'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalFooter}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalFooterLabel}>Comprado</Text>
                        <Text style={styles.modalFooterValue}>
                          {formatDate(selectedActivo.fecha)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.closeBtn,
                          { backgroundColor: accent },
                        ]}
                        onPress={closeModal}
                      >
                        <Text style={styles.closeBtnText}>Cerrar</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })()}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080e1c',
    paddingHorizontal: 18,
    paddingTop: 56,
  },

  /* Ambient glows */
  bgGlow: {
    position: 'absolute',
    top: -40,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#1d4ed8',
  },
  bgGlow2: {
    position: 'absolute',
    top: 200,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#7c3aed',
  },

  /* Header */
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerEyebrow: {
    fontSize: 10,
    color: '#3b5a8a',
    letterSpacing: 1.8,
    fontWeight: '600',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#eef2ff',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0f1a2e',
    borderWidth: 1,
    borderColor: '#1e2d45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0d1829',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  summaryText: {
    color: '#5a7a9e',
    fontSize: 12,
    fontWeight: '500',
  },

  /* Stat strip */
  statStrip: {
    marginBottom: 28,
    marginHorizontal: -18,
  },
  statStripContent: {
    paddingHorizontal: 18,
    gap: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0d1829',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: '#3b5a8a',
    fontWeight: '500',
  },

  /* Section */
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dce8f5',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0d1829',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  viewAllText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
  },

  /* Card */
  card: {
    backgroundColor: '#0d1829',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a2a42',
    overflow: 'hidden',
  },

  /* Donut chart */
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutLabel: {
    color: '#3b5a8a',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  donutValue: {
    color: '#eef2ff',
    fontSize: 15,
    fontWeight: '800',
  },

  /* Chart row */
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  legend: {
    flex: 1,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendName: {
    fontSize: 11,
    color: '#a8c0d8',
    fontWeight: '500',
    marginBottom: 4,
  },
  legendBarTrack: {
    height: 3,
    backgroundColor: '#1a2a42',
    borderRadius: 2,
    overflow: 'hidden',
  },
  legendBarFill: {
    height: 3,
    borderRadius: 2,
  },
  legendPct: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'right',
  },

  /* Asset rows */
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111f35',
    justifyContent: 'space-between',
  },
  assetRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  assetRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assetIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#0a1424',
    borderWidth: 1,
    borderColor: '#1a2a42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dce8f5',
    marginBottom: 2,
    maxWidth: 160,
  },
  assetMeta: {
    fontSize: 10,
    color: '#3b5a8a',
    fontWeight: '500',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  assetStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  assetLoc: {
    fontSize: 11,
    color: '#3b5a8a',
    fontWeight: '500',
    marginLeft: 4,
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    color: '#3b5a8a',
    fontSize: 13,
  },

  /* ── Modal (untouched) ── */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5,10,22,0.8)',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 32,
  },
  modal: {
    backgroundColor: '#111827',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    position: 'relative',
  },
  modalHeaderAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  modalIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalNombre: {
    color: '#f0f4ff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  modalStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  modalStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  modalStatusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalIdChip: {
    color: '#3a5070',
    fontSize: 11,
    fontWeight: '600',
  },
  modalDescRow: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 4,
  },
  modalDesc: {
    color: '#5a7a9e',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  modalGridItem: {
    width: '47%',
    backgroundColor: '#0d1829',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a2a42',
    padding: 10,
  },
  modalGridLabel: {
    color: '#3a5070',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalGridValue: {
    color: '#dce8f5',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#1a2a42',
    marginHorizontal: 16,
  },
  modalFinancialRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalFinancialItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalFinancialDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#1a2a42',
  },
  modalFinancialValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a2a42',
  },
  modalFooterLabel: {
    color: '#3a5070',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  modalFooterValue: {
    color: '#5a7a9e',
    fontSize: 12,
    fontWeight: '500',
  },
  closeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});