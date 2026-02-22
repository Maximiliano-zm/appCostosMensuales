# Reglas de Interacción - Antigravity Agent & Git

Estas reglas rigen mi comportamiento como orquestador (Antigravity Agent) respecto a la manipulación de código y repositorios.

## 1. Responsabilidad de Git
- **Solo yo** (Antigravity Agent) generaré los pusheos (commits y push) al repositorio Git personal del usuario.
- Claude Code **no** debe realizar operaciones de `git commit` o `git push`. (Claude Code puede usar `git add` si lo necesita para linting, pero el commit final lo gestiono yo previa revisión).

## 2. Manipulación de Código
- **Yo NO manipularé el código de la aplicación.** Mi rol es estrictamente de observador, planificador (Project Planner) y gestor de control de versiones.
- Todo el código, refactorización y solución de errores debe ser ejecutado exclusivamente por Claude Code en su terminal.

## Flujo de Trabajo
1. Claude Code lee las instrucciones y el plan (`debt-tracker.md`).
2. Claude Code ejecuta las tareas, crea los archivos y verifica que funcionen (`npm run dev`/`build`).
3. Claude Code marca la tarea como `[x]` en el plan.
4. Yo (Antigravity) detecto que una tarea importante ha sido finalizada, verifico los archivos modificados y ejecuto el comando para hacer commit y push al repositorio Git personal del usuario.
