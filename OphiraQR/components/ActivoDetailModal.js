import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '../services/api';

/**
 * ActivoDetailModal
 *
 * Props:
 *  - visible       {boolean}          Si está abierto o no
 *  - activo        {object|null}      El activo a mostrar
 *  - onClose       {() => void}       Se llama cuando se cierra elmodal
 *  - onAssetUpdate {(updated) => void} Cuando se cambia la ubicación
 */
export default function ActivoDetailModal({ visible, activo, onClose, onAssetUpdate }) {
  const modalAnim = useRef(new Animated.Value(0)).current;
  const locationModalAnim = useRef(new Animated.Value(0)).current;

  const [locationVisible, setLocationVisible] = useState(false);
  const [aulas, setAulas] = useState([]);
  const [aulasLoading, setAulasLoading] = useState(false);
  const [selectedAula, setSelectedAula] = useState(null);
  const [changingLocation, setChangingLocation] = useState(false);
  const [aulaSearch, setAulaSearch] = useState('');

  // Animate detail modal in/out when `visible` changes
  useEffect(() => {
    if (visible) {
      Animated.spring(modalAnim, {
        toValue: 1,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const closeDetailModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  // ─── Location modal helpers ───────────────────────────────────────────────

  const cargarAulas = async () => {
    setAulasLoading(true);
    try {
      const datos = await api.get('/ubicacion/aulas/');
      setAulas(datos);
    } catch (e) {
      console.log('Error cargando aulas: ' + e);
      Alert.alert('Error', 'No se pudieron cargar las aulas');
    } finally {
      setAulasLoading(false);
    }
  };

    const openLocationModal = () => {
        setSelectedAula(null);
        setAulaSearch('');

        closeDetailModal();

        setTimeout(() => {
            setLocationVisible(true);
            cargarAulas();

            Animated.spring(locationModalAnim, {
            toValue: 1,
            tension: 70,
            friction: 10,
            useNativeDriver: true,
            }).start();
        }, 220);
    };

  const closeLocationModal = () => {
    Animated.timing(locationModalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setLocationVisible(false);
      setSelectedAula(null);
      setAulaSearch('');
    });
  };

  const handleChangeLocation = async () => {
    if (!selectedAula || !activo) return;
    setChangingLocation(true);
    try {
      await api.post('/assets/cambiarAula', {
        id_activo: activo.id,
        id_aula_destino: selectedAula.id_aula,
      });

      const updated = {
        ...activo,
        ubicacion: selectedAula.id_aula,
        tipoAula: selectedAula.tipo,
        numeroAula: selectedAula.numero_aula,
      };

      onAssetUpdate?.(updated);
      closeLocationModal();
      Alert.alert('Éxito', `Activo movido a ${selectedAula.tipo} ${selectedAula.numero_aula}`);
    } catch (e) {
      console.log('Error cambiando aula: ' + e);
      Alert.alert('Error', 'No se pudo cambiar la ubicación');
    } finally {
      setChangingLocation(false);
    }
  };

  const filteredAulas = useMemo(() => {
    const q = aulaSearch.trim().toLowerCase();
    if (!q) return aulas;
    return aulas.filter(
      (a) =>
        a.id_aula.toLowerCase().includes(q) ||
        a.tipo.toLowerCase().includes(q) ||
        a.numero_aula.toLowerCase().includes(q)
    );
  }, [aulas, aulaSearch]);

  // ─── Render helpers ───────────────────────────────────────────────────────

  const formatCurrency = (val) =>
    val
      ? `$${parseFloat(val).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      : '—';

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ─── Main render ─────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Detail Modal ── */}
      <Modal visible={visible} animationType="none" transparent>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeDetailModal}>
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
            {activo &&
              (() => {
                const accent =
                  activo.estado === 'Activo'
                    ? '#10b981'
                    : activo.estado === 'Mantenimiento'
                    ? '#f59e0b'
                    : '#ef4444';

                const ubicacionLabel = [activo.tipoAula, activo.ubicacion]
                  .filter(Boolean)
                  .join(' - ');

                return (
                  <TouchableOpacity activeOpacity={1}>
                    {/* Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: accent + '33' }]}>
                      <View style={[styles.modalHeaderAccent, { backgroundColor: accent }]} />
                      <View style={[styles.modalIconCircle, { backgroundColor: accent + '20' }]}>
                        <MaterialIcons name="inventory-2" size={20} color={accent} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.modalNombre} numberOfLines={2}>
                          {activo.nombre}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                          <View
                            style={[
                              styles.modalStatusPill,
                              { backgroundColor: accent + '20', borderColor: accent + '40' },
                            ]}
                          >
                            <View style={[styles.modalStatusDot, { backgroundColor: accent }]} />
                            <Text style={[styles.modalStatusText, { color: accent }]}>{activo.estado}</Text>
                          </View>
                          <Text style={styles.modalIdChip}>#{activo.id}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Description */}
                    {activo.descripcion ? (
                      <View style={styles.modalDescRow}>
                        <Text style={styles.modalDesc}>{activo.descripcion}</Text>
                      </View>
                    ) : null}

                    {/* Info grid */}
                    <View style={styles.modalGrid}>
                      <View style={styles.modalGridItem}>
                        <Text style={styles.modalGridLabel}>Categoría</Text>
                        <Text style={styles.modalGridValue}>{activo.categoria || '—'}</Text>
                      </View>
                      <View style={styles.modalGridItem}>
                        <Text style={styles.modalGridLabel}>Ubicación</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={[styles.modalGridValue, { flex: 1 }]}>{ubicacionLabel || '—'}</Text>
                          <TouchableOpacity
                            onPress={openLocationModal}
                            style={styles.changeLocationBtn}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <MaterialIcons name="edit-location-alt" size={13} color="#3b82f6" />
                            <Text style={styles.changeLocationText}>Cambiar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.modalGridItem}>
                        <Text style={styles.modalGridLabel}>Modelo</Text>
                        <Text style={styles.modalGridValue}>{activo.modelo || '—'}</Text>
                      </View>
                      <View style={styles.modalGridItem}>
                        <Text style={styles.modalGridLabel}>No. Serie</Text>
                        <Text style={styles.modalGridValue}>{activo.numeroSerie || '—'}</Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.modalDivider} />

                    {/* Financial row */}
                    <View style={styles.modalFinancialRow}>
                      <View style={styles.modalFinancialItem}>
                        <Text style={styles.modalGridLabel}>Precio Compra</Text>
                        <Text style={[styles.modalFinancialValue, { color: '#f0f4ff' }]}>
                          {formatCurrency(activo.precioCompra)}
                        </Text>
                      </View>
                      <View style={styles.modalFinancialDivider} />
                      <View style={styles.modalFinancialItem}>
                        <Text style={styles.modalGridLabel}>Valor Actual</Text>
                        <Text style={[styles.modalFinancialValue, { color: accent }]}>
                          {formatCurrency(activo.valorActual)}
                        </Text>
                      </View>
                      <View style={styles.modalFinancialDivider} />
                      <View style={styles.modalFinancialItem}>
                        <Text style={styles.modalGridLabel}>Vida Útil</Text>
                        <Text style={[styles.modalFinancialValue, { color: '#f0f4ff' }]}>
                          {activo.vidaUtilAnios ? `${activo.vidaUtilAnios} años` : '—'}
                        </Text>
                      </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.modalFooter}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalFooterLabel}>Comprado</Text>
                        <Text style={styles.modalFooterValue}>{formatDate(activo.fecha)}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.closeBtn, { backgroundColor: accent }]}
                        onPress={closeDetailModal}
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

      {/* ── Change Location Modal ── */}
      <Modal visible={locationVisible} animationType="none" transparent>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeLocationModal}>
          <Animated.View
            style={[
              styles.modal,
              {
                transform: [
                  {
                    scale: locationModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                  {
                    translateY: locationModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
                opacity: locationModalAnim,
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Header */}
              <View style={[styles.modalHeader, { borderBottomColor: '#1a2a42' }]}>
                <View style={[styles.modalHeaderAccent, { backgroundColor: '#3b82f6' }]} />
                <View style={[styles.modalIconCircle, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                  <MaterialIcons name="edit-location-alt" size={20} color="#3b82f6" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.modalNombre}>Cambiar Ubicación</Text>
                  {activo && (
                    <Text style={styles.locationModalSubtitle} numberOfLines={1}>
                      {activo.nombre}
                    </Text>
                  )}
                </View>
              </View>

              {/* Search */}
              <View style={styles.locationSearchBox}>
                <MaterialIcons name="search" size={15} color="#3a5070" />
                <TextInput
                  placeholder="Buscar aula..."
                  placeholderTextColor="#3a5070"
                  value={aulaSearch}
                  onChangeText={setAulaSearch}
                  style={styles.locationSearchInput}
                />
                {aulaSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setAulaSearch('')}>
                    <MaterialIcons name="close" size={14} color="#3a5070" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Aulas list */}
              <View style={styles.aulaListContainer}>
                {aulasLoading ? (
                  <View style={styles.aulasLoadingWrap}>
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text style={styles.aulasLoadingText}>Cargando aulas...</Text>
                  </View>
                ) : filteredAulas.length === 0 ? (
                  <View style={styles.aulasLoadingWrap}>
                    <MaterialIcons name="location-off" size={28} color="#1e3a5f" />
                    <Text style={styles.aulasLoadingText}>Sin resultados</Text>
                  </View>
                ) : (
                  <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 240 }}>
                    {filteredAulas.map((aula) => {
                      const isSelected = selectedAula?.id_aula === aula.id_aula;
                      const isCurrent = activo?.ubicacion === aula.id_aula;
                      return (
                        <TouchableOpacity
                          key={aula.id_aula}
                          style={[styles.aulaRow, isSelected && styles.aulaRowSelected]}
                          onPress={() => setSelectedAula(aula)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.aulaRowIcon,
                              { backgroundColor: isSelected ? 'rgba(59,130,246,0.15)' : '#0d1829' },
                            ]}
                          >
                            <MaterialIcons
                              name="meeting-room"
                              size={14}
                              color={isSelected ? '#3b82f6' : '#3a5070'}
                            />
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={[styles.aulaRowNombre, isSelected && { color: '#dce8f5' }]}>
                                {aula.id_aula}
                              </Text>
                              {isCurrent && (
                                <View style={styles.currentBadge}>
                                  <Text style={styles.currentBadgeText}>Actual</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.aulaRowId}>
                              {aula.tipo} {aula.numero_aula} · Piso {aula.id_piso}
                            </Text>
                          </View>
                          {isSelected && (
                            <MaterialIcons name="check-circle" size={16} color="#3b82f6" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Footer */}
              <View style={[styles.modalFooter, { paddingTop: 12 }]}>
                <TouchableOpacity
                  style={[
                    styles.closeBtn,
                    { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2a42', flex: 1 },
                  ]}
                  onPress={closeLocationModal}
                >
                  <Text style={[styles.closeBtnText, { color: '#5a7a9e' }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.closeBtn,
                    {
                      flex: 1,
                      backgroundColor: selectedAula ? '#1d3461' : '#0d1829',
                      borderWidth: 1,
                      borderColor: selectedAula ? '#2563eb' : '#1a2a42',
                    },
                  ]}
                  onPress={handleChangeLocation}
                  disabled={!selectedAula || changingLocation}
                >
                  {changingLocation ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <Text style={[styles.closeBtnText, { color: selectedAula ? '#3b82f6' : '#2a3a52' }]}>
                      Confirmar
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  changeLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    marginLeft: 4,
  },
  changeLocationText: {
    color: '#3b82f6',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  locationModalSubtitle: {
    color: '#4a6fa8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  locationSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1829',
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a2a42',
    gap: 7,
  },
  locationSearchInput: {
    flex: 1,
    color: '#dce8f5',
    fontSize: 13,
  },
  aulaListContainer: {
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a2a42',
    overflow: 'hidden',
    backgroundColor: '#0d1829',
    minHeight: 80,
  },
  aulasLoadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  aulasLoadingText: {
    color: '#3a5070',
    fontSize: 12,
    fontWeight: '500',
  },
  aulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  aulaRowSelected: {
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  aulaRowIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aulaRowNombre: {
    color: '#5a7a9e',
    fontSize: 12,
    fontWeight: '600',
  },
  aulaRowId: {
    color: '#3a5070',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  currentBadge: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  currentBadgeText: {
    color: '#10b981',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});