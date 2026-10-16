import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

/**
 * Catálogo de giros de Hazlo Cash, tomado del Excel "Catálogo.xls" (hoja
 * SECCIONADO): cada columna es un grupo y debajo vienen sus giros.
 *
 * Al pasarlo se corrigieron erratas (MEIDICNA → Medicina, TALER → Taller,
 * GEDIATRA → Geriatra, TORPICAL → Tropical…), se pusieron acentos y se quitó
 * un Neurólogo repetido. "Veterinario" y "Venta y renta" aparecen en dos
 * grupos a propósito, igual que en el Excel.
 */

export type IconoGrupo = ComponentProps<typeof Ionicons>['name'];

export interface Grupo {
  slug: string;
  nombre: string;
  icono: IconoGrupo;
  /** Tono del gradiente de la tarjeta (ver hueColors en ui.tsx). */
  hue: number;
  giros: string[];
}

const CRUDO: Grupo[] = [
  {
    slug: 'salud',
    nombre: 'Salud y medicina',
    icono: 'medkit-outline',
    hue: 172,
    giros: [
      'Alergólogo', 'Angiólogo', 'Bariatra', 'Cardiólogo', 'Cardiólogo infantil', 'Cirujano plástico',
      'Clínicas dentales', 'Coloproctólogo', 'Dentista', 'Dermatólogo', 'Endocrinólogo',
      'Endocrinólogo infantil', 'Gabinete de imagen y ultrasonido', 'Gastroenterólogo', 'Ginecólogo',
      'Inhaloterapia', 'Internista', 'Dentista maxilofacial', 'Medicina del deporte', 'Medicina general',
      'Medicina fetal', 'Nefrólogo', 'Neumólogo', 'Neurólogo', 'Neurólogo infantil', 'Nutriólogo',
      'Odontología infantil', 'Oftalmólogo', 'Oncólogo', 'Oncólogo infantil', 'Ortodoncia', 'Ortopedia',
      'Otorrinolaringólogo', 'Paidopsicólogo', 'Patólogo', 'Pediatra', 'Psicólogo', 'Psiquiatra',
      'Rehabilitador bucal', 'Terapeuta', 'Traumatólogo', 'Urólogo', 'Veterinario', 'Geriatra',
      'Reumatólogo', 'Reumatólogo infantil', 'Cosmetología dental', 'Endodoncista', 'Dentista en periodoncia',
      'Paidodoncia', 'Médico naturista', 'Médico acupunturista', 'Cancerólogo', 'Homeópata',
    ],
  },
  {
    slug: 'alimentos',
    nombre: 'Alimentos y bebidas',
    icono: 'restaurant-outline',
    hue: 26,
    giros: [
      'Antojitos típicos', 'Banquetes', 'Barbacoa y consomé', 'Boutique de carnes', 'Cafetería', 'Caldos',
      'Carnitas estilo Michoacán', 'Chamoyadas', 'Churrerías', 'Cochinita pibil', 'Cocina económica',
      'Coctelerías', 'Comida saludable', 'Comida vegetariana', 'Esquites y elotes', 'Hamburguesas y hot dogs',
      'Juguerías', 'Micheladas', 'Paletería y heladería', 'Panadería', 'Panuchería',
      'Picadas y comida veracruzana', 'Pizzas locales', 'Pollerías y rostizados', 'Pozol', 'Quesos',
      'Remolques y food trucks', 'Repostería y pastelería', 'Restaurantes para desayuno', 'Snacks',
      'Tacos de asada', 'Tacos de guisado', 'Tamales', 'Taquerías de pastor y sirloin',
      'Artículos para repostería', 'Tortería', 'Venta de pescados y mariscos', 'Ensaladas',
      'Dulces regionales', 'Hielo en cubos', 'Agua purificada a domicilio', 'Marquesitas y creperías',
      'Taquerías dentro del mercado',
    ],
  },
  {
    slug: 'belleza',
    nombre: 'Belleza y cuidado personal',
    icono: 'cut-outline',
    hue: 334,
    giros: [
      'Aplicación de uñas postizas', 'Barbería', 'Clínica cosmética', 'Clínica de reducción de peso',
      'Estética', 'Maquillista para eventos especiales', 'Masajes reductivos',
      'Masajes relajantes y terapias naturales', 'Perforaciones', 'Productos de belleza', 'Salón de belleza',
      'Salón de belleza móvil', 'Salón de imagen', 'Manicura y pedicura a domicilio', 'Spa', 'Tatuajes',
      'Yoga',
    ],
  },
  {
    slug: 'automotriz',
    nombre: 'Automotriz y motos',
    icono: 'build-outline',
    hue: 212,
    giros: [
      'Alineación y balanceo', 'Autoboutique', 'Balatas y clutch', 'Cambio de aceite', 'Eléctrica automotriz',
      'Lavado de autos', 'Mofles', 'Parabrisas', 'Partes de colisión', 'Recarga de batería', 'Rectificaciones',
      'Refaccionaria en general', 'Refaccionaria para motocicletas', 'Taller de radiadores', 'Taller mecánico',
      'Taller de hojalatería y pintura', 'Taller de motos', 'Taller de suspensión', 'Taller eléctrico',
      'Técnico en climas para autos', 'Venta de llantas', 'Venta de radiadores', 'Vulcanizadora',
    ],
  },
  {
    slug: 'fiestas',
    nombre: 'Diversión, fiestas y música',
    icono: 'musical-notes-outline',
    hue: 276,
    giros: [
      'Alberca y jardín', 'Animadoras y show infantil', 'Decoradores para fiestas (globos)', 'DJ',
      'Entretenimiento para niños', 'Estudio fotográfico', 'Florería', 'Grupo de rock',
      'Grupo musical para bodas', 'Grupo norteño', 'Grupo tropical', 'Inflables', 'Jaula de bateo portátil',
      'Juegos infantiles y ferias', 'Marimba', 'Organizador(a) de eventos', 'Palapas para fiestas', 'Payaso',
      'Renta de mesas, sillas, manteles y cristalería', 'Renta de toldos', 'Rockolas', 'Salón para fiestas',
      'Tamborileros', 'Tienda de bolsas, platos y vasos desechables', 'Tienda de globos y decoración para fiestas',
      'Tienda de piñatas y dulcería', 'Video y fotografía', 'Mesas de postres, dulces y palomitas',
      'Pistas luminosas y shots', 'Mobiliario lounge', 'Mariachis', 'Renta de climas portátiles', 'Tríos',
      'Tecladista', 'Violinista',
    ],
  },
  {
    slug: 'oficios',
    nombre: 'Oficios',
    icono: 'hammer-outline',
    hue: 38,
    giros: [
      'Albañil', 'Aluminero', 'Carpintero', 'Cerrajero', 'Cortinas y persianas', 'Costurera', 'Electricista',
      'Especialista en pantallas', 'Fumigación y control de plagas', 'Herrero', 'Jardinero', 'Mesero',
      'Pintor de brocha gorda', 'Plomero', 'Relojero', 'Reparación de aparatos electrónicos',
      'Reparación de celulares', 'Reparación de electrodomésticos', 'Sastre', 'Tablaroquero',
      'Taller de bicicletas', 'Tapicero', 'Zapatero', 'Pulidor de pisos',
      'Reparación de consolas y videojuegos', 'Acero inoxidable', 'Técnico en refrigeración y A/C',
    ],
  },
  {
    slug: 'servicios',
    nombre: 'Servicios varios',
    icono: 'storefront-outline',
    hue: 196,
    giros: [
      'Copias fotostáticas', 'Ferreterías', 'Fletes', 'Imprenta', 'Impresión de lonas', 'Impresiones de tabloide',
      'Lavandería', 'Mantenimiento y reparación de computadoras', 'Materiales para construcción',
      'Renta de smoking y trajes', 'Tienda de artículos de limpieza', 'Tienda de pintura', 'Tintorería',
      'Tlapalería', 'Transporte en camiones', 'Transporte escolar', 'Uniformes y bordados',
      'Venta de herrajes y cerraduras', 'Vidrios y cristales', 'Agencia de viajes', 'Acuarios',
      'Fabricación de anuncios luminosos', 'Agente de seguros y fianzas', 'Inmobiliaria', 'Perifoneo',
      'Venta de cámaras de circuito cerrado', 'Planchado y lavado a domicilio',
    ],
  },
  {
    slug: 'ensenanza',
    nombre: 'Enseñanza y cultura',
    icono: 'school-outline',
    hue: 246,
    giros: [
      'Asesoría en español', 'Asesoría en física', 'Asesoría en inglés y francés', 'Asesoría en matemáticas',
      'Clases de bajo', 'Clases de batería', 'Clases de canto', 'Clases de guitarra', 'Clases de piano',
      'Clases de saxofón', 'Clases de violín', 'Club de tareas', 'Escuela de belleza', 'Escuela de cocina',
      'Escuela de danza', 'Escuela de inglés', 'Escuela de mecánica', 'Escuela de música',
      'Escuela de refrigeración y A/C', 'Escuela de repostería', 'Escuelas de manejo',
    ],
  },
  {
    slug: 'deportes',
    nombre: 'Deportes',
    icono: 'basketball-outline',
    hue: 142,
    giros: [
      'Clases de básquetbol', 'Clases de béisbol', 'Clases de futbol', 'Clases de futbol americano',
      'Clases de karate', 'Clases de natación', 'Clases de patinaje', 'Clases de salsa', 'Clases de taekwondo',
      'Clases de tenis', 'Clases de voleibol', 'Clases de zumba', 'Tour de pesca', 'Gym', 'Crossfit',
    ],
  },
  {
    slug: 'profesionales',
    nombre: 'Profesionales',
    icono: 'briefcase-outline',
    hue: 226,
    giros: ['Abogado', 'Diseñador gráfico', 'Ingeniero en sistemas', 'Contador público', 'Diseñador web', 'Arquitecto', 'Veterinario'],
  },
  {
    slug: 'inmuebles',
    nombre: 'Inmuebles',
    icono: 'home-outline',
    hue: 14,
    giros: ['Venta y renta'],
  },
  {
    slug: 'vehiculos',
    nombre: 'Vehículos',
    icono: 'car-sport-outline',
    hue: 356,
    giros: ['Venta y renta'],
  },
];

