# UI-TODO — Hazlo Cash

> Análisis exhaustivo de gaps de UI en el proyecto. Lo que está hecho son dashboards bonitos, pero el núcleo conversacional/transaccional del marketplace (auth, chat, solicitud, pago, reseñas, notificaciones, estados base) está prácticamente en 0%.
>
> Última actualización: 2026-05-19

---

## 📊 Resumen ejecutivo de gaps

| Área | Estado | Items faltantes (aprox) |
|---|---|---|
| Auth flow | 0% | ~8 pantallas |
| Vista Cliente | 15% | ~12 pantallas |
| Mensajería/Chat | 0% | ~3 pantallas + componentes |
| Estados base (loading/empty/error/404) | 5% | ~20 archivos |
| Componentes shadcn | 60% | ~13 componentes faltantes |
| Modales/flujos críticos | 20% | ~10 flujos |
| Inputs especializados MX | 0% | ~8 componentes |
| Notificaciones in-app | 0% | UI completa |
| Detalles individuales | 10% | ~15 vistas detalle |
| PWA/mobile | 0% | ~8 archivos |
| Modo oscuro | 0% | Variantes en todo |
| Páginas legales | 0% | ~5 páginas |

---

## 1. 🔗 Links rotos en sidebars (404 garantizado)

Los sidebars apuntan a páginas que **no existen**:

- [ ] `/admin/mensajes`
- [ ] `/negocio/mensajes`
- [ ] `/recomendador/messages` (además: inconsistencia inglés vs español — debería ser `mensajes`)

---

## 2. 🛒 Vista Cliente — esqueleto mínimo (la más incompleta)

Solo hay **2 páginas** (`/cliente` y `/cliente/negocio`). En un marketplace, faltan al menos:

- [ ] Búsqueda con filtros (categoría, distancia, precio, calificación)
- [ ] Solicitar servicio (formulario + confirmación)
- [ ] "Mostrar al negocio" — pantalla full-screen con el código/QR del cliente
- [ ] Mis servicios — historial de solicitudes activas/pasadas
- [ ] Detalle de servicio activo — estado, chat, cancelar
- [ ] Chat con el negocio (anti-bypass = UI obligatoria)
- [ ] Dejar reseña post-servicio
- [ ] Mis favoritos / Guardados
- [ ] Mi perfil (cliente)
- [ ] Notificaciones (in-app)
- [ ] Pantalla de éxito post-transacción
- [ ] Recomendar este negocio (el cliente también puede ser embajador)
- [ ] Empty state — "no hay negocios cerca de ti"
- [ ] Onboarding/welcome del cliente
- [ ] Continuación de `/r/[code]` — qué pasa después de "Mostrar al negocio"

---

## 3. 🔐 Auth flow — 0 páginas existen

No hay UI para nada de esto, y se necesita antes del MVP:

- [ ] Login (email/teléfono + password / OTP)
- [ ] Registro (con elección de rol)
- [ ] Selector de rol (multi-rol: soy embajador Y cliente)
- [ ] Recuperar contraseña
- [ ] Verificación de email/SMS (OTP screen)
- [ ] Onboarding diferenciado por rol (4 flujos distintos: Cliente / Negocio / Embajador / Admin)
- [ ] Logout / sesión expirada
- [ ] Switcher de rol activo en la UI principal

---

## 4. 💬 Sistema de mensajería — 0% UI

El **anti-bypass** depende de esto y los sidebars ya tienen el link, pero no existe:

- [ ] Lista de conversaciones
- [ ] Vista de chat individual
- [ ] Indicadores de "leído", "escribiendo", timestamps
- [ ] Badge de no-leídos en sidebar
- [ ] Bloqueo visual de datos de contacto (cuando alguien intenta compartir teléfono/email)

---

## 5. 🧱 Estados base faltantes (todas las vistas)

- [ ] **Loading states** — no veo skeletons en uso, aunque `skeleton.tsx` está instalado
- [ ] **Empty states** ilustrados (no hay solicitudes, no hay comisiones, no hay referidos)
- [ ] **Error states** / `error.tsx` por ruta
- [ ] **404 page** personalizada (`not-found.tsx`)
- [ ] **500 page** personalizada
- [ ] **Offline state** (crítico para mobile-first en México)
- [ ] **`loading.tsx`** por ruta (App Router)

---

## 6. 🧩 Componentes shadcn faltantes (críticos para próximos flujos)

Solo hay 15 componentes; **faltan los más usados para formularios y marketplaces**:

| Componente | Para qué se necesita |
|---|---|
| [ ] `form` + `react-hook-form` + `zod` | Registro, alta de negocio, retiros, perfil |
| [ ] `sonner` / `toast` | Feedback de acciones (copiado, enviado, error) |
| [ ] `select` / `combobox` | Categorías, filtros, estados |
| [ ] `calendar` / `date-picker` | Horarios, fechas de retiro, agendar |
| [ ] `table` (data-table) | Admin: users, negocios, finanzas |
| [ ] `switch` (primitivo shadcn) | Settings, ofertas activas |
| [ ] `radio-group` / `checkbox` | Formularios |
| [ ] `textarea` | Mensajes, descripción de negocio, reseñas |
| [ ] `alert-dialog` | Confirmaciones destructivas (cancelar, eliminar) |
| [ ] `popover` | Menús contextuales, filtros compactos |
| [ ] `command` (cmdk) | Búsqueda global ⌘K |
| [ ] `pagination` | Listas largas (admin, comisiones) |
| [ ] `carousel` | Galería de fotos del negocio |
| [ ] `slider` | Filtros de rango (precio, distancia) |
| [ ] `drawer` | Mobile actions, filtros en móvil |

