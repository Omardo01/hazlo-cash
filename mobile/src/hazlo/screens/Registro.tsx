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

import { registrarConEmail } from '@/lib/services/auth';
import { HazloMark } from '../HazloMark';
import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { Glass } from '../ui';

function Campo({
  label,
  hint,
  ...input
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  secureTextEntry?: boolean;
  onSubmitEditing?: () => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: FG }}>{label}</Text>
        {hint && <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{hint}</Text>}
      </View>
      <Glass style={{ borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 12 }}>
        <TextInput
          placeholderTextColor={MUTED}
          autoCorrect={false}
          style={{ fontFamily: F.reg, fontSize: 14, color: FG, padding: 0 }}
          {...input}
        />
      </Glass>
    </View>
  );
}

export function RegistroScreen({ onVolver }: { onVolver: () => void }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [recomendar, setRecomendar] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!nombre.trim()) return setError('Escribe tu nombre.');
    if (!email.trim().includes('@')) return setError('Escribe un correo válido.');
    if (password.length < 6) return setError('La contraseña necesita al menos 6 caracteres.');

    setError(null);
    setLoading(true);
    const r = await registrarConEmail({
      nombre,
      email,
      password,
      telefono,
      quiereRecomendar: recomendar,
    });
    // Si sale bien, el AuthProvider ve la sesión nueva y cambia de pantalla solo.
    if (!r.ok) {
      setError(r.error);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Fade desde={10}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <LinearGradient
              colors={[C.primary, C.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 60, height: 60, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 13 }}>
              <HazloMark size={37} primary="#fff" secondary="#fff" />
            </LinearGradient>
            <Text style={{ fontFamily: F.bold, fontSize: 23, color: FG, letterSpacing: -0.5 }}>Crea tu cuenta</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 4, textAlign: 'center' }}>
              Recomienda los lugares que ya te gustan y gana por cada venta.
            </Text>
          </View>
        </Fade>

        <Fade delay={STAGGER} desde={10}>
          <Campo
            label="Tu nombre"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej. Omar Domínguez"
            autoCapitalize="words"
          />
        </Fade>

        <Fade delay={STAGGER * 2} desde={10}>
          <Campo
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Fade>

        <Fade delay={STAGGER * 3} desde={10}>
          <Campo
            label="Teléfono"
            hint="opcional"
            value={telefono}
            onChangeText={setTelefono}
            placeholder="993 123 4567"
            keyboardType="phone-pad"
          />
        </Fade>

        <Fade delay={STAGGER * 4} desde={10}>
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontFamily: F.base, fontSize: 12, color: FG }}>Contraseña</Text>
              <Pressable onPress={() => setShowPass((v) => !v)} hitSlop={8}>
                <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.primary }}>{showPass ? 'Ocultar' : 'Mostrar'}</Text>
              </Pressable>
            </View>
            <Glass style={{ borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 12 }}>
              <TextInput
                placeholder="Mínimo 6 caracteres"
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
            </Glass>
          </View>
        </Fade>

        {/* Rol inicial: cualquiera puede recomendar, pero se pregunta para que
            la app abra con la intención correcta (y para contarlos aparte). */}
        <Fade delay={STAGGER * 5} desde={10}>
          <PressableScale
            onPress={() => setRecomendar((v) => !v)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              borderRadius: R.md,
              backgroundColor: recomendar ? `${C.primary}12` : '#fff',
              borderWidth: 1,
              borderColor: recomendar ? `${C.primary}55` : 'rgba(0,0,0,0.08)',
            }}>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 7,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: recomendar ? C.primary : 'transparent',
                borderWidth: recomendar ? 0 : 1.5,
                borderColor: 'rgba(0,0,0,0.2)',
              }}>
              {recomendar && <Icon name="check" size={13} color="#fff" sw={3} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>Quiero recomendar y ganar</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 2 }}>
                Te damos tu código y tu QR para compartir.
              </Text>
            </View>
          </PressableScale>
        </Fade>

        {error && (
          <Fade>
            <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12 }}>
              <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
            </View>
          </Fade>
        )}

        <Fade delay={STAGGER * 6} desde={10}>
          <PressableScale
            onPress={onSubmit}
            disabled={loading}
            style={{
              marginTop: 16,
              height: 52,
              borderRadius: R.md,
              backgroundColor: FG,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.7 : 1,
            }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Crear cuenta</Text>}
          </PressableScale>
        </Fade>

        <Pressable onPress={onVolver} hitSlop={10} disabled={loading}>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 20 }}>
            ¿Ya tienes cuenta? <Text style={{ fontFamily: F.semi, color: C.primary }}>Entrar</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
