import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '../services/api';

export default function ScanQrScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(true);
  const [codigoDetectado, setCodigoDetectado] = useState('');
  const [codigoManual, setCodigoManual] = useState('');
  const [assetData, setAssetData] = useState({});
  const isProcessing = useRef(false);

  const recentScans = [
    { id: 1, name: 'LG UltraFine 5K', code: 'OPH-AST-0844', time: '10:15 AM', icon: 'desktop-mac' },
    { id: 2, name: 'Herman Miller Aeron', code: 'OPH-AST-0102', time: '09:48 AM', icon: 'event-seat' },
    { id: 3, name: 'HP LaserJet Pro', code: 'OPH-AST-0331', time: 'Ayer', icon: 'print' },
  ];

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
      // Reset so the camera can scan again
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
      // Permissions still loading
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
          {/* Corner brackets */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Camera or placeholder */}
          {renderCameraArea()}

          {/* Toggle camera button */}
          <TouchableOpacity style={styles.cameraToggleBtn} onPress={handleToggleCamera}>
            <MaterialIcons
              name={cameraActive ? 'videocam' : 'videocam-off'}
              size={18}
              color="#ffffff"
            />
          </TouchableOpacity>

          {/* Bottom status pill */}
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
          {/* Asset title row */}
          <View style={styles.assetTitleRow}>
            <View style={styles.assetIconWrap}>
              <MaterialIcons name="laptop" size={22} color="#4d8aff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.assetName}>
                {assetData?.nombre || 'Sin activo seleccionado'}
              </Text>
              <View style={styles.codeTag}>
                <Text style={styles.codeTagText}>
                  {assetData?.id_activo || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={[styles.activeStatusBadge, { borderColor: `${estadoColor}33`, backgroundColor: `${estadoColor}1a` }]}>
              <View style={[styles.activeStatusDot, { backgroundColor: estadoColor }]} />
              <Text style={[styles.activeStatusText, { color: estadoColor }]}>
                {assetData?.estado || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Detail grid */}
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Categoría</Text>
              <Text style={styles.detailValue}>{assetData?.categoria || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Encargado</Text>
              <View style={styles.assignedRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitials}>
                    {assetData?.encargado?.charAt(0) || '?'}
                  </Text>
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

          {/* Actions */}
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
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>Ver historial →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentCard}>
          {recentScans.map((scan, index) => (
            <TouchableOpacity
              key={scan.id}
              style={[styles.recentItem, index === recentScans.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.recentIconWrap}>
                <MaterialIcons name={scan.icon} size={16} color="#4a6fa8" />
              </View>
              <View style={styles.recentInfo}>
                <Text style={styles.recentName}>{scan.name}</Text>
                <View style={styles.codeTag}>
                  <Text style={styles.codeTagText}>{scan.code}</Text>
                </View>
              </View>
              <View style={styles.recentRight}>
                <Text style={styles.recentTime}>{scan.time}</Text>
                <MaterialIcons name="chevron-right" size={16} color="#1e2d45" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    backgroundColor: '#10b981',
  },
  statusText: {
    color: '#10b981',
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cameraPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    top: 12,
    right: 12,
    width: 36,
    height: 36,
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

  // Section wrapper
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

  // Asset card
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
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  activeStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  activeStatusText: {
    color: '#10b981',
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
    alignItems: 'flex-end',
    gap: 4,
  },
  recentTime: {
    color: '#4a6fa8',
    fontSize: 11,
    fontWeight: '500',
  },
});