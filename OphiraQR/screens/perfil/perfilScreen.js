import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import { api } from '../../services/api';

const ROLES = [
  { id: 1, label: 'Administrador' },
  { id: 2, label: 'Técnico' },
  { id: 3, label: 'Usuario' },
];

const PUESTOS = [
  { id: 1, label: 'Gerente TI', area: 'Tecnología' },
  { id: 2, label: 'Soporte', area: 'Operaciones' },
  { id: 3, label: 'Auditor', area: 'Finanzas' },
];

const FormField = ({ label, icon, children, error, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 45, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 45, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: 14 }}>
      <View style={styles.fieldLabelRow}>
        <MaterialIcons name={icon} size={11} color="#4a6fa8" />
        <Text style={styles.fieldLabel}>{label}</Text>
        {error ? <Text style={styles.fieldError}>{error}</Text> : null}
      </View>
      {children}
    </Animated.View>
  );
};

const StyledInput = ({ value, onChangeText, placeholder, keyboardType, multiline, editable = true }) => (
  <TextInput
    style={[styles.input, multiline && { height: 72, textAlignVertical: 'top' }, !editable && styles.inputDisabled]}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor="#2d4460"
    keyboardType={keyboardType || 'default'}
    multiline={multiline}
    editable={editable}
    autoCapitalize="none"
  />
);

