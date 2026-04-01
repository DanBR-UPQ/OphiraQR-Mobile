import React, { useMemo, useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { api } from '../../services/api';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const initialData = [
  { id: 'A001', nombre: 'Laptop Dell', descripcion: 'Laptop para desarrollo', estado: 'Activo', categoria: 'Electrónica', ubicacion: 'Oficina 1' },
  { id: 'A002', nombre: 'Impresora HP', descripcion: 'Impresora láser', estado: 'Inactivo', categoria: 'Periféricos', ubicacion: 'Oficina 2' },
  { id: 'A003', nombre: 'Proyector Epson', descripcion: 'Proyector sala reuniones', estado: 'Activo', categoria: 'Audiovisual', ubicacion: 'Sala A' },
  { id: 'A004', nombre: 'Router', descripcion: 'Router principal', estado: 'Activo', categoria: 'Redes', ubicacion: 'Rack' },
];

const ActivoCard = ({ item, onPress, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, delay: index * 50, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 320, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const isActivo = item.estado === 'Activo';

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.75}>
        <View style={styles.cardTop}>
          <View style={[styles.cardIconWrap, { backgroundColor: isActivo ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)' }]}>
            <MaterialIcons name="inventory-2" size={17} color={isActivo ? '#10b981' : '#ef4444'} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.cardNombre} numberOfLines={1}>{item.nombre}</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardId}>#{item.id}</Text>
              <View style={styles.cardMetaDot} />
              <Text style={styles.cardCategoria}>{item.categoria}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isActivo ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)' }]}>
            <View style={[styles.statusDot, { backgroundColor: isActivo ? '#10b981' : '#ef4444' }]} />
            <Text style={[styles.statusText, { color: isActivo ? '#10b981' : '#ef4444' }]}>{item.estado}</Text>
          </View>
        </View>

        <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardFooterItem}>
            <MaterialIcons name="place" size={11} color="#4a6fa8" />
            <Text style={styles.cardFooterText}>{item.ubicacion || 'Sin ubicación'}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={14} color="#1e3a5f" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ListActivosScreen() {
  const [data, setData] = useState(initialData);
  const [searchText, setSearchText] = useState('');
  const [searchBy, setSearchBy] = useState('nombre');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const categorias = useMemo(() => ['Todos', ...Array.from(new Set(data.map(d => d.categoria)))], [data]);
  const [categoriaFilter, setCategoriaFilter] = useState('Todos');
  const [selectedActivo, setSelectedActivo] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [editValues, setEditValues] = useState({ nombre: '', descripcion: '' });

  // Change location modal state
  const [locationVisible, setLocationVisible] = useState(false);
  const [aulas, setAulas] = useState([]);
  const [aulasLoading, setAulasLoading] = useState(false);
  const [selectedAula, setSelectedAula] = useState(null);
  const [changingLocation, setChangingLocation] = useState(false);
  const [aulaSearch, setAulaSearch] = useState('');

  const modalAnim = useRef(new Animated.Value(0)).current;
  const locationModalAnim = useRef(new Animated.Value(0)).current;

  const openModal = (item) => {
    setSelectedActivo(item);
    setDetailVisible(true);
    Animated.spring(modalAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setDetailVisible(false));
  };

  const cargarDatos = async () => {
    try {
      const datos = await api.get('/assets/activosUser');
      const formateado = datos.rows.map(item => ({
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
      console.log('ERROR AHHHHHH: ' + e);
      Alert.alert('Error', 'No se pudieron cargar los activos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const crearAsset = async () => {
    try {
      await api.post('/assets/', editValues);
    } catch (e) {
      console.log('ERROR AHHHHHH: ' + e);
    }
  };

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
    closeModal();
    setTimeout(() => {
      setLocationVisible(true);
      cargarAulas();
      Animated.spring(locationModalAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }).start();
    }, 220);
  };

  const closeLocationModal = () => {
    Animated.timing(locationModalAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setLocationVisible(false);
      setSelectedAula(null);
      setAulaSearch('');
    });
  };

  const handleChangeLocation = async () => {
    if (!selectedAula) return;
    setChangingLocation(true);
    try {
      await api.post('/assets/cambiarAula', {
        id_activo: selectedActivo.id,
        id_aula_destino: selectedAula.id_aula,
      });
      // Update local state
      setData(prev => prev.map(p =>
        p.id === selectedActivo.id
          ? {
              ...p,
              ubicacion: selectedAula.id_aula,
              tipoAula: selectedAula.tipo,
              numeroAula: selectedAula.numero_aula,
            }
          : p
      ));
      setSelectedActivo(prev => prev ? {
        ...prev,
        ubicacion: selectedAula.id_aula,
        tipoAula: selectedAula.tipo,
        numeroAula: selectedAula.numero_aula,
      } : prev);
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
    return aulas.filter(a =>
      a.id_aula.toLowerCase().includes(q) ||
      a.tipo.toLowerCase().includes(q) ||
      a.numero_aula.toLowerCase().includes(q)
    );
  }, [aulas, aulaSearch]);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return data.filter(item => {
      if (estadoFilter !== 'Todos' && item.estado !== estadoFilter) return false;
      if (categoriaFilter !== 'Todos' && item.categoria !== categoriaFilter) return false;
      if (!q) return true;
      if (searchBy === 'nombre') return item.nombre.toLowerCase().includes(q);
      return String(item.id).toLowerCase().includes(q);
    });
  }, [data, searchText, searchBy, estadoFilter, categoriaFilter]);

  function openDetail(item) {
    openModal(item);
  }

  function handleDelete(id) {
    Alert.alert('Confirmar eliminación', '¿Eliminar este activo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setData(prev => prev.filter(p => p.id !== id)) },
    ]);
    closeModal();
  }

  function openEdit(item) {
    setEditValues({ nombre: item.nombre, descripcion: item.descripcion });
    closeModal();
    setEditVisible(true);
    setSelectedActivo(item);
  }

  function saveEdit() {
    setData(prev => prev.map(p => (p.id === selectedActivo.id ? { ...p, ...editValues } : p)));
    setEditVisible(false);
    setSelectedActivo(null);
  }

  function handleCreate() {
    const newId = `A${String(Math.floor(Math.random() * 900) + 100)}`;
    const nuevo = { id: newId, nombre: 'Nuevo activo', descripcion: '', estado: 'Activo', categoria: categorias[1] || 'General', ubicacion: '' };
    setData(prev => [nuevo, ...prev]);
  }

  const estados = ['Todos', 'Activo', 'Inactivo'];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white' }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.bgGlow} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>INVENTARIO</Text>
          <Text style={styles.headerTitle}>Activos</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{filtered.length}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={17} color="#3a5070" />
        <TextInput
          placeholder={`Buscar por ${searchBy === 'nombre' ? 'nombre' : 'ID'}...`}
          placeholderTextColor="#3a5070"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <MaterialIcons name="close" size={16} color="#3a5070" />
          </TouchableOpacity>
        )}
        <View style={styles.searchDivider} />
        <TouchableOpacity onPress={() => setSearchBy(searchBy === 'nombre' ? 'id' : 'nombre')} style={styles.searchToggle}>
          <Text style={styles.searchToggleText}>{searchBy === 'nombre' ? 'Nombre' : 'ID'}</Text>
          <MaterialIcons name="swap-horiz" size={13} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 6 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {estados.map(e => {
            const active = estadoFilter === e;
            return (
              <TouchableOpacity key={e} style={[styles.chip, active && styles.chipActive]} onPress={() => setEstadoFilter(e)}>
                {active && <View style={styles.chipDot} />}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{e}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {categorias.map(c => {
            const active = categoriaFilter === c;
            return (
              <TouchableOpacity key={c} style={[styles.chip, styles.chipCat, active && styles.chipActive]} onPress={() => setCategoriaFilter(c)}>
                {active && <View style={styles.chipDot} />}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        renderItem={({ item, index }) => <ActivoCard item={item} index={index} onPress={openDetail} />}
        keyExtractor={i => String(i.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialIcons name="inbox" size={36} color="#1e3a5f" />
            <Text style={styles.emptyText}>Sin activos</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal visible={detailVisible} animationType="none" transparent>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeModal}>
          <Animated.View
            style={[styles.modal, {
              transform: [
                { scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                { translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
              ],
              opacity: modalAnim,
            }]}
          >
            {selectedActivo && (() => {
              const accent = selectedActivo.estado === 'Activo'
                ? '#10b981'
                : selectedActivo.estado === 'Mantenimiento'
                  ? '#f59e0b'
                  : '#ef4444';

              const formatCurrency = (val) =>
                val ? `$${parseFloat(val).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';

              const formatDate = (iso) => {
                if (!iso) return '—';
                const d = new Date(iso);
                return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
              };

              const ubicacionLabel = [selectedActivo.tipoAula, selectedActivo.ubicacion]
                .filter(Boolean).join(' - ');

              return (
                <TouchableOpacity activeOpacity={1}>
                  {/* Header */}
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

                  {/* Description */}
                  {selectedActivo.descripcion ? (
                    <View style={styles.modalDescRow}>
                      <Text style={styles.modalDesc}>{selectedActivo.descripcion}</Text>
                    </View>
                  ) : null}

                  {/* Info grid */}
                  <View style={styles.modalGrid}>
                    <View style={styles.modalGridItem}>
                      <Text style={styles.modalGridLabel}>Categoría</Text>
                      <Text style={styles.modalGridValue}>{selectedActivo.categoria || '—'}</Text>
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
                      <Text style={styles.modalGridValue}>{selectedActivo.modelo || '—'}</Text>
                    </View>
                    <View style={styles.modalGridItem}>
                      <Text style={styles.modalGridLabel}>No. Serie</Text>
                      <Text style={styles.modalGridValue}>{selectedActivo.numeroSerie || '—'}</Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={styles.modalDivider} />

                  {/* Financial row */}
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

                  {/* Footer */}
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

      {/* Edit Modal */}
      <Modal visible={editVisible} animationType="none" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={[styles.modalHeader, { borderBottomColor: '#1a2a42' }]}>
              <View style={[styles.modalHeaderAccent, { backgroundColor: '#3b82f6' }]} />
              <View style={[styles.modalIconCircle, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                <MaterialIcons name="edit" size={20} color="#3b82f6" />
              </View>
              <Text style={[styles.modalNombre, { marginLeft: 12 }]}>Editar Activo</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalGridLabel}>Nombre</Text>
              <TextInput
                style={styles.editInput}
                value={editValues.nombre}
                onChangeText={t => setEditValues(v => ({ ...v, nombre: t }))}
                placeholder="Nombre"
                placeholderTextColor="#3a5070"
              />
              <Text style={[styles.modalGridLabel, { marginTop: 12 }]}>Descripción</Text>
              <TextInput
                style={[styles.editInput, { height: 80, textAlignVertical: 'top' }]}
                value={editValues.descripcion}
                onChangeText={t => setEditValues(v => ({ ...v, descripcion: t }))}
                placeholder="Descripción"
                placeholderTextColor="#3a5070"
                multiline
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: '#1d3461', flex: 1 }]} onPress={saveEdit}>
                <Text style={[styles.closeBtnText, { color: '#3b82f6' }]}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2a42', flex: 1 }]} onPress={() => setEditVisible(false)}>
                <Text style={[styles.closeBtnText, { color: '#5a7a9e' }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Location Modal */}
      <Modal visible={locationVisible} animationType="none" transparent>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeLocationModal}>
          <Animated.View
            style={[styles.modal, styles.locationModal, {
              transform: [
                { scale: locationModalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                { translateY: locationModalAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
              ],
              opacity: locationModalAnim,
            }]}
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
                  {selectedActivo && (
                    <Text style={styles.locationModalSubtitle} numberOfLines={1}>{selectedActivo.nombre}</Text>
                  )}
                </View>
              </View>

              {/* Search aulas */}
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
                      const isCurrent = selectedActivo?.ubicacion === aula.id_aula;
                      return (
                        <TouchableOpacity
                          key={aula.id_aula}
                          style={[styles.aulaRow, isSelected && styles.aulaRowSelected]}
                          onPress={() => setSelectedAula(aula)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.aulaRowIcon, { backgroundColor: isSelected ? 'rgba(59,130,246,0.15)' : '#0d1829' }]}>
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
                            <Text style={styles.aulaRowId}>{aula.tipo} {aula.numero_aula} · Piso {aula.id_piso}</Text>
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
                  style={[styles.closeBtn, { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2a42', flex: 1 }]}
                  onPress={closeLocationModal}
                >
                  <Text style={[styles.closeBtnText, { color: '#5a7a9e' }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.closeBtn,
                    { flex: 1, backgroundColor: selectedAula ? '#1d3461' : '#0d1829', borderWidth: 1, borderColor: selectedAula ? '#2563eb' : '#1a2a42' },
                  ]}
                  onPress={handleChangeLocation}
                  disabled={!selectedAula || changingLocation}
                >
                  {changingLocation ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <Text style={[styles.closeBtnText, { color: selectedAula ? '#3b82f6' : '#2a3a52' }]}>Confirmar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
    paddingTop: 54,
    paddingHorizontal: 16,
  },
  bgGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#0044cc',
    opacity: 0.045,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  headerSub: {
    fontSize: 10,
    color: '#4a6fa8',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f0f4ff',
    letterSpacing: 0.2,
  },
  headerBadge: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1a2a42',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBadgeText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 11,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a2a42',
    gap: 8,
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
  searchToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchToggleText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1a2a42',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipCat: {
    borderColor: '#1e2d45',
  },
  chipActive: {
    backgroundColor: '#1d3461',
    borderColor: '#2563eb',
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginRight: 5,
  },
  chipText: {
    color: '#5a7a9e',
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#dce8f5',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1a2a42',
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNombre: {
    color: '#f0f4ff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardId: {
    color: '#3a5070',
    fontSize: 11,
    fontWeight: '600',
  },
  cardMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#1e3a5f',
  },
  cardCategoria: {
    color: '#4a6fa8',
    fontSize: 11,
    fontWeight: '500',
  },
  cardDesc: {
    color: '#5a7a9e',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#111f35',
    paddingTop: 8,
  },
  cardFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardFooterText: {
    color: '#3a5070',
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    color: '#1e3a5f',
    fontSize: 14,
    fontWeight: '500',
  },
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
  locationModal: {
    // same base styles, can extend if needed
  },

  // Modal — shared new design
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
  modalBody: {
    padding: 18,
    gap: 14,
  },
  editInput: {
    backgroundColor: '#0d1829',
    borderWidth: 1,
    borderColor: '#1a2a42',
    borderRadius: 10,
    color: '#dce8f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginTop: 6,
  },

  // Change location button (inside Ubicación grid cell)
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

  // Location modal
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