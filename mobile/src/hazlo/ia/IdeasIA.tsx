import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { HazloMark } from '../HazloMark';
import { Icon, type IconName } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { BG, C, F, FG, MUTED, R } from '../theme';

/**
 * /ia — propuestas de IA y ML para Hazlo Cash, ordenadas por fase.
 * Es un documento para decidir, no código que corra: nada aquí llama a un
 * modelo. Precios de Claude: lista pública al 25 de septiembre de 2026.
 */

type Fase = 'Ya' | 'Con tracción' | 'A escala';
type Nivel = 'Alto' | 'Medio';
type Esfuerzo = 'S' | 'M' | 'L';
type Tipo = 'ML clásico' | 'LLM' | 'Servicio';

interface Idea {
  titulo: string;
  icon: IconName;
  fase: Fase;
  tipo: Tipo;
  /** Familia de modelo: lo que hay que estudiar para construirlo. */
  familia: string;
  impacto: Nivel;
  esfuerzo: Esfuerzo;
  paraQue: string;
  como: string;
  modelo: string;
  datos: string;
  metrica: string;
  cuidado: string;
}

const IDEAS: Idea[] = [
  // ── Ya: no necesitan historial, solo un modelo de lenguaje ─────────────────
  {
    titulo: '"Escríbelo por mí"',
    tipo: 'LLM',
    familia: 'Generación de texto',
    icon: 'send',
    fase: 'Ya',
    impacto: 'Alto',
    esfuerzo: 'S',
    paraQue: 'El embajador no sabe qué escribir y comparte menos. Un botón genera 3 mensajes de WhatsApp con su tono (chido, formal, corto) a partir de la oferta real del negocio.',
    como: 'Una llamada al modelo con la ficha del negocio y la oferta como contexto; devuelve variantes en JSON con salida estructurada.',
    modelo: 'Claude Opus 5.5 (claude-opus-5-5). Si el volumen crece, medir Haiku 4.5 contra él antes de cambiar.',
    datos: 'Nombre, categoría y oferta del negocio. Nada personal del embajador.',
    metrica: '% de códigos compartidos que alguien reclama, con y sin el botón.',
    cuidado: 'Que el mensaje prometa algo que el negocio no da: el prompt solo puede usar la oferta registrada.',
  },
  {
    titulo: 'Alta de negocio con una foto',
    tipo: 'LLM',
    familia: 'Visión + extracción estructurada',
    icon: 'qr',
    fase: 'Ya',
    impacto: 'Alto',
    esfuerzo: 'M',
    paraQue: 'Dar de alta un negocio informal es lento. El admin toma foto del menú o del letrero y la IA llena servicios, precios, horario, descripción y propone una oferta.',
    como: 'Visión + salida estructurada (JSON con el esquema de businesses). El admin revisa y confirma antes de publicar.',
    modelo: 'Claude Opus 5.5: lee fotos de menús escritos a mano o con mala luz.',
    datos: 'La foto. Se procesa y no se guarda si no hace falta.',
    metrica: 'Minutos por alta de negocio (hoy vs. con foto) y % de campos que el admin corrige.',
    cuidado: 'Precios mal leídos: nunca se publica sin la confirmación del admin.',
  },
  {
    titulo: 'Guardián del chat (anti-bypass)',
    tipo: 'ML clásico',
    familia: 'Clasificación de texto',
    icon: 'settings',
    fase: 'Ya',
    impacto: 'Alto',
    esfuerzo: 'M',
    paraQue: 'Si cliente y negocio se pasan el WhatsApp, la venta se va por fuera y nadie cobra comisión. Detecta teléfonos, correos y frases como "mándame mensaje al…", aunque los escriban con letras o emojis.',
    como: 'Reglas (regex de números, correos, @) desde el día 1. Con mensajes etiquetados, un clasificador propio (TF-IDF + regresión logística) que corre en milisegundos y casi gratis. Un LLM solo para los casos dudosos al inicio.',
    modelo: 'scikit-learn (TF-IDF + regresión logística); Claude Opus 5.5 de apoyo mientras no hay etiquetas.',
    datos: 'El texto del mensaje, en el servidor. Se entra cuando exista el chat mediado.',
    metrica: 'Intentos detectados por semana y quejas por falsos positivos.',
    cuidado: 'Bloquear de más molesta: ocultar solo el dato, no el mensaje entero, y permitir reportar el error.',
  },
  {
    titulo: 'Asistente de ayuda',
    tipo: 'LLM',
    familia: 'Agente con herramientas',
    icon: 'bell',
    fase: 'Ya',
    impacto: 'Medio',
    esfuerzo: 'M',
    paraQue: 'Las dudas típicas ("¿por qué no me llegó mi comisión?", "¿cómo retiro?") se responden solas, 24/7, con los datos de esa persona.',
    como: 'Chat con herramientas de solo lectura: consultar el estado de una orden, sus comisiones, su nivel. Si no puede resolver, pasa el caso a una persona.',
    modelo: 'Claude Opus 5.5 con tool use.',
    datos: 'Las propias órdenes y comisiones del usuario, vía las mismas reglas RLS que la app.',
    metrica: '% de conversaciones resueltas sin humano y satisfacción al cerrar.',
    cuidado: 'Jamás mueve dinero ni cambia datos: solo consulta y explica.',
  },

  // ── Con tracción: necesitan cientos de ventas registradas ───────────────────
  {
    titulo: 'Detección de fraude en referidos',
    tipo: 'ML clásico',
    familia: 'Anomalías + clasificación supervisada',
    icon: 'star',
    fase: 'Con tracción',
    impacto: 'Alto',
    esfuerzo: 'M',
    paraQue: 'Cada venta falsa es dinero que sale: autorreferidos, un negocio y un embajador que se ponen de acuerdo para confirmar ventas que no existieron, ráfagas de reclamos desde el mismo teléfono.',
    como: 'Desde ya: reglas (mismo dispositivo, misma persona, montos repetidos, horarios raros). Con datos: detección de anomalías (Isolation Forest) y, cuando haya casos confirmados, un clasificador (LightGBM). Revisión humana antes de congelar pagos.',
    modelo: 'ML clásico en Python (scikit-learn / LightGBM) en un job nocturno.',
    datos: 'Referidos, confirmaciones, montos, tiempos entre pasos, dispositivo.',
    metrica: 'Comisiones retenidas por fraude confirmado vs. falsos positivos revisados.',
    cuidado: 'Nunca castigar solo por el modelo: marca para revisión, decide una persona.',
  },
  {
    titulo: 'Descubre "Para ti"',
    tipo: 'ML clásico',
    familia: 'Sistema de recomendación',
    icon: 'search',
    fase: 'Con tracción',
    impacto: 'Alto',
    esfuerzo: 'M',
    paraQue: 'Ordenar Descubre por lo que más probablemente compres: cerca, con buena conversión y parecido a lo que ya te gustó.',
    como: 'Paso 1: fórmula simple (distancia + conversión + promo activa). Paso 2: filtrado colaborativo implícito (ALS) sobre quién compró dónde. Paso 3: un modelo de ranking (LambdaMART) que mezcla todo.',
    modelo: 'implicit (ALS) o LightFM; LightGBM para el ranking final.',
    datos: 'Fichas vistas, reclamos, compras y ubicación aproximada (colonia, no GPS exacto).',
    metrica: '% de fichas vistas que terminan en orden.',
    cuidado: 'No esconder negocios nuevos: reservar lugares para darlos a conocer.',
  },
  {
    titulo: 'Qué recomendar ahora (embajador)',
    tipo: 'ML clásico',
    familia: 'Learning to rank',
    icon: 'gift',
    fase: 'Con tracción',
    impacto: 'Alto',
    esfuerzo: 'M',
    paraQue: 'Al embajador le decimos qué negocio le conviene compartir hoy: donde sus amigos más compran y donde la comisión rinde más.',
    como: 'Al inicio, reglas. Con datos: learning to rank (LambdaMART) por embajador, con su conversión por categoría, la demanda de la zona y la comisión de cada negocio.',
    modelo: 'LightGBM (objetivo lambdarank).',
    datos: 'Historial de códigos del embajador, ventas por categoría, comisiones.',
    metrica: 'Ventas por embajador activo al mes.',
    cuidado: 'Explicar el porqué ("tus amigos compran más comida") para que confíe.',
  },
  {
    titulo: 'Reactivar embajadores dormidos',
    tipo: 'ML clásico',
    familia: 'Análisis de supervivencia',
    icon: 'refresh',
    fase: 'Con tracción',
    impacto: 'Medio',
    esfuerzo: 'S',
    paraQue: 'Detectar a quién estamos perdiendo antes de que se vaya y mandarle el empujón correcto (un negocio nuevo cerca, cuánto le falta para subir de nivel).',
    como: 'Análisis de supervivencia: no solo "si" se va, sino "cuándo". Curvas de Kaplan-Meier por nivel y un modelo de Cox con días sin compartir, conversión y saldo sin retirar.',
    modelo: 'lifelines (Python); alternativa simple: regresión logística en scikit-learn.',
    datos: 'Actividad del embajador en la app y sus ventas.',
    metrica: '% de embajadores marcados que vuelven a compartir en 14 días.',
    cuidado: 'Pocos avisos y útiles: el spam acelera el abandono.',
  },
  {
    titulo: 'Pronóstico de créditos del negocio',
    tipo: 'ML clásico',
    familia: 'Series de tiempo',
    icon: 'chart',
    fase: 'Con tracción',
    impacto: 'Medio',
    esfuerzo: 'S',
    paraQue: 'Avisar "te alcanzan ~4 días" y sugerir cuánto recargar, antes de que el negocio se quede sin poder confirmar ventas.',
    como: 'Suavizado exponencial (Holt-Winters) de las ventas diarias por negocio, con estacionalidad semanal: el viernes no vende igual que el martes.',
    modelo: 'statsmodels (Holt-Winters / ETS).',
    datos: 'Ventas confirmadas por día y saldo de créditos.',
    metrica: 'Ventas perdidas por falta de créditos (meta: cero).',
    cuidado: 'Negocios con pocas ventas: mostrar rango, no un número exacto.',
  },
  {
    titulo: 'Demanda no cubierta',
    tipo: 'ML clásico',
    familia: 'Embeddings + clustering',
    icon: 'home',
    fase: 'Con tracción',
    impacto: 'Medio',
    esfuerzo: 'S',
    paraQue: 'Saber qué negocios dar de alta: lo que la gente busca en Descubre y no encuentra, agrupado por tema y zona.',
    como: 'Guardar búsquedas sin resultado y agruparlas con embeddings ("barbería", "corte de pelo" y "peluquero" son lo mismo).',
    modelo: 'Embeddings en pgvector + HDBSCAN para agrupar.',
    datos: 'Texto de la búsqueda y colonia. Sin identificar a la persona.',
    metrica: '% de búsquedas sin resultado, mes contra mes.',
    cuidado: 'Es un reporte para el admin, no se muestra a usuarios.',
  },
  {
    titulo: 'Resumen y moderación de reseñas',
    tipo: 'LLM',
    familia: 'Resumen y clasificación de texto',
    icon: 'bookmark',
    fase: 'Con tracción',
    impacto: 'Medio',
    esfuerzo: 'S',
    paraQue: 'En la ficha: "Lo que más gusta: el pastor y la salsa verde". Y filtrar reseñas ofensivas o falsas antes de publicarlas.',
    como: 'Resumen periódico por negocio y clasificación de cada reseña nueva.',
    modelo: 'Claude Opus 5.5 (resúmenes en lote con la Batches API, a mitad de precio).',
    datos: 'Solo reseñas verificadas (de compras dentro de la plataforma).',
    metrica: '% de fichas vistas que terminan en orden, con resumen vs. sin resumen.',
    cuidado: 'El resumen no inventa: cada frase debe salir de reseñas reales.',
  },

  {
    titulo: 'Horas pico del negocio',
    icon: 'activity',
    fase: 'Con tracción',
    tipo: 'ML clásico',
    familia: 'Series de tiempo',
    impacto: 'Medio',
    esfuerzo: 'S',
    paraQue: 'Decirle a cada negocio a qué horas y qué días le llegan más clientes de Hazlo Cash, y sugerir lanzar su promo justo antes. Es valor que el negocio no tiene hoy y le da razones para quedarse.',
    como: 'Descomposición de la serie de ventas por hora y día de la semana; con más historia, Prophet o SARIMA para pronosticar la semana siguiente.',
    modelo: 'statsmodels (STL / SARIMA) o Prophet.',
    datos: 'Hora de cada venta confirmada por negocio.',
    metrica: 'Negocios que activan una promo sugerida y sus ventas en esa franja.',
    cuidado: 'Con pocas ventas el patrón es ruido: mostrarlo solo arriba de un mínimo de ventas.',
  },
  {
    titulo: 'Valor de vida (LTV)',
    icon: 'dollar',
    fase: 'Con tracción',
    tipo: 'ML clásico',
    familia: 'Modelos probabilísticos de clientes',
    impacto: 'Alto',
    esfuerzo: 'M',
    paraQue: 'Saber cuánto va a dejar cada cliente y cada embajador en los próximos meses. Dice cuánto conviene pagar para conseguir uno nuevo y a quién cuidar primero.',
    como: 'BG/NBD para predecir cuántas compras más hará alguien y Gamma-Gamma para cuánto gastará en cada una. Es el estándar en marketplaces.',
    modelo: 'PyMC-Marketing (módulo CLV).',
    datos: 'Fecha y monto de cada compra por persona.',
    metrica: 'Error del pronóstico contra lo que de verdad pasó al mes siguiente.',
    cuidado: 'Es un promedio estadístico: sirve para decidir en grupo, no para tratar distinto a una persona.',
  },
  {
    titulo: 'Zonas para crecer',
    icon: 'search',
    fase: 'Con tracción',
    tipo: 'ML clásico',
    familia: 'Geoespacial',
    impacto: 'Medio',
    esfuerzo: 'S',
    paraQue: 'Ver en el mapa dónde hay mucha demanda y pocos negocios afiliados, para saber a qué colonia mandar a captar negocios (y luego a qué ciudad saltar después de Villahermosa).',
    como: 'Dividir la ciudad en hexágonos H3, contar demanda (búsquedas, órdenes) contra oferta (negocios) y agrupar zonas parecidas con DBSCAN.',
    modelo: 'h3-py + scikit-learn (DBSCAN).',
    datos: 'Colonia o celda H3 aproximada de búsquedas y órdenes; ubicación de negocios.',
    metrica: 'Ventas en las zonas donde se captaron negocios por sugerencia del mapa.',
    cuidado: 'Usar celdas grandes: nunca la ubicación exacta de una persona.',
  },

  // ── A escala ────────────────────────────────────────────────────────────────
  {
    titulo: 'Comisión y oferta óptimas',
    tipo: 'ML clásico',
    familia: 'Bandits multi-brazo',
    icon: 'dollar',
    fase: 'A escala',
    impacto: 'Alto',
    esfuerzo: 'L',
    paraQue: 'Encontrar, por categoría, la combinación de comisión y beneficio al cliente que trae más ventas por cada peso pagado.',
    como: 'Experimentos controlados y, después, bandits (Thompson sampling) que reparten tráfico hacia lo que mejor funciona.',
    modelo: 'Thompson sampling (Python, unas decenas de líneas); para análisis, statsmodels.',
    datos: 'Ventas por oferta y comisión, con el experimento registrado en cada orden.',
    metrica: 'Ventas por peso de comisión pagado.',
    cuidado: 'Cambiar condiciones confunde: experimentos acotados, avisados al negocio y sin tocar lo ya acordado.',
  },
  {
    titulo: 'Anillos de fraude (grafos)',
    icon: 'share',
    fase: 'A escala',
    tipo: 'ML clásico',
    familia: 'Machine learning en grafos',
    impacto: 'Alto',
    esfuerzo: 'L',
    paraQue: 'El fraude organizado no se ve venta por venta: se ve en la red. Grupos de embajadores, clientes y negocios que solo se compran entre ellos.',
    como: 'Armar el grafo embajador–cliente–negocio y buscar comunidades cerradas (Louvain) y patrones raros. Con muchos datos, redes neuronales de grafos (GNN).',
    modelo: 'NetworkX (Louvain, PageRank); PyTorch Geometric si se llega a GNN.',
    datos: 'Quién refirió a quién, en qué negocio y cuándo.',
    metrica: 'Anillos confirmados por revisión humana.',
    cuidado: 'Una familia que compra en el mismo lugar no es un fraude: siempre revisión humana.',
  },
  {
    titulo: 'A quién darle el incentivo',
    icon: 'gift',
    fase: 'A escala',
    tipo: 'ML clásico',
    familia: 'Inferencia causal (uplift)',
    impacto: 'Alto',
    esfuerzo: 'L',
    paraQue: 'Un bono le sirve a quien compraría solo gracias al bono, no a quien iba a comprar de todos modos. El uplift encuentra a los primeros y ahorra dinero en promociones.',
    como: 'Un experimento con grupo de control y después modelos de uplift (T-learner, causal forests) que estiman el efecto del incentivo por persona.',
    modelo: 'causalml o EconML.',
    datos: 'Quién recibió incentivo, quién no (al azar) y quién compró.',
    metrica: 'Ventas extra por peso gastado en incentivos, contra darle a todos.',
    cuidado: 'Necesita un experimento bien hecho primero; sin grupo de control el modelo engaña.',
  },
  {
    titulo: 'Verificación de identidad para retiros',
    tipo: 'Servicio',
    familia: 'Visión (OCR + prueba de vida)',
    icon: 'user',
    fase: 'A escala',
    impacto: 'Medio',
    esfuerzo: 'M',
    paraQue: 'Cuando haya retiros reales: confirmar que la cuenta es de una persona real antes del primer pago, para frenar cuentas falsas.',
    como: 'No construir esto en casa: un proveedor de KYC para México (lectura de INE + prueba de vida). Candidatos a evaluar: Truora, MetaMap, Incode.',
    modelo: 'Servicio del proveedor.',
    datos: 'INE y selfie, solo en el proveedor; nosotros guardamos el resultado, no la imagen.',
    metrica: 'Fraude en retiros y % de personas que terminan la verificación.',
    cuidado: 'Datos muy sensibles: aviso de privacidad explícito y pedirla solo al retirar.',
  },
];

