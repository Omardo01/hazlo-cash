import { Ionicons } from '@expo/vector-icons';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../icons';
import { grupoPorSlug } from '../categorias/catalogo';
import { IconoGrupo } from '../categorias/piezas';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { hueColors } from '../ui';
import { contarGiros, contarGrupos, nombreFiltro, type BaseMapa, type DatosMapa, type Filtro, type NegocioMapa, type Zona } from './datosEjemplo';
import type { Modo } from './Lienzo';
import { NIVELES } from './paleta';

const numero = (n: number) => n.toLocaleString('es-MX');

function PillEjemplo() {
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(13,13,13,0.06)' }}>
      <Text style={{ fontFamily: F.semi, fontSize: 9.5, color: MUTED }}>Datos de ejemplo</Text>
    </View>
  );
}

function PillNivel({ zona }: { zona: Zona }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(13,13,13,0.1)' }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: NIVELES[zona.nivel].muestra }} />
      <Text style={{ fontFamily: F.semi, fontSize: 10, color: FG }}>{NIVELES[zona.nivel].etiqueta}</Text>
    </View>
  );
}

function Cifras({ negocios, recomendadores, ventas }: { negocios: number; recomendadores: number; ventas: number }) {
  const datos: [string, number][] = [
    ['Negocios', negocios],
    ['Recomendadores', recomendadores],
    ['Ventas del mes', ventas],
  ];
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {datos.map(([etiqueta, valor], i) => (
        <Fade key={etiqueta} delay={i * STAGGER} desde={6} style={{ flex: 1 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: R.md, paddingVertical: 10, paddingHorizontal: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(13,13,13,0.07)' }}>
            <Text style={{ fontFamily: F.bold, fontSize: 18, color: FG, letterSpacing: -0.3 }}>{numero(valor)}</Text>
            <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 10, color: MUTED, marginTop: 1 }}>{etiqueta}</Text>
          </View>
        </Fade>
      ))}
    </View>
  );
}

/** Lo que siempre se ve de la hoja: de qué se está hablando. */
export function EncabezadoHoja({ zona, datos, filtro, alCerrar }: { zona: Zona | null; datos: DatosMapa; filtro: Filtro; alCerrar: () => void }) {
  const giro = nombreFiltro(filtro);
  if (!zona) {
    return (
      <Fade key="ciudad" style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>Villahermosa</Text>
          <PillEjemplo />
        </View>
        <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 1 }}>
          {giro ? `${giro} · ${datos.totales.negocios} ${datos.totales.negocios === 1 ? 'negocio' : 'negocios'}` : `${datos.sectores.length} sectores · ${datos.colonias.length} colonias`}
        </Text>
      </Fade>
    );
  }
  return (
    <Fade key={zona.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 12 }}>
      <PressableScale onPress={alCerrar} hitSlop={8} accessibilityRole="button" accessibilityLabel="Volver a toda la ciudad" style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(13,13,13,0.06)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="x" size={15} color={FG} />
      </PressableScale>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 18, color: FG, letterSpacing: -0.3 }}>{zona.nombre}</Text>
        <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED }}>{giro ?? zona.detalle}</Text>
      </View>
      <PillNivel zona={zona} />
    </Fade>
  );
}

function Rayitas({ nivel }: { nivel: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2.5, alignItems: 'flex-end' }}>
      {[1, 2, 3].map((n) => (
        <View key={n} style={{ width: 4, height: 4 + n * 3, borderRadius: 2, backgroundColor: n <= nivel ? C.primary : 'rgba(13,13,13,0.12)' }} />
      ))}
    </View>
  );
}

