import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";

const movimientosMock = [
  {
    id: "M001",
    activo: "Laptop Dell",
    tipo: "Asignación",
    usuario: "Juan Pérez",
    fecha: "12/03/2026",
    hora: "10:32",
    ubicacion: "Oficina 1",
    descripcion: "Asignación al área de desarrollo",
  },
  {
    id: "M002",
    activo: "Router",
    tipo: "Mantenimiento",
    usuario: "Soporte TI",
    fecha: "11/03/2026",
    hora: "14:10",
    ubicacion: "Rack principal",
    descripcion: "Revisión de red",
  },
  {
    id: "M003",
    activo: "Proyector Epson",
    tipo: "Traslado",
    usuario: "María López",
    fecha: "09/03/2026",
    hora: "09:05",
    ubicacion: "Sala A",
    descripcion: "Traslado a sala de reuniones",
  },
  {
    id: "M004",
    activo: "Impresora HP",
    tipo: "Baja",
    usuario: "Administrador",
    fecha: "05/03/2026",
    hora: "16:20",
    ubicacion: "Almacén",
    descripcion: "Equipo fuera de servicio",
  },
];

export default function HistorialMovimientosScreen() {
  const [search, setSearch] = useState("");
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = movimientosMock.filter((m) =>
    m.activo.toLowerCase().includes(search.toLowerCase())
  );

  function openDetalle(item) {
    setSelectedMovimiento(item);
    setModalVisible(true);
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openDetalle(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.activo}>{item.activo}</Text>
        <Text style={styles.tipo}>{item.tipo}</Text>
      </View>

      <Text style={styles.descripcion}>{item.descripcion}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.meta}>{item.fecha}</Text>
        <Text style={styles.meta}>{item.hora}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Movimientos</Text>

      <TextInput
        placeholder="Buscar activo..."
        placeholderTextColor="#888"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <StatusBar style="light" />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>

            {selectedMovimiento && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedMovimiento.activo}
                </Text>

                <Text style={styles.modalTipo}>
                  {selectedMovimiento.tipo}
                </Text>

                <View style={styles.separator} />

                <Text style={styles.modalText}>
                  📅 Fecha: {selectedMovimiento.fecha}
                </Text>

                <Text style={styles.modalText}>
                  🕒 Hora: {selectedMovimiento.hora}
                </Text>

                <Text style={styles.modalText}>
                  👤 Usuario: {selectedMovimiento.usuario}
                </Text>

                <Text style={styles.modalText}>
                  📍 Ubicación: {selectedMovimiento.ubicacion}
                </Text>

                <Text style={styles.modalText}>
                  🧾 Detalle: {selectedMovimiento.descripcion}
                </Text>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#101622",
    paddingTop: 40,
    paddingHorizontal: 16,
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },

  search: {
    backgroundColor: "#0f1724",
    color: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#1a1f2e",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  activo: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  tipo: {
    color: "#5ca9ff",
    fontWeight: "600",
    fontSize: 12,
  },

  descripcion: {
    color: "#bfc9d3",
    marginTop: 6,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  meta: {
    color: "#8f9bb3",
    fontSize: 12,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: "#0f1620",
    padding: 20,
    borderRadius: 14,
  },

  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },

  modalTipo: {
    color: "#5ca9ff",
    marginTop: 4,
    marginBottom: 10,
  },

  modalText: {
    color: "#c8d0da",
    marginBottom: 6,
  },

  separator: {
    height: 1,
    backgroundColor: "#26333f",
    marginVertical: 10,
  },

  closeBtn: {
    backgroundColor: "#0066ff",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },

  closeText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
});