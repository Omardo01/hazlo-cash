import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Fade, PressableScale, STAGGER } from '../motion';
import { BG, C, F, FG, MUTED, R } from '../theme';
import {
  MaquetaAvisos,
  MaquetaBienvenida,
  MaquetaCuenta,
  MaquetaDetalleComision,
  MaquetaEstados,
  MaquetaFichaNegocio,
  MaquetaNegocioCreditos,
  MaquetaNiveles,
  MaquetaRendimiento,
} from './maquetas';

/**
 * /sugerencias — catálogo de pantallas propuestas para decidir qué construir.
 * Cada propuesta trae su maqueta (estática, con datos de ejemplo), para qué
 * sirve y dónde viviría. No toca datos ni requiere sesión.
 */

type Audiencia = 'Cliente / Embajador' | 'Negocio' | 'Todos';
type Prioridad = 'Alta' | 'Media' | 'Baja';

interface Propuesta {
  titulo: string;
  audiencia: Audiencia;
  prioridad: Prioridad;
  porque: string;
  donde: string;
  Maqueta: () => React.ReactElement;
}

const PROPUESTAS: Propuesta[] = [
  {
    titulo: 'Ficha del negocio',
    audiencia: 'Cliente / Embajador',
    prioridad: 'Alta',
    porque: 'Hoy tocar un negocio en Descubre no abre nada. Es el paso que convierte curiosidad en orden: beneficio, horario, cómo llegar y reseñas verificadas.',
    donde: 'Al tocar un negocio en Descubre o en "Con promoción".',
    Maqueta: MaquetaFichaNegocio,
  },
  {
    titulo: 'Centro de avisos',
    audiencia: 'Todos',
    prioridad: 'Alta',
    porque: 'La campana de Inicio no hace nada. Aquí queda el historial de lo que llega en vivo (ventas, comisiones, retiros), para quien no vio el aviso a tiempo.',
    donde: 'Campana de Inicio e Inicio 2.',
    Maqueta: MaquetaAvisos,
  },
  {
    titulo: 'Cuenta, privacidad y borrar cuenta',
    audiencia: 'Todos',
    prioridad: 'Alta',
    porque: 'Hoy no se puede editar el perfil. Además, Google Play y App Store exigen poder borrar la cuenta desde la app, y la ley mexicana pide el aviso de privacidad.',
    donde: 'Perfil → "Cuenta y verificación" y "Privacidad" (hoy en "Pronto").',
    Maqueta: MaquetaCuenta,
  },
  {
    titulo: 'Sin conexión, errores y contraseña',
    audiencia: 'Todos',
    prioridad: 'Alta',
    porque: 'En la calle la señal falla. Mensajes claros ("tu dinero está a salvo") evitan que la gente crea que perdió algo. Y hoy no hay forma de recuperar la contraseña.',
    donde: 'Banner global, listas que fallan y "¿Olvidaste tu contraseña?" en la entrada.',
    Maqueta: MaquetaEstados,
  },
  {
    titulo: 'Detalle de una comisión',
    audiencia: 'Cliente / Embajador',
    prioridad: 'Media',
    porque: 'Dinero es confianza: el embajador ve paso a paso de dónde salió cada peso, con la regla del negocio y el folio.',
    donde: 'Al tocar una comisión en Actividad o en Movimientos.',
    Maqueta: MaquetaDetalleComision,
  },
  {
    titulo: 'Cómo van tus códigos',
    audiencia: 'Cliente / Embajador',
    prioridad: 'Media',
    porque: 'El embajador no sabe si su recomendación funciona. El embudo (abrieron → reclamaron → compraron) le dice dónde insistir y lo motiva a compartir más.',
    donde: 'Nueva sección en Actividad o en Recomendar.',
    Maqueta: MaquetaRendimiento,
  },
  {
    titulo: 'Niveles con beneficios',
    audiencia: 'Cliente / Embajador',
    prioridad: 'Media',
    porque: 'Hoy el nivel Plata aparece pero no dice qué gana. Mostrar el premio de subir es lo que mantiene recomendando, y refuerza el anti-bypass (solo cuentan ventas dentro).',
    donde: 'Al tocar la tarjeta de nivel en Perfil.',
    Maqueta: MaquetaNiveles,
  },
  {
    titulo: 'Créditos y QR de mostrador',
    audiencia: 'Negocio',
    prioridad: 'Media',
    porque: 'El negocio se entera de que no tiene créditos cuando ya no puede confirmar una venta. El aviso anticipado y el historial evitan ese mal momento; el QR impreso trae clientes solos.',
    donde: 'Pestaña "Mi negocio".',
    Maqueta: MaquetaNegocioCreditos,
  },
  {
    titulo: 'Bienvenida la primera vez',
    audiencia: 'Cliente / Embajador',
    prioridad: 'Baja',
    porque: 'Quien llega por un link no conoce el modelo. Tres pantallas (Recomienda · Gana · Crece) explican el trato antes de pedir nada.',
    donde: 'Después del registro, una sola vez.',
    Maqueta: MaquetaBienvenida,
  },
];

