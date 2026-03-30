import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { api } from "../../services/api";

const TypeBadge = ({ tipo }) => {
  const cfg = {
    ingreso:         { icon: "arrow-downward", color: "#10b981", bg: "rgba(16,185,129,0.18)" },
    salida:          { icon: "arrow-upward",   color: "#ef4444", bg: "rgba(239,68,68,0.18)"  },
    "ubicación":     { icon: "place",          color: "#3b82f6", bg: "rgba(59,130,246,0.18)" },
    baja:            { icon: "remove-circle",  color: "#f59e0b", bg: "rgba(245,158,11,0.18)" },
    "actualización": { icon: "autorenew",      color: "#a855f7", bg: "rgba(168,85,247,0.18)" },
    "depreciación":  { icon: "trending-down",  color: "#06b6d4", bg: "rgba(6,182,212,0.18)"  },
  };
  const c = cfg[tipo?.toLowerCase()] ?? { icon: "info", color: "#64748b", bg: "rgba(100,116,139,0.18)" };
  return (
    <View style={[styles.typeBadge, { backgroundColor: c.bg }]}>
      <MaterialIcons name={c.icon} size={11} color={c.color} />
      <Text style={[styles.typeBadgeText, { color: c.color }]}>{tipo}</Text>
    </View>
  );
};

