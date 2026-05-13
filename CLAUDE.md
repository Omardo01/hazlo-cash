# CLAUDE.md — Contexto del Proyecto Hazlo Cash

> Este documento es la fuente de verdad para cualquier agente de IA que trabaje en este proyecto. Contiene el contexto completo del negocio, la arquitectura técnica, las decisiones tomadas, el roadmap, y el perfil del fundador técnico. Léelo completo antes de escribir cualquier línea de código.

---

## QUIÉN SOY

Soy **Omar**, co-fundador técnico y desarrollador principal de Hazlo Cash. Estoy basado en **Villahermosa, Tabasco, México**.

### Mi rol en Hazlo Cash

- **Co-fundador técnico** con 10% de equity en el proyecto.
- Responsable del **desarrollo completo** de la aplicación y todo el sistema.
- **Mantenimiento continuo** de la plataforma una vez en producción.
- **Diseño inicial** de logo y branding (identidad visual base).
- Una vez operando: **Head of Systems / CTO de facto** — soy la persona responsable de todos los aspectos técnicos y tecnológicos de la plataforma.
- Superviso la **integridad del código**, la **seguridad de la aplicación**, y los **movimientos operativos** dentro del sistema.
- Retengo el rol de **líder técnico** incluso si se incorporan más colaboradores al equipo de sistemas en el futuro.
- Soy el único desarrollador en esta fase. Todo el código pasa por mí.

### Mi stack y preferencias técnicas

**Lo confirmado:**
- **Framework**: Next.js 14+ con App Router y TypeScript. Es mi herramienta principal y lo único 100% definido del stack técnico. Se eligió React/Next.js deliberadamente porque facilita la transición futura a app nativa con React Native — compartiendo paradigma, componentes de lógica, y conocimiento del equipo.
- **Lenguaje**: TypeScript estricto. No JavaScript plano.
- **Preferencias de código**: código limpio, componentes reutilizables, tipado fuerte, sin over-engineering. Prefiero soluciones pragmáticas sobre soluciones perfectas. Ship fast, iterate later.

**Lo demás está abierto.** Las decisiones de backend, base de datos, infraestructura, hosting, pagos, y servicios se irán definiendo conforme avance el desarrollo. Hay ideas y candidatos fuertes (ver sección de Arquitectura Técnica), pero nada está cerrado. La arquitectura se va a ir construyendo y ajustando en el camino.

### Acuerdo con mi socio

Tengo un socio inversor (no técnico). Los términos del acuerdo son:

- **10% de equity** para mí como co-fundador técnico.
- **$2,000 MXN mensuales** de retainer de desarrollo por 12 meses consecutivos a partir de la firma del contrato.
- **MVP funcional** entregado a los 4 meses.
- Meses 5-12: depuración, optimización y mejoras continuas.
- El retainer de $2,000 MXN **continúa los 12 meses completos** aunque la plataforma ya esté operando y generando ingresos.
- Mi socio cubre la inversión inicial y yo cubro todo el desarrollo técnico.

---

## QUÉ ES HAZLO CASH

### Definición

Hazlo Cash es un **marketplace de servicios freelance basado en recomendaciones**, enfocado en **trabajadores de servicios informales en México**. La plataforma conecta clientes con prestadores de servicios a través de una **red de confianza y recomendaciones personales**, incentivada económicamente.

### El problema que resuelve

En México, la mayoría de los servicios informales (plomeros, electricistas, mecánicos, estilistas, albañiles, etc.) se contratan por recomendación de boca en boca. No hay una plataforma que:

1. Digitalice y formalice esas recomendaciones.
2. Premie económicamente a quien recomienda.
3. Dé visibilidad y credibilidad a los prestadores de servicios.
4. Proteja tanto al cliente como al prestador.

### La propuesta de valor

- **Para el Embajador** (quien recomienda): Ganas dinero por recomendar negocios/servicios que ya conoces y en los que confías.
- **Para el Cliente** (quien busca el servicio): Accedes a servicios recomendados por gente real, con reseñas verificadas y pagos protegidos.
- **Para el Negocio** (quien presta el servicio): Recibes clientes nuevos sin gastar en publicidad. Pagas comisión solo por resultados.
- **Para Hazlo Cash**: Comisión por cada transacción que fluye por la plataforma.

