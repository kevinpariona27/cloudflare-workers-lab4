export default {
 fetch(request, env) {
  const url = new URL(request.url);
  const requestId = crypto.randomUUID();
  const headers: Record<string,string> = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'",'X-Request-Id':requestId};
  if(url.protocol === 'https:') headers['Strict-Transport-Security'] = 'max-age=86400';
  let status = 200;
  let body: object;
  if(!['GET','HEAD'].includes(request.method)) { status=405; body={error:'Method not allowed'}; headers.Allow='GET, HEAD'; }
  else if(url.pathname === '/api/status') body={environment:env.APP_ENV, expectedDomain:env.APP_DOMAIN, release:env.APP_VERSION, hostname:url.host, https:url.protocol==='https:', timestamp:new Date().toISOString(),requestId};
  else if(url.pathname === '/api/') body={name:'Cloudflare'};
  else {status=404;body={error:'Not found'};}
  // No cookies, IPs, query strings or secrets in application logs.
  console.log(JSON.stringify({event:'api_request',requestId,environment:env.APP_ENV,status}));
  const response = Response.json(body,{status,headers});
  return request.method==='HEAD' ? new Response(null,{status,headers:response.headers}) : response;
 },
} satisfies ExportedHandler<Env>;