const FASES: ('Todas' | Fase)[] = ['Todas', 'Ya', 'Con tracción', 'A escala'];
const TIPOS: ('Todos' | Tipo)[] = ['Todos', 'ML clásico', 'LLM', 'Servicio'];
const ORDEN_FASE: Record<Fase, number> = { Ya: 0, 'Con tracción': 1, 'A escala': 2 };
const ORDEN_TIPO: Record<Tipo, number> = { 'ML clásico': 0, Servicio: 1, LLM: 2 };

// Familias de ML y dónde encaja cada una en Hazlo Cash.
const FAMILIAS: { f: string; para: string; algo: string }[] = [
  { f: 'Clasificación supervisada', para: 'Fraude con casos confirmados, abandono, mensajes que rompen el anti-bypass', algo: 'Regresión logística, LightGBM, XGBoost' },
  { f: 'Detección de anomalías', para: 'Fraude cuando aún no hay casos etiquetados, montos y horarios raros', algo: 'Isolation Forest, LOF' },
  { f: 'Sistemas de recomendación', para: 'Descubre "Para ti", negocios parecidos', algo: 'ALS implícito, LightFM, two-tower' },
  { f: 'Learning to rank', para: 'Orden de Descubre y de "qué recomendar ahora"', algo: 'LambdaMART (LightGBM)' },
  { f: 'Series de tiempo', para: 'Créditos del negocio, horas pico, demanda por día', algo: 'Holt-Winters, SARIMA, Prophet' },
  { f: 'Análisis de supervivencia', para: 'Cuándo se va un embajador o un negocio', algo: 'Kaplan-Meier, Cox' },
  { f: 'Modelos de valor de cliente', para: 'LTV de clientes y embajadores, cuánto pagar por adquirir', algo: 'BG/NBD + Gamma-Gamma' },
  { f: 'Inferencia causal / uplift', para: 'A quién darle un bono para que de verdad cambie su compra', algo: 'T-learner, causal forests' },
  { f: 'Bandits y experimentos', para: 'Comisión y oferta óptimas por categoría', algo: 'Thompson sampling, pruebas A/B' },
  { f: 'Grafos', para: 'Anillos de fraude, embajadores más influyentes', algo: 'Louvain, PageRank, GNN' },
  { f: 'Geoespacial', para: 'Zonas con demanda y sin negocios, siguiente ciudad', algo: 'H3, DBSCAN' },
  { f: 'Lenguaje y visión', para: 'Mensajes, menús en foto, reseñas, búsqueda por significado', algo: 'Embeddings, OCR, LLM (Claude)' },
];

