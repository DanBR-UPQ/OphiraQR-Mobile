import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api'
import { useNavigation } from '@react-navigation/native'

// ─── helpers ────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

const initials = (nombre, apellido) => {
  const n = typeof nombre === 'string' ? nombre : '';
  const a = typeof apellido === 'string' ? apellido : '';
  return `${n.charAt(0)}${a.charAt(0)}`.toUpperCase();
};

const AVATAR_COLORS = ['#0055e5', '#10b981', '#a855f7', '#ef4444', '#f59e0b', '#3b82f6', '#ec4899'];
const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const getEstadoStyle = (estado) => {
  switch ((estado || '').toLowerCase()) {
    case 'finalizada':   return { bg: 'rgba(16,185,129,0.12)',  text: '#10b981', dot: '#10b981' };
    case 'pendiente':    return { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24', dot: '#fbbf24' };
    case 'en proceso':   return { bg: 'rgba(59,130,246,0.12)',  text: '#3b82f6', dot: '#3b82f6' };
    case 'cancelada':    return { bg: 'rgba(239,68,68,0.12)',   text: '#ef4444', dot: '#ef4444' };
    default:             return { bg: 'rgba(107,114,128,0.12)', text: '#6b7280', dot: '#6b7280' };
  }
};

// Renders the estados_activos JSONB in a readable way
const EstadosActivos = ({ data }) => {
  if (!data || typeof data !== 'object') return <Text style={styles.datosText}>—</Text>;
  const entries = Object.entries(data);
  if (entries.length === 0) return <Text style={styles.datosText}>—</Text>;
  return (
    <View style={{ gap: 3 }}>
      {entries.slice(0, 3).map(([k, v]) => (
        <View key={k} style={styles.kvRow}>
          <Text style={styles.kvKey}>{k}:</Text>
          <Text style={styles.kvVal} numberOfLines={1}>{String(v)}</Text>
        </View>
      ))}
      {entries.length > 3 && (
        <Text style={styles.kvMore}>+{entries.length - 3} más</Text>
      )}
    </View>
  );
};

// ─── screen ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function ListAuditoriasScreen() {
  const navigation = useNavigation();
  const [allData, setAllData]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState(null);
  

  // ── fetch ──
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const res = await api.get('/auditorias/');
      const rows = res.rows ?? [];
      setAllData(rows);
      setFiltered(rows);
      setPage(1);
    } catch (e) {
      setError('No se pudo cargar la información. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── search filter ──
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) { setFiltered(allData); setPage(1); return; }
    setFiltered(
      allData.filter(r =>
        `${r.nombre} ${r.apellido_paterno}`.toLowerCase().includes(q) ||
        String(r.id_auditoria).includes(q) ||
        (r.id_aula ?? '').toLowerCase().includes(q) ||
        (r.observaciones ?? '').toLowerCase().includes(q) ||
        (r.estado_general ?? '').toLowerCase().includes(q) ||
        (r.id_movimiento !== null && String(r.id_movimiento).includes(q))
      )
    );
    setPage(1);
  }, [search, allData]);

  // ── pagination ──
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total:      allData.length,
    finalizada: allData.filter(r => (r.estado_general ?? '').toLowerCase() === 'finalizada').length,
    pendiente:  allData.filter(r => (r.estado_general ?? '').toLowerCase() === 'pendiente').length,
    cancelada:  allData.filter(r => (r.estado_general ?? '').toLowerCase() === 'cancelada').length,
  };

  // ── page buttons ──
  const buildPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, '...', totalPages];
    if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  // ── render ──
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor="#0055e5" />}
    >
      <View style={styles.bgAccent} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Sistema de Activos</Text>
          <Text style={styles.headerTitle}>Auditorías</Text>
        </View>
        <View style={styles.headerActions}>
          {/* Non-functional create button */}
          <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('CrearAuditoria')}>
            <MaterialIcons name="add" size={15} color="#fff" />
            <Text style={styles.btnPrimaryText}>Nueva Auditoría</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => fetchData(true)}>
            <MaterialIcons name="refresh" size={15} color="#7a8fa6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.filterRow}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={16} color="#3a5070" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por auditor, aula, estado..."
            placeholderTextColor="#3a5070"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={15} color="#3a5070" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        {[
          { label: 'Total',      value: String(stats.total),      color: '#f0f4ff' },
          { label: 'Finalizadas', value: String(stats.finalizada), color: '#10b981' },
          { label: 'Pendientes', value: String(stats.pendiente),   color: '#fbbf24' },
          { label: 'Canceladas', value: String(stats.cancelada),   color: '#ef4444' },
        ].map((s, i, arr) => (
          <View key={i} style={[styles.statItem, i < arr.length - 1 && { borderRightWidth: 1, borderRightColor: '#1a2a42' }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0055e5" />
          <Text style={styles.loadingText}>Cargando auditorías...</Text>
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={40} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <View style={styles.centered}>
          <MaterialIcons name="search-off" size={40} color="#1e2d45" />
          <Text style={styles.emptyText}>
            {search ? 'Sin resultados para tu búsqueda.' : 'No hay auditorías registradas.'}
          </Text>
        </View>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <View style={styles.tableCard}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.th, { flex: 1.3 }]}>Auditor</Text>
            <Text style={[styles.th, { flex: 0.8 }]}>Aula</Text>
            <Text style={[styles.th, { flex: 0.9, textAlign: 'center' }]}>Estado</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Observaciones</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Estados Activos</Text>
            <Text style={[styles.th, { flex: 1.1 }]}>Fecha</Text>
          </View>

          {pageData.map((item, index) => {
            const s       = getEstadoStyle(item.estado_general);
            const isLast  = index === pageData.length - 1;
            const auditor = `${item.nombre ?? ''} ${item.apellido_paterno ?? ''}`.trim() || item.nombre_usuario;
            return (
              <View key={item.id_auditoria} style={[styles.tableRow, isLast && { borderBottomWidth: 0 }]}>

                {/* ID */}
                <View style={[styles.td, { flex: 0.5 }]}>
                  <Text style={styles.idText}>#{item.id_auditoria}</Text>
                </View>

                {/* Auditor */}
                <View style={[styles.td, { flex: 1.3 }]}>
                  <View style={[styles.avatar, {
                    backgroundColor: avatarColor(item.id_usuario_auditor) + '22',
                    borderColor:     avatarColor(item.id_usuario_auditor) + '44',
                  }]}>
                    <Text style={[styles.avatarText, { color: avatarColor(item.id_usuario_auditor) }]}>
                      {initials(item.nombre, item.apellido_paterno)}
                    </Text>
                  </View>
                  <Text style={styles.responsableText} numberOfLines={2}>{auditor}</Text>
                </View>

                {/* Aula */}
                <View style={[styles.td, { flex: 0.8 }]}>
                  {item.id_aula ? (
                    <View style={styles.codeTag}>
                      <Text style={styles.codeText}>{item.id_aula}</Text>
                    </View>
                  ) : (
                    <Text style={styles.nullText}>—</Text>
                  )}
                </View>

                {/* Estado */}
                <View style={[styles.td, { flex: 0.9, justifyContent: 'center' }]}>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
                    <Text style={[styles.statusText, { color: s.text }]} numberOfLines={2}>
                      {item.estado_general ?? '—'}
                    </Text>
                  </View>
                </View>

                {/* Observaciones */}
                <View style={[styles.td, { flex: 1.5, alignItems: 'flex-start' }]}>
                  <Text style={styles.datosText} numberOfLines={3}>
                    {item.observaciones?.trim() || <Text style={styles.nullText}>Sin observaciones</Text>}
                  </Text>
                </View>

                {/* Estados Activos (JSONB) */}
                <View style={[styles.td, { flex: 1.5, alignItems: 'flex-start' }]}>
                  <EstadosActivos data={item.estados_activos} />
                </View>

                {/* Fecha */}
                <View style={[styles.td, { flex: 1.1, alignItems: 'flex-start' }]}>
                  <Text style={styles.fechaText}>{formatDate(item.fecha_auditoria)}</Text>
                  {item.id_movimiento && (
                    <View style={styles.movTag}>
                      <Text style={styles.movText}>MOV-{item.id_movimiento}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {/* Pagination */}
          <View style={styles.pagination}>
            <Text style={styles.paginationInfo}>
              {filtered.length === 0 ? '0 resultados' : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de `}
              {filtered.length > 0 && <Text style={{ color: '#f0f4ff' }}>{filtered.length}</Text>}
              {filtered.length > 0 && ' resultados'}
            </Text>
            <View style={styles.paginationControls}>
              <TouchableOpacity
                style={styles.pageBtn}
                onPress={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <MaterialIcons name="chevron-left" size={16} color={page === 1 ? '#1e2d45' : '#4a6fa8'} />
              </TouchableOpacity>

              {buildPages().map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.pageBtn, p === page && styles.pageBtnActive]}
                  onPress={() => typeof p === 'number' && setPage(p)}
                  disabled={p === '...'}
                >
                  <Text style={[styles.pageBtnText, p === page && styles.pageBtnTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.pageBtn}
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <MaterialIcons name="chevron-right" size={16} color={page === totalPages ? '#1e2d45' : '#4a6fa8'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.footer}>© 2025 Ophira Technologies · All rights reserved.</Text>
    </ScrollView>
  );
}

// ─── styles ─────────────────────────────────────────────────────────────────

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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
    marginTop: 6,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#111827',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a2a42',
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

  // Filter
  filterRow: {
    marginBottom: 16,
  },
  searchBar: {
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

  // Stats
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

  // Loading / Error / Empty
  centered: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    color: '#4a6fa8',
    fontSize: 13,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0055e5',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyText: {
    color: '#3a5070',
    fontSize: 13,
    textAlign: 'center',
  },

  // Table
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

  // ID
  idText: {
    color: '#3a5070',
    fontSize: 11,
    fontWeight: '600',
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

  // Code tag (aula)
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

  // Movimiento tag
  movTag: {
    marginTop: 4,
    backgroundColor: 'rgba(168,85,247,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
  },
  movText: {
    color: '#a855f7',
    fontSize: 9,
    fontWeight: '700',
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

  // Data / text
  datosText: {
    color: '#5a7a9e',
    fontSize: 10.5,
    lineHeight: 15,
  },
  nullText: {
    color: '#1e2d45',
    fontSize: 11,
  },
  fechaText: {
    color: '#5a7a9e',
    fontSize: 10,
    lineHeight: 14,
  },

  // KV rows for estados_activos
  kvRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  kvKey: {
    color: '#4a6fa8',
    fontSize: 10,
    fontWeight: '700',
  },
  kvVal: {
    color: '#5a7a9e',
    fontSize: 10,
    flex: 1,
  },
  kvMore: {
    color: '#3a5070',
    fontSize: 9,
    fontStyle: 'italic',
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
    flexWrap: 'wrap',
    gap: 8,
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
    minWidth: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
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