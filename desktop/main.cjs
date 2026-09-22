'use strict';

const {app, BrowserWindow, Menu, protocol, net, shell, session} = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const {pathToFileURL} = require('node:url');
const {createHash} = require('node:crypto');

app.setName('Kampfcheck');
app.setAppUserModelId('de.kampfcheck.desktop');
const origin = 'kampfcheck://app';
protocol.registerSchemesAsPrivileged([{scheme:'kampfcheck',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}}]);

const contentRoot = path.join(__dirname, '..', 'dist');
const html = fs.readFileSync(path.join(contentRoot, 'index.html'), 'utf8');
const inlineHashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
const policy = [
  "default-src 'self'",
  `script-src 'self' ${inlineHashes.join(' ')}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://raw.githubusercontent.com",
  "connect-src 'self' https://poke.itlibra.com",
  "object-src 'none'", "base-uri 'self'", "form-action 'none'", "frame-src 'none'"
].join('; ');

function isAppUrl(url) {
  try { const u=new URL(url); return u.protocol==='kampfcheck:' && u.hostname==='app' && !u.username && !u.password && !u.port; }
  catch { return false; }
}
function openExternal(url) {
  try { const u=new URL(url); if(u.protocol==='https:' && !u.username && !u.password) void shell.openExternal(u.href); }
  catch { /* Invalid URLs are not opened. */ }
}

let mainWindow;
const singleInstance = app.requestSingleInstanceLock();
if(!singleInstance) app.quit();
else {
  app.on('second-instance',()=>{ if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.show();mainWindow.focus();} });
  app.whenReady().then(async()=>{
    session.defaultSession.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));
    session.defaultSession.setPermissionCheckHandler(()=>false);
    protocol.handle('kampfcheck',async request=>{
      try {
        if(!isAppUrl(request.url) || request.method!=='GET') return new Response('Nicht erlaubt',{status:403});
        const url=new URL(request.url);
        const route=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
        const file=path.resolve(contentRoot,'.'+route);
        if(!file.startsWith(contentRoot+path.sep)) return new Response('Nicht erlaubt',{status:403});
        const response=await net.fetch(pathToFileURL(file).href);
        const headers=new Headers(response.headers);
        headers.set('Content-Security-Policy',policy);
        headers.set('X-Content-Type-Options','nosniff');
        return new Response(response.body,{status:response.status,headers});
      } catch { return new Response('Nicht gefunden',{status:404}); }
    });
    mainWindow=new BrowserWindow({
      width:1440,height:960,minWidth:700,minHeight:600,title:'Kampfcheck',
      backgroundColor:'#101c28',icon:path.join(__dirname,'icon.png'),show:false,
      webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,webviewTag:false}
    });
    mainWindow.webContents.setWindowOpenHandler(({url})=>{openExternal(url);return {action:'deny'};});
    mainWindow.webContents.on('will-navigate',(event,url)=>{if(!isAppUrl(url)){event.preventDefault();openExternal(url);}});
    mainWindow.webContents.on('will-attach-webview',event=>event.preventDefault());
    mainWindow.once('ready-to-show',()=>mainWindow.show());
    mainWindow.on('closed',()=>{mainWindow=null;});
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {label:'Kampfcheck',submenu:[{label:'Beenden',role:'quit'}]},
      {label:'Bearbeiten',submenu:[{label:'Rückgängig',role:'undo'},{label:'Wiederholen',role:'redo'},{type:'separator'},{label:'Ausschneiden',role:'cut'},{label:'Kopieren',role:'copy'},{label:'Einfügen',role:'paste'},{label:'Alles auswählen',role:'selectAll'}]},
      {label:'Ansicht',submenu:[{label:'Neu laden',role:'reload'},{type:'separator'},{label:'Vergrößern',role:'zoomIn'},{label:'Verkleinern',role:'zoomOut'},{label:'Originalgröße',role:'resetZoom'},{type:'separator'},{label:'Vollbild',role:'togglefullscreen'}]}
    ]));
    await mainWindow.loadURL(origin+'/');
  }).catch(error=>{console.error('Kampfcheck konnte nicht starten:',error.message);app.quit();});
  app.on('window-all-closed',()=>app.quit());
}
