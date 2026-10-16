import { useState } from 'react';
import { Linking, Platform, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { HazloMark } from '../HazloMark';
import { Icon, type IconName } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { BG, C, F, FG, MUTED, R } from '../theme';

/**
 * /requerimientos — qué hace falta para publicar Hazlo Cash en Google Play y
 * App Store, en qué estado está la app hoy y los pasos en orden.
 *
 * Revisado el 5 de octubre de 2026 contra la configuración real del proyecto
 * (app.json, eas.json, React Native 0.81 → targetSdk 36) y las políticas
 * vigentes de cada tienda. Las políticas cambian: antes de enviar, confirmar
 * en los enlaces de "Fuentes".
 */

type Tienda = 'Google Play' | 'App Store' | 'Ambas';
type Estado = 'listo' | 'falta' | 'decidir';

const TEAL = '#00A896';
const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'ui-monospace, Menlo, monospace' });
const AMBAR = '#B7791F';

const ESTADO: Record<Estado, { label: string; color: string; bg: string; icon: IconName }> = {
  listo: { label: 'Listo', color: '#007F71', bg: 'rgba(0,168,150,0.12)', icon: 'check' },
  falta: { label: 'Falta', color: C.accent, bg: 'rgba(235,78,0,0.10)', icon: 'x' },
  decidir: { label: 'Decisión', color: AMBAR, bg: 'rgba(245,166,35,0.16)', icon: 'star' },
};

/* ─── Registro en cada tienda ─────────────────────────────────────────────── */

const REGISTRO: { tienda: 'Google Play' | 'App Store'; costo: string; datos: { k: string; v: string }[] }[] = [
  {
    tienda: 'Google Play',
    costo: '$25 USD · pago único',
    datos: [
      { k: 'Tipo de cuenta', v: 'Organización. Google exige cuenta de organización para productos y servicios financieros, y las cuentas personales nuevas no pueden publicar hasta hacer una prueba cerrada con 12 testers durante 14 días seguidos.' },
      { k: 'Documentos', v: 'Número D-U-N-S de la empresa, nombre legal, dirección, sitio web, teléfono y correo de contacto verificados, e identificación de quien la registra.' },
      { k: 'Requisito técnico', v: 'Desde el 31 de agosto de 2026 las apps nuevas deben apuntar a Android 16 (API 36). Hazlo Cash ya cumple: React Native 0.81 compila con targetSdk 36.' },
      { k: 'Formato', v: 'Android App Bundle (.aab), firmado con Play App Signing. EAS ya lo genera con el perfil production.' },
    ],
  },
  {
    tienda: 'App Store',
    costo: '$99 USD · por año',
    datos: [
      { k: 'Tipo de cuenta', v: 'Organización. La regla 5.1.1(ix) pide que las apps de servicios financieros las publique la entidad legal que da el servicio, no una persona.' },
      { k: 'Documentos', v: 'Persona moral con nombre legal, D-U-N-S (gratis), sitio web con dominio propio, correo con ese dominio, autoridad para firmar contratos y un Apple ID con verificación en dos pasos.' },
      { k: 'Requisito técnico', v: 'Se construye y se sube con EAS (no hace falta una Mac). Sí hace falta un iPhone para probar con TestFlight.' },
      { k: 'Cuestionarios', v: 'Clasificación por edad (sistema nuevo 4+, 9+, 13+, 16+, 18+), privacidad de la app (App Privacy) y cifrado de exportación.' },
    ],
  },
];

/* ─── Estado de Hazlo Cash hoy ────────────────────────────────────────────── */

