import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { colorSector } from './sectores';

/**
 * Agrupar colonias en sectores es opcional. Se elige un sector y se tocan
 * colonias en el mapa para sumarlas o quitarlas; nada se guarda hasta «Guardar».
 */

export interface SectorBorrador {
  clave: string;
  nombre: string;
  colonias: string[];
}

export interface Borrador {
  sectores: SectorBorrador[];
  /** El sector que reciben los toques en el mapa. */
  activo: string | null;
}

let siguiente = 0;
export const claveNueva = () => `nuevo-${Date.now().toString(36)}-${siguiente++}`;

/** Una colonia tocada en el mapa: entra al sector activo, o sale si ya estaba. */
export function alternarColonia(b: Borrador, colonia: string): Borrador {
  if (!b.activo) return b;
  const yaEstaba = b.sectores.find((s) => s.clave === b.activo)?.colonias.includes(colonia) ?? false;
  return {
    ...b,
    sectores: b.sectores.map((s) => {
      const sin = s.colonias.filter((c) => c !== colonia);
      return s.clave === b.activo && !yaEstaba ? { ...s, colonias: [...sin, colonia] } : { ...s, colonias: sin };
    }),
  };
}

/** Qué color lleva cada colonia en el mapa mientras se edita. */
export function coloresDe(b: Borrador): Map<string, string> {
  const m = new Map<string, string>();
  b.sectores.forEach((s, i) => {
    for (const c of s.colonias) m.set(c, colorSector(i));
  });
  return m;
}

export function EncabezadoEditor({ guardando, alCancelar, alGuardar }: { guardando: boolean; alCancelar: () => void; alGuardar: () => void }) {
  return (
    <Fade key="editor" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 12 }}>
      <PressableScale onPress={alCancelar} hitSlop={8} accessibilityRole="button" accessibilityLabel="Salir sin guardar" style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(13,13,13,0.06)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="x" size={15} color={FG} />
      </PressableScale>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 18, color: FG, letterSpacing: -0.3 }}>Organizar sectores</Text>
        <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED }}>Toca colonias para sumarlas al sector elegido</Text>
      </View>
      <PressableScale onPress={alGuardar} disabled={guardando} accessibilityRole="button" style={{ minWidth: 84, height: 36, paddingHorizontal: 14, borderRadius: 999, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', opacity: guardando ? 0.7 : 1 }}>
        {guardando ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Guardar</Text>}
      </PressableScale>
    </Fade>
  );
}

function Boton({ icono, texto, alTocar, principal }: { icono: React.ComponentProps<typeof Ionicons>['name']; texto: string; alTocar: () => void; principal?: boolean }) {
  return (
    <PressableScale
      onPress={alTocar}
      accessibilityRole="button"
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: R.md, backgroundColor: principal ? C.primary : '#fff', borderWidth: principal ? 0 : StyleSheet.hairlineWidth, borderColor: 'rgba(13,13,13,0.12)' }}>
      <Ionicons name={icono} size={17} color={principal ? '#fff' : FG} />
      <Text style={{ fontFamily: F.semi, fontSize: 13, color: principal ? '#fff' : FG }}>{texto}</Text>
    </PressableScale>
  );
}

function FilaSector({
  sector,
  indice,
  activo,
  nombreColonia,
  alActivar,
  alRenombrar,
  alBorrar,
  alQuitarColonia,
}: {
  sector: SectorBorrador;
  indice: number;
  activo: boolean;
  nombreColonia: (id: string) => string;
  alActivar: () => void;
  alRenombrar: (nombre: string) => void;
  alBorrar: () => void;
  alQuitarColonia: (id: string) => void;
}) {
  const color = colorSector(indice);
  return (
    <Fade delay={Math.min(indice, 6) * STAGGER} desde={8}>
      {/* Sin botones anidados: la fila es una caja y cada parte toca por su cuenta. */}
      <View style={{ backgroundColor: '#fff', borderRadius: R.md, padding: 12, marginBottom: 8, borderWidth: activo ? 1.5 : StyleSheet.hairlineWidth, borderColor: activo ? color : 'rgba(13,13,13,0.08)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <PressableScale onPress={alActivar} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: activo }} accessibilityLabel={`Elegir el sector ${sector.nombre} para tocar colonias`} style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: activo ? color : 'transparent' }}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color }} />
          </PressableScale>
          <TextInput
            value={sector.nombre}
            onChangeText={alRenombrar}
            onFocus={alActivar}
            maxLength={40}
            placeholder={`Sector ${indice + 1}`}
            placeholderTextColor={MUTED}
            accessibilityLabel="Nombre del sector"
            style={{ flex: 1, fontFamily: F.semi, fontSize: 14, color: FG, padding: 0 }}
          />
          <PressableScale onPress={alActivar} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${sector.colonias.length} colonias en ${sector.nombre}`}>
            <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED }}>
              {sector.colonias.length} {sector.colonias.length === 1 ? 'colonia' : 'colonias'}
            </Text>
          </PressableScale>
          <PressableScale onPress={alBorrar} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Borrar el sector ${sector.nombre}`} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={16} color={MUTED} />
          </PressableScale>
        </View>
        {activo ? (
          <Fade desde={4} style={{ marginTop: 10 }}>
            {sector.colonias.length === 0 ? (
              <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED }}>Toca colonias en el mapa para sumarlas aquí.</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {sector.colonias.map((id) => (
                  <PressableScale key={id} onPress={() => alQuitarColonia(id)} accessibilityRole="button" accessibilityLabel={`Quitar ${nombreColonia(id)} del sector`} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 10, paddingRight: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: `${color}1A` }}>
                    <Text style={{ fontFamily: F.base, fontSize: 11.5, color: FG }}>{nombreColonia(id)}</Text>
                    <Icon name="x" size={11} color={MUTED} />
                  </PressableScale>
                ))}
              </View>
            )}
          </Fade>
        ) : (
          <PressableScale onPress={alActivar} accessibilityRole="button" style={{ marginTop: 8 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: color }}>Elegir para tocar colonias</Text>
          </PressableScale>
        )}
      </View>
    </Fade>
  );
}