---

## EL MODELO DE NEGOCIO

### El flujo core: Embajador → Cliente → Negocio → Comisión

Este es el loop principal de la plataforma y TODO el sistema gira alrededor de él:

1. **El Embajador** conoce un negocio/servicio y lo recomienda. Tiene un código único y un QR personal.
2. **El Cliente** recibe la recomendación (QR, link, código), abre Hazlo Cash, ve el perfil del negocio.
3. **El Cliente** solicita el servicio al **Negocio** a través de la plataforma.
4. **El Negocio** realiza el servicio y se confirma la transacción dentro de la plataforma.
5. **El Embajador** recibe su comisión automáticamente.

### Ejemplo real del flujo (la taquería)

> Un Embajador conoce una taquería buenísima. Comparte su código con un amigo. El amigo va a la taquería, dice que viene por Hazlo Cash y su código. La taquería le da un beneficio (ej: "te dan una coca gratis"). La transacción se registra en la plataforma. El Embajador recibe su comisión. La taquería ganó un cliente nuevo. El cliente tuvo un beneficio extra. Todos ganan.

Este ejemplo es el que usamos para explicar el modelo porque es tangible, viral, y fácil de entender.

### Monetización

- **Comisión por transacción**: Hazlo Cash toma un porcentaje de cada transacción que pasa por la plataforma.
- **Comisión del Embajador**: Un porcentaje de esa comisión (o un porcentaje directo de la transacción) va al Embajador.
- Las comisiones son **configurables por categoría de servicio** (ej: servicios de alto valor como plomería pueden tener distinto % que comida).
- El modelo depende 100% de que las transacciones pasen por la plataforma. De ahí la importancia crítica del sistema anti-bypass.

---

## ARQUITECTURA TÉCNICA

> **NOTA IMPORTANTE**: La única decisión técnica confirmada es **Next.js con TypeScript** como framework frontend, elegido además por su compatibilidad con React Native para una posible transición a app nativa. Todo lo demás en esta sección son **propuestas y candidatos** que se irán evaluando y definiendo conforme avance el desarrollo. Antes de implementar cualquier servicio o herramienta listada aquí, confirmar con Omar si sigue siendo la dirección elegida.

### Stack tecnológico (propuesto — en evaluación)

| Capa | Candidatos | Notas |
|------|-----------|-------|
| Frontend | **Next.js 16.2.3 (App Router) + TypeScript** | ✅ **CONFIRMADO**. Framework principal. Elegido por compatibilidad con React Native para transición móvil futura. |
| Estilos | **Tailwind CSS 4 + shadcn/ui** | ✅ **CONFIRMADO**. Ya instalados y en uso. Componentes base en `src/components/ui/`. |
| Iconos | **Lucide React** | ✅ **CONFIRMADO**. En uso en toda la app. |
| Gráficos | **Recharts** | ✅ **CONFIRMADO**. En uso en dashboards. |
| Auth | Supabase Auth, NextAuth, Clerk, otros | Por definir. Necesita soportar múltiples roles. |
| Base de datos | PostgreSQL (via Supabase o Neon), PlanetScale, otros | Por definir. Necesita soporte geo (PostGIS o equivalente). |
| Realtime | Supabase Realtime, Pusher, Socket.io, otros | Por definir. Necesario para chat y notificaciones. |
| Storage | Supabase Storage, Cloudflare R2, S3, otros | Por definir. Para fotos de perfil, imágenes de negocios. |
| Serverless/Edge | Supabase Edge Functions, Vercel Functions, Cloudflare Workers | Por definir. Para lógica de negocio sensible. |
| Pagos (primario) | SPEI via STP, Conekta, u OpenPay | Fuerte candidato para mercado mexicano, por definir proveedor. |
| Pagos (secundario) | Stripe Connect | Fuerte candidato para tarjetas y split payments. |
| Infra/Hosting | OVHcloud + Coolify, Vercel, Railway, Fly.io, otros | **Totalmente abierto**. Se evaluará costo, simplicidad y control. |
| Geo | PostGIS, Mapbox, Google Maps, Leaflet | Por definir. Búsquedas por cercanía es requisito. |
| Monitoreo | Sentry, LogRocket, Datadog, otros | Por definir. |
| Analytics | PostHog, Mixpanel, Plausible, otros | Por definir. |
| App móvil / PWA | React Native/Expo, Service Worker + manifest.json | Por definir. Puede ser PWA, nativa, o híbrida. Ambas opciones están abiertas. |