const CHECKLIST: { grupo: string; items: { t: string; tienda: Tienda; estado: Estado; detalle: string }[] }[] = [
  {
    grupo: 'Cuenta y empresa',
    items: [
      { t: 'Quién es el dueño de la cuenta', tienda: 'Ambas', estado: 'decidir', detalle: 'Por manejar dinero (comisiones, saldo, retiros) ambas tiendas piden una empresa, no una persona. Definir con tu socio la persona moral que será titular y quién tendrá acceso de administrador.' },
      { t: 'D-U-N-S, dominio y correo de la empresa', tienda: 'Ambas', estado: 'falta', detalle: 'El D-U-N-S es gratis y se pide desde la herramienta de Apple; tarda de días a un par de semanas. El dominio también sirve para el aviso de privacidad y el soporte.' },
      { t: 'Revisión legal del saldo y los retiros', tienda: 'Ambas', estado: 'decidir', detalle: 'Guardar saldo a nombre de usuarios y dejarlos retirarlo puede caer en regulación financiera (Ley Fintech). Confirmar con un abogado cómo estructurarlo con el proveedor de pagos (SPEI) antes de activar retiros reales, y con un contador cómo se facturan y retienen las comisiones.' },
    ],
  },
  {
    grupo: 'En la app (código)',
    items: [
      { t: 'Android 16 (API 36)', tienda: 'Google Play', estado: 'listo', detalle: 'Expo SDK 54 con React Native 0.81 ya compila con targetSdk 36.' },
      { t: 'Build de producción', tienda: 'Ambas', estado: 'listo', detalle: 'eas.json ya tiene el perfil production con App Bundle y número de versión automático.' },
      { t: 'Permiso de cámara explicado', tienda: 'Ambas', estado: 'listo', detalle: 'El plugin de expo-camera ya explica para qué se usa: escanear el QR y confirmar la venta.' },
      { t: 'Identificador de iOS', tienda: 'App Store', estado: 'falta', detalle: 'app.json tiene el package de Android (com.hazlocash.app) pero no ios.bundleIdentifier. Agregarlo antes del primer build de iOS: después no se puede cambiar.' },
      { t: 'Quitar el permiso de micrófono', tienda: 'Ambas', estado: 'falta', detalle: 'app.json pide RECORD_AUDIO y la app nunca graba audio. Un permiso sin uso es motivo común de rechazo: quitarlo y apagar el micrófono en el plugin de expo-camera.' },
      { t: 'Borrar la cuenta desde la app', tienda: 'Ambas', estado: 'falta', detalle: 'Obligatorio en las dos tiendas si la app permite crear cuenta. Google además pide una página web para solicitarlo sin tener la app instalada.' },
      { t: 'Aviso de privacidad y términos', tienda: 'Ambas', estado: 'falta', detalle: 'URL pública con el aviso de privacidad (ley mexicana de datos personales) y los términos, enlazados desde el registro y desde Perfil.' },
      { t: 'Recuperar contraseña', tienda: 'Ambas', estado: 'falta', detalle: 'Un revisor que olvida o cambia la contraseña de la cuenta demo se queda fuera. También lo esperan los usuarios reales.' },
      { t: 'Ocultar lo que no funciona', tienda: 'Ambas', estado: 'falta', detalle: 'En la versión que se manda a revisión no deben aparecer: la invitación con código falso ("gana $5 por amigo"), los retiros simulados, los ajustes marcados "Pronto", el selector "Prueba · vista" ni los dos Inicios. Las tiendas rechazan funciones de mentira o incompletas.' },
      { t: 'Páginas internas', tienda: 'Ambas', estado: 'listo', detalle: '/lab, /sugerencias, /ia y esta página ya no se muestran en las versiones de producción del teléfono.' },
      { t: 'Declarar el cifrado', tienda: 'App Store', estado: 'falta', detalle: 'La app sólo usa HTTPS: poner usesNonExemptEncryption en false en app.json para no contestar la pregunta en cada build.' },
      { t: 'Servidor encendido durante la revisión', tienda: 'Ambas', estado: 'falta', detalle: 'El plan gratis de Supabase se pausa tras 7 días sin uso. Si el revisor entra y la app no conecta, la rechazan. Pasar a un plan de pago antes de enviar, o como mínimo verificar el keepalive diario.' },
    ],
  },
  {
    grupo: 'Ficha de la tienda',
    items: [
      { t: 'Textos', tienda: 'Ambas', estado: 'falta', detalle: 'Nombre (hasta 30 caracteres), descripción corta de 80 (Google), subtítulo de 30 y palabras clave de 100 (Apple), descripción larga de hasta 4,000 y URL de soporte.' },
      { t: 'Ícono', tienda: 'Ambas', estado: 'listo', detalle: 'Ya existe el ícono adaptativo de Android. Google pide además uno de 512×512 y Apple usa el de 1024×1024 sin transparencia, ambos generados del mismo arte.' },
      { t: 'Capturas de pantalla', tienda: 'Ambas', estado: 'falta', detalle: 'Google: mínimo 2 capturas de teléfono más un gráfico destacado de 1024×500. Apple: capturas de iPhone de 6.9" (1320×2868 o 1290×2796). Se pueden sacar del laboratorio web.' },
      { t: 'Video', tienda: 'Google Play', estado: 'listo', detalle: 'La promo "Recomienda" sirve como video de YouTube en Google Play. En Apple el video de vista previa debe ser grabación real de la app, no una animación.' },
      { t: 'Cuestionarios', tienda: 'Ambas', estado: 'falta', detalle: 'Google: seguridad de los datos, clasificación de contenido, público objetivo (sugerido: mayores de 18), anuncios y funciones financieras. Apple: privacidad de la app y clasificación por edad.' },
      { t: 'Cuentas demo para los revisores', tienda: 'Ambas', estado: 'listo', detalle: 'Ya existen cuentas demo por rol. Mandar una por rol (cliente/embajador y negocio) con instrucciones paso a paso, sin el selector de vistas.' },
    ],
  },
];