const INFO_FASE: Record<Fase, { sub: string; color: string; bg: string }> = {
  Ya: { sub: 'Sin historial: solo un modelo de lenguaje', color: '#00806F', bg: 'rgba(0,168,150,0.12)' },
  'Con tracción': { sub: 'Con cientos de ventas registradas', color: '#B7791F', bg: 'rgba(245,166,35,0.16)' },
  'A escala': { sub: 'Con miles de usuarios y retiros reales', color: '#2D2B8F', bg: 'rgba(45,43,143,0.1)' },
};

const ESFUERZO: Record<Esfuerzo, string> = { S: 'Días', M: '1–3 semanas', L: '1 mes o más' };

function Campo({ titulo, texto, color = FG }: { titulo: string; texto: string; color?: string }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: MUTED, letterSpacing: 0.6, textTransform: 'uppercase' }}>{titulo}</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 12.5, color, marginTop: 2, lineHeight: 18 }}>{texto}</Text>
    </View>
  );
}

function TarjetaIdea({ idea, ancho, delay }: { idea: Idea; ancho: number; delay: number }) {
  const fase = INFO_FASE[idea.fase];
  return (
    <Fade delay={delay} desde={14} style={{ width: ancho }}>
      <View style={{ borderRadius: R.lg, padding: 16, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={idea.icon} size={18} color="#fff" />
          </LinearGradient>
          <Text style={{ flex: 1, fontFamily: F.bold, fontSize: 16, color: FG, letterSpacing: -0.2 }}>{idea.titulo}</Text>
        </View>

        <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: C.accent, marginTop: 10 }}>
          {idea.tipo} · {idea.familia}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: fase.bg }}>
            <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: fase.color }}>{idea.fase}</Text>
          </View>
          <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: idea.impacto === 'Alto' ? `${C.primary}18` : 'rgba(13,13,13,0.06)' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: idea.impacto === 'Alto' ? C.accent : MUTED }}>Impacto {idea.impacto.toLowerCase()}</Text>
          </View>
          <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: 'rgba(13,13,13,0.06)' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: MUTED }}>Esfuerzo: {ESFUERZO[idea.esfuerzo]}</Text>
          </View>
        </View>

        <Text style={{ fontFamily: F.base, fontSize: 13, color: FG, marginTop: 12, lineHeight: 19 }}>{idea.paraQue}</Text>
        <Campo titulo="Cómo" texto={idea.como} />
        <Campo titulo="Modelo / herramienta" texto={idea.modelo} color={C.accent} />
        <Campo titulo="Datos que necesita" texto={idea.datos} />
        <Campo titulo="Cómo sabremos que funciona" texto={idea.metrica} />
        <View style={{ marginTop: 12, flexDirection: 'row', gap: 8, padding: 10, borderRadius: R.sm, backgroundColor: 'rgba(245,166,35,0.12)' }}>
          <Icon name="bell" size={14} color="#B7791F" />
          <Text style={{ flex: 1, fontFamily: F.reg, fontSize: 11.5, color: '#7A5212', lineHeight: 16 }}>{idea.cuidado}</Text>
        </View>
      </View>
    </Fade>
  );
}

