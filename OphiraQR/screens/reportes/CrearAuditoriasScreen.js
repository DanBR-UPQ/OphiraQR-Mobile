import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Modal, FlatList, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api'

// ─── constants ────────────────────────────────────────────────────────────────

const ESTADOS_ACTIVO = [
  'Por Verificar',
  'Encontrado',
  'No Encontrado',
  'Dañado',
  'Ubicación Incorrecta',
];

const ESTADO_COLORS = {
  'Por Verificar':       { bg: 'rgba(107,114,128,0.15)', text: '#6b7280', dot: '#6b7280' },
  'Encontrado':          { bg: 'rgba(16,185,129,0.15)',  text: '#10b981', dot: '#10b981' },
  'No Encontrado':       { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444', dot: '#ef4444' },
  'Dañado':              { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24', dot: '#fbbf24' },
  'Ubicación Incorrecta':{ bg: 'rgba(168,85,247,0.15)', text: '#a855f7', dot: '#a855f7' },
};

// ─── small components ────────────────────────────────────────────────────────

/** Generic bottom-sheet style picker modal */
function PickerModal({ visible, title, options, selected, onSelect, onClose, keyExtractor, labelExtractor }) {
  const [search, setSearch] = useState('');
  const filtered = options.filter(o =>
    labelExtractor(o).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <TouchableOpacity style={modal.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={modal.sheet}>
          {/* Handle */}
          <View style={modal.handle} />

          <Text style={modal.title}>{title}</Text>

          {options.length > 5 && (
            <View style={modal.searchBar}>
              <MaterialIcons name="search" size={15} color="#3a5070" />
              <TextInput
                style={modal.searchInput}
                placeholder="Buscar..."
                placeholderTextColor="#3a5070"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            style={modal.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const label = labelExtractor(item);
              const isSelected = label === selected;
              return (
                <TouchableOpacity
                  style={[modal.option, isSelected && modal.optionActive]}
                  onPress={() => { onSelect(item); setSearch(''); onClose(); }}
                >
                  <Text style={[modal.optionText, isSelected && modal.optionTextActive]}>
                    {label}
                  </Text>
                  {isSelected && <MaterialIcons name="check" size={16} color="#0055e5" />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={modal.emptyText}>Sin resultados</Text>
            }
          />

          <TouchableOpacity style={modal.cancelBtn} onPress={() => { setSearch(''); onClose(); }}>
            <Text style={modal.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/** Status badge (reused for asset rows) */
function StatusBadge({ estado }) {
  const s = ESTADO_COLORS[estado] ?? ESTADO_COLORS['Por Verificar'];
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
      <Text style={[styles.statusText, { color: s.text }]}>{estado}</Text>
    </View>
  );
}

/** Inline dropdown for each asset row */
function AssetEstadoPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const s = ESTADO_COLORS[value] ?? ESTADO_COLORS['Por Verificar'];

  return (
    <>
      <TouchableOpacity
        style={[styles.assetPickerBtn, { backgroundColor: s.bg, borderColor: s.dot + '44' }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
        <Text style={[styles.assetPickerText, { color: s.text }]} numberOfLines={1}>
          {value}
        </Text>
        <MaterialIcons name="expand-more" size={13} color={s.text} />
      </TouchableOpacity>

      <PickerModal
        visible={open}
        title="Estado del activo"
        options={ESTADOS_ACTIVO}
        selected={value}
        onSelect={(v) => onChange(v)}
        onClose={() => setOpen(false)}
        keyExtractor={(o) => o}
        labelExtractor={(o) => o}
      />
    </>
  );
}

// ─── progress stepper ────────────────────────────────────────────────────────

function Stepper({ current }) {
  const steps = ['Ubicación', 'Activos', 'Confirmar'];
  return (
    <View style={styles.stepper}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done    = idx < current;
        const active  = idx === current;
        return (
          <View key={label} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              done   && styles.stepCircleDone,
              active && styles.stepCircleActive,
            ]}>
              {done
                ? <MaterialIcons name="check" size={13} color="#fff" />
                : <Text style={[styles.stepNum, active && { color: '#fff' }]}>{idx}</Text>
              }
            </View>
            <Text style={[styles.stepLabel, active && { color: '#f0f4ff' }, done && { color: '#10b981' }]}>
              {label}
            </Text>
            {i < steps.length - 1 && (
              <View style={[styles.stepLine, done && { backgroundColor: '#10b981' }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export default function CrearAuditoriaScreen({ navigation }) {
  // Step 1 – location
  const [aulas, setAulas]           = useState([]);
  const [aulaLoading, setAulaLoading] = useState(true);
  const [aulaError, setAulaError]   = useState(null);
  const [selectedAula, setSelectedAula] = useState(null);
  const [aulaModalOpen, setAulaModalOpen] = useState(false);

  // Step 2 – assets
  const [assets, setAssets]         = useState([]);   // [{ nombre, estado }]
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState(null);

  // Step 3 – confirm
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Navigation
  const [step, setStep] = useState(1);

  // ── load aulas on mount ──
  useEffect(() => {
    (async () => {
      try {
        setAulaLoading(true);
        setAulaError(null);
        const res = await api.get('/ubicacion/aulas');
        setAulas(res.rows ?? res ?? []);
      } catch {
        setAulaError('No se pudieron cargar las ubicaciones.');
      } finally {
        setAulaLoading(false);
      }
    })();
  }, []);

  // ── load assets when aula is picked ──
  const loadAssets = useCallback(async (idAula) => {
    try {
      setAssetsLoading(true);
      setAssetsError(null);
      const res = await api.get(`/assets/aula/${idAula}`);
      const rows = res.rows ?? res ?? [];
      setAssets(rows.map(a => ({ ...a, estadoAuditoria: 'Por Verificar' })));
    } catch {
      setAssetsError('No se pudieron cargar los activos de esta ubicación.');
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  const handleSelectAula = (aula) => {
    setSelectedAula(aula);
    setAssets([]);
    loadAssets(aula.id_aula);
  };

  // ── update single asset estado ──
  const updateAssetEstado = (index, newEstado) => {
    setAssets(prev => {
      const next = [...prev];
      next[index] = { ...next[index], estadoAuditoria: newEstado };
      return next;
    });
  };

  // ── quick-set all assets to same estado ──
  const setAllEstados = (estado) => {
    setAssets(prev => prev.map(a => ({ ...a, estadoAuditoria: estado })));
  };

  // ── build estados_activos JSONB ──
  const buildEstadosActivos = () => {
    const obj = {};
    assets.forEach(a => {
      obj[a.nombre] = a.estadoAuditoria;
    });
    return obj;
  };

  // ── submit ──
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const body = {
        id_aula: selectedAula.id_aula,
        observaciones: observaciones.trim() || null,
        estados_activos: buildEstadosActivos(),
        estado_general: 'finalizada',
      };
      await api.post('/auditorias/', body);
      Alert.alert(
        'Auditoría creada',
        `La auditoría para ${selectedAula.id_aula} fue registrada exitosamente.`,
        [{ text: 'Aceptar', onPress: () => navigation?.goBack?.() }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo crear la auditoría. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── summary counts ──
  const counts = ESTADOS_ACTIVO.reduce((acc, e) => {
    acc[e] = assets.filter(a => a.estadoAuditoria === e).length;
    return acc;
  }, {});

  // ── step validation ──
  const canGoStep2 = !!selectedAula && !assetsLoading && !assetsError;
  const canGoStep3 = canGoStep2 && assets.length > 0;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.bgAccent} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
            <MaterialIcons name="arrow-back-ios" size={14} color="#4a6fa8" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerEyebrow}>Nueva</Text>
            <Text style={styles.headerTitle}>Auditoría</Text>
          </View>
        </View>

        {/* Stepper */}
        <Stepper current={step} />

        {/* ══════════════ STEP 1 – UBICACIÓN ══════════════ */}
        {step === 1 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <MaterialIcons name="location-on" size={16} color="#0055e5" />
              </View>
              <Text style={styles.cardTitle}>Seleccionar Ubicación</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Elige el aula o espacio físico que deseas auditar. Los activos se cargarán automáticamente.
            </Text>

            {aulaLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator color="#0055e5" />
                <Text style={styles.loadingText}>Cargando ubicaciones...</Text>
              </View>
            ) : aulaError ? (
              <View style={styles.centered}>
                <MaterialIcons name="error-outline" size={32} color="#ef4444" />
                <Text style={styles.errorText}>{aulaError}</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.selectBtn, selectedAula && styles.selectBtnActive]}
                  onPress={() => setAulaModalOpen(true)}
                >
                  <MaterialIcons name="meeting-room" size={16} color={selectedAula ? '#4d8aff' : '#3a5070'} />
                  <Text style={[styles.selectBtnText, selectedAula && styles.selectBtnTextActive]}>
                    {selectedAula ? selectedAula.id_aula : 'Selecciona una ubicación...'}
                  </Text>
                  <MaterialIcons name="expand-more" size={18} color={selectedAula ? '#4d8aff' : '#3a5070'} />
                </TouchableOpacity>

                <PickerModal
                  visible={aulaModalOpen}
                  title="Seleccionar Ubicación"
                  options={aulas}
                  selected={selectedAula?.id_aula}
                  onSelect={handleSelectAula}
                  onClose={() => setAulaModalOpen(false)}
                  keyExtractor={(o) => o.id_aula}
                  labelExtractor={(o) => o.id_aula}
                />

                {/* Asset preview while loading */}
                {selectedAula && assetsLoading && (
                  <View style={styles.assetLoadingRow}>
                    <ActivityIndicator size="small" color="#0055e5" />
                    <Text style={styles.loadingText}>Cargando activos de {selectedAula.id_aula}...</Text>
                  </View>
                )}
                {selectedAula && assetsError && (
                  <Text style={styles.errorText}>{assetsError}</Text>
                )}
                {selectedAula && !assetsLoading && !assetsError && (
                  <View style={styles.previewChip}>
                    <MaterialIcons name="inventory-2" size={13} color="#10b981" />
                    <Text style={styles.previewText}>
                      {assets.length} activo{assets.length !== 1 ? 's' : ''} encontrado{assets.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* ══════════════ STEP 2 – ACTIVOS ══════════════ */}
        {step === 2 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <MaterialIcons name="inventory-2" size={16} color="#0055e5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Activos — {selectedAula?.id_aula}</Text>
                <Text style={styles.cardSubtitle}>{assets.length} activos por verificar</Text>
              </View>
            </View>

            {/* Quick-set bar */}
            <View style={styles.quickSetBar}>
              <Text style={styles.quickSetLabel}>Marcar todos:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {ESTADOS_ACTIVO.map(e => {
                  const s = ESTADO_COLORS[e];
                  return (
                    <TouchableOpacity
                      key={e}
                      style={[styles.quickSetBtn, { borderColor: s.dot + '55' }]}
                      onPress={() => setAllEstados(e)}
                    >
                      <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
                      <Text style={[styles.quickSetText, { color: s.text }]}>{e}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Asset list */}
            {assets.map((asset, idx) => (
              <View key={asset.nombre + idx} style={[
                styles.assetRow,
                idx === assets.length - 1 && { borderBottomWidth: 0 }
              ]}>
                {/* Index + name */}
                <View style={styles.assetInfo}>
                  <Text style={styles.assetIndex}>{String(idx + 1).padStart(2, '0')}</Text>
                  <Text style={styles.assetName} numberOfLines={2}>{asset.nombre}</Text>
                </View>
                {/* Estado picker */}
                <AssetEstadoPicker
                  value={asset.estadoAuditoria}
                  onChange={(v) => updateAssetEstado(idx, v)}
                />
              </View>
            ))}

            {/* Summary bar */}
            <View style={styles.summaryBar}>
              {ESTADOS_ACTIVO.filter(e => counts[e] > 0).map(e => {
                const s = ESTADO_COLORS[e];
                return (
                  <View key={e} style={[styles.summaryChip, { backgroundColor: s.bg }]}>
                    <Text style={[styles.summaryCount, { color: s.text }]}>{counts[e]}</Text>
                    <Text style={[styles.summaryLabel, { color: s.text }]} numberOfLines={1}>{e}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ══════════════ STEP 3 – CONFIRMAR ══════════════ */}
        {step === 3 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <MaterialIcons name="fact-check" size={16} color="#0055e5" />
              </View>
              <Text style={styles.cardTitle}>Confirmar Auditoría</Text>
            </View>
            <Text style={styles.cardSubtitle}>Revisa el resumen antes de enviar.</Text>

            {/* Info rows */}
            <View style={styles.infoBlock}>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Ubicación</Text>
                <View style={styles.codeTag}>
                  <Text style={styles.codeText}>{selectedAula?.id_aula}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Total de activos</Text>
                <Text style={styles.infoVal}>{assets.length}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Estado general</Text>
                <StatusBadge estado="Encontrado" />
              </View>
            </View>

            {/* Status breakdown */}
            <Text style={styles.sectionLabel}>Resumen de estados</Text>
            <View style={styles.breakdownGrid}>
              {ESTADOS_ACTIVO.map(e => {
                const s = ESTADO_COLORS[e];
                return (
                  <View key={e} style={[styles.breakdownCell, { backgroundColor: s.bg, borderColor: s.dot + '33' }]}>
                    <Text style={[styles.breakdownCount, { color: s.text }]}>{counts[e]}</Text>
                    <Text style={[styles.breakdownLabel, { color: s.text }]}>{e}</Text>
                  </View>
                );
              })}
            </View>

            {/* Observaciones */}
            <Text style={styles.sectionLabel}>Observaciones <Text style={styles.optional}>(opcional)</Text></Text>
            <TextInput
              style={styles.textarea}
              placeholder="Agrega notas o comentarios sobre esta auditoría..."
              placeholderTextColor="#3a5070"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={observaciones}
              onChangeText={setObservaciones}
            />
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── fixed bottom nav ── */}
      <View style={styles.bottomNav}>
        {step > 1 && (
          <TouchableOpacity style={styles.navBtnSecondary} onPress={() => setStep(s => s - 1)}>
            <MaterialIcons name="arrow-back" size={16} color="#7a8fa6" />
            <Text style={styles.navBtnSecondaryText}>Atrás</Text>
          </TouchableOpacity>
        )}

        {step === 1 && (
          <TouchableOpacity
            style={[styles.navBtnPrimary, !canGoStep2 && styles.navBtnDisabled]}
            disabled={!canGoStep2}
            onPress={() => setStep(2)}
          >
            <Text style={styles.navBtnPrimaryText}>Continuar</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}

        {step === 2 && (
          <TouchableOpacity
            style={[styles.navBtnPrimary, !canGoStep3 && styles.navBtnDisabled]}
            disabled={!canGoStep3}
            onPress={() => setStep(3)}
          >
            <Text style={styles.navBtnPrimaryText}>Revisar</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}

        {step === 3 && (
          <TouchableOpacity
            style={[styles.navBtnPrimary, submitting && styles.navBtnDisabled]}
            disabled={submitting}
            onPress={handleSubmit}
          >
            {submitting
              ? <ActivityIndicator size="small" color="#fff" />
              : <>
                  <MaterialIcons name="check-circle" size={16} color="#fff" />
                  <Text style={styles.navBtnPrimaryText}>Crear Auditoría</Text>
                </>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  container: {
    flex: 1,
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
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1a2a42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4a6fa8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f0f4ff',
    letterSpacing: 0.2,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#111827',
    borderWidth: 1.5,
    borderColor: '#1a2a42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#0055e5',
    borderColor: '#0055e5',
    shadowColor: '#0044cc',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  stepCircleDone: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3a5070',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3a5070',
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#1a2a42',
    marginHorizontal: 6,
    minWidth: 20,
  },

  // Card
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a2a42',
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(0,85,229,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,85,229,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f0f4ff',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#4a6fa8',
    lineHeight: 17,
    marginBottom: 16,
    marginLeft: 42,
  },

  // Location select button
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#0d1829',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  selectBtnActive: {
    borderColor: 'rgba(0,85,229,0.4)',
    backgroundColor: 'rgba(0,85,229,0.06)',
  },
  selectBtnText: {
    flex: 1,
    fontSize: 13,
    color: '#3a5070',
  },
  selectBtnTextActive: {
    color: '#4d8aff',
    fontWeight: '600',
  },

  // Asset loading / preview
  assetLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  previewText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },

  // Quick-set
  quickSetBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a42',
  },
  quickSetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3a5070',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  quickSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#0d1829',
  },
  quickSetText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Asset row
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111f35',
    gap: 10,
  },
  assetInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  assetIndex: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e2d45',
    width: 22,
    flexShrink: 0,
  },
  assetName: {
    flex: 1,
    fontSize: 12,
    color: '#dce8f5',
    fontWeight: '500',
    lineHeight: 17,
  },
  assetPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    maxWidth: 155,
    flexShrink: 0,
  },
  assetPickerText: {
    fontSize: 10.5,
    fontWeight: '700',
    flex: 1,
  },

  // Summary bar
  summaryBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1a2a42',
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  summaryCount: {
    fontSize: 13,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Confirm screen
  infoBlock: {
    backgroundColor: '#0d1829',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a2a42',
    overflow: 'hidden',
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111f35',
  },
  infoKey: {
    fontSize: 12,
    color: '#4a6fa8',
    fontWeight: '500',
  },
  infoVal: {
    fontSize: 12,
    color: '#dce8f5',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4a6fa8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  optional: {
    color: '#2a3d55',
    textTransform: 'none',
    fontWeight: '500',
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  breakdownCell: {
    flex: 1,
    minWidth: '28%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
  },
  breakdownCount: {
    fontSize: 20,
    fontWeight: '800',
  },
  breakdownLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  textarea: {
    backgroundColor: '#0d1829',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a2a42',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#dce8f5',
    fontSize: 13,
    minHeight: 100,
    lineHeight: 20,
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
  },

  // Bottom nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 28,
    backgroundColor: '#0b1120',
    borderTopWidth: 1,
    borderTopColor: '#1a2a42',
    gap: 10,
  },
  navBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  navBtnSecondaryText: {
    color: '#7a8fa6',
    fontSize: 13,
    fontWeight: '600',
  },
  navBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    backgroundColor: '#0055e5',
    borderRadius: 10,
    shadowColor: '#0044cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  navBtnDisabled: {
    backgroundColor: '#111827',
    shadowOpacity: 0,
    elevation: 0,
  },
  navBtnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Misc
  centered: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  loadingText: {
    color: '#4a6fa8',
    fontSize: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center',
  },
});

// ─── modal styles ─────────────────────────────────────────────────────────────

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#1a2a42',
    paddingBottom: 34,
    maxHeight: '75%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1a2a42',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f0f4ff',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 18,
    marginBottom: 8,
    backgroundColor: '#0d1829',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  searchInput: {
    flex: 1,
    color: '#dce8f5',
    fontSize: 13,
  },
  list: {
    maxHeight: 320,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111f35',
  },
  optionActive: {
    backgroundColor: 'rgba(0,85,229,0.07)',
  },
  optionText: {
    fontSize: 14,
    color: '#7a8fa6',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#4d8aff',
    fontWeight: '700',
  },
  emptyText: {
    color: '#3a5070',
    fontSize: 13,
    textAlign: 'center',
    padding: 24,
  },
  cancelBtn: {
    marginHorizontal: 18,
    marginTop: 10,
    paddingVertical: 13,
    backgroundColor: '#0d1829',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a2a42',
    alignItems: 'center',
  },
  cancelText: {
    color: '#7a8fa6',
    fontSize: 13,
    fontWeight: '600',
  },
});