/* ─── Pasos a seguir ──────────────────────────────────────────────────────── */

const PASOS: { t: string; d: string; tiempo: string; cmd?: string }[] = [
  { t: 'Decidir el titular y formalizar la empresa', d: 'Persona moral con RFC, dominio y correo propios. Es la base de todo lo demás.', tiempo: '1–3 semanas' },
  { t: 'Pedir el D-U-N-S', d: 'Gratis, desde la herramienta de Apple con los datos de la empresa. Sirve para las dos tiendas.', tiempo: '≈ 1–2 semanas' },
  { t: 'Abrir las cuentas de desarrollador', d: 'Play Console como organización ($25) y Apple Developer Program como organización ($99/año). Darte acceso de administrador.', tiempo: '2–7 días' },
  { t: 'Publicar la parte legal', d: 'Aviso de privacidad, términos y página "Borrar mi cuenta" en el dominio de la empresa.', tiempo: '1 semana' },
  { t: 'Ajustar la app', d: 'Todo lo marcado "Falta" en la sección de código: bundleIdentifier, micrófono, borrar cuenta, recuperar contraseña, ocultar maquetas, cifrado y servidor estable.', tiempo: '1–2 semanas' },
  { t: 'Subir las claves de producción a EAS', d: 'Igual que con preview, pero para el entorno production.', tiempo: '10 min', cmd: 'npx eas-cli env:push production' },
  { t: 'Construir y subir', d: 'EAS construye en la nube el .aab de Android y el .ipa de iOS, y los sube a cada tienda.', tiempo: '1 día', cmd: 'npx eas-cli build --platform all --profile production' },
  { t: 'Probar antes de enviar', d: 'Google: prueba interna con el equipo (y prueba cerrada de 12 testers por 14 días si la cuenta fuera personal). Apple: TestFlight en tu iPhone.', tiempo: '3–14 días' },
  { t: 'Llenar la ficha y los cuestionarios', d: 'Textos, capturas, video, seguridad de datos, clasificación, público objetivo y funciones financieras.', tiempo: '1–2 días' },
  { t: 'Enviar a revisión', d: 'Con las cuentas demo, la nota para el revisor y el servidor encendido. Si rechazan, contestar en el mismo hilo con el arreglo.', tiempo: '1–7 días por intento' },
  { t: 'Lanzar por etapas', d: 'En Google, lanzamiento escalonado (10% → 50% → 100%) para detectar fallas con pocos usuarios.', tiempo: '1 semana' },
];