// Reglas que aplican a todas las ideas: van antes que cualquier modelo.
const PRINCIPIOS: { icon: IconName; t: string; d: string }[] = [
  { icon: 'chart', t: 'Primero, registrar eventos', d: 'Un modelo de ML aprende de lo que pasó. Lo urgente es guardar: link abierto, código compartido (y por dónde), búsqueda, ficha vista, orden creada, hora de cada venta.' },
  { icon: 'refresh', t: 'Reglas antes que modelos', d: 'Una regla simple medida le gana a un modelo sin datos. Cada idea arranca con reglas y sube a ML cuando hay historial para entrenar y comparar.' },
  { icon: 'settings', t: 'La IA corre en el servidor', d: 'Toda llamada a un modelo pasa por una Edge Function de Supabase. La llave nunca va en la app.' },
  { icon: 'dollar', t: 'El dinero lo decide el código', d: 'Comisiones y pagos los calculan reglas en el servidor. Un modelo puede sugerir o marcar, nunca pagar ni cobrar.' },
  { icon: 'user', t: 'Privacidad primero', d: 'Mandar al modelo solo lo necesario (sin teléfonos ni correos) y mencionar el uso de IA en el aviso de privacidad.' },
];

const STACK: { t: string; d: string }[] = [
  { t: 'Python: pandas, scikit-learn, LightGBM', d: 'La base de casi todo: clasificación, anomalías, ranking. Corre en un job programado (como el keepalive de GitHub Actions que ya existe) que lee de Supabase y escribe resultados en una tabla.' },
  { t: 'statsmodels / Prophet', d: 'Series de tiempo: créditos, horas pico, demanda.' },
  { t: 'implicit o LightFM', d: 'Recomendaciones a partir de quién compró dónde.' },
  { t: 'lifelines · PyMC-Marketing · causalml', d: 'Supervivencia (abandono), valor de vida (LTV) y uplift.' },
  { t: 'NetworkX · h3-py', d: 'Grafos para anillos de fraude; hexágonos H3 para zonas.' },
  { t: 'pgvector (Supabase)', d: 'Guardar embeddings y buscar por significado en la base que ya usamos.' },
  { t: 'Claude Opus 5.5', d: 'claude-opus-5-5 · solo donde hay lenguaje o imágenes. $4 / $20 por millón de tokens. Alternativas a medir: Sonnet 5.5 ($2 / $10) y Haiku 4.5 ($1 / $5).' },
];

