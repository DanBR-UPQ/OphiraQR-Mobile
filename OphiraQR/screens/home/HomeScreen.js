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
  Dimensions,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient as SvgLinearGradient,
  Rect,
  Line,
  Path,
} from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState, useMemo, useRef } from 'react';
import { api } from '../../services/api';

const { width: SCREEN_W } = Dimensions.get('window');

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const formatCurrency = (val) =>
  val
    ? `$${parseFloat(val).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`
    : '—';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ─── Animated Number ───────────────────────────────────────────────────────── */
const AnimatedNumber = ({ value, style, prefix = '', suffix = '' }) => {
  const animVal = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    animVal.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(animVal, {
      toValue: value,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animVal.removeAllListeners();
  }, [value]);

  return (
    <Text style={style}>
      {prefix}{display.toLocaleString('es-MX')}{suffix}
    </Text>
  );
};

/* ─── Donut Chart ────────────────────────────────────────────────────────────── */
const DonutChart = ({ data, size = 130, strokeWidth = 13 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const colors = ['#3b82f6', '#06b6d4', '#a78bfa', '#34d399', '#f97316'];
  let cumulativePercent = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={radius + 10} fill="url(#glow)" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#0f1e35" strokeWidth={strokeWidth} fill="none" />
        {data.map((item, index) => {
          const dash = `${item.percent * circumference} ${circumference}`;
          const offset = -cumulativePercent * circumference;
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
              strokeDasharray={dash}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          );
        })}
      </Svg>
      <View style={[styles.donutCenter, { top: size / 2 - 24, left: 0, right: 0 }]}>
        <Text style={styles.donutLabel}>TOTAL</Text>
        <Text style={styles.donutValue}>100%</Text>
      </View>
    </View>
  );
};