### Ideas arquitectónicas (por validar)

Estas son direcciones que hemos discutido y tienen sentido para el proyecto, pero **no son decisiones finales**. Se irán confirmando o descartando conforme se avance:

1. **PWA vs. app nativa**: Ambas opciones están completamente abiertas. Una PWA reduciría time-to-market. Una app nativa (React Native/Expo) podría ser la ruta correcta desde el inicio si las condiciones lo justifican. Esta decisión se tomará antes del arranque del desarrollo y no está definida aún.

2. **SPEI como método principal, Stripe como fallback**: El mercado mexicano informal paga con transferencia. Tiene mucho sentido, pero el proveedor específico de SPEI está por definirse.

3. **BaaS tipo Supabase**: Un servicio todo-en-uno (auth + DB + realtime + storage) simplificaría mucho el desarrollo. Supabase es el candidato más fuerte pero no es la única opción.

4. **Anti-bypass desde el día 1**: Esto SÍ es una decisión firme a nivel de producto. El cómo se implemente técnicamente es flexible, pero el concepto es no-negociable.

5. **Hosting**: Completamente abierto. Puede ser self-hosted (OVHcloud + Coolify), puede ser Vercel, puede ser Railway. Se evaluará según costo, simplicidad de deployment, y necesidades del proyecto.

6. **TypeScript estricto**: Confirmado. No hay JavaScript plano en este proyecto.

7. **Experiencia móvil prioritaria**: El 90%+ de los usuarios accederá desde el teléfono. El canal exacto (web/PWA vs. app nativa) está por definirse, pero la experiencia móvil es siempre la prioritaria.

### Esquema de base de datos (conceptual — sujeto a cambios)

Las tablas/entidades principales que el sistema necesitará, independientemente de qué BD o BaaS se elija:

- **users**: Tabla base de usuarios. Un usuario puede tener múltiples roles.
- **profiles**: Información extendida del usuario (nombre, foto, ubicación, etc.).
- **businesses**: Perfiles de negocios/prestadores de servicio. Nombre, categoría, ubicación (PostGIS), descripción, fotos, horarios, calificación promedio.
- **ambassadors**: Perfil del embajador. Código único, QR, nivel (bronce/plata/oro), estadísticas.
- **referral_codes**: Códigos de referencia generados por embajadores. Formato sugerido: `HAZLO-XXXX`.
- **referrals**: Registro de cada uso de un código. Quién compartió, quién usó, cuándo, para qué negocio.
- **service_requests**: Solicitudes de servicio de Cliente a Negocio.
- **transactions**: Transacciones completadas. Monto, método de pago, estado, timestamps.
- **commissions**: Comisiones generadas por cada transacción. Monto, estado (pendiente, pagada), embajador asociado.
- **wallets**: Balance acumulado de cada embajador. Historial de retiros.
- **withdrawals**: Solicitudes de retiro de embajadores. Estado, CLABE destino, monto.
- **reviews**: Reseñas y calificaciones. Solo válidas para transacciones dentro de la plataforma.
- **messages**: Chat en tiempo real entre cliente y negocio (mediado por la plataforma).
- **categories**: Categorías de servicios (plomería, electricidad, comida, belleza, etc.).
- **notifications**: Sistema de notificaciones (push + in-app).

**IMPORTANTE**: Si se usa Supabase u otra BD con RLS, habilitarlo en TODAS las tablas desde el día 1. Si se usa otro approach, implementar autorización equivalente a nivel de API.

### Sistema anti-bypass (CRÍTICO — esto SÍ está definido)

El anti-bypass no es un feature opcional. Es la columna vertebral del modelo de negocio. Independientemente de qué tecnologías se elijan, estas medidas son requerimientos firmes del producto:

