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
- [ ] **Task 2.1**: Crear esquema de Base de Datos para Deudas e Ingresos.
  - *Agente/Skill*: `database-architect`, `database-design`
  - *INPUT*: Archivo SQL con la tabla `debts` y la tabla `income`.
  - *OUTPUT*: Tablas en Supabase con políticas de privacidad RLS (el usuario solo ve su propia información).
  - *VERIFY*: Se pueden hacer INSERTS desde el panel de Supabase.
- [ ] **Task 2.2**: Construir la UI del Dashboard enfocada en móviles.
  - *Agente/Skill*: `frontend-specialist`, `mobile-design`
  - *INPUT*: Diseñar un progreso visual (Deuda cubierta vs Ingreso libre) y lista de tarjetas de crédito.
  - *OUTPUT*: Interfaz atractiva y 100% responsiva (vista celular).
  - *VERIFY*: Los botones y las métricas se ven grandes y claros y siguen un contraste legible.

### Fase 3: Lógica de Carga y Lectura Inteligente de Imágenes
- [ ] **Task 3.1**: Interfaz "Add Debt" para carga de capturas de pantalla.
  - *Agente/Skill*: `frontend-specialist`
  - *INPUT*: Campo input tipo "file" para cámara/galería en móviles.
  - *OUTPUT*: Previsualización de la captura antes de procesar.
  - *VERIFY*: La foto de la cuenta bancaria/tarjeta de crédito se inserta bien en la UI.
- [ ] **Task 3.2**: API Route de procesado con Claude Code/Vision.
  - *Agente/Skill*: `backend-specialist`
  - *INPUT*: Convertir imagen a Base64 → Enviar a un endpoint `/api/process-receipt` donde la API de Claude lea el monto a pagar.
  - *OUTPUT*: Un JSON retornado con `{ banco: "Santander", saldo: "300000" }`.
  - *VERIFY*: Enviar una captura de prueba en el navegador devuelve sus datos exactos en la consola.
- [ ] **Task 3.3**: Guardar información extraída en Supabase.
  - *Agente/Skill*: `backend-specialist`
  - *INPUT*: Formulario auto-completado con los datos de la IA listos para Confirmar.
  - *OUTPUT*: El nuevo estado de deuda se inserta a la tabla, el dashboard actualiza y refleja el avance.
  - *VERIFY*: Al volver al inicio, el número de 3.6m se actualiza y avisa de la reducción.

## ✅ Phase X: Verification
- [ ] **Security**: Analizar secretos o contraseñas en código duro (`checklist.py`).
- [ ] **Build**: Comando de compilación `npm run build` pase con éxito, libre de errores de `TypeScript` o `ESLint`.
- [ ] **UI Audit**: Touch Targets (área táctil) evaluados en pantallas pequeñas. Todo botón debe ser fácil de presionar con un pulgar (mínimo 44px).
