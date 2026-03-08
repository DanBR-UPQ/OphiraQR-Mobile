import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ListAuditoriasScreen() {
  const auditData = [
    {
      id: 1,
      responsable: 'Mark Smith',
      initials: 'MS',
      avatarColor: '#0055e5',
      codigo: 'ASSET-4921',
      descripcion: 'Scheduled quarterly check',
      estado: 'Modified',
      datos: 'Status: Active + Maintenance\nReason: Scheduled quarterly check',
    },
    {
      id: 2,
      responsable: 'Jane Doe',
      initials: 'JD',
      avatarColor: '#10b981',
      codigo: 'ASSET-5002',
      descripcion: 'New asset registration',
      estado: 'Created',
      datos: 'New asset registered: Dell XPS 15 Laptop\nLocation: Headquarters IT Dept',
    },
    {
      id: 3,
      responsable: 'Alex Lee',
      initials: 'AL',
      avatarColor: '#a855f7',
      codigo: 'ASSET-1024',
      descripcion: 'Location transfer logged',
      estado: 'Modified',
      datos: 'Location: Warehouse A → Warehouse B',
    },
    {
      id: 4,
      responsable: 'Sarah Ross',
      initials: 'SR',
      avatarColor: '#ef4444',
      codigo: 'ASSET-1092',
      descripcion: 'Item scrapped — irreparable',
      estado: 'Deleted',
      datos: 'Item scrapped due to irreparable damage.\nAuthorized by: Manager ID #442',
    },
    {
      id: 5,
      responsable: 'Sarah Ross',
      initials: 'SR',
      avatarColor: '#3b82f6',
      codigo: 'ASSET-3310',
      descripcion: 'Auto depreciation report',
      estado: 'Report Generated',
      datos: 'Monthly depreciation: generated automatically.',
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Modified':    return { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24', dot: '#fbbf24' };
      case 'Created':     return { bg: 'rgba(16,185,129,0.12)',  text: '#10b981', dot: '#10b981' };
      case 'Deleted':     return { bg: 'rgba(239,68,68,0.12)',   text: '#ef4444', dot: '#ef4444' };
      case 'Report Generated': return { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6', dot: '#3b82f6' };
      default:            return { bg: 'rgba(107,114,128,0.12)', text: '#6b7280', dot: '#6b7280' };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.bgAccent} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Auditoría</Text>
          <Text style={styles.headerTitle}>Registro de Activos</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.btnSecondary}>
            <MaterialIcons name="download" size={15} color="#7a8fa6" />
            <Text style={styles.btnSecondaryText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary}>
            <MaterialIcons name="refresh" size={15} color="#ffffff" />
            <Text style={styles.btnPrimaryText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search + filter bar */}
      <View style={styles.filterRow}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={16} color="#3a5070" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar activos..."
            placeholderTextColor="#3a5070"
          />
          <View style={styles.searchDivider} />
          <MaterialIcons name="tune" size={16} color="#3a5070" />
        </View>
        <TouchableOpacity style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        {[
          { label: 'Total', value: '248', color: '#f0f4ff' },
          { label: 'Modificados', value: '102', color: '#fbbf24' },
          { label: 'Creados', value: '89', color: '#10b981' },
          { label: 'Eliminados', value: '12', color: '#ef4444' },
        ].map((s, i) => (
          <View key={i} style={styles.statItem}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Table */}
      <View style={styles.tableCard}>
        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 1.4 }]}>Responsable</Text>
          <Text style={[styles.th, { flex: 1 }]}>Código</Text>
          <Text style={[styles.th, { flex: 1.4 }]}>Descripción</Text>
          <Text style={[styles.th, { flex: 0.9, textAlign: 'center' }]}>Estado</Text>
          <Text style={[styles.th, { flex: 1.6 }]}>Datos del Bien</Text>
        </View>

        {auditData.map((item, index) => {
          const s = getStatusStyle(item.estado);
          const isLast = index === auditData.length - 1;
          return (
            <View key={item.id} style={[styles.tableRow, isLast && { borderBottomWidth: 0 }]}>
              {/* Responsable */}
              <View style={[styles.td, { flex: 1.4 }]}>
                <View style={[styles.avatar, { backgroundColor: item.avatarColor + '22', borderColor: item.avatarColor + '44' }]}>
                  <Text style={[styles.avatarText, { color: item.avatarColor }]}>{item.initials}</Text>
                </View>
                <Text style={styles.responsableText} numberOfLines={2}>{item.responsable}</Text>
              </View>

              {/* Código */}
              <View style={[styles.td, { flex: 1 }]}>
                <View style={styles.codeTag}>
                  <Text style={styles.codeText}>{item.codigo}</Text>
                </View>
              </View>

              {/* Descripción */}
              <View style={[styles.td, { flex: 1.4, alignItems: 'flex-start' }]}>
                <Text style={styles.descripcionText} numberOfLines={3}>{item.descripcion}</Text>
              </View>

              {/* Estado */}
              <View style={[styles.td, { flex: 0.9, justifyContent: 'center' }]}>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
                  <Text style={[styles.statusText, { color: s.text }]} numberOfLines={2}>{item.estado}</Text>
                </View>
              </View>

              {/* Datos del Bien */}
              <View style={[styles.td, { flex: 1.6, alignItems: 'flex-start' }]}>
                <Text style={styles.datosText} numberOfLines={3}>{item.datos}</Text>
              </View>
            </View>
          );
        })}

        {/* Pagination */}
        <View style={styles.pagination}>
          <Text style={styles.paginationInfo}>1–5 de <Text style={{ color: '#f0f4ff' }}>248</Text> resultados</Text>
          <View style={styles.paginationControls}>
            <TouchableOpacity style={styles.pageBtn}>
              <MaterialIcons name="chevron-left" size={16} color="#4a6fa8" />
            </TouchableOpacity>
            {['1', '2', '3', '...', '25'].map((p, i) => (
              <TouchableOpacity key={i} style={[styles.pageBtn, p === '1' && styles.pageBtnActive]}>
                <Text style={[styles.pageBtnText, p === '1' && styles.pageBtnTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.pageBtn}>
              <MaterialIcons name="chevron-right" size={16} color="#4a6fa8" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>© 2025 Ophira Technologies · All rights reserved.</Text>
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
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#0044cc',
    opacity: 0.05,
  },

  // Header
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 10,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4a6fa8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f0f4ff',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#111827',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  btnSecondaryText: {
    color: '#7a8fa6',
    fontSize: 12,
    fontWeight: '600',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0055e5',
    borderRadius: 8,
    shadowColor: '#0044cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Filter row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#1a2a42',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#dce8f5',
    fontSize: 13,
  },
  searchDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#1e2d45',
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  clearBtnText: {
    color: '#3a72cc',
    fontSize: 12,
    fontWeight: '600',
  },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a2a42',
    marginBottom: 16,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#1a2a42',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#5a7a9e',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Table card
  tableCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a2a42',
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#0d1829',
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a42',
  },
  th: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4a6fa8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111f35',
    alignItems: 'center',
  },
  td: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },

  // Avatar
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '800',
  },
  responsableText: {
    flex: 1,
    color: '#dce8f5',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },

  // Code tag
  codeTag: {
    backgroundColor: 'rgba(0,85,229,0.1)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,85,229,0.2)',
  },
  codeText: {
    color: '#4d8aff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Description
  descripcionText: {
    color: '#7a8fa6',
    fontSize: 11,
    lineHeight: 16,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    flexShrink: 1,
  },

  // Datos
  datosText: {
    color: '#5a7a9e',
    fontSize: 10.5,
    lineHeight: 15,
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a2a42',
    backgroundColor: '#0d1829',
  },
  paginationInfo: {
    color: '#4a6fa8',
    fontSize: 11,
    fontWeight: '500',
  },
  paginationControls: {
    flexDirection: 'row',
    gap: 4,
  },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pageBtnActive: {
    backgroundColor: '#0055e5',
    shadowColor: '#0044cc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  pageBtnText: {
    color: '#4a6fa8',
    fontSize: 11,
    fontWeight: '600',
  },
  pageBtnTextActive: {
    color: '#ffffff',
  },

  // Footer
  footer: {
    textAlign: 'center',
    color: '#1e2d45',
    fontSize: 11,
    marginBottom: 40,
    letterSpacing: 0.3,
  },
});