# Debt Tracker MVP - Plan de Desarrollo

## 📋 Overview
Aplicación "Mobile-First" diseñada para ayudar al usuario a regularizar sus deudas de **tarjetas de crédito** (actualmente ~3.6M CLP vs 1.3M CLP de ingresos). La característica principal es consolidar el total a pagar de múltiples tarjetas en un solo lugar y visualizar métricas de progreso para organizar los pagos.

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
- [x] **Task 3.2**: Interfaz y lógica "Settings / Ingreso Mensual".
  - *Agente/Skill*: `frontend-specialist`
  - *INPUT*: Pantalla simple para configurar o actualizar el 'Ingreso Mensual' del usuario.
  - *OUTPUT*: Guardado en la tabla `income` de Supabase asociado al User ID.
  - *VERIFY*: El Banner del Dashboard recalcula los % automáticamente.
  > NOTA CLAUDE: Server Component `src/app/(dashboard)/settings/page.tsx` hace auth + fetch del registro income existente. Pasa `existingId`, `initialAmount`, `initialNote` al Client Component `src/components/settings/IncomeForm.tsx` que maneja INSERT o UPDATE según si hay registro previo (sin UNIQUE constraint en user_id, se usa el id del registro). Botón "Editar / Configurar ›" agregado en `SummaryBanner.tsx` junto al ingreso mensual, mostrando "No configurado" si el monto es 0. Redirect a `/` + `router.refresh()` tras guardar. Touch targets ≥ 44px-52px. TypeScript ✅ ESLint ✅ sin errores.
- [x] **Task 3.3**: (Opcional MVP) Importador CSV/Excel básico.
  - *Agente/Skill*: `backend-specialist`
  - *INPUT*: Botón en el dashboard para subir un archivo pre-formateado con las deudas (plantilla CSV).
  - *OUTPUT*: Parseo local e inserción en batch a Supabase.
  - *VERIFY*: Múltiples tarjetas aparecen de inmediato en el Dashboard tras la carga.
  > NOTA CLAUDE: Client Component en `src/app/(dashboard)/import/page.tsx`. Sin dependencias externas: parseo CSV nativo (maneja BOM de Excel, CRLF, campos con comillas). Flujo: descarga plantilla (Blob + link) → selecciona archivo → FileReader → preview tabla con validación fila a fila (banco requerido, saldo > 0, original ≥ saldo si existe) → filas inválidas se omiten con mensaje de error → botón "Importar N deudas" → batch insert a Supabase → redirect + refresh. Link "↑ Importar CSV" agregado en header de sección "Mis Deudas" del dashboard. TypeScript ✅ ESLint ✅.

### Fase 4: Dashboard de Métricas Analíticas (Labs & UI Polish)
- [x] **Task 4.1**: Mejorar el UI/UX General del Dashboard.
  - *Agente/Skill*: `frontend-specialist`, `frontend-design`
  - *INPUT*: Revisar el dashboard principal y componentes actuales. Refinar estilos, sombras, espaciados y microinteracciones para que deje de verse "feo" y se sienta premium y moderno (manteniendo el tono Dark Finance).
  - *OUTPUT*: Una interfaz significativamente más atractiva y pulida.
  > NOTA CLAUDE: SummaryBanner mejorado: borde superior ámbar 2px, número de deuda en text-5xl, divider entre secciones, label actualizado a "Tarjetas de Crédito". DebtCard: borde izquierdo 3px con color semántico (rojo/ámbar/verde según % pagado), badge con fondo semitransparente (success/warning/danger-subtle), saldo en text-3xl. Dashboard: tab nav sticky (Tarjetas | Métricas), empty state con emoji 💳, texto actualizado a "Mis Tarjetas" y "Agregar Tarjeta". globals.css: tokens --color-bg-card-elevated, --color-success/warning/danger-subtle. TypeScript ✅ ESLint ✅.