const NOTA_REVISOR = `Hazlo Cash is a referral marketplace for local businesses in Mexico.
A user recommends a business with a personal code. When a friend buys there in person, the business confirms the sale by scanning the friend's QR code, and the recommender earns a commission.
All purchases happen offline at the physical business (guideline 3.1.3(e)); the app does not sell digital content or use in-app purchases.

Demo accounts (same password for both):
• Customer / Ambassador: [correo de la cuenta demo]
• Business: [correo de la cuenta demo]
Password: [contraseña de las cuentas demo]

To test the full flow:
1. Ambassador → "Recomienda" → choose a business → share the code.
2. Customer → "+" → "Reclamar recomendación" → enter the code → an order QR appears.
3. Business → "Solicitudes" → "Escanear QR del cliente" → the sale is confirmed and the commission appears in the ambassador's activity.`;

const FUENTES: { t: string; url: string }[] = [
  { t: 'Google Play: requisitos de prueba para cuentas personales nuevas', url: 'https://support.google.com/googleplay/android-developer/answer/14151465' },
  { t: 'Google Play: tipos de cuenta y apps que requieren organización', url: 'https://support.google.com/googleplay/android-developer/answer/13634885' },
  { t: 'Google Play: nivel de API objetivo', url: 'https://developer.android.com/google/play/requirements/target-sdk' },
  { t: 'Google Play: eliminación de cuenta', url: 'https://support.google.com/googleplay/android-developer/answer/13327111' },
  { t: 'App Store Review Guidelines (5.1.1, 3.1.3, 2.1)', url: 'https://developer.apple.com/app-store/review/guidelines/' },
  { t: 'Apple Developer Program: inscripción como organización', url: 'https://developer.apple.com/programs/enroll/' },
  { t: 'Apple: clasificación por edad', url: 'https://developer.apple.com/help/app-store-connect/reference/age-ratings-values-and-definitions/' },
  { t: 'Expo: enviar a las tiendas con EAS', url: 'https://docs.expo.dev/submit/introduction/' },
];

/* ─── UI ──────────────────────────────────────────────────────────────────── */

const FILTROS: ('Todo' | 'Google Play' | 'App Store')[] = ['Todo', 'Google Play', 'App Store'];

function Titulo({ children, sub }: { children: string; sub?: string }) {
  return (
    <View style={{ marginTop: 30, marginBottom: 12 }}>
      <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>{children}</Text>
      {sub ? <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 3, lineHeight: 18 }}>{sub}</Text> : null}
    </View>
  );
}

function Chip({ texto, color, bg }: { texto: string; color: string; bg: string }) {
  return (
    <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: bg }}>
      <Text style={{ fontFamily: F.semi, fontSize: 10.5, color }}>{texto}</Text>
    </View>
  );
}

