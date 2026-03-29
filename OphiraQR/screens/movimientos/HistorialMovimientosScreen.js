import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";

import { api } from "../../services/api";

export default function HistorialMovimientosScreen() {
  const [movimientos, setMovimientos] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");

  const [usuarios, setUsuarios] = useState([]); // lista de usuarios para filtro
  const tipos = ["Ingreso", "Salida", "Ubicación", "Baja", "Actualización", "Depreciación"];



  const obtenerMovimientos = async (tipo = "", usuarioId = "") => {
    try {
      let endpoint = "/movimientos";
      if (tipo) endpoint = `/movimientos/tipo/${tipo}`;
      else if (usuarioId) endpoint = `/movimientos/usuario/${usuarioId}`;

      const response = await api.get(endpoint);
      const formateado = response.rows.map(item => ({
        id: item.id_movimiento.toString(),
        activo: item.nombre_activo,
        tipo: item.tipo_movimiento,
        usuario: item.nombre_usuario,
        fecha: new Date(item.fecha_movimiento).toLocaleDateString(),
        hora: new Date(item.fecha_movimiento).toLocaleTimeString(),
        origen: item.origen ?? "",
        destino: item.destino ?? "",
        descripcion: item.descripcion,
        ubicacion: item.origen && item.destino ? `${item.origen} → ${item.destino}` : "N/A"
      }));

      setMovimientos(formateado);
    } catch (error) {
      console.log("Error al obtener movimientos:", error);
      Alert.alert("Error", "No se pudieron cargar los movimientos.");
    }
  };

  const obtenerUsuarios = async () => {
    try {
      
      const response = await api.get("/usuarios");
      setUsuarios(response.rows);
    } catch (error) {
      console.log("Error al cargar usuarios:", error);
    }
  };


  useEffect(() => {
    obtenerMovimientos();
    obtenerUsuarios();
  }, []);

  const filtered = movimientos.filter((m) =>
    m.activo.toLowerCase().includes(search.toLowerCase())
  );

  function openDetalle(item) {
    setSelectedMovimiento(item);
    setModalVisible(true);
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openDetalle(item)}>
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

  const handleFiltroTipo = (tipo) => {
    setFiltroTipo(tipo);
    setFiltroUsuario("");
    obtenerMovimientos(tipo, "");
  };

  const handleFiltroUsuario = (id) => {
    setFiltroUsuario(id);
    setFiltroTipo("");
    obtenerMovimientos("", id);
  };

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

      {/* FILTRO TIPO */}
      <View style={styles.filtroContainer}>
        <Text style={styles.filtroLabel}>Filtrar por tipo:</Text>
        <View style={styles.filtroButtons}>
          {tipos.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.filtroBtn, filtroTipo === t && styles.filtroBtnActive]}
              onPress={() => handleFiltroTipo(t)}
            >
              <Text style={styles.filtroText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* FILTRO USUARIO */}
      <View style={styles.filtroContainer}>
        <Text style={styles.filtroLabel}>Filtrar por usuario:</Text>
        <View style={styles.filtroButtons}>
          {usuarios.map(u => (
            <TouchableOpacity
              key={u.id_usuario}
              style={[styles.filtroBtn, filtroUsuario == u.id_usuario && styles.filtroBtnActive]}
              onPress={() => handleFiltroUsuario(u.id_usuario)}
            >
              <Text style={styles.filtroText}>{u.nombre_usuario}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
                <Text style={styles.modalTitle}>{selectedMovimiento.activo}</Text>
                <Text style={styles.modalTipo}>{selectedMovimiento.tipo}</Text>
                <View style={styles.separator} />
                <Text style={styles.modalText}>📅 Fecha: {selectedMovimiento.fecha}</Text>
                <Text style={styles.modalText}>🕒 Hora: {selectedMovimiento.hora}</Text>
                <Text style={styles.modalText}>👤 Usuario: {selectedMovimiento.usuario}</Text>
                <Text style={styles.modalText}>📍 Ubicación: {selectedMovimiento.ubicacion}</Text>
                <Text style={styles.modalText}>🧾 Detalle: {selectedMovimiento.descripcion}</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
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

  // --- Contenedor principal ---
  container: {
    flex: 1,
    backgroundColor: "#101622",
    paddingTop: 40,
    paddingHorizontal: 16,
  },

  // --- Títulos ---
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },

  // --- Input de búsqueda ---
  search: {
    backgroundColor: "#0f1724",
    color: "white",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
  },

  // --- Card de movimiento ---
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
    fontSize: 12,
    fontWeight: "600",
  },

  descripcion: {
    color: "#bfc9d3",
    marginTop: 6,
    fontSize: 13,
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

  // --- Modal overlay ---
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  // --- Modal principal ---
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
    fontSize: 14,
    marginTop: 4,
    marginBottom: 10,
  },

  modalText: {
    color: "#c8d0da",
    fontSize: 13,
    marginBottom: 6,
  },

  separator: {
    height: 1,
    backgroundColor: "#26333f",
    marginVertical: 10,
  },

  closeBtn: {
    backgroundColor: "#0066ff",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },

  closeText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },

  // --- Filtros (opcional si agregas filtros luego) ---
  filtroContainer: {
    marginVertical: 8,
  },

  filtroLabel: {
    color: "white",
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "500",
  },

  filtroButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  filtroBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#1a1f2e",
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },

  filtroBtnActive: {
    backgroundColor: "#0066ff",
  },

  filtroText: {
    color: "white",
    fontSize: 13,
  },
});