---

## 7. 💸 Modales / flujos críticos sin diseñar

- [ ] **Solicitar retiro** (embajador) — formulario CLABE + confirmación + estado
- [ ] **Historial de retiros**
- [ ] **Detalle de comisión individual** (no hay vista detalle, solo lista)
- [ ] **Detalle de solicitud individual** (negocio)
- [ ] **Detalle de transacción** (admin)
- [ ] **Detalle de usuario** (admin) — perfil completo, suspender, etc.
- [ ] **Aprobar / rechazar negocio** (admin) — flujo de KYB
- [ ] **Gestión de disputas** (admin)
- [ ] **Detalle de embajador individual** (negocio)
- [ ] **Selección de método de pago** (cliente)
- [ ] **Filtros avanzados** (sheet/drawer reutilizable)

---

## 8. 📥 Inputs especializados para México

Sin estos, los formularios sentirán mal hechos:

- [ ] **Input de CLABE** (18 dígitos + validación visual)
- [ ] **Input de teléfono mexicano** (LADA + formato)
- [ ] **Input de moneda MXN** (formateo en vivo $1,234.56)
- [ ] **Input de RFC** (validación)
- [ ] **QR scanner** — cliente escanea código físico del embajador
- [ ] **File upload** con preview (fotos de negocio, comprobantes)
- [ ] **Image cropper** (foto de perfil, logo)
- [ ] **Geolocation picker** (negocio define su ubicación en mapa)
- [ ] **Map view embebido** (cliente ve ubicación del negocio)

---

## 9. 🔔 Notificaciones in-app

- [ ] Icono de campana con badge en header
- [ ] Dropdown/sheet con lista de notificaciones
- [ ] Página dedicada `/notificaciones`
- [ ] Estados leído/no-leído
- [ ] Push notification permission prompt UI

---

## 10. 🔍 Búsqueda global

- [ ] ⌘K command palette (negocios, usuarios, transacciones)
- [ ] Barra de búsqueda persistente en cliente
- [ ] Resultados con preview

---

## 11. 📊 Detalles que faltan por sección

### Vista Negocio
- [ ] `/negocio/estadisticas` (mencionado en CLAUDE.md)
- [ ] `/negocio/resenas`
- [ ] `/negocio/ajustes`
- [ ] Onboarding del negocio (primera vez)
- [ ] Verificación / KYB en proceso

### Vista Recomendador
- [ ] Lista de "mis referidos" (gente que usó mi código)
- [ ] Catálogo de negocios que puedo recomendar
- [ ] Visualización del programa de niveles (bronce→plata→oro)
- [ ] Estadísticas detalladas
- [ ] Compartir código completo (página, no solo dialog)

### Vista Admin
- [ ] Gestión de categorías de servicio
- [ ] Configuración de comisiones por categoría
- [ ] Feature flags
- [ ] Logs / auditoría
- [ ] Reportes exportables
- [ ] Broadcast / notificación masiva

---

## 12. 📱 PWA / Mobile fundamentals

- [ ] **`manifest.json`** (instalable en celular)
- [ ] **Iconos de app** (solo hay `favicon.ico`, faltan 192, 512, apple-touch)
- [ ] **Splash screens**
- [ ] **Meta tags / OG images** para compartir en WhatsApp (crítico para el canal principal de marketing)
- [ ] **Service Worker** básico para offline
- [ ] **`theme-color`** meta tag

---

## 13. ♿ Accesibilidad y polish

- [ ] **Modo oscuro** — no hay variantes `dark:` ni toggle (CLAUDE.md menciona `brand-dark`)
- [ ] Skip-to-content link
- [ ] `lang="es-MX"` en html
- [ ] Focus styles consistentes verificados
- [ ] Soporte `prefers-reduced-motion` para las animaciones de motion

---

## 14. ⚖️ Páginas legales (obligatorias antes de launch)

- [ ] `/terminos`
- [ ] `/privacidad`
- [ ] `/aviso-cookies`
- [ ] `/contacto`
- [ ] `/faq`
- [ ] `/sobre-nosotros` (opcional pero ayuda a confianza)

---

## 15. 🎉 Post-waitlist / pre-launch

- `WaitlistForm.tsx` existe ✅
- [ ] Página de "gracias por suscribirte"
- [ ] Email confirmation visual
- [ ] Referral del waitlist (gana posiciones invitando)

---

## 🎯 Orden de prioridad sugerido

1. **Estados base + componentes shadcn faltantes** (cimiento — 1-2 días)
2. **Auth flow completo** (necesario para todo lo demás — 2-3 días)
3. **Completar Vista Cliente** (donde está el agujero más grande — 4-5 días)
4. **Sistema de mensajería** (anti-bypass = no negociable — 3 días)
5. **Modales/flujos faltantes** (retiros, detalles, confirmaciones)
6. **Inputs especializados MX** (en paralelo con auth y formularios)
7. **Notificaciones in-app + búsqueda global**
8. **PWA fundamentals + meta tags para WhatsApp**
9. **Detalles individuales por sección**
10. **Páginas legales + modo oscuro + polish final**
