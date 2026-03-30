import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '../../services/api'

export default function ScanQrScreen({navigation}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(true);
  const [codigoDetectado, setCodigoDetectado] = useState('');
  const [codigoManual, setCodigoManual] = useState('');
  const [assetData, setAssetData] = useState({});
  const [recentScans, setRecentScans] = useState([]);
  const [selectedActivo, setSelectedActivo] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const isProcessing = useRef(false);
  const modalAnim = useRef(new Animated.Value(0)).current;

  const openModal = (item) => {
    setSelectedActivo(item);
    setDetailVisible(true);
    Animated.spring(modalAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setDetailVisible(false));
  };

  const formatItem = (item) => ({
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
  });

  const cargarRecientes = async () => {
    try {
      const datos = await api.get('/assets/activosUser');
      const formateado = datos.rows.map(formatItem);
      // Sort by registro date and take the 3 most recent
      const recientes = [...formateado]
        .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
        .slice(0, 3);
      setRecentScans(recientes);
    } catch (e) {
      console.log('ERROR cargando recientes:', e);
    }
  };

  useEffect(() => { cargarRecientes(); }, []);

  const fetchAsset = async (id) => {
    try {
      const idBuscado = String(id).trim();
      if (!idBuscado) {
        setAssetData({});
        return;
      }
      const response = await api.get(`assets/activo/${idBuscado}`);
      if (Array.isArray(response) && response.length > 0) {
        setAssetData(response[0]);
      } else if (response && typeof response === 'object') {
        setAssetData(response);
      } else {
        setAssetData({});
      }
    } catch (error) {
      console.error('No se pudo obtener el activo:', error);
      setAssetData({});
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    if (isProcessing.current || !data) return;
    isProcessing.current = true;
    setCodigoDetectado(data);
    setCameraActive(false);
    fetchAsset(data);
  };

  const handleManualSearch = () => {
    if (!codigoManual.trim()) return;
    setCodigoDetectado(codigoManual);
    setCameraActive(false);
    fetchAsset(codigoManual);
  };

  const handleToggleCamera = () => {
    const next = !cameraActive;
    setCameraActive(next);
    if (next) {
      isProcessing.current = false;
      setCodigoDetectado('');
      setAssetData({});
    }
  };

  const estadoColor = {
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
  }[assetData?.color] ?? '#4a6fa8';

  const renderCameraArea = () => {
    if (!permission) {
      return (
        <View style={styles.cameraPlaceholder}>
          <MaterialIcons name="hourglass-empty" size={40} color="#4a6fa8" />
          <Text style={styles.cameraPlaceholderText}>Cargando permisos...</Text>
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <View style={styles.cameraPlaceholder}>
          <MaterialIcons name="no-photography" size={40} color="#ef4444" />
          <Text style={styles.cameraPlaceholderText}>Sin acceso a la cámara</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Conceder permiso</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!cameraActive) {
      return (
        <View style={styles.cameraPlaceholder}>
          <MaterialIcons name="videocam-off" size={40} color="#4a6fa8" />
          <Text style={styles.cameraPlaceholderText}>Cámara desactivada</Text>
        </View>
      );
    }
    return (
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
    );
  };

  // Shared modal renderer — same design as HomeScreen / ListActivosScreen
  const renderModal = () => (
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

            const ubicacionLabel = [selectedActivo.tipoAula, selectedActivo.numeroAula, selectedActivo.ubicacion]
              .filter(Boolean).join(' · ');

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
                    <Text style={styles.modalGridValue}>{ubicacionLabel || '—'}</Text>
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
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.bgAccent} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Escáner</Text>
          <Text style={styles.headerTitle}>Asset Scanner</Text>
        </View>
        <View style={styles.cameraStatus}>
          <View style={styles.statusPulse} />
          <View style={[styles.statusDot, { backgroundColor: cameraActive ? '#10b981' : '#4a6fa8' }]} />
          <Text style={[styles.statusText, { color: cameraActive ? '#10b981' : '#4a6fa8' }]}>
            {cameraActive ? 'Cámara Activa' : 'Cámara Inactiva'}
          </Text>
        </View>
      </View>

      {/* Scanner frame */}
      <View style={styles.scannerCard}>
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          {renderCameraArea()}
          <TouchableOpacity style={styles.cameraToggleBtn} onPress={handleToggleCamera}>
            <MaterialIcons name={cameraActive ? 'videocam' : 'videocam-off'} size={18} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.scanStatusPill}>
            <MaterialIcons name="qr-code-scanner" size={13} color="#ffffff" />
            <Text style={styles.scanStatusText}>
              {codigoDetectado ? `Código: ${codigoDetectado}` : 'Alinea el código QR dentro del marco'}
            </Text>
          </View>
        </View>
        <View style={styles.scannerFooter}>
          <MaterialIcons name="info-outline" size={13} color="#3a5070" />
          <Text style={styles.instructions}>Alinea el código QR dentro del marco</Text>
        </View>
      </View>

      {/* Manual Input */}
      <View style={styles.manualCard}>
        <View style={styles.manualHeader}>
          <MaterialIcons name="keyboard" size={15} color="#4a6fa8" />
          <Text style={styles.manualTitle}>Entrada Manual</Text>
        </View>
        <Text style={styles.manualSubtitle}>¿La cámara no funciona? Inserta el ID del activo</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <MaterialIcons name="tag" size={15} color="#3a5070" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="ID del activo"
              placeholderTextColor="#3a5070"
              value={codigoManual}
              onChangeText={setCodigoManual}
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={handleManualSearch}>
            <Text style={styles.searchBtnText}>Buscar</Text>
            <MaterialIcons name="arrow-forward" size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scanned asset result */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>Último Escaneo</Text>
          <View style={styles.nowBadge}>
            <View style={styles.nowDot} />
            <Text style={styles.nowBadgeText}>AHORA</Text>
          </View>
        </View>

        <View style={styles.assetCard}>
          <View style={styles.assetTitleRow}>
            <View style={styles.assetIconWrap}>
              <MaterialIcons name="laptop" size={22} color="#4d8aff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.assetName}>{assetData?.nombre || 'Sin activo seleccionado'}</Text>
              <View style={styles.codeTag}>
                <Text style={styles.codeTagText}>{assetData?.id_activo || 'N/A'}</Text>
              </View>
            </View>
            <View style={[styles.activeStatusBadge, { borderColor: `${estadoColor}33`, backgroundColor: `${estadoColor}1a` }]}>
              <View style={[styles.activeStatusDot, { backgroundColor: estadoColor }]} />
              <Text style={[styles.activeStatusText, { color: estadoColor }]}>{assetData?.estado || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Categoría</Text>
              <Text style={styles.detailValue}>{assetData?.categoria || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Encargado</Text>
              <View style={styles.assignedRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitials}>{assetData?.encargado?.charAt(0) || '?'}</Text>
                </View>
                <Text style={styles.detailValue}>{assetData?.encargado || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Ubicación</Text>
              <Text style={styles.detailValue}>{assetData?.ubicacion || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Último escaneo</Text>
              <Text style={styles.detailValue}>Hoy, 10:22 AM</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Ver Detalles</Text>
              <MaterialIcons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary}>
              <MaterialIcons name="history" size={15} color="#4a6fa8" />
              <Text style={styles.btnSecondaryText}>Historial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Recent Scans */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>Recientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Activos")}>
            <Text style={styles.viewAllLink}>Ver activos →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentCard}>
          {recentScans.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#3a5070', fontSize: 13 }}>Sin escaneos recientes</Text>
            </View>
          ) : (
            recentScans.map((scan, index) => (
              <TouchableOpacity
                key={String(scan.id)}
                style={[styles.recentItem, index === recentScans.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => openModal(scan)}
                activeOpacity={0.7}
              >
                <View style={styles.recentIconWrap}>
                  <MaterialIcons name="inventory-2" size={16} color="#4a6fa8" />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{scan.nombre}</Text>
                  <View style={styles.codeTag}>
                    <Text style={styles.codeTagText}>#{scan.id}</Text>
                  </View>
                </View>
                <View style={styles.recentRight}>
                  <View style={[
                    styles.recentStatusDot,
                    { backgroundColor: scan.estado === 'Activo' ? '#10b981' : scan.estado === 'Mantenimiento' ? '#f59e0b' : '#ef4444' }
                  ]} />
                  <MaterialIcons name="chevron-right" size={16} color="#1e2d45" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {renderModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  bgAccent: {
    position: 'absolute',
    top: 40,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#0044cc',
    opacity: 0.05,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  cameraStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    position: 'relative',
  },
  statusPulse: {
    position: 'absolute',
    left: 7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(16,185,129,0.2)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Scanner card
  scannerCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a2a42',
    overflow: 'hidden',
    marginBottom: 12,
  },
  scannerFrame: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#060d18',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  camera: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  cameraPlaceholder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  cameraPlaceholderText: {
    color: '#4a6fa8',
    fontSize: 13,
    fontWeight: '500',
  },
  permissionBtn: {
    marginTop: 6,
    backgroundColor: '#0055e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permissionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#0055e5',
    zIndex: 10,
  },
  topLeft:    { top: 20, left: 20, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 4 },
  topRight:   { top: 20, right: 20, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 4 },
  bottomLeft: { bottom: 20, left: 20, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 4 },
  bottomRight:{ bottom: 20, right: 20, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 4 },
  cameraToggleBtn: {
    position: 'absolute',
    top: 12, right: 12,
    width: 36, height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(30,45,70,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scanStatusPill: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(30,45,70,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    zIndex: 10,
  },
  scanStatusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  scannerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#0d1829',
  },
  instructions: {
    color: '#3a5070',
    fontSize: 12,
    fontWeight: '500',
  },

  // Manual card
  manualCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a2a42',
    padding: 16,
    marginBottom: 20,
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  manualTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dce8f5',
    letterSpacing: 0.2,
  },
  manualSubtitle: {
    fontSize: 12,
    color: '#5a7a9e',
    marginBottom: 14,
    lineHeight: 17,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1829',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  input: {
    flex: 1,
    color: '#dce8f5',
    fontSize: 13,
    paddingVertical: 11,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0055e5',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    shadowColor: '#0044cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4a6fa8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,85,229,0.1)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,85,229,0.2)',
  },
  nowDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#0055e5',
  },
  nowBadgeText: {
    color: '#4d8aff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  viewAllLink: {
    fontSize: 12,
    color: '#3a72cc',
    fontWeight: '600',
  },

  // Asset card (scanned result)
  assetCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a2a42',
    overflow: 'hidden',
  },
  assetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  assetIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(0,85,229,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,85,229,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f0f4ff',
    marginBottom: 5,
    letterSpacing: 0.1,
  },
  codeTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,85,229,0.1)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,85,229,0.2)',
  },
  codeTagText: {
    color: '#4d8aff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  activeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  activeStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#111f35',
    marginHorizontal: 16,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  detailItem: {
    width: '45%',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4a6fa8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#dce8f5',
    fontWeight: '500',
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,85,229,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0,85,229,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    color: '#4d8aff',
    fontSize: 8,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0055e5',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#0044cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0d1829',
    borderWidth: 1,
    borderColor: '#1a2a42',
  },
  btnSecondaryText: {
    color: '#4a6fa8',
    fontSize: 13,
    fontWeight: '600',
  },

  // Recent scans
  recentCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a2a42',
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#111f35',
    gap: 12,
  },
  recentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0d1829',
    borderWidth: 1,
    borderColor: '#1a2a42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentInfo: {
    flex: 1,
    gap: 5,
  },
  recentName: {
    color: '#dce8f5',
    fontSize: 13,
    fontWeight: '600',
  },
  recentRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  recentStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  // Modal
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
});