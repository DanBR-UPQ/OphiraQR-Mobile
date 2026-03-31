import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, FlatList } from 'react-native';
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
  const n = nombre?.[0] || '';
  const a = apellido?.[0] || '';
  return `${n}${a}`.toUpperCase() || '—';
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

const getAssetEstadoStyle = (estado) => {
  switch ((estado || '').toLowerCase()) {
    case 'encontrado':    return { bg: 'rgba(16,185,129,0.12)',  text: '#10b981' };
    case 'no encontrado': return { bg: 'rgba(239,68,68,0.12)',   text: '#ef4444' };
    case 'dañado':        return { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24' };
    default:              return { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' };
  }
};

// Builds the auditor display name from available fields
const buildAuditorName = (item) => {
  const parts = [item.nombre_usuario, item.apellido_paterno, item.apellido_materno].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  return item.nombre_usuario ?? '—';
};

// Summary counts for estados_activos
const getAssetSummary = (estados_activos) => {
  if (!estados_activos || typeof estados_activos !== 'object') return null;
  const entries = Object.values(estados_activos);
  if (entries.length === 0) return null;
  const found    = entries.filter(e => (e.estado || '').toLowerCase() === 'encontrado').length;
  const missing  = entries.filter(e => (e.estado || '').toLowerCase() === 'no encontrado').length;
  const damaged  = entries.filter(e => (e.estado || '').toLowerCase() === 'dañado').length;
  return { total: entries.length, found, missing, damaged };
};

// ─── Asset Detail Modal ──────────────────────────────────────────────────────

const AuditoriaModal = ({ item, visible, onClose }) => {
  if (!item) return null;

  const auditor   = buildAuditorName(item);
  const s         = getEstadoStyle(item.estado_general);
  const assets    = item.estados_activos ? Object.entries(item.estados_activos) : [];
  const color     = avatarColor(item.id_usuario_auditor);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          {/* Handle bar */}
          <View style={modal.handle} />

          {/* Header */}
          <View style={modal.header}>
            <View style={modal.headerLeft}>
              <Text style={modal.eyebrow}>Auditoría</Text>
              <Text style={modal.title}>#{item.id_auditoria}</Text>
            </View>
            <View style={[modal.statusBadge, { backgroundColor: s.bg }]}>
              <View style={[modal.statusDot, { backgroundColor: s.dot }]} />
              <Text style={[modal.statusText, { color: s.text }]}>
                {item.estado_general
                  ? item.estado_general.charAt(0).toUpperCase() + item.estado_general.slice(1)
                  : '—'}
              </Text>
            </View>
            <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
              <MaterialIcons name="close" size={18} color="#5a7a9e" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={modal.body}>

            {/* Auditor card */}
            <View style={modal.section}>
              <Text style={modal.sectionLabel}>Auditor</Text>
              <View style={modal.auditorRow}>
                <View style={[modal.avatar, { backgroundColor: color + '22', borderColor: color + '44' }]}>
                  <Text style={[modal.avatarText, { color }]}>
                    {initials(item.nombre ?? item.nombre_usuario, item.apellido_paterno)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={modal.auditorName}>{auditor}</Text>
                  {(item.puesto || item.area) && (
                    <Text style={modal.auditorSub}>
                      {[item.puesto, item.area].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Meta row */}
            <View style={modal.section}>
              <Text style={modal.sectionLabel}>Detalles</Text>
              <View style={modal.metaGrid}>
                <View style={modal.metaItem}>
                  <Text style={modal.metaKey}>Aula</Text>
                  <View style={styles.codeTag}>
                    <Text style={styles.codeText}>{item.id_aula ?? '—'}</Text>
                  </View>
                </View>
                <View style={modal.metaItem}>
                  <Text style={modal.metaKey}>Fecha</Text>
                  <Text style={modal.metaVal}>{formatDate(item.fecha_auditoria)}</Text>
                </View>
                {item.id_movimiento && (
                  <View style={modal.metaItem}>
                    <Text style={modal.metaKey}>Movimiento</Text>
                    <View style={styles.movTag}>
                      <Text style={styles.movText}>MOV-{item.id_movimiento}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Observaciones */}
            <View style={modal.section}>
              <Text style={modal.sectionLabel}>Observaciones</Text>
              <View style={modal.obsBox}>
                <Text style={item.observaciones ? modal.obsText : modal.obsEmpty}>
                  {item.observaciones?.trim() || 'Ninguna observación'}
                </Text>
              </View>
            </View>

            {/* Asset list */}
            {assets.length > 0 && (
              <View style={[modal.section, { marginBottom: 32 }]}>
                <Text style={modal.sectionLabel}>
                  Activos Auditados
                  <Text style={modal.sectionCount}> ({assets.length})</Text>
                </Text>

                {/* Summary pills */}
                {(() => {
                  const sum = getAssetSummary(item.estados_activos);
                  if (!sum) return null;
                  return (
                    <View style={modal.summaryRow}>
                      {sum.found   > 0 && <View style={[modal.summaryPill, { backgroundColor: 'rgba(16,185,129,0.12)' }]}><Text style={[modal.summaryText, { color: '#10b981' }]}>✓ {sum.found} encontrado{sum.found !== 1 ? 's' : ''}</Text></View>}
                      {sum.missing > 0 && <View style={[modal.summaryPill, { backgroundColor: 'rgba(239,68,68,0.12)' }]}><Text style={[modal.summaryText, { color: '#ef4444' }]}>✕ {sum.missing} no encontrado{sum.missing !== 1 ? 's' : ''}</Text></View>}
                      {sum.damaged > 0 && <View style={[modal.summaryPill, { backgroundColor: 'rgba(251,191,36,0.12)' }]}><Text style={[modal.summaryText, { color: '#fbbf24' }]}>⚠ {sum.damaged} dañado{sum.damaged !== 1 ? 's' : ''}</Text></View>}
                    </View>
                  );
                })()}

                {assets.map(([id, asset]) => {
                  const as = getAssetEstadoStyle(asset.estado);
                  return (
                    <View key={id} style={modal.assetCard}>
                      <View style={modal.assetTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={modal.assetName} numberOfLines={2}>{asset.nombre ?? '—'}</Text>
                          <Text style={modal.assetCategory}>{asset.categoria ?? '—'}</Text>
                        </View>
                        <View style={[modal.assetBadge, { backgroundColor: as.bg }]}>
                          <Text style={[modal.assetBadgeText, { color: as.text }]}>{asset.estado ?? '—'}</Text>
                        </View>
                      </View>
                      <View style={modal.assetDivider} />
                      <View style={modal.assetBottom}>
                        <MaterialIcons name="person-outline" size={11} color="#3a5070" />
                        <Text style={modal.assetResponsable} numberOfLines={1}>
                          {asset.responsable ?? 'Sin responsable'}
                        </Text>
                        <Text style={modal.assetId}>ID #{id}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Audit Card ──────────────────────────────────────────────────────────────

const AuditoriaCard = ({ item, onPress }) => {
  const s        = getEstadoStyle(item.estado_general);
  const auditor  = buildAuditorName(item);
  const color    = avatarColor(item.id_usuario_auditor);
  const summary  = getAssetSummary(item.estados_activos);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Card top row */}
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <Text style={styles.cardId}>#{item.id_auditoria}</Text>
          {item.id_aula && (
            <View style={styles.codeTag}>
              <Text style={styles.codeText}>{item.id_aula}</Text>
            </View>
          )}
          {item.id_movimiento && (
            <View style={styles.movTag}>
              <Text style={styles.movText}>MOV-{item.id_movimiento}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
          <Text style={[styles.statusText, { color: s.text }]}>
            {item.estado_general
              ? item.estado_general.charAt(0).toUpperCase() + item.estado_general.slice(1)
              : '—'}
          </Text>
        </View>
      </View>

      {/* Auditor */}
      <View style={styles.cardAuditor}>
        <View style={[styles.avatar, { backgroundColor: color + '22', borderColor: color + '44' }]}>
          <Text style={[styles.avatarText, { color }]}>
            {initials(item.nombre ?? item.nombre_usuario, item.apellido_paterno)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.responsableText} numberOfLines={1}>{auditor}</Text>
          {(item.puesto || item.area) && (
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {[item.puesto, item.area].filter(Boolean).join(' · ')}
            </Text>
          )}
        </View>
      </View>

      {/* Observaciones */}
      <Text style={item.observaciones ? styles.cardObs : styles.cardObsEmpty} numberOfLines={2}>
        {item.observaciones?.trim() || 'Ninguna observación'}
      </Text>

      {/* Footer row */}
      <View style={styles.cardFooter}>
        <Text style={styles.fechaText}>{formatDate(item.fecha_auditoria)}</Text>
        {summary && (
          <View style={styles.cardSummaryRow}>
            {summary.found   > 0 && <Text style={styles.summaryGreen}>✓{summary.found}</Text>}
            {summary.missing > 0 && <Text style={styles.summaryRed}>✕{summary.missing}</Text>}
            {summary.damaged > 0 && <Text style={styles.summaryYellow}>⚠{summary.damaged}</Text>}
            <MaterialIcons name="chevron-right" size={14} color="#3a5070" style={{ marginLeft: 4 }} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── screen ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function ListAuditoriasScreen() {
  const navigation = useNavigation();
  const [allData, setAllData]         = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
        buildAuditorName(r).toLowerCase().includes(q) ||
        String(r.id_auditoria).includes(q) ||
        (r.id_aula ?? '').toLowerCase().includes(q) ||
        (r.observaciones ?? '').toLowerCase().includes(q) ||
        (r.estado_general ?? '').toLowerCase().includes(q) ||
        (r.nombre_usuario ?? '').toLowerCase().includes(q) ||
        (r.puesto ?? '').toLowerCase().includes(q) ||
        (r.area ?? '').toLowerCase().includes(q) ||
        (r.id_movimiento !== null && String(r.id_movimiento).includes(q))
      )
    );
    setPage(1);
  }, [search, allData]);

  // ── pagination ──
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const openModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
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

      {/* Cards list */}
      {!loading && !error && filtered.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          {pageData.map((item) => (
            <AuditoriaCard
              key={item.id_auditoria}
              item={item}
              onPress={() => openModal(item)}
            />
          ))}

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

      <Text style={styles.footer}>© 2026 Ophira Technologies · All rights reserved.</Text>

      {/* Detail Modal */}
      <AuditoriaModal
        item={selectedItem}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
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

  // ── Card ──
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a2a42',
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    flexWrap: 'wrap',
  },
  cardId: {
    color: '#3a5070',
    fontSize: 11,
    fontWeight: '700',
  },
  cardAuditor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardSubtitle: {
    color: '#3a5070',
    fontSize: 10.5,
    marginTop: 1,
  },
  cardObs: {
    color: '#5a7a9e',
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 10,
  },
  cardObsEmpty: {
    color: '#2a3d55',
    fontSize: 11.5,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#111f35',
    paddingTop: 8,
    marginTop: 2,
  },
  cardSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryGreen:  { color: '#10b981', fontSize: 11, fontWeight: '700' },
  summaryRed:    { color: '#ef4444', fontSize: 11, fontWeight: '700' },
  summaryYellow: { color: '#fbbf24', fontSize: 11, fontWeight: '700' },

  // Shared: Avatar
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '800',
  },
  responsableText: {
    flex: 1,
    color: '#dce8f5',
    fontSize: 12,
    fontWeight: '500',
  },

  // Shared: Code tag (aula)
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

  // Shared: Movimiento tag
  movTag: {
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

  // Shared: Status badge
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
  },

  // Shared: date
  fechaText: {
    color: '#3a5070',
    fontSize: 10,
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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

// ─── Modal styles ────────────────────────────────────────────────────────────

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0d1829',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#1a2a42',
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1e2d45',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a42',
    gap: 10,
  },
  headerLeft: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    color: '#4a6fa8',
    fontWeight: '600',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f0f4ff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1a2a42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  section: {
    marginTop: 18,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4a6fa8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionCount: {
    color: '#3a5070',
    fontWeight: '500',
  },
  // Auditor
  auditorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
  },
  auditorName: {
    color: '#dce8f5',
    fontSize: 13,
    fontWeight: '600',
  },
  auditorSub: {
    color: '#4a6fa8',
    fontSize: 11,
    marginTop: 2,
  },
  // Meta grid
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    backgroundColor: '#111827',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a2a42',
    padding: 10,
    gap: 5,
    minWidth: 100,
  },
  metaKey: {
    fontSize: 10,
    color: '#4a6fa8',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metaVal: {
    color: '#dce8f5',
    fontSize: 11.5,
    fontWeight: '500',
  },
  // Observaciones
  obsBox: {
    backgroundColor: '#111827',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a2a42',
    padding: 12,
  },
  obsText: {
    color: '#8aa5c5',
    fontSize: 13,
    lineHeight: 19,
  },
  obsEmpty: {
    color: '#3a5070',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  // Summary pills
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  summaryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  summaryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Asset cards
  assetCard: {
    backgroundColor: '#111827',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a2a42',
    padding: 12,
    marginBottom: 8,
  },
  assetTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  assetName: {
    color: '#dce8f5',
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
  },
  assetCategory: {
    color: '#4a6fa8',
    fontSize: 10.5,
    marginTop: 2,
  },
  assetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    flexShrink: 0,
  },
  assetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  assetDivider: {
    height: 1,
    backgroundColor: '#111f35',
    marginVertical: 8,
  },
  assetBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  assetResponsable: {
    flex: 1,
    color: '#5a7a9e',
    fontSize: 10.5,
  },
  assetId: {
    color: '#2a3d55',
    fontSize: 10,
    fontWeight: '600',
  },
});