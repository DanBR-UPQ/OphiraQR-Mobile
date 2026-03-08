import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ScanQrScreen() {
  const recentScans = [
    { id: 1, name: 'LG UltraFine 5K', code: 'OPH-AST-0844', time: '10:15 AM', icon: 'desktop-mac' },
    { id: 2, name: 'Herman Miller Aeron', code: 'OPH-AST-0102', time: '09:48 AM', icon: 'event-seat' },
    { id: 3, name: 'HP LaserJet Pro', code: 'OPH-AST-0331', time: 'Ayer', icon: 'print' },
  ];

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
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Cámara Activa</Text>
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

          {/* Center reticle */}
          <View style={styles.reticle}>
            <MaterialIcons name="qr-code-scanner" size={52} color="#0055e5" style={{ opacity: 0.35 }} />
          </View>

          {/* Scan line */}
          <View style={styles.scanLine} />
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
            />
          </View>
          <TouchableOpacity style={styles.searchBtn}>
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
              <Text style={styles.assetName}>Dell Precision 5570</Text>
              <View style={styles.codeTag}>
                <Text style={styles.codeTagText}>OPH-AST-0921</Text>
              </View>
            </View>
            <View style={styles.activeStatusBadge}>
              <View style={styles.activeStatusDot} />
              <Text style={styles.activeStatusText}>Activo</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Detail grid */}
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Categoría</Text>
              <Text style={styles.detailValue}>Laptop / Tecnología</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Encargado</Text>
              <View style={styles.assignedRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitials}>JS</Text>
                </View>
                <Text style={styles.detailValue}>John Smith</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Ubicación</Text>
              <Text style={styles.detailValue}>HQ · Piso 3</Text>
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
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#0055e5',
  },
  topLeft:    { top: 20, left: 20, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 4 },
  topRight:   { top: 20, right: 20, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 4 },
  bottomLeft: { bottom: 20, left: 20, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 4 },
  bottomRight:{ bottom: 20, right: 20, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 4 },
  reticle: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 1.5,
    backgroundColor: '#0055e5',
    opacity: 0.5,
    top: '45%',
    borderRadius: 1,
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