export function IdeasIA() {
  const { width } = useWindowDimensions();
  const [fase, setFase] = useState<(typeof FASES)[number]>('Todas');
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>('Todos');

  const ancho = Math.min(400, width - 32);
  // Por fase y, dentro de cada una, el ML clásico primero.
  const visibles = IDEAS.filter((i) => (fase === 'Todas' || i.fase === fase) && (tipo === 'Todos' || i.tipo === tipo)).sort(
    (a, b) => ORDEN_FASE[a.fase] - ORDEN_FASE[b.fase] || ORDEN_TIPO[a.tipo] - ORDEN_TIPO[b.tipo],
  );
  const mlClasico = IDEAS.filter((i) => i.tipo === 'ML clásico').length;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Portada oscura, como el bloque de Inicio 2 */}
        <View style={{ backgroundColor: '#0D0D0D', overflow: 'hidden' }}>
          <SafeAreaView edges={['top']}>
            <View style={{ position: 'absolute', right: -60, top: -40, opacity: 0.35 }}>
              <HazloMark size={260} />
            </View>
            <View style={{ maxWidth: 1260, width: '100%', alignSelf: 'center', paddingHorizontal: 16, paddingTop: 22, paddingBottom: 28 }}>
              <Fade desde={8}>
                <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary, letterSpacing: 0.8 }}>HAZLO CASH · INTELIGENCIA</Text>
                <Text style={{ fontFamily: F.bold, fontSize: 30, color: '#fff', letterSpacing: -0.8, marginTop: 6 }}>Machine learning para despegar el negocio</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 13.5, color: 'rgba(255,255,255,0.7)', marginTop: 8, lineHeight: 20, maxWidth: 640 }}>
                  {IDEAS.length} ideas, {mlClasico} de ellas con ML clásico (clasificación, series de tiempo, recomendación, grafos, causalidad) que aprende de nuestras propias ventas. Los LLM entran solo donde hay lenguaje o imágenes. Es una propuesta: nada de esto está conectado.
                </Text>
              </Fade>
            </View>
          </SafeAreaView>
        </View>

        <View style={{ maxWidth: 1260, width: '100%', alignSelf: 'center', paddingHorizontal: 16 }}>
          {/* Principios */}
          <Fade delay={STAGGER} desde={10}>
            <Text style={{ fontFamily: F.semi, fontSize: 17, color: FG, marginTop: 24, marginBottom: 10 }}>Antes de cualquier modelo</Text>
          </Fade>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {PRINCIPIOS.map((p, i) => (
              <Fade key={p.t} delay={STAGGER * (2 + i)} desde={10} style={{ flexGrow: 1, flexBasis: 260 }}>
                <View style={{ height: '100%', borderRadius: R.md, padding: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' }}>
                  <Icon name={p.icon} size={18} color={C.primary} />
                  <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: FG, marginTop: 8 }}>{p.t}</Text>
                  <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 3, lineHeight: 17 }}>{p.d}</Text>
                </View>
              </Fade>
            ))}
          </View>

          {/* Filtro por fase */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 26, paddingBottom: 6 }}>
            {FASES.map((f) => {
              const on = fase === f;
              const n = f === 'Todas' ? IDEAS.length : IDEAS.filter((i) => i.fase === f).length;
              return (
                <PressableScale
                  key={f}
                  onPress={() => setFase(f)}
                  style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: on ? FG : '#fff', borderWidth: on ? 0 : 1, borderColor: 'rgba(0,0,0,0.08)' }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 12, color: on ? '#fff' : FG }}>{f}</Text>
                  <Text style={{ fontFamily: F.semi, fontSize: 11, color: on ? 'rgba(255,255,255,0.6)' : MUTED }}>{n}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 6 }}>
            {TIPOS.map((t) => {
              const on = tipo === t;
              const n = t === 'Todos' ? IDEAS.length : IDEAS.filter((i) => i.tipo === t).length;
              return (
                <PressableScale
                  key={t}
                  onPress={() => setTipo(t)}
                  style={{ height: 30, paddingHorizontal: 12, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: on ? C.primary : 'transparent', borderWidth: on ? 0 : 1, borderColor: 'rgba(0,0,0,0.1)' }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: on ? '#fff' : FG }}>{t === 'Todos' ? 'Todo tipo' : t}</Text>
                  <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: on ? 'rgba(255,255,255,0.75)' : MUTED }}>{n}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 4, marginBottom: 14 }}>
            {fase === 'Todas' ? 'Todas las fases, de lo inmediato a lo que pide escala.' : INFO_FASE[fase].sub}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            {visibles.map((idea, i) => (
              <TarjetaIdea key={`${fase}-${tipo}-${idea.titulo}`} idea={idea} ancho={ancho} delay={Math.min(i, 6) * STAGGER} />
            ))}
          </View>

          {visibles.length === 0 && (
            <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, textAlign: 'center', paddingVertical: 24 }}>No hay ideas con ese filtro.</Text>
          )}

          {/* Mapa de familias de ML */}
          <Text style={{ fontFamily: F.semi, fontSize: 17, color: FG, marginTop: 30, marginBottom: 4 }}>Familias de modelos y dónde encajan</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginBottom: 10 }}>Un mapa para estudiar: qué tipo de modelo resuelve cada problema de Hazlo Cash.</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {FAMILIAS.map((m, i) => (
              <Fade key={m.f} delay={Math.min(i, 8) * STAGGER} desde={8} style={{ flexGrow: 1, flexBasis: 280 }}>
                <View style={{ height: '100%', borderRadius: R.md, padding: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: FG }}>{m.f}</Text>
                  <Text style={{ fontFamily: F.reg, fontSize: 12, color: FG, marginTop: 4, lineHeight: 17 }}>{m.para}</Text>
                  <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.accent, marginTop: 6 }}>{m.algo}</Text>
                </View>
              </Fade>
            ))}
          </View>

          {/* Stack */}
          <Text style={{ fontFamily: F.semi, fontSize: 17, color: FG, marginTop: 30, marginBottom: 4 }}>Herramientas sugeridas</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginBottom: 10 }}>
            Casi todo es Python abierto y gratuito; el único costo por uso son los LLM (precios de lista de Anthropic al 25 de sep 2026). Qué usar en cada idea se decide midiendo con datos reales.
          </Text>
          <View style={{ borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', paddingHorizontal: 14 }}>
            {STACK.map((s, i) => (
              <View key={s.t} style={{ paddingVertical: 12, borderBottomWidth: i < STACK.length - 1 ? 0.5 : 0, borderColor: 'rgba(0,0,0,0.06)' }}>
                <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>{s.t}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 17 }}>{s.d}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
