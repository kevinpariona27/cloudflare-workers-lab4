import { spawnSync } from 'node:child_process'
const [environment, command] = process.argv.slice(2)
if (!['local','staging','production'].includes(environment) || !['dev','build'].includes(command)) throw new Error('Invalid environment or command')
const env = { ...process.env, CLOUDFLARE_VITE_FORCE_LOCAL: 'true' }
delete env.CLOUDFLARE_ENV
if(environment !== 'local') env.CLOUDFLARE_ENV = environment
const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js',command], {stdio:'inherit',env})
if(result.error) throw result.error
process.exit(result.status ?? 1)