function FilaZona({ zona, indice, alTocar }: { zona: Zona; indice: number; alTocar: (z: Zona) => void }) {
  return (
    <Fade delay={Math.min(indice, 7) * STAGGER} desde={8}>
      <PressableScale
        onPress={() => alTocar(zona)}
        accessibilityRole="button"
        accessibilityLabel={`${zona.nombre}, ${zona.negocios} negocios, ${NIVELES[zona.nivel].etiqueta}`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: R.md, paddingVertical: 11, paddingHorizontal: 14, marginBottom: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(13,13,13,0.07)' }}>
        <Rayitas nivel={zona.nivel} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{zona.nombre}</Text>
          <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>
            {zona.negocios} {zona.negocios === 1 ? 'negocio' : 'negocios'} · {zona.recomendadores} {zona.recomendadores === 1 ? 'recomendador' : 'recomendadores'}
          </Text>
        </View>
        <Icon name="chevR" size={15} color={MUTED} />
      </PressableScale>
    </Fade>
  );
}

function FilaNegocio({ negocio, activo, indice, alTocar }: { negocio: NegocioMapa; activo: boolean; indice: number; alTocar: (n: NegocioMapa) => void }) {
  return (
    <Fade delay={Math.min(indice, 5) * STAGGER} desde={8}>
      <PressableScale
        onPress={() => alTocar(negocio)}
        accessibilityRole="button"
        accessibilityLabel={`${negocio.nombre}, ${negocio.giro}`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: R.md, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 8, borderWidth: activo ? 1.5 : StyleSheet.hairlineWidth, borderColor: activo ? FG : 'rgba(13,13,13,0.07)' }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: negocio.color, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={negocio.icono} size={18} color="#fff" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 13.5, color: FG }}>{negocio.nombre}</Text>
          <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>{negocio.giro} · {negocio.coloniaNombre}</Text>
          <Text numberOfLines={1} style={{ fontFamily: F.base, fontSize: 11, color: C.accent, marginTop: 2 }}>{negocio.oferta}</Text>
        </View>
      </PressableScale>
    </Fade>
  );
}

// Una ficha por grupo del catálogo o, dentro de un grupo, por giro.
function FichaGiro({ titulo, cuenta, grupoSlug, activa, indice, alTocar }: { titulo: string; cuenta: number; grupoSlug: string; activa: boolean; indice: number; alTocar: () => void }) {
  const grupo = grupoPorSlug(grupoSlug);
  return (
    <Fade delay={Math.min(indice, 5) * STAGGER} desde={8}>
      <PressableScale
        onPress={alTocar}
        accessibilityRole="button"
        accessibilityState={{ selected: activa }}
        accessibilityLabel={`${titulo}, ${cuenta} negocios`}
        style={{ width: 112, height: 112, padding: 10, borderRadius: R.md, backgroundColor: '#fff', justifyContent: 'space-between', borderWidth: activa ? 1.5 : StyleSheet.hairlineWidth, borderColor: activa ? FG : 'rgba(13,13,13,0.07)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {grupo && <IconoGrupo grupo={grupo} size={30} />}
          <Text style={{ fontFamily: F.bold, fontSize: 18, color: FG, letterSpacing: -0.3 }}>{cuenta}</Text>
        </View>
        <Text numberOfLines={3} style={{ fontFamily: F.base, fontSize: 11, lineHeight: 14, color: FG }}>{titulo}</Text>
      </PressableScale>
    </Fade>
  );
}

/** Cómo se reparten los negocios por giro; tocar uno filtra todo el mapa. */
function PorGiro({ lista, filtro, alCambiarFiltro }: { lista: NegocioMapa[]; filtro: Filtro; alCambiarFiltro: (f: Filtro) => void }) {
  const grupo = filtro.grupo;
  if (lista.length === 0) return null;
  return (
    <>
      <Titulo texto={grupo ? 'Giros' : 'Por categoría'} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {grupo
          ? contarGiros(lista, grupo).map((g, i) => (
              <FichaGiro key={g.giro} titulo={g.giro} cuenta={g.negocios} grupoSlug={grupo} activa={filtro.giro === g.giro} indice={i} alTocar={() => alCambiarFiltro({ grupo, giro: filtro.giro === g.giro ? null : g.giro })} />
            ))
          : contarGrupos(lista).map((c, i) => (
              <FichaGiro key={c.grupo.slug} titulo={c.grupo.nombre} cuenta={c.negocios} grupoSlug={c.grupo.slug} activa={false} indice={i} alTocar={() => alCambiarFiltro({ grupo: c.grupo.slug, giro: null })} />
            ))}
      </ScrollView>
    </>
  );
}

function Titulo({ texto }: { texto: string }) {
  return <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG, marginTop: 18, marginBottom: 8 }}>{texto}</Text>;
}

