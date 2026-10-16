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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { REGISTRO_DE_PRUEBA, registrarConEmail } from '@/lib/services/auth';
import { HazloMark } from '../HazloMark';
import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { CajaCampo } from '../ui';

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
  const [foco, setFoco] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: FG }}>{label}</Text>
        {hint && <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{hint}</Text>}
      </View>
      <CajaCampo activo={foco}>
        <TextInput
          placeholderTextColor={MUTED}
          autoCorrect={false}
          style={{ fontFamily: F.reg, fontSize: 14, color: FG, padding: 0 }}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          {...input}
        />
      </CajaCampo>
    </View>
  );
}

export function RegistroScreen({ onEntrar, onNegocio }: { onEntrar: () => void; onNegocio: () => void }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focoPass, setFocoPass] = useState(false);
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
            {REGISTRO_DE_PRUEBA && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  marginTop: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 999,
                  backgroundColor: `${C.primary}14`,
                }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary }} />
                <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.accent }}>Cuenta de prueba · sin verificar correo</Text>
              </View>
            )}
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
            hint={REGISTRO_DE_PRUEBA ? 'puede ser inventado' : undefined}
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
            <CajaCampo activo={focoPass}>
              <TextInput
                onFocus={() => setFocoPass(true)}
                onBlur={() => setFocoPass(false)}
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
            </CajaCampo>
          </View>
        </Fade>

        {/* Todo el que se registra es recomendador: en vez de preguntar, se
            explica cómo va a ganar. */}
        <Fade delay={STAGGER * 5} desde={10}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              borderRadius: R.md,
              backgroundColor: `${C.primary}12`,
              borderWidth: 1,
              borderColor: `${C.primary}33`,
            }}>
            <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="qr" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>Tu cuenta de recomendador</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 2, lineHeight: 16 }}>
                Generas un código y un QR distinto por cada negocio que recomiendes.
              </Text>
            </View>
          </View>
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

        <Pressable onPress={onEntrar} hitSlop={10} disabled={loading}>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 20 }}>
            ¿Ya tienes cuenta? <Text style={{ fontFamily: F.semi, color: C.primary }}>Entrar</Text>
          </Text>
        </Pressable>

        {/* Los negocios se registran aparte: otra cuenta y otro formulario. */}
        <Fade delay={STAGGER * 7} desde={10}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 26, marginBottom: 14 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(13,13,13,0.08)' }} />
            <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED }}>¿Tienes un negocio?</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(13,13,13,0.08)' }} />
          </View>
          <PressableScale
            onPress={onNegocio}
            disabled={loading}
            accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(13,13,13,0.08)' }}>
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="storefront-outline" size={19} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Registrar mi negocio</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 1 }}>Recibe clientes recomendados y paga solo cuando vendes.</Text>
            </View>
            <Icon name="chevR" size={16} color={MUTED} />
          </PressableScale>
        </Fade>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
