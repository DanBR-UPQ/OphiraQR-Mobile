import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
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
} from 'react-native';

const initialData = [
  { id: 'A001', nombre: 'Laptop Dell', descripcion: 'Laptop para desarrollo', estado: 'Activo', categoria: 'Electrónica', ubicacion: 'Oficina 1' },
  { id: 'A002', nombre: 'Impresora HP', descripcion: 'Impresora láser', estado: 'Inactivo', categoria: 'Periféricos', ubicacion: 'Oficina 2' },
  { id: 'A003', nombre: 'Proyector Epson', descripcion: 'Proyector sala reuniones', estado: 'Activo', categoria: 'Audiovisual', ubicacion: 'Sala A' },
  { id: 'A004', nombre: 'Router', descripcion: 'Router principal', estado: 'Activo', categoria: 'Redes', ubicacion: 'Rack' },
  // ... más datos mock si se necesita
];

export default function ListActivosScreen() {
  const [data, setData] = useState(initialData);
  const [searchText, setSearchText] = useState('');
  const [searchBy, setSearchBy] = useState('nombre'); // 'nombre' o 'id'
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const categorias = useMemo(() => ['Todos', ...Array.from(new Set(initialData.map(d => d.categoria)))], []);
  const [categoriaFilter, setCategoriaFilter] = useState('Todos');

  const [selectedActivo, setSelectedActivo] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editValues, setEditValues] = useState({ nombre: '', descripcion: '' });

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return data.filter(item => {
      if (estadoFilter !== 'Todos' && item.estado !== estadoFilter) return false;
      if (categoriaFilter !== 'Todos' && item.categoria !== categoriaFilter) return false;
      if (!q) return true;
      if (searchBy === 'nombre') return item.nombre.toLowerCase().includes(q);
      return item.id.toLowerCase().includes(q);
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
    // Simple creación mock: generar nuevo id y abrir modal de edición
    const newId = `A${String(Math.floor(Math.random() * 900) + 100)}`;
    const nuevo = { id: newId, nombre: 'Nuevo activo', descripcion: '', estado: 'Activo', categoria: categorias[1] || 'General', ubicacion: '' };
    setData(prev => [nuevo, ...prev]);
  }

  const estados = ['Todos', 'Activo', 'Inactivo'];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => openDetail(item)}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.nombre}</Text>
        <Text style={styles.itemSmall}>{item.id} • {item.categoria}</Text>
        <Text style={styles.itemDescription}>{item.descripcion}</Text>
        <Text style={[styles.itemStatus, item.estado === 'Activo' ? styles.statusActive : styles.statusInactive]}>{item.estado}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.tituloActivo}>Lista de Activos</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Crear Activo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder={`Buscar por ${searchBy === 'nombre' ? 'nombre' : 'ID'}`}
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        <View style={styles.searchByRow}>
          <TouchableOpacity onPress={() => setSearchBy('nombre')} style={[styles.smallToggle, searchBy === 'nombre' && styles.smallToggleActive]}>
            <Text style={styles.smallToggleText}>Nombre</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSearchBy('id')} style={[styles.smallToggle, searchBy === 'id' && styles.smallToggleActive]}>
            <Text style={styles.smallToggleText}>ID</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {estados.map(e => (
            <TouchableOpacity key={e} onPress={() => setEstadoFilter(e)} style={[styles.filterButton, estadoFilter === e && styles.filterButtonActive]}>
              <Text style={styles.filterText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 8 }}>
          {categorias.map(c => (
            <TouchableOpacity key={c} onPress={() => setCategoriaFilter(c)} style={[styles.filterButton, categoriaFilter === c && styles.filterButtonActive]}>
              <Text style={styles.filterText}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList data={filtered} renderItem={renderItem} keyExtractor={(i) => i.id} style={styles.list} />

      <StatusBar style="auto" />

      <Modal visible={detailVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedActivo && (
              <>
                <Text style={styles.modalTitle}>{selectedActivo.nombre}</Text>
                <Text style={styles.modalSub}>{selectedActivo.id} • {selectedActivo.categoria}</Text>
                <Text style={styles.modalText}>{selectedActivo.descripcion}</Text>
                <Text style={styles.modalText}>Estado: {selectedActivo.estado}</Text>
                <Text style={styles.modalText}>Ubicación: {selectedActivo.ubicacion}</Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalBtnPrimary} onPress={() => openEdit(selectedActivo)}>
                    <Text style={styles.modalBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalBtnDanger} onPress={() => handleDelete(selectedActivo.id)}>
                    <Text style={styles.modalBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.modalClose} onPress={() => setDetailVisible(false)}>
                  <Text style={styles.modalCloseText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={editVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Activo</Text>
            <TextInput style={styles.input} value={editValues.nombre} onChangeText={(t) => setEditValues(v => ({ ...v, nombre: t }))} placeholder="Nombre" placeholderTextColor="#999" />
            <TextInput style={[styles.input, { height: 80 }]} value={editValues.descripcion} onChangeText={(t) => setEditValues(v => ({ ...v, descripcion: t }))} placeholder="Descripción" placeholderTextColor="#999" multiline />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={saveEdit}>
                <Text style={styles.modalBtnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setEditVisible(false)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
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
    backgroundColor: '#101622',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tituloActivo: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  searchRow: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#0f1724',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchByRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  smallToggle: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#1b2330',
    marginRight: 8,
  },
  smallToggleActive: {
    backgroundColor: '#26333f',
  },
  smallToggleText: { color: '#ddd' },
  filtersRow: {
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#0f1724',
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: { backgroundColor: '#26333f' },
  filterText: { color: '#ddd' },
  list: { flex: 1 },
  itemContainer: { backgroundColor: '#1a1f2e', borderRadius: 10, padding: 12, marginBottom: 10 },
  itemContent: { flexDirection: 'column' },
  itemTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  itemSmall: { color: '#9aa4b2', fontSize: 12, marginTop: 4 },
  itemDescription: { color: '#bfc9d3', marginTop: 6 },
  itemStatus: { marginTop: 8, fontWeight: '700' },
  statusActive: { color: '#48db6a' },
  statusInactive: { color: '#ff6b6b' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#0f1620', borderRadius: 12, padding: 16 },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  modalSub: { color: '#9aa4b2', marginBottom: 8 },
  modalText: { color: '#c8d0da', marginBottom: 6 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  modalBtnPrimary: { backgroundColor: '#0066ff', padding: 10, borderRadius: 8, flex: 1, marginRight: 6 },
  modalBtnDanger: { backgroundColor: '#ff3b30', padding: 10, borderRadius: 8, flex: 1, marginLeft: 6 },
  modalBtnCancel: { backgroundColor: '#444b55', padding: 10, borderRadius: 8, flex: 1, marginLeft: 6 },
  modalBtnText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  modalClose: { marginTop: 8, alignItems: 'center' },
  modalCloseText: { color: '#9aa4b2' },
  input: { backgroundColor: '#0f1724', color: 'white', padding: 10, borderRadius: 8, marginTop: 8 },
});
