"""Extract CLI result payloads; fail on browser errors rather than CLI exit alone."""
from pathlib import Path
import json,sys
r=Path(__file__).resolve().parents[1];e=r/'evidence/phase25'
for spec in sys.argv[1:]:
 raw,name=spec.split('=',1);s=(e/raw).read_text(encoding='utf-8-sig')
 assert '### Error' not in s,(raw,s[-1200:])
 lines=s.splitlines();i=lines.index('### Result');v=json.loads(lines[i+1])
 assert v.get('passed',True),(raw,v)
 if v.get('base')=='https://casewake.vercel.app' and 'Actual local app' in v.get('scope',''):
  v['driverScopeLabel']=v['scope'];v['scope']=v['scope'].replace('Actual local app','Actual deployed public app')
 (e/name).write_text(json.dumps(v,indent=2)+'\n',encoding='utf-8')
 print(name,'PASS',len(v.get('checks',v.get('results',v.get('runs',[])))))
