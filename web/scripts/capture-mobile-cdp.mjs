import fs from "node:fs";
const targets=await (await fetch("http://127.0.0.1:9333/json")).json();
const page=targets.find(x=>x.type==="page"&&x.url.includes("/workspace"));
if(!page)throw new Error("Workspace tab missing");
const ws=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
let nextId=0;
const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
function send(method,params={}){const id=++nextId;ws.send(JSON.stringify({id,method,params}));return new Promise(resolve=>pending.set(id,resolve));}
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true,screenWidth:390,screenHeight:844});
async function evaluate(expression){const r=await send("Runtime.evaluate",{expression,returnByValue:true});return r.result?.result?.value;}
async function capture(file){const r=await send("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});fs.writeFileSync(file,Buffer.from(r.result.data,"base64"));}
const out="..\\evidence\\visual-qa\\";
let metrics=await evaluate(`JSON.stringify({innerWidth,innerHeight,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,heading:document.querySelector(".workspace-title-row h1")?.getBoundingClientRect().width,headingScroll:document.querySelector(".workspace-title-row h1")?.scrollWidth})`);
await capture(out+"workspace-mobile-390.png");
await send("Page.navigate",{url:"http://127.0.0.1:4220/"});
await new Promise(resolve=>setTimeout(resolve,1800));
const landing=await evaluate(`JSON.stringify({innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,heading:document.querySelector(".hero h1")?.getBoundingClientRect().width,headingScroll:document.querySelector(".hero h1")?.scrollWidth})`);
await capture(out+"landing-mobile-390.png");
console.log(JSON.stringify({workspace:JSON.parse(metrics),landing:JSON.parse(landing)}));
ws.close();