1. **Datos de contacto protegidos**: El Negocio NO ve el teléfono ni email del Cliente hasta que la transacción se confirma dentro de la plataforma. Y viceversa.
2. **Chat mediado**: Toda comunicación entre Cliente y Negocio pasa por el chat in-app. No se comparten datos de contacto directo.
3. **Incentivos dentro de plataforma**: Descuentos, puntos de lealtad, y beneficios solo son válidos para transacciones dentro de Hazlo Cash.
4. **Reputación atada a la plataforma**: Las reseñas, calificaciones, y el historial del Negocio solo se acumulan por transacciones verificadas dentro del sistema. Si te sales, pierdes tu reputación.
5. **Sistema de créditos/puntos**: Existen solo dentro del ecosistema Hazlo Cash. No tienen valor fuera.
6. **Niveles de Embajador**: Los embajadores suben de nivel (bronce, plata, oro) con mejores comisiones. Solo cuentan transacciones dentro de la plataforma.

### Sistema de pagos (requerimientos — proveedores por definir)

El sistema de pagos es crucial para el modelo. Estos son los requerimientos funcionales independientemente del proveedor que se elija:

#### Transferencia bancaria mexicana (SPEI) — método principal probable
- Integración con algún proveedor de pagos SPEI (STP, Conekta, OpenPay, u otro — por definir).
- Capacidad de generar referencias únicas por transacción para conciliación automática.
- Webhooks para confirmar depósitos en tiempo real.
- Conciliación automática: pago recibido → marcar transacción como pagada → trigger de comisión.

#### Pagos con tarjeta — método secundario probable
- Stripe Connect es el candidato más fuerte para split payments de marketplace.
- Tarjeta de débito/crédito como opción alternativa.
- Proveedor final por definir.

#### Motor de comisiones (requerimiento firme)
- Cálculo automático al confirmarse una transacción.
- Porcentaje configurable por categoría de servicio.
- Wallet/balance interno del Embajador con acumulado.
- Mecanismo de retiro para embajadores (dispersión a su cuenta bancaria).
- Dashboard financiero completo: transacciones, comisiones pendientes, historial de retiros.

---

## ROADMAP TÉCNICO (12 MESES)

### Mes 1 — Cimientos

**Objetivo**: Tener la base del proyecto corriendo, auth funcionando, y los modelos de datos definidos.

- Inicializar proyecto Next.js 14+ con App Router y TypeScript.
- Elegir y configurar BaaS/backend (Supabase, Neon, otro) y sistema de auth.
- Definir y migrar esquema de base de datos con control de acceso en todas las entidades.
- Sistema de autenticación con 3 roles: Cliente, Negocio, Embajador (un usuario puede tener múltiples roles).
- Onboarding flow diferenciado por rol.
- CRUD de perfiles de Negocio: nombre, categoría, ubicación, descripción, fotos.
- Geolocalización para búsquedas por cercanía (PostGIS, Google Maps, u otro).
- Deploy inicial en el hosting elegido con CI/CD desde GitHub.

### Mes 2 — El Motor de Recomendaciones

**Objetivo**: El flujo core Embajador → Cliente → Negocio funcionando end-to-end (sin pagos reales todavía).

- Sistema de códigos de referencia únicos por Embajador (formato HAZLO-XXXX).
- Generación de QR codes dinámicos.
- Deep linking: código abre la app/web directo al negocio recomendado.
- Tracking completo de cada uso de código.
- Dashboard del Embajador: mis códigos, usos, comisiones estimadas.
- Flujo completo: Cliente escanea QR → ve perfil del Negocio → solicita servicio → Negocio recibe notificación.
- Chat en tiempo real entre Cliente y Negocio (via websockets, realtime DB, o servicio de chat).
- Confirmación de servicio completado por ambas partes.
- Implementación de las medidas anti-bypass (chat mediado, datos protegidos).

### Mes 3 — Pagos y Comisiones

**Objetivo**: Dinero real fluyendo por la plataforma. Comisiones calculándose y acumulándose.

- Integración del proveedor de pagos elegido (SPEI y/o tarjeta).
- Motor de comisiones automático: transacción completada → cálculo → acumulación en wallet.
- Wallet del Embajador con balance y solicitud de retiros.
- Dispersión de retiros a cuenta bancaria del embajador.
- Dashboard financiero para Negocios: ventas via Hazlo Cash, ROI de embajadores.
- Dashboard financiero admin: GMV, comisiones, flujo de dinero.

