import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState, useMemo } from 'react'
import { api } from '../../services/api'





const DonutChart = ({ data, size = 110, strokeWidth = 18 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const colors = ['#0055e5', '#0099ff', '#a855f7', '#10b981', '#ff6b35'];

  let cumulativePercent = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
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

      {/* Center */}
      <View
        style={{
          position: 'absolute',
          top: size / 2 - 20,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#5a7a9e', fontSize: 10 }}>Total</Text>
        <Text style={{ color: '#f0f4ff', fontSize: 14, fontWeight: '700' }}>100%</Text>
      </View>
    </View>
  );
};




export default function HomeScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      const datos = await api.get("/assets/activosUser")

      const formateado = datos.rows.map(item => ({
        id: item.id_activo,
        nombre: item.nombre,
        descripcion: item.descripcion,
        estado: item.estado_nombre, 
        categoria: item.categoria_nombre,
        ubicacion: item.id_aula,
        fecha: item.fecha_compra
      }))

      setData(formateado)
    } catch (e) {
      console.log("ERROR:", e)
      Alert.alert("Error", "No se pudieron cargar los activos")
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarDatos() }, [])

  /* COSOS PARA LAS METRIC CARDS */
  const activos = data.filter(d => d.estado === "Activo").length
  const inactivos = data.filter(d => d.estado !== "Activo").length
  const colors = ['#0055e5', '#0099ff', '#a855f7', '#10b981', '#ff6b35']

  const recientes = data.filter(d => {
    const fecha = new Date(d.fecha)
    const hoy = new Date()
    const diff = (hoy - fecha) / (1000 * 60 * 60 * 24)
    return diff <= 7
  }).length


  const categoriasCount = useMemo(() => {
    const counts = {};
    data.forEach(d => {
      counts[d.categoria] = (counts[d.categoria] || 0) + 1;
    });
    return counts
  }, [data])

  const categoriasPercent = Object.entries(categoriasCount).map(([cat, count]) => ({
    nombre: cat,
    percent: data.length ? (count / data.length) : 0
  }))

  const recientesLista = [...data]
  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  .slice(0, 4);


  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white' }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Ambient background glow */}
      <View style={styles.bgAccent} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>Bienvenido de vuelta</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={20} color="#4a6fa8" />
          </View>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={18} color="#3a5070" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar activos..."
            placeholderTextColor="#3a5070"
          />
          <View style={styles.searchDivider} />
          <MaterialIcons name="tune" size={18} color="#3a5070" />
        </View>
      </View>

      {/* Metric Cards — 2x2 grid */}
      <View style={styles.metricsGrid}>
        {/* Card 1 */}
        <View style={[styles.metricCard, styles.metricCardBlue]}>
          <View style={styles.metricIconBg}>
            <MaterialIcons name="inventory-2" size={18} color="#0055e5" />
          </View>
          <Text style={styles.metricValue}>{data.length}</Text>
          <Text style={styles.metricLabel}>Total Activos</Text>
          <Text style={[styles.metricChange, { color: '#10b981' }]}>↑ +12%</Text>
        </View>

        {/* Card 2 */}
        <View style={[styles.metricCard, styles.metricCardOrange]}>
          <View style={[styles.metricIconBg, { backgroundColor: 'rgba(255,107,53,0.12)' }]}>
            <MaterialIcons name="warning" size={18} color="#ff6b35" />
          </View>
          <Text style={styles.metricValue}>{inactivos}</Text>
          <Text style={styles.metricLabel}>Inactivos</Text>
          {/* <Text style={[styles.metricChange, { color: '#ff6b35' }]}>⚠ 3 overdue</Text> */}
        </View>

        {/* Card 3 */}
        <View style={[styles.metricCard, styles.metricCardGreen]}>
          <View style={[styles.metricIconBg, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
            <MaterialIcons name="check-circle" size={18} color="#10b981" />
          </View>
          <Text style={styles.metricValue}>{recientes}</Text>
          <Text style={styles.metricLabel}>Añadidos</Text>
          <Text style={[styles.metricChange, { color: '#7a8fa6' }]}>Últimos 7 días</Text>
        </View>

        {/* Card 4 */}
        <View style={[styles.metricCard, styles.metricCardPurple]}>
          <View style={[styles.metricIconBg, { backgroundColor: 'rgba(168,85,247,0.12)' }]}>
            <MaterialIcons name="trending-up" size={18} color="#a855f7" />
          </View>
          <Text style={styles.metricValue}>{Object.keys(categoriasCount).length}</Text>
          <Text style={styles.metricLabel}>Categorías</Text>
        </View>
      </View>

      {/* Distribución de Activos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Distribución de Activos</Text>
          <TouchableOpacity style={styles.moreBtn}>
            <MaterialIcons name="more-horiz" size={18} color="#7a8fa6" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.chartRow}>
            {/* Donut chart */}
            <DonutChart data={categoriasPercent} />

            {/* Legend */}
            <View style={styles.chartLegend}>
              {categoriasPercent.map((cat, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendBar, { backgroundColor: colors[i % colors.length] }]} />
                  <View>
                    <Text style={styles.legendLabel}>{cat.nombre}</Text>
                    <Text style={styles.legendPercent}>{Math.round(cat.percent * 100)}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Actividad Reciente */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Ver todo →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Activo</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>Estado</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Ubicación</Text>
          </View>

          {/* Row */}

          {recientesLista.length === 0 ? (
            <Text style={{ color: '#5a7a9e', padding: 16 }}>
              No hay actividad reciente
            </Text>
          ) : (
            recientesLista.map((item, i) => (
              <View key={i} style={[styles.tableRow, item.isLast && { borderBottomWidth: 0 }]}>
                <View style={[styles.tableRowCell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                  <View style={styles.assetIconWrap}>
                    <MaterialIcons name="inventory" size={16} color="#4a6fa8" />
                  </View>
                  <View>
                    <Text style={styles.assetName}>{item.nombre}</Text>
                    <Text style={styles.assetCode}>{item.id}</Text>
                  </View>
                </View>

                <View style={[styles.tableRowCell, { flex: 1.2, alignItems: 'center' }]}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.estado === "Activo" ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }
                  ]}>
                    <Text style={[styles.statusText, { color: item.estado === "Activo" ? "#10b981" : "#ef4444" }]}>
                    {item.estado}
                  </Text>
                  </View>
                </View>

                <View style={[styles.tableRowCell, { flex: 1.5, alignItems: 'flex-end' }]}>
                  <Text style={styles.locationText}>{item.ubicacion}</Text>
                </View>
              </View>
          ))
          )}

          
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
    paddingHorizontal: 16,
    paddingTop: 56,
  },

  bgAccent: {
    position: 'absolute',
    top: 0,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#0044cc',
    opacity: 0.05,
  },

  // Header
  header: {
    marginBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  headerGreeting: {
    fontSize: 12,
    color: '#4a6fa8',
    letterSpacing: 0.4,
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f0f4ff',
    letterSpacing: 0.2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e2d45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1a2a42',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#dce8f5',
    fontSize: 14,
  },
  searchDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#1e2d45',
  },

  // 2x2 Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  metricCard: {
    width: '47.5%',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  metricCardBlue: { borderTopColor: '#0055e5', borderTopWidth: 2 },
  metricCardOrange: { borderTopColor: '#ff6b35', borderTopWidth: 2 },
  metricCardGreen: { borderTopColor: '#10b981', borderTopWidth: 2 },
  metricCardPurple: { borderTopColor: '#a855f7', borderTopWidth: 2 },
  metricIconBg: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(0,85,229,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f0f4ff',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#5a7a9e',
    fontWeight: '500',
    marginBottom: 6,
  },
  metricChange: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f0f4ff',
    letterSpacing: 0.2,
  },
  moreBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1a2a42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAll: {
    fontSize: 12,
    color: '#3a72cc',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Shared card wrapper
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a2a42',
    overflow: 'hidden',
  },

  // Chart
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 24,
  },
  donutChart: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  donutSegment1: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 18,
    borderColor: '#0055e5',
    borderTopColor: '#0055e5',
    borderRightColor: '#0055e5',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  donutSegment2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 18,
    borderColor: '#0099ff',
    borderTopColor: 'transparent',
    borderRightColor: '#0099ff',
    borderBottomColor: '#0099ff',
    borderLeftColor: 'transparent',
  },
  donutSegment3: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 18,
    borderColor: '#a855f7',
    borderTopColor: '#a855f7',
    borderRightColor: 'transparent',
    borderBottomColor: '#a855f7',
    borderLeftColor: '#a855f7',
  },
  donutCenter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#0b1120',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterLabel: {
    fontSize: 10,
    color: '#5a7a9e',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  donutCenterValue: {
    fontSize: 14,
    color: '#f0f4ff',
    fontWeight: '700',
  },
  chartLegend: {
    flex: 1,
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendBar: {
    width: 3,
    height: 32,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 12,
    color: '#dce8f5',
    fontWeight: '500',
    marginBottom: 2,
  },
  legendPercent: {
    fontSize: 12,
    color: '#5a7a9e',
    fontWeight: '600',
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a42',
    backgroundColor: '#0d1829',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4a6fa8',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#111f35',
    alignItems: 'center',
  },
  tableRowCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0d1829',
    borderWidth: 1,
    borderColor: '#1a2a42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dce8f5',
    marginBottom: 1,
  },
  assetCode: {
    fontSize: 10,
    color: '#4a6fa8',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  locationText: {
    fontSize: 11,
    color: '#5a7a9e',
    fontWeight: '500',
    textAlign: 'right',
  },
});