/* ─── Health Bar ─────────────────────────────────────────────────────────────── */
const HealthBar = ({ label, value, max, color, delay }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pct = max > 0 ? value / max : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(widthAnim, {
        toValue: pct,
        duration: 900,
        delay: delay + 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [pct]);

  return (
    <Animated.View style={[styles.healthRow, { opacity: fadeAnim }]}>
      <View style={styles.healthMeta}>
        <Text style={styles.healthLabel}>{label}</Text>
        <Text style={[styles.healthValue, { color }]}>{value}</Text>
      </View>
      <View style={styles.healthTrack}>
        <Animated.View
          style={[
            styles.healthFill,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

/* ─── Mini Sparkline ─────────────────────────────────────────────────────────── */
const MiniSparkline = ({ values, color, width = 80, height = 28 }) => {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  return (
    <Svg width={width} height={height}>
      <Path d={pathD} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

/* ─── Stat Card (large hero) ────────────────────────────────────────────────── */
const HeroStat = ({ icon, value, label, sub, color, delay, trend }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 9, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.heroCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.heroCardInner}>
        <View style={[styles.heroIconRing, { borderColor: color + '40', backgroundColor: color + '15' }]}>
          <MaterialIcons name={icon} size={18} color={color} />
        </View>
        <AnimatedNumber value={value} style={[styles.heroValue, { color }]} />
        <Text style={styles.heroLabel}>{label}</Text>
        {sub && <Text style={styles.heroSub}>{sub}</Text>}
        {trend && (
          <View style={styles.heroTrendRow}>
            <MaterialIcons
              name={trend >= 0 ? 'trending-up' : 'trending-down'}
              size={12}
              color={trend >= 0 ? '#34d399' : '#f87171'}
            />
            <Text style={[styles.heroTrendText, { color: trend >= 0 ? '#34d399' : '#f87171' }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <View style={[styles.heroAccentLine, { backgroundColor: color }]} />
    </Animated.View>
  );
};

/* ─── Asset Row ─────────────────────────────────────────────────────────────── */
const AssetRow = ({ item, onPress, isLast, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  const isActivo = item.estado === 'Activo';
  const statusColor = isActivo ? '#34d399' : item.estado === 'Mantenimiento' ? '#f59e0b' : '#f87171';

  const depreciationPct = item.precioCompra && item.valorActual
    ? Math.round((item.valorActual / item.precioCompra) * 100)
    : null;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.assetRow, isLast && { borderBottomWidth: 0 }]}
        onPress={() => onPress(item)}
        activeOpacity={0.65}
      >
        <View style={[styles.assetColorBar, { backgroundColor: statusColor }]} />

        <View style={styles.assetRowContent}>
          <View style={styles.assetRowTop}>
            <View style={styles.assetIconWrap}>
              <MaterialIcons name="computer" size={14} color="#4a6fa8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.assetName} numberOfLines={1}>{item.nombre}</Text>
              <Text style={styles.assetMeta}>{item.categoria} · {item.ubicacion}</Text>
            </View>
            <View style={styles.assetRightCol}>
              <View style={[styles.statusChip, { backgroundColor: statusColor + '18', borderColor: statusColor + '40' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusChipText, { color: statusColor }]}>{item.estado}</Text>
              </View>
              {depreciationPct !== null && (
                <Text style={styles.assetDepreciationText}>{depreciationPct}% valor</Text>
              )}
            </View>
          </View>

          {depreciationPct !== null && (
            <View style={styles.assetDepBar}>
              <View style={[styles.assetDepFill, {
                width: `${depreciationPct}%`,
                backgroundColor: depreciationPct > 70 ? '#34d399' : depreciationPct > 40 ? '#f59e0b' : '#f87171',
              }]} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ─── Value Ticker Card ──────────────────────────────────────────────────────── */
const ValueTickerCard = ({ totalValue, activeValue, delay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.tickerCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.tickerBg}>
        <View style={styles.tickerGlowDot} />
      </View>
      <View style={styles.tickerContent}>
        <View style={styles.tickerLeft}>
          <Text style={styles.tickerEyebrow}>VALOR TOTAL DEL PORTAFOLIO</Text>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <AnimatedNumber
              value={Math.round(totalValue)}
              prefix="$"
              style={styles.tickerMainValue}
            />
          </Animated.View>
          <Text style={styles.tickerSub}>MXN · Activos registrados</Text>
        </View>
        <View style={styles.tickerRight}>
          <View style={styles.tickerBadge}>
            <MaterialIcons name="trending-up" size={13} color="#34d399" />
            <Text style={styles.tickerBadgeText}>En uso</Text>
          </View>
          <AnimatedNumber
            value={Math.round(activeValue)}
            prefix="$"
            style={styles.tickerSecondaryValue}
          />
          <Text style={styles.tickerSecondaryLabel}>valor activo</Text>
        </View>
      </View>
    </Animated.View>
  );
};

/* ─── Section Header ─────────────────────────────────────────────────────────── */
const SectionHeader = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionAccentPip} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {action && (
      <TouchableOpacity style={styles.viewAllBtn} onPress={onAction}>
        <Text style={styles.viewAllText}>{action}</Text>
        <MaterialIcons name="arrow-forward-ios" size={9} color="#3b82f6" />
      </TouchableOpacity>
    )}
  </View>
);

/* ─── Main Screen ────────────────────────────────────────────────────────────── */
export default function HomeScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedActivo, setSelectedActivo] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const modalAnim = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-16)).current;
  const glowAnim = useRef(new Animated.Value(0.05)).current;
  const gridAnim = useRef(new Animated.Value(0)).current;

  /* Ambient animations */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.11, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.05, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();

    Animated.timing(gridAnim, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const openModal = (item) => {
    setSelectedActivo(item);
    setDetailVisible(true);
    Animated.spring(modalAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: true })
      .start(() => setDetailVisible(false));
  };

  const cargarDatos = async () => {
    try {
      const [activosRes, userRes] = await Promise.all([
        api.get('/assets/activosUser'),
        api.get('/usuarios/me').catch(() => null),
      ]);

      if (userRes?.nombre_usuario) setUserName(userRes.nombre_usuario);

      const formateado = activosRes.rows.map((item) => ({
        id: item.id_activo,
        nombre: item.nombre,
        descripcion: item.descripcion,
        estado: item.estado_nombre || item.estado,
        categoria: item.categoria_nombre || item.categoria,
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
      Alert.alert('Error', 'No se pudieron cargar los activos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  /* Derived stats */
  const activos = data.filter((d) => d.estado === 'Activo').length;
  const inactivos = data.filter((d) => d.estado !== 'Activo').length;
  const colors = ['#3b82f6', '#06b6d4', '#a78bfa', '#34d399', '#f97316'];

  const totalValue = useMemo(() =>
    data.reduce((acc, d) => acc + (parseFloat(d.precioCompra) || 0), 0), [data]);
  const activeValue = useMemo(() =>
    data.filter(d => d.estado === 'Activo').reduce((acc, d) => acc + (parseFloat(d.valorActual) || 0), 0), [data]);

  const categoriasCount = useMemo(() => {
    const counts = {};
    data.forEach((d) => { counts[d.categoria] = (counts[d.categoria] || 0) + 1; });
    return counts;
  }, [data]);

  const categoriasPercent = Object.entries(categoriasCount).map(([cat, count]) => ({
    nombre: cat,
    count,
    percent: data.length ? count / data.length : 0,
  }));

  const recientesLista = [...data]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 6);

  const recientes = data.filter((d) => {
    const diff = (new Date() - new Date(d.fecha)) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  }).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingDot, { opacity: glowAnim }]} />
        <Text style={styles.loadingText}>Cargando sistema…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 56 }}
    >
      {/* ── Background atmosphere ───────────────────────────────────── */}
      <Animated.View style={[styles.bgGlow1, { opacity: glowAnim }]} />
      <Animated.View style={[styles.bgGlow2, { opacity: glowAnim }]} />
      <Animated.View style={[styles.bgGlow3, { opacity: glowAnim }]} />

      {/* Dot grid overlay */}
      <Animated.View style={[styles.dotGrid, { opacity: gridAnim }]}>
        <Svg width={SCREEN_W} height={200} style={{ position: 'absolute', top: 0 }}>
          {Array.from({ length: 12 }).map((_, row) =>
            Array.from({ length: 20 }).map((_, col) => (
              <Circle
                key={`${row}-${col}`}
                cx={col * 22 + 11}
                cy={row * 18 + 9}
                r={0.8}
                fill="#1e3a5f"
                opacity={0.6}
              />
            ))
          )}
        </Svg>
      </Animated.View>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerGreeting}>{getGreeting()}{userName ? `, ${userName}` : ''}</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <View style={styles.headerTagRow}>
              <View style={styles.liveIndicator}>
                <Animated.View style={[styles.liveDot, { opacity: glowAnim.interpolate({ inputRange: [0.05, 0.11], outputRange: [0.4, 1] }) }]} />
                <Text style={styles.liveText}>EN VIVO</Text>
              </View>
              <Text style={styles.headerDate}>
                {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Perfil')} activeOpacity={0.7}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitial}>{userName ? userName[0].toUpperCase() : '?'}</Text>
            </View>
            <View style={styles.avatarOnline} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Portfolio Value Ticker ───────────────────────────────────── */}
      <ValueTickerCard totalValue={totalValue} activeValue={activeValue} delay={300} />

      {/* ── Hero Stats Row ───────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.heroStrip}
        contentContainerStyle={styles.heroStripContent}
      >
        <HeroStat icon="inventory-2" value={data.length} label="Activos" sub="Registrados" color="#3b82f6" delay={200} />
        <HeroStat icon="check-circle" value={activos} label="Operativos" sub="Estado activo" color="#34d399" delay={280} trend={12} />
        <HeroStat icon="report-problem" value={inactivos} label="Inactivos" sub="Fuera de uso" color="#f97316" delay={360} />
        <HeroStat icon="schedule" value={recientes} label="Este mes" sub="Nuevos activos" color="#a78bfa" delay={440} />
        <HeroStat icon="category" value={Object.keys(categoriasCount).length} label="Categorías" sub="Tipos distintos" color="#06b6d4" delay={520} />
      </ScrollView>

      {/* ── Distribución ────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader title="Distribución" />
        <View style={styles.distributionCard}>
          <View style={styles.distributionRow}>
            <DonutChart data={categoriasPercent} size={130} />
            <View style={styles.legendBlock}>
              {categoriasPercent.map((cat, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                    <View style={[styles.legendDot, { backgroundColor: colors[i % colors.length] }]} />
                    <Text style={styles.legendName} numberOfLines={1}>{cat.nombre}</Text>
                    <Text style={[styles.legendPct, { color: colors[i % colors.length] }]}>
                      {Math.round(cat.percent * 100)}%
                    </Text>
                  </View>
                  <View style={styles.legendBarTrack}>
                    <View style={[styles.legendBarFill, {
                      width: `${Math.round(cat.percent * 100)}%`,
                      backgroundColor: colors[i % colors.length],
                    }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Category count pills */}
          <View style={styles.catPillRow}>
            {categoriasPercent.map((cat, i) => (
              <View key={i} style={[styles.catPill, { borderColor: colors[i % colors.length] + '50' }]}>
                <Text style={[styles.catPillCount, { color: colors[i % colors.length] }]}>{cat.count}</Text>
                <Text style={styles.catPillName} numberOfLines={1}>{cat.nombre.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── Estado General / Health bars ────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader title="Estado General" />
        <View style={styles.healthCard}>
          <HealthBar
            label="Activos operativos"
            value={activos}
            max={data.length}
            color="#34d399"
            delay={100}
          />
          <View style={styles.healthDivider} />
          <HealthBar
            label="Inactivos / Baja"
            value={inactivos}
            max={data.length}
            color="#f87171"
            delay={200}
          />
          <View style={styles.healthDivider} />
          <HealthBar
            label="Registrados este mes"
            value={recientes}
            max={Math.max(data.length, 1)}
            color="#a78bfa"
            delay={300}
          />
        </View>
      </View>

      {/* ── Activos Recientes ────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader title="Activos Recientes" action="Ver todos" onAction={() => navigation.navigate('Activos')} />
        <View style={styles.assetsCard}>
          {recientesLista.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={32} color="#1e2d45" />
              <Text style={styles.emptyText}>Sin activos registrados</Text>
            </View>
          ) : (
            recientesLista.map((item, i) => (
              <AssetRow
                key={item.id}
                item={item}
                onPress={openModal}
                isLast={i === recientesLista.length - 1}
                delay={i * 70}
              />
            ))
          )}
        </View>
      </View>

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      {/* <View style={styles.section}>
        <SectionHeader title="Acciones Rápidas" />
        <View style={styles.actionsRow}>
          {[
            { icon: 'Activos', label: 'Buscar', color: '#3b82f6', nav: 'Activos' },
            { icon: 'bar-chart', label: 'Auditorías', color: '#a78bfa', nav: 'Auditorías' },
            { icon: 'settings', label: 'QR', color: '#06b6d4', nav: 'Perfil' },
          ].map(({ icon, label, color, nav }) => (
            <TouchableOpacity
              key={label}
              style={styles.actionBtn}
              onPress={() => navigation.navigate(nav)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: color + '18', borderColor: color + '35' }]}>
                <MaterialIcons name={icon} size={20} color={color} />
              </View>
              <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View> */}

      {/* ── Modal (untouched) ────────────────────────────────────────── */}
      <Modal visible={detailVisible} animationType="none" transparent>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeModal}>
          <Animated.View
            style={[
              styles.modal,
              {
                transform: [
                  { scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                  { translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
                ],
                opacity: modalAnim,
              },
            ]}
          >
            {selectedActivo && (() => {
              const isActivo = selectedActivo.estado === 'Activo';
              const accent = isActivo ? '#10b981' : selectedActivo.estado === 'Mantenimiento' ? '#f59e0b' : '#ef4444';
              const ubicacionLabel = [selectedActivo.tipoAula, selectedActivo.numeroAula, selectedActivo.ubicacion].filter(Boolean).join(' · ');

              return (
                <TouchableOpacity activeOpacity={1}>
                  <View style={[styles.modalHeader, { borderBottomColor: accent + '33' }]}>
                    <View style={[styles.modalHeaderAccent, { backgroundColor: accent }]} />
                    <View style={[styles.modalIconCircle, { backgroundColor: accent + '20' }]}>
                      <MaterialIcons name="inventory-2" size={20} color={accent} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.modalNombre} numberOfLines={2}>{selectedActivo.nombre}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                        <View style={[styles.modalStatusPill, { backgroundColor: accent + '20', borderColor: accent + '40' }]}>
                          <View style={[styles.modalStatusDot, { backgroundColor: accent }]} />
                          <Text style={[styles.modalStatusText, { color: accent }]}>{selectedActivo.estado}</Text>
                        </View>
                        <Text style={styles.modalIdChip}>#{selectedActivo.id}</Text>
                      </View>
                    </View>
                  </View>

                  {selectedActivo.descripcion ? (
                    <View style={styles.modalDescRow}>
                      <Text style={styles.modalDesc}>{selectedActivo.descripcion}</Text>
                    </View>
                  ) : null}

                  <View style={styles.modalGrid}>
                    <View style={styles.modalGridItem}>
                      <Text style={styles.modalGridLabel}>Categoría</Text>
                      <Text style={styles.modalGridValue}>{selectedActivo.categoria || '—'}</Text>
                    </View>
                    <View style={styles.modalGridItem}>
                      <Text style={styles.modalGridLabel}>Ubicación</Text>
                      <Text style={styles.modalGridValue}>{ubicacionLabel || '—'}</Text>
                    </View>
                    <View style={styles.modalGridItem}>
                      <Text style={styles.modalGridLabel}>Modelo</Text>
                      <Text style={styles.modalGridValue}>{selectedActivo.modelo || '—'}</Text>
                    </View>
                    <View style={styles.modalGridItem}>
                      <Text style={styles.modalGridLabel}>No. Serie</Text>
                      <Text style={styles.modalGridValue}>{selectedActivo.numeroSerie || '—'}</Text>
                    </View>
                  </View>

                  <View style={styles.modalDivider} />

                  <View style={styles.modalFinancialRow}>
                    <View style={styles.modalFinancialItem}>
                      <Text style={styles.modalGridLabel}>Precio Compra</Text>
                      <Text style={[styles.modalFinancialValue, { color: '#f0f4ff' }]}>{formatCurrency(selectedActivo.precioCompra)}</Text>
                    </View>
                    <View style={styles.modalFinancialDivider} />
                    <View style={styles.modalFinancialItem}>
                      <Text style={styles.modalGridLabel}>Valor Actual</Text>
                      <Text style={[styles.modalFinancialValue, { color: accent }]}>{formatCurrency(selectedActivo.valorActual)}</Text>
                    </View>
                    <View style={styles.modalFinancialDivider} />
                    <View style={styles.modalFinancialItem}>
                      <Text style={styles.modalGridLabel}>Vida Útil</Text>
                      <Text style={[styles.modalFinancialValue, { color: '#f0f4ff' }]}>
                        {selectedActivo.vidaUtilAnios ? `${selectedActivo.vidaUtilAnios} años` : '—'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalFooter}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalFooterLabel}>Comprado</Text>
                      <Text style={styles.modalFooterValue}>{formatDate(selectedActivo.fecha)}</Text>
                    </View>
                    <TouchableOpacity style={[styles.closeBtn, { backgroundColor: accent }]} onPress={closeModal}>
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

/* ─── Styles ─────────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060c18',
    paddingHorizontal: 16,
    paddingTop: 54,
  },

  /* Loading */
  loadingContainer: {
    flex: 1,
    backgroundColor: '#060c18',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  loadingText: {
    color: '#2a4a6e',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  /* Background atmosphere */
  bgGlow1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#1d4ed8',
  },
  bgGlow2: {
    position: 'absolute',
    top: 280,
    left: -100,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#6d28d9',
  },
  bgGlow3: {
    position: 'absolute',
    top: 600,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#0e7490',
  },
  dotGrid: {
    position: 'absolute',
    top: 0,
    left: -16,
    right: -16,
  },

  /* Header */
  header: { marginBottom: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  headerGreeting: {
    fontSize: 12,
    color: '#3b6a9e',
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#eef2ff',
    letterSpacing: -1,
    marginBottom: 10,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0d2a1a',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#14532d',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#34d399',
  },
  liveText: {
    fontSize: 9,
    color: '#34d399',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerDate: {
    fontSize: 11,
    color: '#2a4464',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  avatarBtn: {
    position: 'relative',
    marginTop: 4,
  },
  avatarInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0f2040',
    borderWidth: 1.5,
    borderColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '800',
  },
  avatarOnline: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#34d399',
    borderWidth: 1.5,
    borderColor: '#060c18',
  },

  /* Ticker Card */
  tickerCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a3050',
    backgroundColor: '#0a1628',
  },
  tickerBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
  },
  tickerGlowDot: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1d4ed8',
    opacity: 0.12,
  },
  tickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  tickerLeft: { flex: 1 },
  tickerEyebrow: {
    fontSize: 9,
    color: '#2a4a6e',
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  tickerMainValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#eef2ff',
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  tickerSub: {
    fontSize: 10,
    color: '#2a4a6e',
    fontWeight: '500',
  },
  tickerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  tickerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0d2a1a',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#14532d',
    marginBottom: 4,
  },
  tickerBadgeText: {
    fontSize: 9,
    color: '#34d399',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tickerSecondaryValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: -0.3,
  },
  tickerSecondaryLabel: {
    fontSize: 9,
    color: '#2a4a6e',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  /* Hero stat strip */
  heroStrip: { marginBottom: 24, marginHorizontal: -16 },
  heroStripContent: { paddingHorizontal: 16, gap: 10 },
  heroCard: {
    width: 100,
    backgroundColor: '#0a1628',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a3050',
    overflow: 'hidden',
    position: 'relative',
  },
  heroCardInner: {
    padding: 14,
    alignItems: 'flex-start',
    gap: 5,
  },
  heroIconRing: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroLabel: {
    fontSize: 11,
    color: '#dce8f5',
    fontWeight: '700',
  },
  heroSub: {
    fontSize: 9,
    color: '#2a4464',
    fontWeight: '500',
  },
  heroTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  heroTrendText: {
    fontSize: 9,
    fontWeight: '700',
  },
  heroAccentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.7,
  },

  /* Section */
  section: { marginBottom: 22 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccentPip: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#c8d8f0',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#0a1628',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#1a3050',
  },
  viewAllText: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: '700',
  },

  /* Distribution card */
  distributionCard: {
    backgroundColor: '#0a1628',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1a3050',
    overflow: 'hidden',
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 18,
  },
  legendBlock: { flex: 1, gap: 10 },
  legendItem: { gap: 0 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendName: { fontSize: 11, color: '#8aabcc', fontWeight: '600', flex: 1 },
  legendPct: { fontSize: 11, fontWeight: '800', minWidth: 28, textAlign: 'right' },
  legendBarTrack: { height: 3, backgroundColor: '#111f35', borderRadius: 2, overflow: 'hidden' },
  legendBarFill: { height: 3, borderRadius: 2 },

  catPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0d1e34',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  catPillCount: { fontSize: 12, fontWeight: '800' },
  catPillName: { fontSize: 10, color: '#4a6a8a', fontWeight: '500', maxWidth: 70 },

  /* Health card */
  healthCard: {
    backgroundColor: '#0a1628',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1a3050',
    padding: 18,
    gap: 0,
  },
  healthRow: { paddingVertical: 12 },
  healthMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthLabel: { fontSize: 12, color: '#8aabcc', fontWeight: '500' },
  healthValue: { fontSize: 13, fontWeight: '800' },
  healthTrack: {
    height: 5,
    backgroundColor: '#0f1e34',
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthFill: { height: 5, borderRadius: 3 },
  healthDivider: { height: 1, backgroundColor: '#0f1e34' },

  /* Assets card */
  assetsCard: {
    backgroundColor: '#0a1628',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1a3050',
    overflow: 'hidden',
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: '#0d1e34',
  },
  assetColorBar: {
    width: 3,
    borderRadius: 0,
    opacity: 0.7,
  },
  assetRowContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  assetRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  assetIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#0a1624',
    borderWidth: 1,
    borderColor: '#1a3050',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dce8f5',
    marginBottom: 2,
    flex: 1,
  },
  assetMeta: { fontSize: 10, color: '#2a4464', fontWeight: '500' },
  assetRightCol: { alignItems: 'flex-end', gap: 4 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  assetDepreciationText: { fontSize: 9, color: '#2a4464', fontWeight: '600' },
  assetDepBar: {
    height: 3,
    backgroundColor: '#0f1e34',
    borderRadius: 2,
    overflow: 'hidden',
  },
  assetDepFill: { height: 3, borderRadius: 2 },

  /* Quick actions */
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#0a1628',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a3050',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 11, color: '#8aabcc', fontWeight: '700' },

  /* Donut */
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutLabel: {
    color: '#2a4464',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  donutValue: { color: '#eef2ff', fontSize: 15, fontWeight: '900' },

  /* Empty state */
  emptyState: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  emptyText: { color: '#2a4464', fontSize: 13, fontWeight: '500' },

  /* Modal (untouched) */
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
  modalHeaderAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  modalIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalNombre: { color: '#f0f4ff', fontSize: 15, fontWeight: '700', lineHeight: 20 },
  modalStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  modalStatusDot: { width: 5, height: 5, borderRadius: 3 },
  modalStatusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  modalIdChip: { color: '#3a5070', fontSize: 11, fontWeight: '600' },
  modalDescRow: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 },
  modalDesc: { color: '#5a7a9e', fontSize: 12, lineHeight: 18, fontStyle: 'italic' },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
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
  modalGridValue: { color: '#dce8f5', fontSize: 12, fontWeight: '600', lineHeight: 16 },
  modalDivider: { height: 1, backgroundColor: '#1a2a42', marginHorizontal: 16 },
  modalFinancialRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalFinancialItem: { flex: 1, alignItems: 'center' },
  modalFinancialDivider: { width: 1, height: 30, backgroundColor: '#1a2a42' },
  modalFinancialValue: { fontSize: 14, fontWeight: '700', marginTop: 4 },
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
  modalFooterValue: { color: '#5a7a9e', fontSize: 12, fontWeight: '500' },
  closeBtn: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 11, alignItems: 'center' },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.3 },
});