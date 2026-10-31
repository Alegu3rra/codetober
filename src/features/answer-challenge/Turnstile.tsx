import { useEffect, useRef, useState } from 'react';

type TurnstileAPI={render:(element:HTMLElement,options:Record<string,unknown>)=>string;remove:(id:string)=>void};
declare global {interface Window {turnstile?:TurnstileAPI}}
let loading:Promise<void>|undefined;
function load() {
  if(window.turnstile) return Promise.resolve();
  loading??=new Promise<void>((resolve,reject)=>{
    const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async=true;script.onload=()=>resolve();script.onerror=()=>{loading=undefined;script.remove();reject(new Error('Verification unavailable'));};
    document.head.appendChild(script);
  });
  return loading;
}

export function Turnstile({siteKey,onToken}:{siteKey:string;onToken:(token:string)=>void}) {
  const container=useRef<HTMLDivElement>(null),callback=useRef(onToken);
  callback.current=onToken;
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    let disposed=false,id:string|undefined;
    void load().then(()=>{
      if(disposed||!container.current||!window.turnstile)return;
      id=window.turnstile.render(container.current,{sitekey:siteKey,action:'codetober-validator',theme:'dark',
        callback:(token:string)=>callback.current(token),'expired-callback':()=>callback.current(''),
        'error-callback':()=>{callback.current('');setFailed(true);}});
    }).catch(()=>setFailed(true));
    return()=>{disposed=true;if(id)window.turnstile?.remove(id);};
  },[siteKey]);
  return <><div ref={container}/>{failed&&<p role="alert">Verification could not load. Reopen this dialog to retry.</p>}</>;
}
