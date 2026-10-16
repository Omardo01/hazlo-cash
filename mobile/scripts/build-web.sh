#!/bin/sh
# Build web de la app (Expo) para Vercel: lo llama vercel.json en la raíz y
# deja el sitio en mobile/dist. Desde 2026-10-14 la web publica la app; la web
# Next.js quedó aparte (rama respaldo/web-nextjs).
#
# Vercel guarda las claves de Supabase como NEXT_PUBLIC_* (las creó la
# integración del Marketplace para la web Next.js) y Expo solo inyecta
# EXPO_PUBLIC_*, así que aquí se traducen. En local las lee de .env.local.
set -eu
cd "$(dirname "$0")/.."

# Solo se exportan con valor: una variable vacía pero definida le gana a
# .env.local y la app saldría sin claves.
if [ -z "${EXPO_PUBLIC_SUPABASE_URL:-}" ] && [ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ]; then
  export EXPO_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
fi
if [ -z "${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}" ] && [ -n "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]; then
  export EXPO_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

# Sin claves el build pasa pero la app truena al abrir (lib/supabase.ts): mejor
# fallar aquí, donde se ve en el log del deploy.
if [ ! -f .env.local ] && { [ -z "${EXPO_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}" ]; }; then
  echo "Faltan EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY (o sus NEXT_PUBLIC_*) en Vercel." >&2
  exit 1
fi

# --clear: la caché de Metro no se invalida cuando cambian las variables y
# guardaría un bundle con las claves de otra corrida (o sin ellas).
npx expo export -p web --clear
