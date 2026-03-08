import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
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
          <Text style={styles.metricValue}>2,453</Text>
          <Text style={styles.metricLabel}>Total Activos</Text>
          <Text style={[styles.metricChange, { color: '#10b981' }]}>↑ +12%</Text>
        </View>

        {/* Card 2 */}
        <View style={[styles.metricCard, styles.metricCardOrange]}>
          <View style={[styles.metricIconBg, { backgroundColor: 'rgba(255,107,53,0.12)' }]}>
            <MaterialIcons name="warning" size={18} color="#ff6b35" />
          </View>
          <Text style={styles.metricValue}>18</Text>
          <Text style={styles.metricLabel}>Mantenimiento</Text>
          <Text style={[styles.metricChange, { color: '#ff6b35' }]}>⚠ 3 overdue</Text>
        </View>

        {/* Card 3 */}
        <View style={[styles.metricCard, styles.metricCardGreen]}>
          <View style={[styles.metricIconBg, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
            <MaterialIcons name="check-circle" size={18} color="#10b981" />
          </View>
          <Text style={styles.metricValue}>45</Text>
          <Text style={styles.metricLabel}>Añadidos</Text>
          <Text style={[styles.metricChange, { color: '#7a8fa6' }]}>Últimos 7 días</Text>
        </View>

        {/* Card 4 */}
        <View style={[styles.metricCard, styles.metricCardPurple]}>
          <View style={[styles.metricIconBg, { backgroundColor: 'rgba(168,85,247,0.12)' }]}>
            <MaterialIcons name="trending-up" size={18} color="#a855f7" />
          </View>
          <Text style={styles.metricValue}>$1.2M</Text>
          <Text style={styles.metricLabel}>Valor Total</Text>
          <Text style={[styles.metricChange, { color: '#10b981' }]}>↑ +4.5%</Text>
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
            <View style={styles.donutChart}>
              <View style={styles.donutSegment1} />
              <View style={styles.donutSegment2} />
              <View style={styles.donutSegment3} />
              <View style={styles.donutCenter}>
                <Text style={styles.donutCenterLabel}>Total</Text>
                <Text style={styles.donutCenterValue}>100%</Text>
              </View>
            </View>

            {/* Legend */}
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBar, { backgroundColor: '#0055e5' }]} />
                <View>
                  <Text style={styles.legendLabel}>Electrónica</Text>
                  <Text style={styles.legendPercent}>45%</Text>
                </View>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBar, { backgroundColor: '#0099ff' }]} />
                <View>
                  <Text style={styles.legendLabel}>Mobiliario</Text>
                  <Text style={styles.legendPercent}>30%</Text>
                </View>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBar, { backgroundColor: '#a855f7' }]} />
                <View>
                  <Text style={styles.legendLabel}>Vehículos</Text>
                  <Text style={styles.legendPercent}>25%</Text>
                </View>
              </View>
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
          {[
            {
              icon: 'laptop',
              name: 'MacBook Pro M2',
              code: 'ORi-8932',
              status: 'Activo',
              statusColor: '#10b981',
              statusBg: 'rgba(16,185,129,0.1)',
              location: 'HQ - Piso 3',
            },
            {
              icon: 'print',
              name: 'HP LaserJet Pro',
              code: 'ORi-1029',
              status: 'Mantenimiento',
              statusColor: '#ffc107',
              statusBg: 'rgba(255,193,7,0.1)',
              location: 'Almacén B',
            },
            {
              icon: 'chair',
              name: 'Ergo Chair V2',
              code: 'ORi-4451',
              status: 'Asignado',
              statusColor: '#0099ff',
              statusBg: 'rgba(0,153,255,0.1)',
              location: 'Oficina 302',
            },
            {
              icon: 'tablet',
              name: 'iPad Pro 12.9',
              code: 'ORi-8921',
              status: 'Perdido',
              statusColor: '#ef4444',
              statusBg: 'rgba(239,68,68,0.1)',
              location: 'Lobby',
              isLast: true,
            },
          ].map((item, i) => (
            <View key={i} style={[styles.tableRow, item.isLast && { borderBottomWidth: 0 }]}>
              <View style={[styles.tableRowCell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                <View style={styles.assetIconWrap}>
                  <MaterialIcons name={item.icon} size={16} color="#4a6fa8" />
                </View>
                <View>
                  <Text style={styles.assetName}>{item.name}</Text>
                  <Text style={styles.assetCode}>{item.code}</Text>
                </View>
              </View>

              <View style={[styles.tableRowCell, { flex: 1.2, alignItems: 'center' }]}>
                <View style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
                  <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
                </View>
              </View>

              <View style={[styles.tableRowCell, { flex: 1.5, alignItems: 'flex-end' }]}>
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
            </View>
          ))}
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