const MovCard = ({ item, onPress, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, delay: index * 50, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 320, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const colorMap = {
    ingreso:         "#10b981",
    salida:          "#ef4444",
    "ubicación":     "#3b82f6",
    baja:            "#f59e0b",
    "actualización": "#a855f7",
    "depreciación":  "#06b6d4",
  };
  const accent = colorMap[item.tipo?.toLowerCase()] ?? "#64748b";

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: accent }]}
        onPress={() => onPress(item)}
        activeOpacity={0.75}
      >
        <View style={styles.cardTop}>
          <View style={[styles.cardIconWrap, { backgroundColor: accent + "28" }]}>
            <MaterialIcons name="inventory" size={17} color={accent} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.cardActivo} numberOfLines={1}>{item.activo}</Text>
            <View style={styles.cardMeta}>
              <MaterialIcons name="person-outline" size={11} color="#4a6fa8" />
              <Text style={styles.cardUsuario}>{item.usuario}</Text>
            </View>
          </View>
          <TypeBadge tipo={item.tipo} />
        </View>

        <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardFooterItem}>
            <MaterialIcons name="calendar-today" size={10} color="#4a6fa8" />
            <Text style={styles.cardFooterText}>{item.fecha}</Text>
          </View>
          <View style={styles.cardFooterDot} />
          <View style={styles.cardFooterItem}>
            <MaterialIcons name="schedule" size={10} color="#4a6fa8" />
            <Text style={styles.cardFooterText}>{item.hora}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <MaterialIcons name="chevron-right" size={14} color="#2a4a6a" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HistorialMovimientosScreen() {
  const [movimientos, setMovimientos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtroUsuario, setFiltroUsuario] = useState("");

  const modalAnim = useRef(new Animated.Value(0)).current;

  const openModal = (item) => {
    setSelectedMovimiento(item);
    setModalVisible(true);
    Animated.spring(modalAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      setModalVisible(false)
    );
  };

  const obtenerMovimientos = async (usuarioId = "") => {
    try {
      const endpoint = usuarioId ? `/movimientos/usuario/${usuarioId}` : "/movimientos";
      const response = await api.get(endpoint);
      const data = response?.rows || [];
      const formateado = data.map((item) => ({
        id: item.id_movimiento?.toString(),
        activo: item.nombre_activo || "Sin nombre",
        tipo: item.tipo_movimiento || "N/A",
        usuario: item.nombre_usuario || "N/A",
        fecha: item.fecha_movimiento ? new Date(item.fecha_movimiento).toLocaleDateString() : "N/A",
        hora: item.fecha_movimiento ? new Date(item.fecha_movimiento).toLocaleTimeString() : "N/A",
        descripcion: item.descripcion || "Sin descripción",
      }));
      setMovimientos(formateado);
    } catch (error) {
      console.log("ERROR:", error?.response?.data || error);
      setMovimientos([]);
      Alert.alert("Error", "No se pudieron cargar los movimientos");
    }
  };

  const obtenerUsuarios = async () => {
    try {
      const response = await api.get("/usuarios");
      setUsuarios(response || []);
    } catch (error) {
      console.log("Error usuarios:", error);
      setUsuarios([]);
    }
  };

  useEffect(() => {
    obtenerMovimientos();
    obtenerUsuarios();
  }, []);

  const filtered = movimientos.filter((m) =>
    m.activo.toLowerCase().includes(search.toLowerCase())
  );

  const handleFiltroUsuario = (id) => {
    const next = filtroUsuario == id ? "" : id;
    setFiltroUsuario(next);
    obtenerMovimientos(next);
  };

  const modalAccent = {
    ingreso: "#10b981", salida: "#ef4444", "ubicación": "#3b82f6",
    baja: "#f59e0b", "actualización": "#a855f7", "depreciación": "#06b6d4",
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.bgGlow} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>GESTIÓN DE ACTIVOS</Text>
          <Text style={styles.headerTitle}>Historial</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{filtered.length}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={17} color="#3a5070" />
        <TextInput
          placeholder="Buscar activo..."
          placeholderTextColor="#3a5070"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <MaterialIcons name="close" size={16} color="#3a5070" />
          </TouchableOpacity>
        )}
      </View>

      {usuarios.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {usuarios.map((u) => {
              const active = filtroUsuario == u.id_usuario;
              return (
                <TouchableOpacity
                  key={u.id_usuario}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => handleFiltroUsuario(u.id_usuario)}
                >
                  {active && <View style={styles.chipDot} />}
                  <MaterialIcons name="person" size={11} color={active ? "#dce8f5" :"#4a6fa8"} style={{ marginRight: 4 }} />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{u.nombre_usuario}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filtered || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MovCard item={item} index={index} onPress={openModal} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialIcons name="inbox" size={36} color="#1e3a5f" />
            <Text style={styles.emptyText}>Sin movimientos</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="none" transparent>
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
            {selectedMovimiento && (() => {
              const accent = modalAccent[selectedMovimiento.tipo?.toLowerCase()] ?? "#64748b";
              return (
                <>
                  <View style={[styles.modalBand, { backgroundColor: accent + "22" }]}>
                    <View style={[styles.modalIconCircle, { backgroundColor: accent + "30" }]}>
                      <MaterialIcons name="inventory" size={22} color={accent} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.modalActivo}>{selectedMovimiento.activo}</Text>
                      <TypeBadge tipo={selectedMovimiento.tipo} />
                    </View>
                  </View>

                  <View style={styles.modalBody}>
                    {[
                      { icon: "person-outline", label: "Usuario", value: selectedMovimiento.usuario },
                      { icon: "calendar-today", label: "Fecha", value: selectedMovimiento.fecha },
                      { icon: "schedule", label: "Hora", value: selectedMovimiento.hora },
                      { icon: "notes", label: "Descripción", value: selectedMovimiento.descripcion },
                    ].map((row, i) => (
                      <View key={i} style={styles.modalRow}>
                        <View style={styles.modalRowIcon}>
                          <MaterialIcons name={row.icon} size={14} color="#4a6fa8" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modalRowLabel}>{row.label}</Text>
                          <Text style={styles.modalRowValue}>{row.value}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity style={[styles.closeBtn, { backgroundColor: accent }]} onPress={closeModal}>
                    <Text style={styles.closeBtnText}>Cerrar</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1120",
    paddingTop: 54,
    paddingHorizontal: 16,
  },
  bgGlow: {
    position: "absolute",
    top: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#0044cc",
    opacity: 0.045,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  headerSub: {
    fontSize: 10,
    color: "#4a6fa8",
    letterSpacing: 1.2,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f0f4ff",
    letterSpacing: 0.2,
  },
  headerBadge: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1a2a42",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBadgeText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "700",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    padding: 11,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1a2a42",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#dce8f5",
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: "row",
    paddingVertical: 2,
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1a2a42",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: "#1d3461",
    borderColor: "#2563eb",
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#3b82f6",
    marginRight: 5,
  },
  chipText: {
    color: "#5a7a9e",
    fontSize: 12,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#dce8f5",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1a2a42",
    borderLeftWidth: 4,
    overflow: "hidden",
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardActivo: {
    color: "#f0f4ff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardUsuario: {
    color: "#4a6fa8",
    fontSize: 11,
    fontWeight: "500",
  },
  cardDesc: {
    color: "#5a7a9e",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#111f35",
    paddingTop: 8,
    gap: 5,
  },
  cardFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  cardFooterText: {
    color: "#3a5070",
    fontSize: 11,
  },
  cardFooterDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#1e3a5f",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    color: "#1e3a5f",
    fontSize: 14,
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,10,22,0.75)",
    justifyContent: "flex-end",
    padding: 16,
    paddingBottom: 32,
  },
  modal: {
    backgroundColor: "#111827",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1a2a42",
  },
  modalBand: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2a42",
  },
  modalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalActivo: {
    color: "#f0f4ff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
  modalBody: {
    padding: 18,
    gap: 14,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  modalRowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#0d1829",
    borderWidth: 1,
    borderColor: "#1a2a42",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  modalRowLabel: {
    color: "#3a5070",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  modalRowValue: {
    color: "#dce8f5",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  closeBtn: {
    margin: 16,
    marginTop: 4,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
  },
});