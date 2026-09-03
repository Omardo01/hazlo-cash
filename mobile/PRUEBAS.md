# Hazlo Cash — cómo dejar la app lista para probar

Guía operativa para armar una demo o pasarle la app a alguien más. Todo lo que
aparece aquí se corre desde `mobile/` salvo que se diga otra cosa.

---

## 0. Antes de cualquier prueba: ¿está despierto Supabase?

El free tier **pausa el proyecto tras ~7 días sin peticiones** y da de baja el
DNS del subdominio. La app empieza a fallar con `Network request failed` y no
hay forma de arreglarlo desde el código. Ya pasó dos veces (9 de julio y 2 de
septiembre de 2026).

```bash
nslookup pihexutjvuifjzkukfwo.supabase.co
```

- Responde una IP → todo bien.
- `NXDOMAIN` → el proyecto está pausado. Entra al
  [dashboard de Supabase](https://supabase.com/dashboard) → **Restore project**.
  Los datos se conservan (en free tier hasta ~90 días).

Para que no vuelva a pasar hay un workflow de GitHub Actions
(`.github/workflows/keepalive-supabase.yml`) que hace un ping diario. Necesita
dos secrets en el repo (**Settings → Secrets and variables → Actions**):

| Secret | Valor |
|---|---|
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | la anon key (es pública, va en el bundle de la app) |

Si el ping falla, GitHub manda correo — te enteras antes que por la app.

---

## 1. Aplicar migraciones pendientes

> **Las dos migraciones de abajo ya se aplicaron el 2026-09-03** y quedaron
> verificadas contra la base. Se dejan documentadas por si hay que rehacer el
> proyecto desde cero; son idempotentes (`create or replace`, `drop ... if
> exists`), así que volver a correrlas no rompe nada.

Las migraciones viven en `supabase/migrations/` y se aplican con `psql` usando
`POSTGRES_URL` del `.env.local` de la raíz:

```bash
psql "$POSTGRES_URL" -f supabase/migrations/20260903_registro_publico_y_blindaje_negocio.sql
```

```bash
psql "$POSTGRES_URL" -f supabase/migrations/20260903_panel_negocio.sql
```

Qué hace cada una:

- **`20260903_registro_publico_y_blindaje_negocio.sql`** — habilita el registro
  público (el trigger `handle_new_user` ahora lee nombre, teléfono y roles del
  signup, saneados a `cliente` / `embajador`) y **cierra un agujero**: hasta hoy
  el dueño de un negocio podía recargarse créditos él mismo por REST.
- **`20260903_panel_negocio.sql`** — funciones `negocio_resumen()` y
  `negocio_embajadores()` para el panel del negocio.

---

## 2. Apagar la confirmación de correo

Para que quien se registre entre directo, sin esperar un correo que puede caer
en spam a media demo:

**Dashboard → Authentication → Sign In / Providers → Email → Confirm email: OFF.**

Si se vuelve a activar, la app lo detecta y avisa ("Te enviamos un correo para
confirmar tu cuenta") en vez de quedarse muda.

---

> **Ojo con los correos falsos.** El registro público valida el dominio: dar de
> alta `algo@hazlocash.app` desde la app devuelve *"Ese correo no parece
> válido"*, porque ese dominio no existe todavía. Las cuentas demo pudieron
> usarlo porque se crearon con la Admin API, que no valida — y por eso el alta
> desde **Admin → Usuarios → Nuevo** sí acepta cualquier dominio. Para probar el
> registro público hay que usar un correo real (Gmail, etc.); el truco de
> `tucorreo+lo-que-sea@gmail.com` sirve para crear varias cuentas con una sola
> bandeja.

## 3. Desplegar las Edge Functions

Dos funciones corren con service role y validan que quien llama es admin:

| Función | Para qué |
|---|---|
| `admin-asignar-rol` | cambiar los roles de un usuario |
| `admin-usuarios` | ver correos, crear cuentas y cambiar contraseñas desde el panel |

```bash
npx supabase functions deploy admin-asignar-rol --project-ref pihexutjvuifjzkukfwo
```

```bash
npx supabase functions deploy admin-usuarios --project-ref pihexutjvuifjzkukfwo
```

Sin desplegarlas la app **no se rompe**: el panel de usuarios cae a la lectura
por RLS (se ve la lista sin correos) y las acciones avisan que falta desplegar.

---

## 4. Generar el APK para Android

El perfil `preview` de `eas.json` produce un APK instalable que **no depende de
Expo Go ni de tu computadora**: se manda un link y se instala.

```bash
npx eas-cli login
```

Las claves de Supabase están en `mobile/.env.local`, que **no se sube al build**.
Hay que darlas de alta en EAS una sola vez (entorno `preview`):

```bash
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --type string --visibility plaintext --value "$(grep EXPO_PUBLIC_SUPABASE_URL mobile/.env.local | cut -d= -f2-)"
```

```bash
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --type string --visibility plaintext --value "$(grep EXPO_PUBLIC_SUPABASE_ANON_KEY mobile/.env.local | cut -d= -f2-)"
```

```bash
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_APP_URL --type string --visibility plaintext --value "$(grep EXPO_PUBLIC_APP_URL mobile/.env.local | cut -d= -f2-)"
```

Y a construir (tarda ~10–20 min en la cola gratuita):

```bash
npx eas-cli build --platform android --profile preview
```

Al terminar, EAS devuelve un link de descarga. Ese es el que se le manda al
socio. Para instalarlo, Android pide permitir "instalar apps de esta fuente".

> El QR de la cámara y el escaneo funcionan igual en el APK que en Expo Go.

---

## 5. Recorrido de prueba completo

Una cuenta con los cuatro roles puede recorrer todo sola (el pill flotante
"Prueba · vista" alterna entre experiencias). Con dos teléfonos se ve el loop
real. Orden sugerido:

1. **Admin → Usuarios → Nuevo.** Crea la cuenta del negocio (rol `negocio`) y
   la del recomendador (roles `cliente` + `embajador`).
2. **Admin → Negocios → Nuevo.** Da de alta el negocio, define la comisión.
3. **Admin → Negocios → tocar el negocio.** Recarga créditos y asigna la cuenta
   dueña. Sin créditos no se puede confirmar ninguna venta.
4. **Recomendador → Recomienda.** Elige el negocio, genera su código y comparte
   el QR por WhatsApp.
5. **Cliente → botón + → Reclamar recomendación.** Captura el código y obtiene
   su folio y su QR de orden.
6. **Negocio → Solicitudes → Escanear QR del cliente.** Confirma la venta.
7. **Recomendador → Actividad.** Ahí está la comisión. **Negocio → Mi negocio:**
   los créditos bajaron.

También se puede probar el atajo del modelo taquería: el negocio escanea
directamente el **QR del recomendador** (`/r/HAZLO-XXXX`) y la venta se registra
al instante, sin orden previa del cliente.

### Registro público

Cualquiera puede crear su cuenta desde la pantalla de entrada ("¿Primera vez en
Hazlo Cash? → Crear cuenta"). Nace como **cliente** y, si marca la casilla,
también como **embajador**. Los roles `negocio` y `admin` **sólo** los asigna un
administrador — ni el registro ni el propio usuario pueden dárselos.

---

## 6. Cuentas demo

Contraseña de todas: `HazloDemo2026!`

| Correo | Rol |
|---|---|
| `admin.demo@hazlocash.app` | admin |
| `negocio.demo@hazlocash.app` | negocio (Tacos El Güero) |
| `embajador.demo@hazlocash.app` | cliente + embajador (código `HAZLO-OD42`) |
| `cliente.demo@hazlocash.app` | cliente |
