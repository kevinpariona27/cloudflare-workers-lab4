import { useEffect, useState } from 'react'
import './App.css'
type Status = {environment:string;hostname:string;https:boolean;expectedDomain:string;release:string;timestamp:string;requestId:string}
const features=[
 ['Seguridad','Cabeceras de seguridad y secretos fuera de Git. TLS remoto pendiente de verificar.'],
 ['Escalabilidad','Workers serverless sin estado sobre la red global. Sujeto a límites del plan; sin prueba de carga.'],
 ['DNS','Dominio raíz y subdominio preparados. Activación de zona y resolución pendientes de comprobar.'],
 ['CI/CD','CI preparado para lint, tipos y builds en GitHub. Despliegue continuo pendiente de habilitar.'],
 ['Observabilidad','Logs estructurados e ID por petición. Métricas remotas pendientes de despliegue.'],
 ['Versionamiento','Git local y versión de aplicación. Versiones de Workers y rollback pendientes de demostrar.']]
function App(){
 const [data,setData]=useState<Status|null>(null)
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)
 const [ms,setMs]=useState<number|null>(null)
 async function check(){
  setBusy(true);setError('')
  const start=performance.now()
  try{
   const res=await fetch('/api/status',{cache:'no-store',signal:AbortSignal.timeout(8000)})
   if(!res.ok) throw new Error('API unavailable')
   const value:Status=await res.json()
   if(!['Development','Staging','Production'].includes(value.environment)) throw new Error('Invalid response')
   setData(value);setMs(Math.round(performance.now()-start))
  }catch{setData(null);setMs(null);setError('No se pudo consultar el Worker. Reintenta y revisa la terminal.')}
  finally{setBusy(false)}
 }
 useEffect(()=>{const timer = window.setTimeout(() => void check(), 0); return () => window.clearTimeout(timer)},[])
 return <main>
 <header><a href="/" className="brand">☁ KEVIN / CLOUD LAB</a><span className="badge">SEMANA 04</span></header>
 <section className="hero"><p className="eyebrow">REACT + TYPESCRIPT + WORKERS WITH ASSETS</p><h1>Cloudflare Workers <span>- Laboratorio 4</span></h1><p className="intro">Del desarrollo local a la red global. Un laboratorio de ambientes, seguridad y operación en producción.</p><p className="badge accent">{data?.environment??'Consultando ambiente'} · Demostración académica</p></section>
 <section className="panel"><div className="heading"><div><p className="eyebrow">COMPROBACIÓN EN VIVO</p><h2>Estado del sistema</h2></div><button disabled={busy} onClick={()=>void check()}>{busy?'Comprobando…':'Actualizar estado ↗'}</button></div><p role="status" className={error?'error':'health'}>{error||(busy?'Consultando API…':data?'● API operativa · respuesta del Worker':'Sin datos')}</p><div className="stats">{[['Ambiente configurado',data?.environment??'—'],['Dominio observado',data?.hostname??window.location.host],['HTTPS de la petición',data?data.https?'Sí · HTTPS':'No · HTTP':'—'],['Tiempo de consulta',ms===null?'—':ms+' ms']].map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><p className="note">Cloudflare Workers / workerd. Tiempo medido en navegador: incluye red y procesamiento; no es CPU ni un SLA.</p></section>
 <section><div className="heading"><h2>Tres ambientes, un proyecto</h2><span className="note">Aislamiento por configuración</span></div><div className="grid">{['Development','Staging','Production'].map((env,i)=><article key={env} className={data?.environment===env?'selected':''}><small>0{i+1} / {data?.environment===env?'AMBIENTE ACTUAL':'AMBIENTE PREVISTO'}</small><h3>{env}</h3><code>{['localhost','staging.kevincloud.online','kevincloud.online'][i]}</code><p>{i===0?'Vite + workerd local. HTTP es normal en localhost.':'Configuración preparada. Disponibilidad remota y TLS sin verificar.'}</p></article>)}</div></section>
 <section><div className="heading"><h2>Funciones de producción</h2><span className="note">Qué demuestra el laboratorio</span></div><div className="grid">{features.map(([title,text],i)=><article key={title}><span className="eyebrow">0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
 <section className="trace"><h2>Evidencia de la petición</h2><dl>{[['Dominio previsto',data?.expectedDomain],['Versión de aplicación',data?.release],['Fecha del servidor',data?.timestamp],['ID de petición',data?.requestId]].map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value??'—'}</dd></div>)}</dl></section>
 <footer><span>Laboratorio 4 · kevincloud.online</span><a href="https://developers.cloudflare.com/workers/" target="_blank" rel="noreferrer">Documentación oficial ↗</a></footer>
 </main>
}
export default App
