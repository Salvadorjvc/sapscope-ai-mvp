# SAPScope AI — Micro-SaaS B2B de Levantamiento y Estimación SAP

**Link de la aplicación desplegada:** [PEGAR_AQUI_LINK_VERCEL]  
**Repositorio GitHub:** [PEGAR_AQUI_LINK_GITHUB]

## 1. Propuesta de Producto
- **Problema:** Los equipos de preventa y consultoría SAP pierden horas clasificando requerimientos funcionales ambiguos de clientes y estimando esfuerzos manualmente.
- **Usuario objetivo:** Consultores SAP, Líderes de Proyecto (PM) y áreas de Preventa B2B.
- **Base de datos:** PostgreSQL gestionado en **Supabase** (`tabla: sap_requirements`), con persistencia en tiempo real para operaciones CRUD completas (registro, filtrado, edición de estado/horas y eliminación).
- **Monetización:** Suscripción B2B mensual por niveles (Starter $29/mes, Consultora Pro $99/mes, Enterprise $249/mes).
- **Evolución a Productivo:** Autenticación multi-empresa (Supabase Auth + RLS), conexión directa a LLM vía backend para generación de documentos de alcance (SOW) en PDF e integración vía API con Jira y SAP Cloud ALM.

## 2. Explicación del Uso de IA durante el Desarrollo
1. **Herramientas utilizadas:** Gemini para arquitectura de producto, diseño del esquema SQL y generación acelerada de componentes React/TypeScript.
2. **Prompts principales utilizados:**
   - *"Diseña un micro-SaaS B2B enfocado en consultoría SAP con un esquema PostgreSQL limpio y operaciones CRUD."*
   - *"Genera un componente Next.js App Router con Tailwind CSS conectado a Supabase que incluya un asistente de clasificación automática de módulos SAP (FI, MM, SD, ABAP, BTP)."*
3. **Código generado con apoyo de IA:** Estructura inicial de la interfaz en Tailwind CSS, cliente de conexión a Supabase y lógica heurística de sugerencia de módulos SAP.
4. **Decisiones técnicas tomadas por mí:**
   - Elegir **Next.js + Supabase + Vercel** para minimizar latencia de despliegue y mantener tipado estricto con TypeScript.
   - Incorporar edición inline tanto de estado (`Pendiente`, `En Revisión`, `Aprobado`, `Descartado`) como de horas estimadas para reflejar el flujo real de aprobación comercial.
   - Configurar variables de entorno (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`) separadas del código fuente.
5. **Errores encontrados y solución:**
   - *Bloqueo de inserciones por Row Level Security (RLS) en Supabase:* Al crear la tabla por defecto, Supabase bloquea escrituras anónimas. Se resolvió configurando explícitamente el esquema SQL para el MVP y documentando el uso de políticas RLS por `tenant_id` para la fase productiva.