const OptionSelector = ({ options, selected, onSelect, placeholder }) => {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toVal = open ? 0 : 1;
    setOpen(!open);
    Animated.spring(anim, { toValue: toVal, tension: 80, friction: 10, useNativeDriver: true }).start();
  };

  const chosen = options.find(o => o.id === selected);

  return (
    <View>
      <TouchableOpacity style={styles.selector} onPress={toggle} activeOpacity={0.75}>
        <Text style={chosen ? styles.selectorValue : styles.selectorPlaceholder}>
          {chosen ? chosen.label : placeholder}
        </Text>
        <Animated.View style={{ transform: [{ rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
          <MaterialIcons name="keyboard-arrow-down" size={18} color="#3b82f6" />
        </Animated.View>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownList}>
          {options.map(opt => {
            const active = opt.id === selected;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                onPress={() => { onSelect(opt.id); toggle(); }}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropdownLabel, active && styles.dropdownLabelActive]}>{opt.label}</Text>
                  {opt.area ? <Text style={styles.dropdownSub}>{opt.area}</Text> : null}
                </View>
                {active && <MaterialIcons name="check" size={14} color="#3b82f6" />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const Section = ({ title, icon, accent = '#3b82f6', children, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
      <View style={[styles.sectionAccent, { backgroundColor: accent }]} />
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, { backgroundColor: accent + '20' }]}>
          <MaterialIcons name={icon} size={15} color={accent} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </Animated.View>
  );
};

export default function UserFormScreen({ route, navigation }) {
  const existing = route?.params?.user || null;

  const [form, setForm] = useState({
    id_usuario: existing?.id_usuario || null,
    nombre_usuario: existing?.nombre_usuario || '',
    apellido_paterno: existing?.apellido_paterno || '',
    apellido_materno: existing?.apellido_materno || '',
    correo: existing?.correo || '',
    telefono: existing?.telefono || '',
    id_rol: existing?.id_rol || null,
    id_puesto: existing?.id_puesto || null,
    activo: existing?.activo ?? true,
    fecha_registro: existing?.fecha_registro || new Date().toISOString().split('T')[0],
    puesto: existing?.puesto || '',
    area: existing?.area || '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.nombre_usuario.trim()) e.nombre_usuario = 'Requerido';
    if (!form.apellido_paterno.trim()) e.apellido_paterno = 'Requerido';
    if (!form.correo.trim() || !form.correo.includes('@')) e.correo = 'Correo inválido';
    if (!form.id_rol) e.id_rol = 'Selecciona un rol';
    if (!form.id_puesto) e.id_puesto = 'Selecciona un puesto';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Campos incompletos', 'Revisa los campos marcados en rojo.');
      return;
    }
    setSaving(true);
    try {
      if (form.id_usuario) {
        // await api.put(`/usuarios/${form.id_usuario}`, form);
        console.log('PUT /usuarios/', form);
      } else {
        // await api.post('/usuarios/', form);
        console.log('POST /usuarios/', form);
      }
      Alert.alert('Éxito', form.id_usuario ? 'Usuario actualizado.' : 'Usuario creado.', [
        { text: 'OK', onPress: () => navigation?.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el usuario.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!form.id_usuario;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <View style={styles.bgGlow} />
      <View style={styles.bgGlow2} />

      <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={14} color="#4a6fa8" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>{isEdit ? 'EDITAR' : 'NUEVO'} · USUARIOS</Text>
          <Text style={styles.headerTitle}>{isEdit ? 'Editar Usuario' : 'Crear Usuario'}</Text>
        </View>
        {isEdit && form.id_usuario && (
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>#{form.id_usuario}</Text>
          </View>
        )}
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Section title="Identidad" icon="person" accent="#3b82f6" index={0}>
          <FormField label="Nombre(s)" icon="badge" error={errors.nombre_usuario} index={0}>
            <StyledInput value={form.nombre_usuario} onChangeText={t => set('nombre_usuario', t)} placeholder="Ej. María Fernanda" />
          </FormField>
          <View style={styles.rowTwo}>
            <View style={{ flex: 1 }}>
              <FormField label="Apellido Paterno" icon="badge" error={errors.apellido_paterno} index={1}>
                <StyledInput value={form.apellido_paterno} onChangeText={t => set('apellido_paterno', t)} placeholder="Paterno" />
              </FormField>
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <FormField label="Apellido Materno" icon="badge" index={2}>
                <StyledInput value={form.apellido_materno} onChangeText={t => set('apellido_materno', t)} placeholder="Materno" />
              </FormField>
            </View>
          </View>
        </Section>

        <Section title="Contacto" icon="alternate-email" accent="#10b981" index={1}>
          <FormField label="Correo electrónico" icon="mail-outline" error={errors.correo} index={3}>
            <StyledInput value={form.correo} onChangeText={t => set('correo', t)} placeholder="usuario@empresa.com" keyboardType="email-address" />
          </FormField>
          <FormField label="Teléfono" icon="phone" index={4}>
            <StyledInput value={form.telefono} onChangeText={t => set('telefono', t)} placeholder="+52 442 000 0000" keyboardType="phone-pad" />
          </FormField>
        </Section>

        <Section title="Rol y Puesto" icon="work" accent="#f59e0b" index={2}>
          <FormField label="Rol del sistema" icon="security" error={errors.id_rol} index={5}>
            <OptionSelector options={ROLES} selected={form.id_rol} onSelect={v => set('id_rol', v)} placeholder="Seleccionar rol..." />
          </FormField>
          <FormField label="Puesto" icon="corporate-fare" error={errors.id_puesto} index={6}>
            <OptionSelector
              options={PUESTOS}
              selected={form.id_puesto}
              onSelect={(v) => {
                const p = PUESTOS.find(x => x.id === v);
                set('id_puesto', v);
                set('puesto', p?.label || '');
                set('area', p?.area || '');
              }}
              placeholder="Seleccionar puesto..."
            />
          </FormField>
          <View style={styles.rowTwo}>
            <View style={{ flex: 1 }}>
              <FormField label="Puesto (texto)" icon="label-outline" index={7}>
                <StyledInput value={form.puesto} onChangeText={t => set('puesto', t)} placeholder="—" editable={false} />
              </FormField>
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <FormField label="Área" icon="domain" index={8}>
                <StyledInput value={form.area} onChangeText={t => set('area', t)} placeholder="—" editable={false} />
              </FormField>
            </View>
          </View>
        </Section>

        <Section title="Estado y Registro" icon="toggle-on" accent="#8b5cf6" index={3}>
          <FormField label="Fecha de registro" icon="calendar-today" index={9}>
            <StyledInput value={form.fecha_registro} onChangeText={t => set('fecha_registro', t)} placeholder="YYYY-MM-DD" keyboardType="numeric" />
          </FormField>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <MaterialIcons name="power-settings-new" size={14} color={form.activo ? '#10b981' : '#ef4444'} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.toggleLabel}>Estado del usuario</Text>
                <Text style={[styles.toggleValue, { color: form.activo ? '#10b981' : '#ef4444' }]}>
                  {form.activo ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
            <Switch
              value={form.activo}
              onValueChange={v => set('activo', v)}
              trackColor={{ false: 'rgba(239,68,68,0.25)', true: 'rgba(16,185,129,0.3)' }}
              thumbColor={form.activo ? '#10b981' : '#ef4444'}
              ios_backgroundColor="rgba(239,68,68,0.25)"
            />
          </View>
        </Section>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation?.goBack()} activeOpacity={0.75}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
            <MaterialIcons name={saving ? 'hourglass-empty' : (isEdit ? 'save' : 'person-add')} size={16} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear usuario')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1120', paddingTop: 54, paddingHorizontal: 16 },
  bgGlow: { position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: '#0044cc', opacity: 0.04 },
  bgGlow2: { position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: '#8b5cf6', opacity: 0.03 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  backBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2a42', alignItems: 'center', justifyContent: 'center' },
  headerSub: { fontSize: 9, color: '#4a6fa8', letterSpacing: 1.4, fontWeight: '700', marginBottom: 3 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#f0f4ff', letterSpacing: 0.2 },
  idBadge: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2a42', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  idBadgeText: { color: '#3b82f6', fontSize: 12, fontWeight: '700' },
  scroll: { paddingBottom: 16 },
  section: { backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1a2a42', marginBottom: 14, overflow: 'hidden' },
  sectionAccent: { height: 3, width: '100%', opacity: 0.8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#0d1829', gap: 10 },
  sectionIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: '#dce8f5', fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  fieldLabel: { color: '#3a5070', fontSize: 9, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase', flex: 1 },
  fieldError: { color: '#ef4444', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  input: { backgroundColor: '#0d1829', borderWidth: 1, borderColor: '#1a2a42', borderRadius: 10, color: '#dce8f5', paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, fontWeight: '500' },
  inputDisabled: { opacity: 0.5 },
  rowTwo: { flexDirection: 'row' },
  selector: { backgroundColor: '#0d1829', borderWidth: 1, borderColor: '#1a2a42', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorValue: { color: '#dce8f5', fontSize: 13, fontWeight: '500' },
  selectorPlaceholder: { color: '#2d4460', fontSize: 13 },
  dropdownList: { backgroundColor: '#0d1829', borderWidth: 1, borderColor: '#1a2a42', borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#111827' },
  dropdownItemActive: { backgroundColor: '#1d3461' },
  dropdownLabel: { color: '#5a7a9e', fontSize: 13, fontWeight: '500' },
  dropdownLabelActive: { color: '#dce8f5', fontWeight: '600' },
  dropdownSub: { color: '#3a5070', fontSize: 10, marginTop: 2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d1829', borderWidth: 1, borderColor: '#1a2a42', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  toggleInfo: { flexDirection: 'row', alignItems: 'center' },
  toggleLabel: { color: '#3a5070', fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  toggleValue: { fontSize: 13, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2a42', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: '#4a6fa8', fontSize: 13, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: '#1d3461', borderWidth: 1, borderColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#dce8f5', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
});