function AyudaZona({ zona }: { zona: Zona }) {
  return (
    <Fade delay={3 * STAGGER} desde={8}>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 10, padding: 14, borderRadius: R.md, backgroundColor: `${C.primary}12`, borderWidth: StyleSheet.hairlineWidth, borderColor: `${C.primary}40` }}>
        <Ionicons name="help-buoy-outline" size={22} color={C.accent} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>Ayuda en {zona.tipo === 'sector' ? 'este sector' : 'esta colonia'}</Text>
            <Text style={{ fontFamily: F.semi, fontSize: 9.5, color: C.accent }}>Por definir</Text>
          </View>
          <Text style={{ fontFamily: F.reg, fontSize: 11.5, lineHeight: 16, color: MUTED, marginTop: 3 }}>
            Aquí irá quién te apoya en tu zona: encargado, horario y punto de atención.
          </Text>
        </View>
      </View>
    </Fade>
  );
}

/** Detalle de una zona. */
function DetalleZona({
  zona,
  relleno,
  pinActivo,
  sectorDe,
  filtro,
  alElegirZona,
  alElegirNegocio,
  alCambiarFiltro,
}: {
  zona: Zona;
  relleno: number;
  pinActivo: string | null;
  sectorDe: (z: Zona) => Zona | undefined;
  filtro: Filtro;
  alElegirZona: (z: Zona) => void;
  alElegirNegocio: (n: NegocioMapa) => void;
  alCambiarFiltro: (f: Filtro) => void;
}) {
  const sector = sectorDe(zona);
  // El negocio que se acaba de tocar en el mapa va primero.
  const lista = [...zona.lista].sort((a, b) => Number(b.id === pinActivo) - Number(a.id === pinActivo));
  return (
    <ScrollView key={zona.id} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: relleno }}>
      <Cifras negocios={zona.negocios} recomendadores={zona.recomendadores} ventas={zona.ventasMes} />
      <AyudaZona zona={zona} />

      <PorGiro lista={zona.lista} filtro={filtro} alCambiarFiltro={alCambiarFiltro} />

      {sector && (
        <Fade delay={4 * STAGGER} desde={8}>
          <PressableScale onPress={() => alElegirZona(sector)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, padding: 12, borderRadius: R.md, backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(13,13,13,0.07)' }}>
            <Ionicons name="layers-outline" size={18} color={FG} />
            <Text style={{ flex: 1, fontFamily: F.base, fontSize: 12.5, color: FG }}>Ver todo el sector {sector.nombre}</Text>
            <Icon name="chevR" size={15} color={MUTED} />
          </PressableScale>
        </Fade>
      )}

      {zona.tipo === 'sector' && (
        <>
          <Titulo texto={`Colonias (${zona.colonias.length})`} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {zona.colonias.map((c, i) => (
              <Fade key={c.id} delay={Math.min(i, 8) * 25}>
                <PressableScale onPress={() => alElegirZona(c)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(13,13,13,0.1)' }}>
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: NIVELES[c.nivel].muestra }} />
                  <Text style={{ fontFamily: F.base, fontSize: 11.5, color: FG }}>{c.nombre}</Text>
                </PressableScale>
              </Fade>
            ))}
          </View>
        </>
      )}

      <Titulo texto={lista.length > 0 ? `Negocios aquí (${lista.length})` : 'Negocios aquí'} />
      {lista.length === 0 ? (
        <Fade desde={8} style={{ alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16 }}>
          <Ionicons name="storefront-outline" size={26} color={MUTED} />
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG, marginTop: 8, textAlign: 'center' }}>
            {nombreFiltro(filtro) ? `Aún no hay «${nombreFiltro(filtro)}» aquí` : 'Aún no hay negocios aquí'}
          </Text>
          <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 2, textAlign: 'center' }}>Es buena zona para salir a invitar al primero.</Text>
        </Fade>
      ) : (
        contarGrupos(lista).map(({ grupo }) => {
          const suyos = lista.filter((n) => n.grupo === grupo.slug);
          return (
            <View key={grupo.slug} style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: hueColors(grupo.hue)[1] }} />
                <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 11.5, color: MUTED }}>{grupo.nombre}</Text>
                <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED }}>{suyos.length}</Text>
              </View>
              {suyos.map((n, i) => (
                <FilaNegocio key={n.id} negocio={n} activo={n.id === pinActivo} indice={i} alTocar={alElegirNegocio} />
              ))}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

