import { create } from 'zustand';
import { Chess, type Square } from 'chess.js';
import { play, type Promotion } from '../chess/game';
import { MOVE_DURATION, snapshot, transitionPieces, type Transition } from '../chess/presentation';
interface GameState {
 chess:Chess; revision:number; selected:Square|null; promotion:{from:Square;to:Square}|null; view:number;
 animations:boolean; quality:'low'|'high'; transition:Transition|null;
 click:(square:Square)=>void; promote:(piece:Promotion)=>void; cancel:()=>void; reset:()=>void; undo:()=>void; resetView:()=>void;
 setAnimations:(enabled:boolean)=>void; setQuality:(quality:'low'|'high')=>void; finishTransition:(id:number)=>void;
}
let pending: ReturnType<typeof setTimeout> | undefined;
export const useGame = create<GameState>((set,get)=>{
 const commit = (from:Square,to:Square,promotion?:Promotion) => {
  const {chess,animations,revision} = get();
  const before = snapshot(chess);
  if(!play(chess,from,to,promotion)) return;
  const id = revision+1;
  const transition = animations ? {id,started:performance.now(),pieces:transitionPieces(before,chess,chess.history({verbose:true}).at(-1)!)} : null;
  set({revision:id,selected:null,promotion:null,transition});
  // Also release the lock if WebGL is unavailable or the tab stops rendering.
  if(transition) pending = setTimeout(()=>get().finishTransition(id),MOVE_DURATION+80);
 };
 return {
 chess:new Chess(),revision:0,selected:null,promotion:null,view:0,transition:null,
 animations:typeof matchMedia === 'undefined' || !matchMedia('(prefers-reduced-motion: reduce)').matches,quality:'high',
 click:(square)=>{const {chess,selected,promotion,transition}=get();if(promotion||transition||chess.isGameOver())return;
  const move=selected?chess.moves({square:selected,verbose:true}).find(m=>m.to===square):undefined;
  if(move&&selected){if(move.isPromotion()){set({promotion:{from:selected,to:square}});return;}commit(selected,square);return;}
  set({selected:chess.get(square)?.color===chess.turn()?square:null});
 },
 promote:(piece)=>{const {promotion,transition}=get();if(promotion&&!transition)commit(promotion.from,promotion.to,piece);},
 cancel:()=>{if(!get().transition)set({promotion:null,selected:null});},
 reset:()=>{if(get().transition)return;set(s=>({chess:new Chess(),revision:s.revision+1,selected:null,promotion:null}));},
 undo:()=>{if(get().transition||get().promotion)return;get().chess.undo();set(s=>({revision:s.revision+1,selected:null,promotion:null}));},
 resetView:()=>set(s=>({view:s.view+1})),
 finishTransition:(id)=>{if(get().transition?.id!==id)return;clearTimeout(pending);set({transition:null});},
 setAnimations:(animations)=>{const id=get().transition?.id;if(id!==undefined)get().finishTransition(id);set({animations});},
 setQuality:(quality)=>set({quality})
 };
});
