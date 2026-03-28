import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react'
import { api } from '../../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'

export default function LoginScreen() {

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {
    if (!correo || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/login', {
        correo,
        password
      });

      await AsyncStorage.setItem('token', response.token);

      Alert.alert('Éxito', 'Login correcto');

      console.log('Usuario:', response.usuario);

      // TODO: navegar al home

    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas o servidor');
    } finally {
      setLoading(false);
    }
  };








  return (
    <View style={styles.container}>
      {/* Subtle background accent blob */}
      <View style={styles.bgAccent} />

      <View style={styles.card}>
        {/* Logo section */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoRing}>
            <Image source={require('../../assets/icon.png')} style={styles.logo} />
          </View>
        </View>

        <Text style={styles.logoTitle}>Ophira QR</Text>
        <Text style={styles.tagline} numberOfLines={2}>
          Gestión precisa de activos impulsada por{'\n'}tecnología QR de última generación.
        </Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Correo</Text>
          <TextInput
            style={styles.input}
            placeholder="usuario@empresa.com"
            placeholderTextColor="#3a4a60"
            value={correo}
            onChangeText={setCorreo}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#3a4a60"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
          <View style={styles.buttonArrow}>
            <Text style={styles.buttonArrowText}>→</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
      </View>

      <Text style={styles.footer}>© 2025 Ophira Technologies</Text>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Subtle background glow accent
  bgAccent: {
    position: 'absolute',
    top: '15%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#0044cc',
    opacity: 0.06,
  },

  card: {
    width: '88%',
    backgroundColor: '#111827',
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e2d45',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },

  // Logo
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d1829',
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f0f4ff',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: '#5a7a9e',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#1a2540',
    marginVertical: 24,
  },

  // Input group
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4a6fa8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: '#1a2a42',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    color: '#dce8f5',
    backgroundColor: '#0d1829',
    fontSize: 15,
  },

  // Button
  button: {
    backgroundColor: '#0055e5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flexDirection: 'row',
    shadowColor: '#0044cc',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
    flex: 1,
    textAlign: 'center',
  },
  buttonArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonArrowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Forgot password
  forgot: {
    color: '#3a72cc',
    textAlign: 'center',
    marginTop: 18,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 32,
    color: '#1e2d45',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});