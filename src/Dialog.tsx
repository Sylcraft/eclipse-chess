import { useEffect, useRef, type ReactNode } from 'react';
export function Dialog({titleId,onClose,children}:{titleId:string;onClose:()=>void;children:ReactNode}) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  const root=ref.current;root?.querySelector<HTMLElement>('button')?.focus();
  return ()=>previous?.focus();
 },[]);
 return <div className="overlay"><div ref={ref} className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={e=>{
  if(e.key==='Escape'){e.preventDefault();onClose();}
  if(e.key==='Tab'){
   const buttons=ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select,input,[tabindex="0"]');
   if(!buttons?.length)return;
   const first=buttons[0],last=buttons[buttons.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 }}>{children}</div></div>;
}