export function Requerimientos() {
  const { width } = useWindowDimensions();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>('Todo');
  const ancho = width >= 900;

  const aplica = (t: Tienda) => filtro === 'Todo' || t === 'Ambas' || t === filtro;
  const todos = CHECKLIST.flatMap((g) => g.items).filter((i) => aplica(i.tienda));
  const cuenta = (e: Estado) => todos.filter((i) => i.estado === e).length;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 56 }}>
        {/* Portada */}
        <View style={{ backgroundColor: '#0D0D0D', overflow: 'hidden' }}>
          <SafeAreaView edges={['top']}>
            <View style={{ position: 'absolute', right: -50, top: -30, opacity: 0.35 }}>
              <HazloMark size={240} />
            </View>
            <View style={{ maxWidth: 1100, width: '100%', alignSelf: 'center', paddingHorizontal: 16, paddingTop: 22, paddingBottom: 26 }}>
              <Fade desde={8}>
                <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary, letterSpacing: 0.8 }}>HAZLO CASH · PUBLICACIÓN</Text>
                <Text style={{ fontFamily: F.bold, fontSize: 30, color: '#fff', letterSpacing: -0.8, marginTop: 6 }}>Requisitos para Google Play y App Store</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 13.5, color: 'rgba(255,255,255,0.7)', marginTop: 8, lineHeight: 20, maxWidth: 680 }}>
                  Qué se necesita para registrarse, cómo está la app hoy frente a lo que revisan y los pasos en orden. Revisado el 5 de octubre de 2026 contra el código del proyecto y las políticas vigentes.
                </Text>
              </Fade>
              <Fade delay={STAGGER} desde={8}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
                  {(['listo', 'falta', 'decidir'] as Estado[]).map((e) => (
                    <View key={e} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: e === 'listo' ? TEAL : e === 'falta' ? C.primary : '#F5A623' }} />
                      <Text style={{ fontFamily: F.bold, fontSize: 14, color: '#fff' }}>{cuenta(e)}</Text>
                      <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>{ESTADO[e].label.toLowerCase()}</Text>
                    </View>
                  ))}
                </View>
              </Fade>
            </View>
          </SafeAreaView>
        </View>

        <View style={{ maxWidth: 1100, width: '100%', alignSelf: 'center', paddingHorizontal: 16 }}>
          {/* Filtro por tienda */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 20 }}>
            {FILTROS.map((f) => {
              const on = filtro === f;
              return (
                <PressableScale
                  key={f}
                  onPress={() => setFiltro(f)}
                  style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? FG : '#fff', borderWidth: on ? 0 : 1, borderColor: 'rgba(0,0,0,0.08)' }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 12, color: on ? '#fff' : FG }}>{f}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>

          {/* Registro */}
          <Titulo sub="Lo que pide cada tienda para abrir la cuenta y aceptar la app.">Para registrarse</Titulo>
          <View style={{ flexDirection: ancho ? 'row' : 'column', gap: 12 }}>
            {REGISTRO.filter((r) => filtro === 'Todo' || r.tienda === filtro).map((r, i) => (
              <Fade key={r.tienda} delay={STAGGER * i} desde={12} style={{ flex: 1 }}>
                <View style={{ borderRadius: R.lg, padding: 18, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', height: ancho ? '100%' : undefined }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: F.bold, fontSize: 18, color: FG }}>{r.tienda}</Text>
                    <Chip texto={r.costo} color={C.accent} bg={`${C.primary}18`} />
                  </View>
                  {r.datos.map((d) => (
                    <View key={d.k} style={{ marginTop: 12 }}>
                      <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: MUTED, letterSpacing: 0.6, textTransform: 'uppercase' }}>{d.k}</Text>
                      <Text style={{ fontFamily: F.reg, fontSize: 13, color: FG, marginTop: 3, lineHeight: 19 }}>{d.v}</Text>
                    </View>
                  ))}
                </View>
              </Fade>
            ))}
          </View>

          {/* Estado de la app */}
          <Titulo sub="Revisado contra app.json, eas.json y las pantallas actuales.">Cómo está Hazlo Cash hoy</Titulo>
          {CHECKLIST.map((g, gi) => {
            const items = g.items.filter((i) => aplica(i.tienda));
            if (items.length === 0) return null;
            return (
              <Fade key={g.grupo} delay={STAGGER * gi} desde={10} style={{ marginBottom: 14 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 12, color: MUTED, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>{g.grupo}</Text>
                <View style={{ borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', paddingHorizontal: 14 }}>
                  {items.map((it, i) => {
                    const e = ESTADO[it.estado];
                    return (
                      <View key={it.t} style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: i < items.length - 1 ? 0.5 : 0, borderColor: 'rgba(0,0,0,0.06)' }}>
                        <View style={{ width: 30, height: 30, borderRadius: 30, backgroundColor: e.bg, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                          <Icon name={e.icon} size={15} color={e.color} sw={2.2} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{it.t}</Text>
                            <Chip texto={e.label} color={e.color} bg={e.bg} />
                            {it.tienda !== 'Ambas' ? <Chip texto={it.tienda} color={MUTED} bg="rgba(13,13,13,0.06)" /> : null}
                          </View>
                          <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 4, lineHeight: 18 }}>{it.detalle}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Fade>
            );
          })}

          {/* Pasos */}
          <Titulo sub="En orden. Del primer paso a la app publicada calcula de 4 a 8 semanas, casi todo en trámites.">Pasos a seguir</Titulo>
          <View style={{ borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', padding: 16 }}>
            {PASOS.map((p, i) => (
              <Fade key={p.t} delay={Math.min(i, 8) * STAGGER} desde={10} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 28, height: 28, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: '#fff' }}>{i + 1}</Text>
                  </View>
                  {i < PASOS.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 18, backgroundColor: `${C.primary}30`, marginVertical: 3 }} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: i < PASOS.length - 1 ? 16 : 0 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{p.t}</Text>
                    <Chip texto={p.tiempo} color={MUTED} bg="rgba(13,13,13,0.06)" />
                  </View>
                  <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 3, lineHeight: 18 }}>{p.d}</Text>
                  {p.cmd ? (
                    <View style={{ marginTop: 8, alignSelf: 'flex-start', paddingVertical: 7, paddingHorizontal: 11, borderRadius: 10, backgroundColor: '#0D0D0D' }}>
                      <Text style={{ fontFamily: MONO, fontSize: 12, color: '#F5F3F0' }}>{p.cmd}</Text>
                    </View>
                  ) : null}
                </View>
              </Fade>
            ))}
          </View>

          {/* Nota para el revisor */}
          <Titulo sub="Va en «Notas para el revisor» (Apple) y en «Acceso a la app» (Google). En inglés, que es lo que leen todos los revisores. Completa los datos entre corchetes al enviar.">Nota para el revisor</Titulo>
          <View style={{ borderRadius: R.md, backgroundColor: '#0D0D0D', padding: 16 }}>
            <Text style={{ fontFamily: MONO, fontSize: 12.5, color: '#F5F3F0', lineHeight: 19 }}>{NOTA_REVISOR}</Text>
          </View>

          {/* Riesgos de rechazo */}
          <Titulo sub="Lo que más probablemente haría que rechacen a Hazlo Cash hoy, de mayor a menor riesgo.">Riesgos de rechazo</Titulo>
          {[
            { t: 'Servidor caído durante la revisión', d: 'Supabase gratis se pausa: el revisor ve errores y rechaza por "app incompleta" (regla 2.1).' },
            { t: 'Funciones simuladas', d: 'Retiros que no mueven dinero y una invitación con código falso cuentan como contenido engañoso o de relleno.' },
            { t: 'Cuenta personal en vez de empresa', d: 'Apple pide entidad legal para servicios financieros (5.1.1(ix)) y Google exige cuenta de organización para productos financieros.' },
            { t: 'Sin borrar cuenta ni aviso de privacidad', d: 'Las dos tiendas lo revisan siempre que la app pide registro.' },
            { t: 'Permisos de más', d: 'El micrófono declarado sin uso contradice lo que se declara en seguridad de los datos.' },
          ].map((r, i) => (
            <Fade key={r.t} delay={Math.min(i, 6) * STAGGER} desde={10} style={{ flexDirection: 'row', gap: 12, padding: 14, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', marginBottom: 10 }}>
              <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.accent, width: 22 }}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{r.t}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 3, lineHeight: 18 }}>{r.d}</Text>
              </View>
            </Fade>
          ))}

          {/* Fuentes */}
          <Titulo sub="Las políticas cambian. Confirmar aquí antes de enviar.">Fuentes</Titulo>
          <View style={{ borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', paddingHorizontal: 14 }}>
            {FUENTES.map((f, i) => (
              <PressableScale
                key={f.url}
                onPress={() => Linking.openURL(f.url)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, borderBottomWidth: i < FUENTES.length - 1 ? 0.5 : 0, borderColor: 'rgba(0,0,0,0.06)' }}>
                <Icon name="share" size={15} color={C.primary} />
                <Text style={{ flex: 1, fontFamily: F.base, fontSize: 13, color: FG }}>{f.t}</Text>
                <Icon name="chevR" size={15} color={MUTED} />
              </PressableScale>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