const FILTROS: ('Todas' | Audiencia)[] = ['Todas', 'Cliente / Embajador', 'Negocio', 'Todos'];
const ETIQUETA_FILTRO: Record<(typeof FILTROS)[number], string> = {
  Todas: 'Todas',
  'Cliente / Embajador': 'Cliente / Embajador',
  Negocio: 'Negocio',
  Todos: 'Para todos',
};

const COLOR_PRIORIDAD: Record<Prioridad, { fg: string; bg: string }> = {
  Alta: { fg: C.accent, bg: 'rgba(235,78,0,0.12)' },
  Media: { fg: '#B7791F', bg: 'rgba(245,166,35,0.16)' },
  Baja: { fg: MUTED, bg: 'rgba(13,13,13,0.06)' },
};

const ALTO_MAQUETA = 680;
const ANCHO_TARJETA = 372;

function TarjetaPropuesta({ p, n, ancho, delay }: { p: Propuesta; n: number; ancho: number; delay: number }) {
  const prio = COLOR_PRIORIDAD[p.prioridad];
  return (
    <Fade delay={delay} desde={14} style={{ width: ancho }}>
      <View style={{ borderRadius: R.lg, padding: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 12, color: MUTED }}>{String(n).padStart(2, '0')}</Text>
          <Text style={{ flex: 1, fontFamily: F.bold, fontSize: 16, color: FG, letterSpacing: -0.2 }}>{p.titulo}</Text>
          <View style={{ paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999, backgroundColor: prio.bg }}>
            <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: prio.fg }}>{p.prioridad}</Text>
          </View>
        </View>
        <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary, marginTop: 6 }}>{p.audiencia === 'Todos' ? 'Para todos' : p.audiencia}</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: FG, marginTop: 6, lineHeight: 18 }}>{p.porque}</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 6, lineHeight: 16 }}>
          <Text style={{ fontFamily: F.semi }}>Dónde: </Text>
          {p.donde}
        </Text>

        {/* Pantalla de la maqueta: alto fijo de teléfono, recorte redondeado. */}
        <View style={{ marginTop: 12, height: ALTO_MAQUETA, borderRadius: 28, borderWidth: 6, borderColor: '#0D0D0D', overflow: 'hidden', backgroundColor: BG }}>
          <p.Maqueta />
        </View>
        <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: MUTED, textAlign: 'center', marginTop: 8 }}>Maqueta · datos de ejemplo, no funciona todavía</Text>
      </View>
    </Fade>
  );
}

export function Sugerencias() {
  const { width } = useWindowDimensions();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>('Todas');

  // En el teléfono una columna a lo ancho; en pantallas grandes, rejilla.
  const ancho = Math.min(ANCHO_TARJETA, width - 32);
  const visibles = PROPUESTAS.filter((p) => filtro === 'Todas' || p.audiencia === filtro);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48 }}>
          <View style={{ maxWidth: 1180, width: '100%', alignSelf: 'center' }}>
            <Fade desde={8}>
              <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary, letterSpacing: 0.8 }}>HAZLO CASH · PROPUESTAS</Text>
              <Text style={{ fontFamily: F.bold, fontSize: 28, color: FG, letterSpacing: -0.7, marginTop: 4 }}>Sugerencias de UI</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19, maxWidth: 620 }}>
                Pantallas que le faltan a la app, ordenadas por prioridad. Son maquetas para decidir: cuando apruebes una, se construye con datos reales.
              </Text>
            </Fade>

            <Fade delay={STAGGER} desde={8}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 16 }}>
                {FILTROS.map((f) => {
                  const on = filtro === f;
                  const cuantas = f === 'Todas' ? PROPUESTAS.length : PROPUESTAS.filter((p) => p.audiencia === f).length;
                  return (
                    <PressableScale
                      key={f}
                      onPress={() => setFiltro(f)}
                      style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: on ? FG : '#fff', borderWidth: on ? 0 : 1, borderColor: 'rgba(0,0,0,0.08)' }}>
                      <Text style={{ fontFamily: F.semi, fontSize: 12, color: on ? '#fff' : FG }}>{ETIQUETA_FILTRO[f]}</Text>
                      <Text style={{ fontFamily: F.semi, fontSize: 11, color: on ? 'rgba(255,255,255,0.6)' : MUTED }}>{cuantas}</Text>
                    </PressableScale>
                  );
                })}
              </ScrollView>
            </Fade>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
              {visibles.map((p, i) => (
                <TarjetaPropuesta key={`${filtro}-${p.titulo}`} p={p} n={PROPUESTAS.indexOf(p) + 1} ancho={ancho} delay={Math.min(i, 6) * STAGGER} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
