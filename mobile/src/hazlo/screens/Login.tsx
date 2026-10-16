import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { loginConEmail } from '@/lib/services/auth';
import { PressableScale } from '../motion';
import { HazloMark } from '../HazloMark';
import { C, F, FG, MUTED, R } from '../theme';
import { CajaCampo } from '../ui';

export function LoginScreen({ onCrearCuenta }: { onCrearCuenta: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [foco, setFoco] = useState<'email' | 'pass' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Escribe tu correo y contraseña.');
      return;
    }
    setError(null);
    setLoading(true);
    const r = await loginConEmail(email, password);
    // Si es ok, el AuthProvider detecta la sesión y cambia de pantalla solo.
    if (!r.ok) {
      setError(r.error);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Marca */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <LinearGradient
            colors={[C.primary, C.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <HazloMark size={40} primary="#fff" secondary="#fff" />
          </LinearGradient>
          <Text style={{ fontFamily: F.bold, fontSize: 24, color: FG, letterSpacing: -0.5 }}>Bienvenido de vuelta</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 4, textAlign: 'center' }}>
            Ingresa a tu cuenta para continuar ganando.
          </Text>
        </View>

        {/* Correo */}
        <Text style={{ fontFamily: F.base, fontSize: 12, color: FG, marginBottom: 6 }}>Correo electrónico</Text>
        <CajaCampo activo={foco === 'email'} style={{ marginBottom: 14 }}>
          <TextInput
            onFocus={() => setFoco('email')}
            onBlur={() => setFoco(null)}
            placeholder="tu@email.com"
            placeholderTextColor={MUTED}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={{ fontFamily: F.reg, fontSize: 14, color: FG, padding: 0 }}
          />
        </CajaCampo>

        {/* Contraseña */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontFamily: F.base, fontSize: 12, color: FG }}>Contraseña</Text>
          <Pressable onPress={() => setShowPass((v) => !v)} hitSlop={8}>
            <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.primary }}>{showPass ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        </View>
        <CajaCampo activo={foco === 'pass'} style={{ marginBottom: 8 }}>
          <TextInput
            onFocus={() => setFoco('pass')}
            onBlur={() => setFoco(null)}
            placeholder="••••••••"
            placeholderTextColor={MUTED}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={onSubmit}
            returnKeyType="go"
            style={{ fontFamily: F.reg, fontSize: 14, color: FG, padding: 0 }}
          />
        </CajaCampo>

        {error && (
          <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6, marginBottom: 4 }}>
            <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
          </View>
        )}

        {/* Botón entrar */}
        <PressableScale
          onPress={onSubmit}
          disabled={loading}
          style={{
            marginTop: 14,
            height: 52,
            borderRadius: R.md,
            backgroundColor: FG,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Entrar</Text>
          )}
        </PressableScale>

        <Pressable onPress={onCrearCuenta} hitSlop={10} disabled={loading}>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 20 }}>
            ¿Primera vez en Hazlo Cash?{' '}
            <Text style={{ fontFamily: F.semi, color: C.primary }}>Crear cuenta</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