### Mes 4 — MVP Launch Ready

**Objetivo**: Plataforma lista para usuarios reales. Admin panel. Monitoreo.

- Entrega móvil según la ruta elegida: PWA (manifest, service worker, instalable) o app nativa publicada en tiendas.
- Push notifications (según plataforma elegida).
- Diseño mobile-first responsive pulido.
- Offline-first para catálogo de negocios (si aplica según plataforma).
- Admin panel: métricas clave, gestión de disputas, aprobación de negocios, feature flags.
- Testing E2E del flujo completo.
- Load testing básico.
- Revisión de seguridad: RLS, rate limiting, validación de inputs.
- Setup de monitoreo: errores en tiempo real + uptime (Sentry, LogRocket, u otro).
- Landing page pública con waitlist.

### Meses 5–8 — Optimización y Crecimiento

**Objetivo**: Iterar basándose en datos reales de usuarios. Mejorar retención. Escalar técnicamente.

- Analytics: implementar tracking de eventos y funnels (PostHog, Mixpanel, Plausible, u otro).
- Funnel analysis y A/B testing.
- Optimización de performance (Core Web Vitals, lazy loading, ISR).
- Sistema de niveles para Embajadores (bronce, plata, oro) con % de comisión creciente.
- Programa de lealtad para Clientes.
- Reviews y ratings con fotos verificadas.
- Favoritos, historial de servicios, notificaciones inteligentes.
- CDN para assets estáticos (Cloudflare u otro).
- Optimización de queries a BD y caching si es necesario.
- Server-side functions para lógica pesada.
- Evaluar si la arquitectura necesita crecer o refactorizarse.

### Meses 9–12 — Madurez y Expansión

**Objetivo**: Formalizar, documentar APIs, preparar para escala.

- KYC/KYB para negocios de alto volumen.
- Facturación electrónica CFDI integrada.
- Términos de servicio y privacidad revisados legalmente.
- Cumplimiento regulatorio fintech mexicana (si aplica por volumen).
- API REST documentada para integraciones de negocios.
- Webhooks para eventos clave.
- Widget embebible: botón "Recomiéndame en Hazlo Cash".
- Evaluación de migración a React Native/Expo (solo si métricas lo justifican).

---

## IDENTIDAD VISUAL

### Colores de marca (definidos)

| Token | Valor | Uso |
|-------|-------|-----|
| `brand-purple` | `#2D2B8F` | Color principal — texto, fondos primarios, CTAs |
| `brand-teal` | `#00A896` | Acento secundario — tagline, highlights, links |
| `brand-orange` | `#F5A623` | Energía / spark — acentos, notificaciones, badges |
| `brand-white` | `#FFFFFF` | Fondos claros |
| `brand-dark` | `#1A1840` | Variante oscura del purple para fondos nocturnos |

### Tipografía y tono visual

- Logotipo: dos figuras humanas estilizadas en movimiento, una pasando algo a la otra (la recomendación).
- Tagline: **RECOMIENDA. GANA. CRECE.**
- La identidad es **dinámica, directa, mexicana**. No corporativa, no fría.
- El diseño aún no es definitivo — estos colores son el punto de partida confirmado.

---

## ESTRUCTURA DEL PROYECTO (ESTADO REAL — actualizado)