export function CuerpoEditor({
  borrador,
  totalColonias,
  nombreColonia,
  sectoresPropuesta,
  error,
  relleno,
  alCambiar,
  alUsarPropuesta,
}: {
  borrador: Borrador;
  totalColonias: number;
  nombreColonia: (id: string) => string;
  sectoresPropuesta: number;
  error: string | null;
  relleno: number;
  alCambiar: (b: Borrador) => void;
  alUsarPropuesta: () => void;
}) {
  const { sectores, activo } = borrador;
  const conSector = sectores.reduce((t, s) => t + s.colonias.length, 0);
  const libres = totalColonias - conSector;

  const nuevo = () => {
    const clave = claveNueva();
    alCambiar({ sectores: [...sectores, { clave, nombre: `Sector ${sectores.length + 1}`, colonias: [] }], activo: clave });
  };
  const cambiarSector = (clave: string, cambio: Partial<SectorBorrador>) => alCambiar({ ...borrador, sectores: sectores.map((s) => (s.clave === clave ? { ...s, ...cambio } : s)) });
  const borrar = (clave: string) => {
    const resto = sectores.filter((s) => s.clave !== clave);
    alCambiar({ sectores: resto, activo: activo === clave ? (resto[0]?.clave ?? null) : activo });
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: relleno }}>
      {error && (
        <Fade>
          <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 }}>
            <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
          </View>
        </Fade>
      )}

      {sectores.length === 0 ? (
        <Fade desde={8}>
          <View style={{ padding: 14, borderRadius: R.md, backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(13,13,13,0.08)' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: FG }}>Sin sectores, el mapa muestra las colonias tal cual</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 12, lineHeight: 17, color: MUTED, marginTop: 4 }}>
              Si quieren repartir la ciudad en zonas más grandes, crea un sector y toca sus colonias. Se puede deshacer cuando sea.
            </Text>
          </View>
          <View style={{ gap: 8, marginTop: 10 }}>
            <Boton icono="add" texto="Nuevo sector" principal alTocar={nuevo} />
            {sectoresPropuesta > 0 && <Boton icono="layers-outline" texto={`Empezar con la propuesta (${sectoresPropuesta} sectores)`} alTocar={alUsarPropuesta} />}
          </View>
        </Fade>
      ) : (
        <>
          {sectores.map((s, i) => (
            <FilaSector
              key={s.clave}
              sector={s}
              indice={i}
              activo={s.clave === activo}
              nombreColonia={nombreColonia}
              alActivar={() => s.clave !== activo && alCambiar({ ...borrador, activo: s.clave })}
              alRenombrar={(nombre) => cambiarSector(s.clave, { nombre })}
              alBorrar={() => borrar(s.clave)}
              alQuitarColonia={(id) => cambiarSector(s.clave, { colonias: s.colonias.filter((c) => c !== id) })}
            />
          ))}
          <Fade delay={STAGGER} desde={8} style={{ gap: 8, marginTop: 2 }}>
            <Boton icono="add" texto="Nuevo sector" alTocar={nuevo} />
          </Fade>
          <Fade delay={STAGGER * 2} desde={8} style={{ marginTop: 14, alignItems: 'center', gap: 10 }}>
            <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, textAlign: 'center' }}>
              {libres === 0 ? 'Todas las colonias tienen sector.' : `${libres} ${libres === 1 ? 'colonia queda' : 'colonias quedan'} sin sector. Los sectores vacíos no se guardan.`}
            </Text>
            <PressableScale onPress={() => alCambiar({ sectores: [], activo: null })} accessibilityRole="button" hitSlop={6}>
              <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.accent }}>Quitar todos los sectores</Text>
            </PressableScale>
          </Fade>
        </>
      )}
    </ScrollView>
  );
}