/** Grupos en el orden del Excel; los giros de cada uno, en orden alfabético. */
export const GRUPOS: Grupo[] = CRUDO.map((g) => ({ ...g, giros: [...g.giros].sort((a, b) => a.localeCompare(b, 'es')) }));

export const TOTAL_GIROS = GRUPOS.reduce((n, g) => n + g.giros.length, 0);

export function grupoPorSlug(slug: string | undefined): Grupo | undefined {
  return GRUPOS.find((g) => g.slug === slug);
}

/**
 * Sin acentos ni mayúsculas: "medico" encuentra "Médico". Conserva la longitud
 * de los textos en NFC (cada letra acentuada sigue siendo un carácter), así el
 * índice de una coincidencia sirve para resaltarla en el texto original.
 */
export function normalizar(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export interface Resultado {
  giro: string;
  grupo: Grupo;
}

/** Giros cuyo nombre contiene la búsqueda; los que empiezan con ella, primero. */
export function buscarGiros(busqueda: string): Resultado[] {
  const q = normalizar(busqueda.trim());
  if (!q) return [];
  const res = GRUPOS.flatMap((grupo) => grupo.giros.filter((giro) => normalizar(giro).includes(q)).map((giro) => ({ giro, grupo })));
  const empieza = (r: Resultado) => (normalizar(r.giro).startsWith(q) ? 0 : 1);
  return res.sort((a, b) => empieza(a) - empieza(b) || a.giro.localeCompare(b.giro, 'es'));
}