/** Cuerpo de la hoja: toda la ciudad, o la zona elegida. */
export function CuerpoHoja({
  zona,
  base,
  datos,
  modo,
  filtro,
  relleno,
  pinActivo,
  alElegirZona,
  alElegirNegocio,
  alCambiarFiltro,
}: {
  zona: Zona | null;
  base: BaseMapa;
  datos: DatosMapa;
  modo: Modo;
  filtro: Filtro;
  /** Lo que queda escondido bajo la pantalla con la hoja a media altura. */
  relleno: number;
  pinActivo: string | null;
  alElegirZona: (z: Zona) => void;
  alElegirNegocio: (n: NegocioMapa) => void;
  alCambiarFiltro: (f: Filtro) => void;
}) {
  if (zona) {
    return (
      <DetalleZona
        zona={zona}
        relleno={relleno}
        pinActivo={pinActivo}
        filtro={filtro}
        sectorDe={(z) => (z.sectorId ? datos.sectores.find((s) => s.id === z.sectorId) : undefined)}
        alElegirZona={alElegirZona}
        alElegirNegocio={alElegirNegocio}
        alCambiarFiltro={alCambiarFiltro}
      />
    );
  }
  const giro = nombreFiltro(filtro);
  const todas = modo === 'sectores' ? datos.sectores : datos.colonias;
  // Con un giro elegido solo importan las zonas donde sí hay.
  const filas = giro ? todas.filter((z) => z.negocios > 0) : todas;
  return (
    <FlatList
      key={modo}
      data={filas}
      keyExtractor={(z) => z.id}
      initialNumToRender={10}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: relleno }}
      ListHeaderComponent={
        <>
          <Cifras negocios={datos.totales.negocios} recomendadores={datos.totales.recomendadores} ventas={datos.totales.ventasMes} />
          {/* Con un giro elegido se sigue viendo todo su grupo, para saltar a otro giro. */}
          {filas.length > 0 && <PorGiro lista={filtro.grupo ? base.negocios : datos.negocios} filtro={filtro} alCambiarFiltro={alCambiarFiltro} />}
          {filas.length > 0 && <Titulo texto={modo === 'sectores' ? 'Sectores' : 'Colonias'} />}
        </>
      }
      ListEmptyComponent={
        <Fade desde={8} style={{ alignItems: 'center', paddingVertical: 26, paddingHorizontal: 16 }}>
          <Ionicons name="storefront-outline" size={26} color={MUTED} />
          <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, marginTop: 8, textAlign: 'center' }}>Aún no hay «{giro}» en Villahermosa</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 3, textAlign: 'center' }}>Si conoces uno, recomiéndalo y es el primero del mapa.</Text>
        </Fade>
      }
      renderItem={({ item, index }) => <FilaZona zona={item} indice={index} alTocar={alElegirZona} />}
    />
  );
}