```
hazlocash/
├── src/
│   ├── app/
│   │   ├── (dashboard)/                  # Vista del Embajador
│   │   │   ├── layout.tsx                # Layout con AppSidebar + TooltipProvider
│   │   │   └── ambassador/
│   │   │       ├── page.tsx              # ✅ Dashboard principal del embajador
│   │   │       ├── comisiones/page.tsx   # ✅ Historial y detalle de comisiones
│   │   │       ├── perfil/page.tsx       # ✅ Perfil del embajador (v1)
│   │   │       └── perfil2/page.tsx      # ✅ Perfil del embajador (v2 alternativa)
│   │   ├── (negocio)/                    # Vista del Negocio
│   │   │   ├── layout.tsx                # Layout con NegocioSidebar + TooltipProvider
│   │   │   └── negocio/
│   │   │       ├── page.tsx              # ✅ Dashboard inicio del negocio
│   │   │       ├── solicitudes/page.tsx  # ✅ Gestión de solicitudes (expandible, filtros, acciones)
│   │   │       ├── embajadores/page.tsx  # ✅ Lista de embajadores con ranking y actividad
│   │   │       └── perfil/page.tsx       # ✅ Mi Negocio (tabs: Info / Servicios / Horarios / Oferta)
│   │   ├── globals.css                   # Variables CSS: brand-purple, brand-teal, brand-orange, brand-dark
│   │   ├── layout.tsx                    # Root layout
│   │   └── page.tsx                      # ✅ Landing page pública
│   ├── components/
│   │   ├── ui/                           # Componentes shadcn/ui instalados:
│   │   │   ├── avatar.tsx                #   Avatar
│   │   │   ├── badge.tsx                 #   Badge
│   │   │   ├── card.tsx                  #   Card
│   │   │   ├── chart.tsx                 #   ChartContainer (Recharts wrapper)
│   │   │   ├── dialog.tsx                #   Dialog / Modal
│   │   │   ├── dropdown-menu.tsx         #   DropdownMenu
│   │   │   ├── input.tsx                 #   Input
│   │   │   ├── progress.tsx              #   Progress bar
│   │   │   ├── scroll-area.tsx           #   ScrollArea
│   │   │   ├── separator.tsx             #   Separator
│   │   │   ├── sheet.tsx                 #   Sheet (drawer)
│   │   │   ├── sidebar.tsx               #   Sidebar primitivo
│   │   │   ├── skeleton.tsx              #   Skeleton loader
│   │   │   ├── tabs.tsx                  #   Tabs
│   │   │   └── tooltip.tsx               #   Tooltip
│   │   └── dashboard/                    # Componentes de negocio / embajador:
│   │       ├── AppSidebar.tsx            #   Sidebar del embajador (íconos + nav)
│   │       ├── NegocioSidebar.tsx        #   Sidebar del negocio (íconos + nav)
│   │       ├── DashboardHeader.tsx       #   Header reutilizable
│   │       ├── StatCard.tsx              #   Tarjeta de estadística
│   │       ├── EarningsChart.tsx         #   Gráfico de ingresos (Recharts)
│   │       ├── ReferralDistribution.tsx  #   Distribución de referidos
│   │       ├── LevelProgress.tsx         #   Progreso de nivel embajador
│   │       ├── RecentActivity.tsx        #   Actividad reciente
│   │       ├── QuickActions.tsx          #   Acciones rápidas
│   │       ├── RightPanel.tsx            #   Panel derecho genérico
│   │       └── ShareCodeDialog.tsx       #   Dialog para compartir código QR
│   ├── hooks/                            # Custom hooks (por poblar)
│   └── lib/
│       └── utils.ts                      # cn() helper (clsx + tailwind-merge)
├── .claude/
│   └── launch.json                       # Config dev server (puerto 3000)
├── next.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md
```

---

## ESTADO ACTUAL DEL DESARROLLO

> Fecha de última actualización: Abril 2026 (Mes 1 del roadmap)

### Decisiones de stack YA tomadas (no reabrir)

| Capa | Decisión | Notas |
|------|----------|-------|
| Framework | Next.js 16.2.3 + App Router + TypeScript | Instalado y corriendo |
| Estilos | Tailwind CSS 4 | Instalado. Variables CSS en `globals.css` |
| Componentes UI | shadcn/ui | 15 componentes instalados en `src/components/ui/` |
| Iconos | Lucide React | En uso en toda la app |
| Gráficos | Recharts | Wrapper `ChartContainer` en `src/components/ui/chart.tsx` |
| Animaciones | motion (Framer Motion) | Instalado, en uso en `perfil2` |

### Rutas implementadas

