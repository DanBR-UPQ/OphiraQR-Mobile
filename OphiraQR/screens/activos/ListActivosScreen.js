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
import ActivoDetailModal from '../../components/ActivoDetailModal';

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
    setSelectedActivo(item);
    setDetailVisible(true);
  }

  function handleDelete(id) {
    Alert.alert('Confirmar eliminación', '¿Eliminar este activo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setData(prev => prev.filter(p => p.id !== id)) },
    ]);
    setDetailVisible(false);
  }

  function openEdit(item) {
    setEditValues({ nombre: item.nombre, descripcion: item.descripcion });
    setDetailVisible(false);
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

      {/* modal de ubi y detalles (si alguien lo ocupa está en /components en src) */}
      <ActivoDetailModal
        visible={detailVisible}
        activo={selectedActivo}
        onClose={() => setDetailVisible(false)}
        onAssetUpdate={(updated) => {
          setData(prev => prev.map(p => p.id === updated.id ? updated : p));
          setSelectedActivo(updated);
        }}
      />

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
  modalGridLabel: {
    color: '#3a5070',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
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
});