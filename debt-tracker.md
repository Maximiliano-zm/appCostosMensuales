# Debt Tracker MVP - Plan de Desarrollo

## 📋 Overview
Aplicación "Mobile-First" diseñada para ayudar al usuario a regularizar sus deudas (actualmente ~3.6M CLP vs 1.3M CLP de ingresos). La característica principal es tomar capturas de pantalla de los saldos bancarios o tarjetas, extraer el valor automáticamente usando IA y actualizar el estado de la deuda en tiempo real.

## 🏗️ Project Type
**WEB (Mobile-First / PWA)**: Elegimos una Web App orientada completamente a uso en teléfonos móviles.
- **Razón**: Es más rápida de desarrollar que una app nativa, no requiere pasar por aprobaciones de App Stores (Apple/Play Store) y permite acceso rápido a la cámara/galería del teléfono desde Chrome/Safari.

## 🎯 Success Criteria
- [ ] Autenticación segura de usuario (Google Login) operativa.
- [ ] Interfaz móvil amigable que muestre claramente el Saldo Total de Deuda vs Ingreso.
- [ ] Funcionalidad de subir una imagen (captura de pantalla) desde el teléfono.
- [ ] Extracción precisa del saldo/monto desde la captura de pantalla usando IA y actualización de la base de datos.

## 🛠️ Tech Stack
- **Framework**: Next.js (App Router) - Permite crear interfaces y servicios/APIs en el mismo proyecto, acelerando el desarrollo.
- **Styling**: Tailwind CSS & Shadcn/UI - Para diseños profesionales y adaptados a móviles rápidamente.
- **Base de Datos & Autenticación**: Supabase (PostgreSQL + Google Auth) - Gratuito, robusto y fácil de usar para un MVP.
- **Procesamiento OCR / IA**: API de Claude (Anthropic Vision) para procesar las capturas de pantalla inteligentemente y extraer números/saldos y el nombre de la tarjeta.
- **Hosting**: Vercel - Despliegue con un par de clics y gratuito.

## 📁 File Structure (Propuesta)
```text
app/
├── (auth)/
│   └── login/page.tsx       # Pantalla de inicio de sesión con Google
├── (dashboard)/
│   ├── page.tsx             # Resumen de deudas vs ingresos
│   └── add-debt/page.tsx    # Subida de capturas de pantalla y carga manual
├── api/
│   └── process-receipt/route.ts # Servicio que llama a Claude Vision para sacar el monto
components/
├── ui/                      # Componentes reutilizables (Botones, inputs)
└── debt/                    # Tarjetas de deuda específicas
lib/
├── supabase.ts              # Configuración de base de datos
└── ai.ts                    # Configuración de API Anthropic (Claude)
```

## 📋 Task Breakdown
> **Estados de Tareas:** `[ ]` Pendiente ➔ `[/]` En Progreso ➔ `[QA]` Lista para Revisión ➔ `[x]` Aprobada y Pusheada

### Fase 1: Setup y Autenticación
- [x] **Task 1.1**: Inicializar Next.js con Tailwind y preparar Supabase.
  - *Agente/Skill*: `frontend-specialist`, `app-builder`
  - *INPUT*: `npx create-next-app@latest` y configuración local.
  - *OUTPUT*: Proyecto corriendo con Supabase conectado.
  - *VERIFY*: `npm run dev` levanta sin errores.
  > NOTA CLAUDE: Proyecto inicializado con Next.js 16.1.6, React 19, TypeScript strict, Tailwind v4, @supabase/supabase-js. Estructura de rutas y lib/ creada. Sistema de diseño dark finance (slate + ámbar, sin morado) configurado en globals.css. `npm run dev` levanta en ~624ms sin errores. Credenciales en .env.local (vacías — el usuario debe completarlas). Sin operaciones Git.
- [x] **Task 1.2**: Implementar Google Login con Supabase Auth.
  - *Agente/Skill*: `backend-specialist`, `api-patterns`
  - *INPUT*: Configuración de Supabase Auth en Next.js.
  - *OUTPUT*: Login bloqueando rutas privadas; desvía exitosamente a `/dashboard`.
  - *VERIFY*: Se puede iniciar y cerrar sesión.
  > NOTA CLAUDE: Implementado con @supabase/ssr. Archivos: src/proxy.ts (auth guard, migrado de middleware a proxy — convención Next.js 16), src/lib/supabase.ts (server factory con cookies), src/lib/supabase-browser.ts (browser client), src/app/auth/callback/route.ts (OAuth code exchange), login/page.tsx (Client Component + Google OAuth), dashboard/page.tsx (Server Component + getUser), dashboard/actions.ts (Server Action signOut). TypeScript ✅ ESLint ✅ npm run dev sin warnings ✅. PENDIENTE DEL USUARIO: completar .env.local con credenciales Supabase y configurar Google OAuth en Supabase Dashboard (ver .env.example).