#### Vista Negocio — `/negocio/*`
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/negocio` | ✅ Listo | Dashboard: stats, gráfico semanal, solicitudes recientes, top embajadores |
| `/negocio/solicitudes` | ✅ Listo | Tabla completa, filas expandibles, acciones (Aceptar/Confirmar/Rechazar), filtros, búsqueda |
| `/negocio/embajadores` | ✅ Listo | Ranking con niveles (bronce/plata/oro), copiar código, actividad reciente |
| `/negocio/perfil` | ✅ Listo | Tabs: Información básica, Servicios/Menú, Horarios, Oferta Hazlo Cash |

#### Vista Embajador — `/ambassador/*`
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/ambassador` | ✅ Listo | Dashboard: nivel, stats, gráfico de ingresos, distribución de referidos, panel derecho |
| `/ambassador/comisiones` | ✅ Listo | Historial de comisiones con detalle |
| `/ambassador/perfil` | ✅ Listo | Perfil del embajador v1 |
| `/ambassador/perfil2` | ✅ Listo | Perfil del embajador v2 (alternativa con animaciones) |

#### Rutas pendientes (aún no implementadas)
| Ruta | Prioridad | Descripción |
|------|-----------|-------------|
| `/negocio/estadisticas` | Media | Estadísticas detalladas del negocio |
| `/negocio/resenas` | Media | Gestión de reseñas y calificaciones |
| `/negocio/mensajes` | Alta | Chat con clientes (anti-bypass) |
| `/negocio/ajustes` | Baja | Configuración de cuenta |
| `/ambassador/stats` | Media | Estadísticas detalladas |
| `/ambassador/referrals` | Media | Historial completo de referidos |
| `/ambassador/businesses` | Media | Negocios afiliados |
| Rutas de `/auth` | Alta | Login, registro, onboarding por rol |
| Landing page completa | Alta | Página pública con waitlist |
| `/r/[code]` | Alta | Deep link de referido |

### Patrones de UI establecidos (seguir estos para consistencia)

1. **Layout de página**: `NegocioHeader` sticky + `div.flex.flex-1.min-h-0` con contenido principal + panel derecho (270px, oculto en mobile).
2. **Header de nav**: Tabs de navegación con underline naranja en activo. Siempre recibe `activeHref` como prop.
3. **Cards**: `rounded-2xl border border-border bg-white` con padding `p-4` o `p-5`.
4. **Pills de estado**: `rounded-full px-2.5 py-1 text-[10px] font-semibold` con dot de color.
5. **Botones primarios**: `bg-brand-orange text-white rounded-xl px-4 py-2.5 text-[12px] font-semibold`.
6. **Breadcrumb**: `text-[11px] font-semibold uppercase tracking-wider` con naranja para la sección.
7. **Gradiente de negocio**: `linear-gradient(135deg, #1A1840 0%, #2D2B8F 60%, #F5A623 200%)`.
8. **Toggle custom**: Componente local (no shadcn) en `bg-brand-teal` cuando activo.
9. **Datos de negocio en UI**: Usar datos mock mientras no haya backend. Negocio demo: "Tacos El Güero", código "TG".

> La estructura de `lib/` se poblará conforme se definan los servicios de backend (BaaS, auth, pagos).

---

## REGLAS PARA CLAUDE CODE

### Principios generales (firmes)

1. **TypeScript estricto siempre**. No uses `any`. Si necesitas un tipo temporal, usa `unknown` y haz type narrowing.
2. **Mobile-first en diseño**. Todo componente se diseña primero para 375px de ancho y luego se adapta hacia arriba. La plataforma de entrega (web/PWA o nativa) está por definirse.
3. **Server Components por defecto** (Next.js). Usa `"use client"` solo cuando sea necesario (interactividad, hooks, event handlers).
4. **Lógica de dinero en el servidor**. Cálculos de comisiones, webhooks de pagos, y cualquier cosa que involucre dinero va en funciones server-side, NUNCA en el cliente.
5. **No over-engineer**. Si algo funciona con una solución simple, no lo compliques. Ship first, refactor later.
6. **Código en español para variables de negocio** (nombres de tablas, tipos de dominio) y en inglés para código técnico (funciones, utilidades, componentes).
7. **Seguridad desde el inicio**. Autorización a nivel de datos (RLS, middleware, o lo que aplique según la BD elegida) en todas las entidades desde el día 1.

### Principios flexibles (dependen de las decisiones técnicas que se tomen)

- Si se usa Supabase: aprovechar sus soluciones nativas (auth, storage, realtime) antes de buscar alternativas.
- Si se usa otro BaaS o backend custom: aplicar el mismo principio de no reinventar la rueda.
- La elección de hosting, BaaS, proveedores de pago, y herramientas auxiliares se irá definiendo. **Pregunta antes de asumir** qué servicio usar.

### Convenciones de código

- **Componentes**: PascalCase, un componente por archivo. `BusinessCard.tsx`, `AmbassadorDashboard.tsx`.
- **Hooks**: camelCase con prefijo `use`. `useBusinessProfile.ts`, `useReferralCode.ts`.
- **Tipos**: PascalCase. `Business`, `Ambassador`, `Transaction`. Los tipos de BD se generan desde Supabase.
- **Utilidades**: camelCase. `formatCurrency.ts`, `generateReferralCode.ts`.
- **Rutas de API**: kebab-case. `/api/verify-payment`, `/api/calculate-commission`.
- **Migraciones**: timestamp + descripción. `20240415_create_businesses_table.sql`.
- **Commits**: Conventional Commits en español. `feat: agregar sistema de códigos de referencia`, `fix: corregir cálculo de comisión en categoría alimentos`.

### Variables de entorno (ejemplo — dependerán de las herramientas elegidas)

```env
# Base de datos / BaaS (ejemplo con Supabase, puede cambiar)
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=

# Pagos (proveedores por definir)
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# SPEI_API_KEY=
# SPEI_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=Hazlo Cash

# Monitoreo (proveedor por definir)
# SENTRY_DSN=

# Analytics (proveedor por definir)
# NEXT_PUBLIC_POSTHOG_KEY=
# NEXT_PUBLIC_POSTHOG_HOST=
```

> Las variables específicas se irán definiendo conforme se elijan los proveedores y servicios.

### Lo que NO hacer

- **NO** expongas claves secretas en el cliente. API keys, service role keys, y secrets de webhooks solo van en server-side.
- **NO** permitas acceso a datos sin autorización. Toda entidad debe tener control de acceso (RLS, middleware, o lo que aplique).
- **NO** compartas datos de contacto directo entre Cliente y Negocio en el chat. Esto rompe el modelo anti-bypass.
- **NO** calcules comisiones en el frontend. Siempre server-side.
- **NO** uses JavaScript plano. Todo es TypeScript.
- **NO** asumas qué servicio o proveedor usar sin confirmar. La arquitectura está abierta — pregunta antes de implementar.
- **NO** agregues dependencias innecesarias. Antes de instalar un paquete, verifica si el framework o las herramientas actuales ya lo resuelven.

---

## CONTEXTO ADICIONAL

### Mercado objetivo

- **Geografía**: México, empezando por mercados locales (probablemente Tabasco y zonas cercanas).
- **Usuarios target**: Trabajadores de servicios informales — plomeros, electricistas, mecánicos, estilistas, albañiles, cocineros, taquerías, etc.
- **Perfil demográfico**: Personas que usan WhatsApp como herramienta principal de comunicación, acceden a internet principalmente desde el celular, y confían más en recomendaciones personales que en publicidad.
- **Competencia indirecta**: WhatsApp (grupos de recomendaciones), Facebook Marketplace, Google Maps (reseñas), directorios locales.
- **Ventaja competitiva**: Nadie incentiva económicamente la recomendación de boca en boca de manera sistematizada.

### Tono y comunicación

- La marca es **cercana, directa, mexicana**. No corporativa.
- El lenguaje en la UI debe ser **coloquial pero profesional**. No tutear de manera forzada ni ser demasiado formal.
- Los errores y mensajes del sistema deben ser **claros y amigables**, no técnicos.
- Ejemplo de buen mensaje: "¡Listo! Tu recomendación fue enviada. Te avisamos cuando la usen."
- Ejemplo de mal mensaje: "Referral code successfully dispatched. Awaiting redemption."

### Prioridades de producto (en orden)

1. **El flujo de recomendación funcione perfecto**. Si esto falla, nada más importa.
2. **Los pagos sean confiables y transparentes**. Dinero es confianza.
3. **La experiencia móvil sea impecable**. El 90% de uso será desde el celular.
4. **El anti-bypass sea robusto**. Sin esto, el modelo de negocio no sobrevive.
5. **Las métricas estén visibles**. Necesitamos saber qué está pasando en la plataforma.
6. Todo lo demás es secundario y se prioriza según datos reales de usuarios.
