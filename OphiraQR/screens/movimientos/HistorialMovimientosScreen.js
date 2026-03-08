import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';

// Types removed for plain JavaScript build (was TypeScript-like declarations)

// ─── Data ────────────────────────────────────────────────────────────────────

const ACTION_META = {
  add:    { icon: '＋', color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  edit:   { icon: '✎',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  scan:   { icon: '⊞',  color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)'  },
  delete: { icon: '✕',  color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  assign: { icon: '→',  color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
};

const DATA = [
  {
    label: 'TODAY, OCTOBER 24',
    items: [
      {
        id: '1',
        user: 'Sarah Jenkins',
        initials: 'SJ',
        avatarColor: '#4f8ef7',
        action: 'add',
        description: 'Added new asset',
        highlight: [{ id: 'QR-8829', name: 'MacBook Pro 16"' }],
        tags: ['Warehouse A'],
        time: '02:45 PM',
        linkLabel: 'View Details',
      },
      {
        id: '2',
        user: 'Marcus Thorne',
        initials: 'MT',
        avatarColor: '#fbbf24',
        action: 'edit',
        description: 'Updated status of',
        highlight: [{ id: 'QR-4512', name: 'Forklift X-1' }],
        tags: ['Available', 'Maintenance'],
        time: '11:20 AM',
        linkLabel: 'Compare Changes',
      },
      {
        id: '3',
        user: 'Elena Vance',
        initials: 'EV',
        avatarColor: '#34d399',
        action: 'scan',
        description: 'Location audit scan on',
        highlight: [{ id: '12 assets', name: '' }],
        tags: ['South Campus'],
        time: '09:15 AM',
        linkLabel: 'View Scan Log',
        extra: ['🖨️', '🖥️', '📺', '+9'],
      },
    ],
  },
  {
    label: 'YESTERDAY, OCTOBER 23',
    items: [
      {
        id: '4',
        user: 'System Administrator',
        initials: 'SA',
        avatarColor: '#f87171',
        action: 'delete',
        description: 'Decommissioned and deleted asset',
        highlight: [{ id: 'QR-1002', name: 'Dell Server Rack B' }],
        tags: [],
        time: '04:30 PM',
        linkLabel: 'Audit Trail',
      },
      {
        id: '5',
        user: 'David Miller',
        initials: 'DM',
        avatarColor: '#a78bfa',
        action: 'assign',
        description: 'Assigned',
        highlight: [{ id: 'QR-5541', name: 'iPad Air' }],
        tags: ['Lisa Wong', 'mobile scan'],
        time: '01:05 PM',
        linkLabel: 'View Details',
      },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ initials, color }) {
  return (
    <View style={[s.avatar, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[s.avatarText, { color }]}>{initials}</Text>
    </View>
  );
}

function ActionDot({ type }) {
  const meta = ACTION_META[type];
  return (
    <View style={[s.actionDot, { backgroundColor: meta.bg, borderColor: meta.color + '44' }]}>
      <Text style={[s.actionIcon, { color: meta.color }]}>{meta.icon}</Text>
    </View>
  );
}

function Tag({ label }) {
  return (
    <View style={s.tag}>
      <Text style={s.tagText}>{label}</Text>
    </View>
  );
}

function ActivityCard({ item }) {
  return (
    <View style={s.card}>
      {/* Left: avatar + connector line */}
      <View style={s.cardLeft}>
        <Avatar initials={item.initials} color={item.avatarColor} />
        <View style={s.connector} />
      </View>

      {/* Right: content */}
      <View style={s.cardContent}>
        {/* Top row */}
        <View style={s.cardTopRow}>
          <View style={s.cardTopLeft}>
            <ActionDot type={item.action} />
            <Text style={s.userName}>{item.user}</Text>
          </View>
          <Text style={s.timeText}>{item.time}</Text>
        </View>

        {/* Description */}
        <View style={s.descRow}>
          <Text style={s.descText}>
            {item.description}{' '}
            {item.highlight?.map((h, i) => (
              <Text key={i} style={s.highlight}>
                {h.id}{h.name ? `: ${h.name}` : ''}
              </Text>
            ))}
          </Text>
        </View>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={s.tagsRow}>
            {item.tags.map((t, i) => <Tag key={i} label={t} />)}
          </View>
        )}

        {/* Extra icons (scan row) */}
        {item.extra && (
          <View style={s.extraRow}>
            {item.extra.map((e, i) => (
              <View key={i} style={s.extraChip}>
                <Text style={s.extraText}>{e}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Link */}
        <TouchableOpacity style={s.linkRow} activeOpacity={0.7}>
          <Text style={s.linkText}>{item.linkLabel} →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DaySection({ group }) {
  return (
    <View style={s.section}>
      <View style={s.dayLabelWrap}>
        <Text style={s.dayLabel}>{group.label}</Text>
      </View>
      {group.items.map(item => (
        <ActivityCard key={item.id} item={item} />
      ))}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ActivityHistory() {
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0b1220" />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View style={s.headerLeft}>
            <Text style={s.headerTitle}>Activity History</Text>
            <Text style={s.headerSub}>Real-time log of field modifications via QR scanners.</Text>
          </View>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.filterBtn} activeOpacity={0.8}>
            <Text style={s.filterIcon}>📅</Text>
            <Text style={s.filterText}>Last 7 Days</Text>
            <Text style={s.filterChevron}>⌄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.exportBtn} activeOpacity={0.8}>
            <Text style={s.exportText}>⬇ Export PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {DATA.map((group, i) => (
          <DaySection key={i} group={group} />
        ))}

        <TouchableOpacity style={s.loadMoreBtn} activeOpacity={0.8}>
          <Text style={s.loadMoreText}>Load More Activity</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FAB refresh */}
      <TouchableOpacity style={s.fab} activeOpacity={0.8}>
        <Text style={s.fabIcon}>↻</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b1220' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 100 },

  // Header
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { gap: 3, flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e8eaf0',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 17,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#13161d',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 7,
    flex: 1,
  },
  filterIcon: { fontSize: 12 },
  filterText: { fontSize: 12.5, color: '#e8eaf0', fontWeight: '500', flex: 1 },
  filterChevron: { fontSize: 13, color: '#6b7280' },
  exportBtn: {
    backgroundColor: '#4f8ef7',
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 7,
    shadowColor: '#4f8ef7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  exportText: { fontSize: 12.5, color: '#fff', fontWeight: '600' },

  // Section
  section: { marginTop: 22 },
  dayLabelWrap: { marginBottom: 14 },
  dayLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4f8ef7',
    letterSpacing: 1.2,
  },

  // Card
  card: { flexDirection: 'row', marginBottom: 4 },
  cardLeft: { alignItems: 'center', marginRight: 13, width: 40 },
  connector: {
    flex: 1,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginTop: 4,
    marginBottom: -6,
  },
  cardContent: {
    flex: 1,
    backgroundColor: '#13161d',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 7,
  },

  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700' },

  // Top row
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },

  // Action dot
  actionDot: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: { fontSize: 11, fontWeight: '700' },
  userName: { fontSize: 13.5, fontWeight: '600', color: '#e8eaf0', flex: 1 },
  timeText: { fontSize: 11, color: '#6b7280', fontFamily: 'monospace' },

  // Description
  descRow: { flexDirection: 'row', flexWrap: 'wrap' },
  descText: { fontSize: 13, color: '#9ca3af', lineHeight: 19 },
  highlight: { fontSize: 13, color: '#4f8ef7', fontWeight: '600', lineHeight: 19 },

  // Tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11.5, color: '#9ca3af' },

  // Extra chips
  extraRow: { flexDirection: 'row', gap: 6 },
  extraChip: {
    backgroundColor: '#1a1e28',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  extraText: { fontSize: 14 },

  // Link
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  linkText: { fontSize: 12, color: '#4f8ef7', fontWeight: '500' },

  // Load more
  loadMoreBtn: {
    marginTop: 4,
    backgroundColor: '#13161d',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loadMoreText: { fontSize: 13.5, color: '#e8eaf0', fontWeight: '500' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4f8ef7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f8ef7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
});