- [x] **Task 4.2**: Crear la pestaña de Métricas Integrando 5 Librerías Distintas.
  - *Agente/Skill*: `frontend-specialist`
  - *INPUT*: Crear `/dashboard/metrics`. Implementar gráficos usando **5 librerías distintas** (Ej: Recharts, Tremor, Chart.js/react-chartjs-2, Nivo, Visx, o ApexCharts) para comparar cuál se ve y rinde mejor en móviles.
  - *OUTPUT*: Un dashboard "labs" con múltiples aproximaciones visuales para los mismos datos (deuda por tarjeta, % de ingresos, etc), inicialmente con datos simulados o conectados a la actual db.
  > NOTA CLAUDE: Instaladas 5 librerías (--legacy-peer-deps por React 19): recharts, react-chartjs-2+chart.js, @nivo/pie+bar, @visx/shape+scale+group+responsive, react-apexcharts+apexcharts. Creados: 5 componentes en src/components/metrics/ + src/app/dashboard/metrics/page.tsx (Server Component con datos reales de Supabase). Secciones: (1) Recharts PieChart distribución por tarjeta, (2) Chart.js HorizontalBar saldos actuales+originales, (3) Nivo ResponsivePie donut deuda vs ingreso, (4) Visx SVG custom barras progreso de pago, (5) ApexCharts RadialBar cobertura mensual. Nivo y ApexCharts con next/dynamic ssr:false. Tab nav Tarjetas|Métricas en ambas vistas. TypeScript ✅ ESLint ✅.
- [ ] **Task 4.3**: Flujo Real y Refinamiento (Supabase).
  - *Agente/Skill*: `backend-specialist`
  - *INPUT*: Recolectar `debts` e `income` del usuario y calcular métricas en tiempo real.
  - *OUTPUT*: Todos los gráficos reflejan la realidad financiera real del usuario desde Supabase.
  > NOTA: Task 4.2 ya conecta a Supabase directamente (Task 4.3 cubierto en paralelo).

### Fase 5: Gestión de Pagos Mensuales (Vista Activa)
- [x] **Task 5.1**: Actualización de Esquema BD (`monthly_statement` o campos adicionales).
  - *Agente/Skill*: `backend-specialist`, `database-design`
  - *INPUT*: Crear migración SQL `20260222..._add_billing_cycle.sql` agregando columnas a `debts` (como `statement_balance`, `minimum_payment`, `next_due_date`, `interest_rate`) para alojar la "vista activa" del mes y fecha de vencimiento. Actualizar RLS y Types.
  - *OUTPUT*: Base de datos lista para registrar facturas mensuales e intereses, con tipos de TypeScript actualizados.
- [x] **Task 5.2**: Modal/Vista de Registro de "Estado de Cuenta".
  - *Agente/Skill*: `frontend-specialist`, `frontend-design`
  - *INPUT*: Crear UI que permita al usuario seleccionar una tarjeta, introducir la `next_due_date`, la `interest_rate`, el Monto Facturado Completo (`statement_balance`) y el Pago Mínimo (`minimum_payment`). 
  - *OUTPUT*: Formulario validado guardando estos nuevos datos en la DB.
- [x] **Task 5.3**: Dashboard de Flujo y Vencimientos.
  - *Agente/Skill*: `frontend-specialist`
  - *INPUT*: Incorporar alertas ("Pronto a vencer" / "Vencido") dinámicas basadas en `next_due_date` respecto de hoy. Mostrar Tasa de Interés para decidir qué pagar primero. Crear interfaz para "Pagar esta deúda" escogiendo pago Mínimo, Completo u Otro.
  - *OUTPUT*: El usuario visualiza de forma estructurada qué pagar del mes en curso y sus vencimientos.
- [x] **Task 5.4**: Lógica de Descuento (Pago).
  - *Agente/Skill*: `backend-specialist`
  - *INPUT*: Acción Server o RPC que tome el monto pagado, lo reste de `current_balance` de la tarjeta, y resetee `statement_balance` o corra la fecha de vencimiento en caso de ser necesario tras el pago.
  - *OUTPUT*: Las tarjetas descuentan sus balances generales con cada pago mensual ejecutado.

## ✅ Phase X: Verification
- [ ] **Security**: Analizar secretos o contraseñas en código duro (`checklist.py`).
- [ ] **Build**: Comando de compilación `npm run build` pase con éxito, libre de errores de `TypeScript` o `ESLint`.
- [ ] **UI Audit**: Touch Targets (área táctil) evaluados en pantallas pequeñas. Todo botón debe ser fácil de presionar con un pulgar (mínimo 44px).
