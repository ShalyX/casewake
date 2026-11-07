import fs from "node:fs";
const targets=await (await fetch("http://127.0.0.1:9333/json")).json();
const page=targets.find(x=>x.type==="page"&&x.url.includes("127.0.0.1:4220"));
if(!page)throw new Error("Casewake tab missing");
const ws=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
let nextId=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
function send(method,params={}){const id=++nextId;ws.send(JSON.stringify({id,method,params}));return new Promise(resolve=>pending.set(id,resolve));}
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true,screenWidth:390,screenHeight:844});
await send("Page.navigate",{url:"http://127.0.0.1:4220/workspace?digest=BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6"});
await new Promise(resolve=>setTimeout(resolve,15000));
const ev=await send("Runtime.evaluate",{expression:`JSON.stringify({url:location.href,innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,bodyWidth:document.body.scrollWidth,text:document.body.innerText.slice(0,1800)})`,returnByValue:true});
const metrics=JSON.parse(ev.result.result.value);
const shot=await send("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});
fs.writeFileSync("..\\evidence\\visual-qa\\workspace-mobile-results-390.png",Buffer.from(shot.result.data,"base64"));
console.log(JSON.stringify(metrics));
ws.close();
