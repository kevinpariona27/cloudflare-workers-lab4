# Cloudflare Workers - Laboratorio 4

## Diagnóstico y arquitectura
Revisión del 13 de octubre de 2026: plantilla create-cloudflare en app1; Git ya inicializado, sin cambios previos. Revisados React, Worker, assets, public, HTML, README, scripts, lockfile, configuraciones TypeScript/Vite/Wrangler/Oxlint/editor y Git. No se instalaron dependencias ni se hizo push.
Instalado: Node 24.21.0, npm 11.19.0, React 19.3.0, TypeScript 6.0.3, Vite 8.3.4, plugin Cloudflare 1.63.2, Wrangler 4.150.0 y Oxlint 1.88.0.
Scripts originales: dev, build, lint, preview, deploy, cf-typegen.
Navegador → React servido por Workers with Assets → /api/status → Worker TypeScript → JSON y log estructurado.
Se conservan fecha de compatibilidad 2026-10-06, observabilidad, source maps, SPA, React y TypeScript. Los assets originales permanecen aunque no se utilicen.
run_worker_first para /api/* garantiza que la API no reciba el fallback HTML de la SPA.

## Configuración y ambientes
| Ambiente | Worker previsto | Dominio previsto | Desarrollo local | Build local |
| --- | --- | --- | --- | --- |
| Development | app1 | localhost | npm run dev | npm run build |
| Staging | app1-staging | staging.kevincloud.online | npm run dev:staging | npm run build:staging |
| Production | app1-production | kevincloud.online | npm run dev:production | npm run build:production |
Todos los comandos dev ejecutan workerd LOCAL. Mostrar Production en localhost no significa que producción esté desplegada.
El wrapper Node selecciona CLOUDFLARE_ENV al iniciar/compilar Vite, compatible con Windows; fuerza bindings locales. Vars no heredables se repiten por ambiente.
APP_ENV determina el ambiente; hostname y https se obtienen de la petición real. APP_DOMAIN es el dominio esperado, no una consulta DNS. APP_VERSION es etiqueta de aplicación, no ID de versión de Cloudflare.
Los builds generan dist/app1/wrangler.json aplanado; cada build sustituye la salida anterior. El build base conserva Development aunque optimice los assets.
workers_dev y preview_urls deshabilitados. No se crearon Workers remotos ni se activaron dominios.
Se conserva deploy original; NO ejecutarlo. Su build base no selecciona production. Revisar el flujo futuro antes de usar cualquier despliegue.
preview original compila la base y sirve localmente.

## Comandos utilizados
Desde app1: npm ls --depth=0, node --version, npm --version, git status --short, git log -1 --oneline, npm run cf-typegen, npm run check y los tres builds.
check = lint Oxlint + tsc -b. cf-typegen regenera worker-configuration.d.ts; no editarlo a mano.
Se inició npm run dev y se consultó con curl.exe: /api/status, POST /api/status, /api/missing y cabeceras de /.
Se corrigió una advertencia inicial de React; validación final sin advertencias.
Para visualizar: npm run dev y abrir http://localhost:5173. Detener con Ctrl+C antes de cambiar ambiente.

## Seguridad, variables y secretos
Solo variables públicas APP_ENV, APP_DOMAIN, APP_VERSION. Ningún token o contraseña almacenado.
.gitignore ya excluye .env*, .dev.vars*, dist, node_modules y .wrangler.
Si se necesitan secretos en el futuro: .dev.vars local ignorado y secretos separados por Worker remoto. Nunca usar vars ni VITE_* para valores sensibles.
API pública sin autenticación: GET/HEAD permitidos, otros métodos 405, ruta desconocida 404. Estado no cacheado e ID por petición.
Cabeceras API: CSP restrictiva, nosniff, DENY, Referrer-Policy y HSTS corto solo con HTTPS.
public/_headers aplica CSP y Permissions-Policy a assets; no afecta respuestas del Worker. Vite dev no garantiza esas cabeceras y necesita HMR; verificar en preview y en nube.
Logs de aplicación omiten IP, cookies, query strings y secretos. Revisar también acceso y retención de logs de plataforma.
Access, WAF y rate limiting son opciones futuras, no habilitadas aquí.

## DNS y HTTPS
Registrador Namecheap; NS proporcionados por el usuario: ben.ns.cloudflare.com y kira.ns.cloudflare.com. Propagación NO verificada ni modificada.
Antes de desplegar: confirmar zona Active, NS correctos y ausencia de conflictos DNS. Custom Domains conecta el Worker como origen; un despliegue futuro autorizado puede crear DNS y certificados para los hosts declarados.
No se necesita un servidor de origen externo ni configurar su modo Full/Strict. No sustituir Custom Domains por un CNAME manual a workers.dev.
HTTP local es normal; el panel observa protocolo, no valida certificado, expiración ni cadena TLS.
Comandos de solo lectura para evidencias futuras (no ejecutados):
```powershell
Resolve-DnsName kevincloud.online -Type NS
Resolve-DnsName kevincloud.online
Resolve-DnsName staging.kevincloud.online
```

## Git, GitHub y CI/CD
Git existente preservado; no commit nuevo, remoto modificado ni push.
.github/workflows/ci.yml se prepara en la raíz del repositorio app1. Validará PR, push main/master o ejecución manual con npm ci, check y tres builds. No deploy ni credenciales.
El workflow no se ha ejecutado en GitHub. Publicar app1 como raíz o adaptar rutas si se publica el directorio padre.
CI preparado no equivale a CD habilitado. Futuro: elegir Workers Builds o GitHub Actions con staging separado y aprobación de producción. Credenciales de mínimo privilegio solo en secretos de la plataforma.

## Producción, versionamiento y rollback
Git conserva código; APP_VERSION muestra etiqueta; Cloudflare emite versiones e historial de despliegues propio.
Futuro: primer deploy autorizado, registrar ambiente/commit/ID real; segunda versión en staging y después promoción a producción.
Rollback crea un nuevo despliegue de una versión previa; no restaura automáticamente datos externos ni DNS. Verificar assets y bindings compatibles.
Comandos FUTUROS NO ejecutados:
```powershell
npx wrangler versions list --env staging
npx wrangler deployments list --env staging
npx wrangler rollback <VERSION_ID> --env staging
```

## Observabilidad, métricas y rendimiento
observability.enabled y upload_source_maps conservados. Actualizar estado genera log api_request correlacionable mediante requestId.
Logs locales en terminal; Workers Logs, dashboard y wrangler tail requieren despliegue futuro.
Capturar peticiones, errores, CPU y duración disponibles en el plan. Assets directos no ejecutan necesariamente el Worker.
Tiempo del panel = fetch/JSON en navegador, incluye red; no es CPU, promedio global ni SLA. La arquitectura sin estado sirve a escalabilidad pero no demuestra capacidad mediante carga; límites dependen del plan.
Otras funciones a investigar: despliegues graduales, caching de assets, bindings KV/D1/R2 y trazas. Ninguna fue creada aquí.

## Evidencias para el informe
1. Versiones, estructura y Wrangler con ambientes separados.
2. Development en localhost: API operativa, HTTP y dominio observado.
3. Staging/Production ejecutados localmente: distinguir dominio previsto de localhost.
4. Network: JSON, cabeceras, no-store e ID; correlacionarlo con terminal.
5. POST → 405, API desconocida → 404, navegación SPA → HTML.
6. Lint/tipos y tres builds satisfactorios; Git diff y workflow CI.
7. FUTURO: zona Active, NS/DNS, dominios accesibles y certificados del navegador.
8. FUTURO: Workers separados, variables/secretos sin revelar valores, logs y métricas reales.
9. FUTURO: ejecución GitHub CI, versiones remotas y rollback comprobado.
No presentar funciones pendientes como activas. No se desplegó ni se cambiaron DNS, nameservers o recursos remotos.

## Documentación oficial
- [Ambientes del plugin](https://developers.cloudflare.com/workers/vite-plugin/reference/cloudflare-environments/)
- [Configuración Wrangler](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [SPA](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Headers](https://developers.cloudflare.com/workers/static-assets/headers/)
- [Secretos](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [Métricas](https://developers.cloudflare.com/workers/observability/metrics-and-analytics/)
- [Versiones](https://developers.cloudflare.com/workers/versions-and-deployments/)
- [Rollback](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)
- [GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [Límites](https://developers.cloudflare.com/workers/platform/limits/)

## Resultado final de comprobaciones locales
- npm run check: sin errores ni advertencias de Oxlint/TypeScript.
- Builds Development, Staging y Production: correctos; nombres y variables del JSON generado comprobados.
- Runtime local: GET estado 200, POST 405 con Allow, API desconocida 404.
- Preview compilado: HTML 200 con CSP presente, Worker con Development y fallback SPA correcto.
- git diff --check: correcto. Git avisa sobre conversión LF/CRLF de Windows; no es error de aplicación.
- Servidor de desarrollo disponible en localhost:5173 al finalizar. Verificación visual del navegador pendiente del estudiante.