### Fase 2: Base de Datos y Tablero (Dashboard)
- [x] **Task 2.1**: Crear esquema de Base de Datos para Deudas e Ingresos.
  - *Agente/Skill*: `database-architect`, `database-design`
  - *INPUT*: Archivo SQL con la tabla `debts` y la tabla `income`.
  - *OUTPUT*: Tablas en Supabase con políticas de privacidad RLS (el usuario solo ve su propia información).
  - *VERIFY*: Se pueden hacer INSERTS desde el panel de Supabase.
  > NOTA CLAUDE: Migración en supabase/migrations/20260221000000_initial_schema.sql. Tablas: debts (id, user_id, bank_name, current_balance, original_amount, image_url, timestamps) + income (id, user_id, monthly_amount, note, timestamps). RLS habilitado en ambas con policy "owner access only". Índices en user_id. Trigger updated_at automático. Rollback incluido (comentado). Tipos TS en src/types/database.ts. Clientes supabase.ts y supabase-browser.ts actualizados con Database generic. TypeScript ✅ ESLint ✅ dev ✅. ACCIÓN REQUERIDA DEL USUARIO: ejecutar el SQL en Supabase Dashboard → SQL Editor para crear las tablas en el proyecto real.
- [x] **Task 2.2**: Construir la UI del Dashboard enfocada en móviles.
  - *Agente/Skill*: `frontend-specialist`, `mobile-design`
  - *INPUT*: Diseñar un progreso visual (Deuda cubierta vs Ingreso libre) y lista de tarjetas de crédito.
  - *OUTPUT*: Interfaz atractiva y 100% responsiva (vista celular).
  - *VERIFY*: Los botones y las métricas se ven grandes y claros y siguen un contraste legible.
  > NOTA CLAUDE: Dashboard reescrito como Server Component con fetch paralelo de `debts` e `income`. Componentes: `SummaryBanner` (deuda total en rojo, ingreso en verde, ratio deuda/ingreso, barra de cobertura mensual %) y `DebtCard` (nombre banco, saldo actual, monto original, barra de progreso de pago con colores semánticos rojo/ámbar/verde). Header sticky con email + botón "Salir" (44px mínimo). FAB "Agregar Deuda" fijo abajo derecha (52px altura, ámbar). Empty state con dashed border. Todos los tokens del design system dark finance reutilizados. TypeScript ✅ ESLint ✅ sin warnings.

### Fase 3: Registro de Datos Manual (MVP Base)
- [x] **Task 3.1**: Interfaz "Add Debt" simple.
  - *Agente/Skill*: `frontend-specialist`, `mobile-design`
  - *INPUT*: Formulario de ingreso manual para Deudas (Banco, Saldo Actual, Monto Original, Foto Opcional como comprobante visual -sin IA-).
  - *OUTPUT*: Pantalla responsiva de captura de datos conectada a Supabase.
  - *VERIFY*: Al presionar guardar, los datos se reflejan directo en el Dashboard.
  > NOTA CLAUDE: Client Component `"use client"` en `src/app/(dashboard)/add-debt/page.tsx`. Campos: bank_name (req.), current_balance CLP (req.), original_amount CLP (opcional), foto comprobante (opcional, preview local vía FileReader). Validación client-side con mensajes de error inline. Upload de foto a bucket `debt-images` de Supabase Storage con fallback silencioso si el bucket no existe. Insert en tabla `debts`. Redirect a `/` + `router.refresh()` tras éxito. Loading state en botón (52px ámbar). Header sticky con botón "← Volver" (44px). Fix adicional: añadido `Relationships: []` a `src/types/database.ts` para compatibilidad con @supabase/postgrest-js v12. TypeScript ✅ ESLint ✅.
- [QA] **Task 3.2**: Interfaz y lógica "Settings / Ingreso Mensual".
  - *Agente/Skill*: `frontend-specialist`
  - *INPUT*: Pantalla simple para configurar o actualizar el 'Ingreso Mensual' del usuario.
  - *OUTPUT*: Guardado en la tabla `income` de Supabase asociado al User ID.
  - *VERIFY*: El Banner del Dashboard recalcula los % automáticamente.
  > NOTA CLAUDE: Server Component `src/app/(dashboard)/settings/page.tsx` hace auth + fetch del registro income existente. Pasa `existingId`, `initialAmount`, `initialNote` al Client Component `src/components/settings/IncomeForm.tsx` que maneja INSERT o UPDATE según si hay registro previo (sin UNIQUE constraint en user_id, se usa el id del registro). Botón "Editar / Configurar ›" agregado en `SummaryBanner.tsx` junto al ingreso mensual, mostrando "No configurado" si el monto es 0. Redirect a `/` + `router.refresh()` tras guardar. Touch targets ≥ 44px-52px. TypeScript ✅ ESLint ✅ sin errores.
- [ ] **Task 3.3**: (Opcional MVP) Importador CSV/Excel básico.
  - *Agente/Skill*: `backend-specialist`
  - *INPUT*: Botón en el dashboard para subir un archivo pre-formateado con las deudas (plantilla CSV).
  - *OUTPUT*: Parseo local e inserción en batch a Supabase.
  - *VERIFY*: Múltiples tarjetas aparecen de inmediato en el Dashboard tras la carga.

## ✅ Phase X: Verification
- [ ] **Security**: Analizar secretos o contraseñas en código duro (`checklist.py`).
- [ ] **Build**: Comando de compilación `npm run build` pase con éxito, libre de errores de `TypeScript` o `ESLint`.
- [ ] **UI Audit**: Touch Targets (área táctil) evaluados en pantallas pequeñas. Todo botón debe ser fácil de presionar con un pulgar (mínimo 44px).
