import { memo, type ComponentType } from 'react';
import type { Color, PieceSymbol } from 'chess.js';
import { BoxGeometry, ConeGeometry, CylinderGeometry, LatheGeometry, Matrix4, MeshStandardMaterial, OctahedronGeometry, Quaternion, Euler, SphereGeometry, TorusGeometry, Vector2, Vector3, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { stoneTexture } from './stoneTexture';
export interface PieceProps { type: PieceSymbol; color: Color }
type Surface = 'armor'|'stone'|'trim'|'soul';
type V = [number,number,number];
const palettes = {
 w:{armor:'#b9c7ca',stone:'#637983',trim:'#e3dfca',soul:'#b8efff'},
 b:{armor:'#253442',stone:'#111e29',trim:'#697c8d',soul:'#408cff'}
};
const materials = Object.fromEntries(Object.entries(palettes).map(([color,p])=>[color,{
 armor:new MeshStandardMaterial({color:p.armor,metalness:.78,roughness:.38}),
 stone:new MeshStandardMaterial({color:p.stone,map:stoneTexture,metalness:.18,roughness:.83}),
 trim:new MeshStandardMaterial({color:p.trim,metalness:.83,roughness:.34}),
 soul:new MeshStandardMaterial({color:p.soul,emissive:p.soul,emissiveIntensity:1.4,roughness:.35})
}])) as Record<Color,Record<Surface,MeshStandardMaterial>>;
const unit = {
 box:new BoxGeometry(1,1,1), cylinder:new CylinderGeometry(1,1,1,12),
 cone:new ConeGeometry(1,1,8), sphere:new SphereGeometry(1,12,8),
 crystal:new OctahedronGeometry(1), ring:new TorusGeometry(1,.065,5,24),
 base:new LatheGeometry([[0,0],[.30,0],[.35,.05],[.35,.10],[.31,.14],[.28,.16],[.28,.21],[.22,.25],[0,.25]].map(p=>new Vector2(...p)),24),
 robe:new LatheGeometry([[0,.24],[.25,.24],[.23,.33],[.19,.45],[.12,.71],[.17,.83],[.1,.88],[0,.88]].map(p=>new Vector2(...p)),16),
 veil:new LatheGeometry([[0,.25],[.27,.25],[.25,.37],[.18,.57],[.14,.83],[.12,1.02],[0,1.06]].map(p=>new Vector2(...p)),12,Math.PI*.22,Math.PI*1.56)
};
// Bake all details into four shared geometries per archetype: at most four draw calls per piece.
function build(type:PieceSymbol) {
 const parts:Record<Surface,BufferGeometry[]>={armor:[],stone:[],trim:[],soul:[]};
 const add=(shape:keyof typeof unit,surface:Surface,pos:V=[0,0,0],scale:V=[1,1,1],rotation:V=[0,0,0])=>{
  const matrix=new Matrix4().compose(new Vector3(...pos),new Quaternion().setFromEuler(new Euler(...rotation)),new Vector3(...scale));
  const source=unit[shape];
  const geometry=source.index?source.toNonIndexed():source.clone();
  parts[surface].push(geometry.applyMatrix4(matrix));
 };
 const band=(y:number,r:number,surface:Surface='trim')=>add('cylinder',surface,[0,y,0],[r,.027,r]);
 const eyes=(y:number,z:number,width=.15)=>add('box','soul',[0,y,z],[width,.024,.025]);
 const crown=(y:number,r:number,count:number)=>{
  band(y,r);for(let i=0;i<count;i++){const a=i*Math.PI*2/count;add('cone','trim',[Math.cos(a)*r,y+.12,Math.sin(a)*r],[.044,.25,.044],[0,0,-Math.cos(a)*.12]);}
 };
 add('base','stone');band(.145,.305);band(.22,.25);
 for(let i=0;i<6;i++){const a=i*Math.PI/3;add('crystal','trim',[Math.cos(a)*.32,.09,Math.sin(a)*.32],[.024,.035,.024]);}
 if(type==='p'){
  add('robe','armor',[0,0,0],[.82,.78,.85]);
  add('box','armor',[0,.49,.045],[.24,.28,.22]);
  for(const s of [-1,1]){add('crystal','trim',[s*.19,.54,0],[.115,.095,.16]);add('box','armor',[s*.20,.39,0],[.09,.21,.11],[0,0,s*.2]);}
  add('sphere','armor',[0,.72,0],[.15,.17,.14]);eyes(.73,.132);
  add('box','trim',[0,.82,-.015],[.035,.12,.23]);
  add('box','trim',[.21,.35,.12],[.17,.26,.045],[0,0,-.14]);
  add('box','trim',[-.23,.40,.08],[.028,.39,.035]);
 } else if(type==='r'){
  add('cylinder','stone',[0,.52,0],[.24,.55,.24]);band(.32,.27);band(.73,.28);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;add('box','armor',[Math.cos(a)*.24,.52,Math.sin(a)*.24],[.075,.47,.075],[0,-a,0]);add('box','trim',[Math.cos(a)*.255,.91,Math.sin(a)*.255],[.13,.22,.13]);}
  add('cylinder','armor',[0,.79,0],[.31,.13,.31]);
  for(const s of [-1,1])add('box','soul',[s*.12,.55,.224],[.028,.20,.027]);
  add('crystal','soul',[0,.88,0],[.10,.17,.10]);
 } else if(type==='n'){
  add('robe','stone',[0,0,0],[.92,.69,.92]);
  add('cone','armor',[0,.63,-.045],[.24,.65,.23],[-.32,0,0]);
  add('box','armor',[0,.91,.09],[.24,.27,.39],[.32,0,0]);
  add('box','trim',[0,.81,.29],[.22,.16,.20],[.15,0,0]);
  for(const s of [-1,1]){add('cone','trim',[s*.08,1.10,-.025],[.045,.23,.055],[0,0,s*-.15]);add('sphere','soul',[s*.126,.96,.16],[.027,.025,.036]);add('box','trim',[s*.126,.88,.04],[.025,.07,.30],[.3,0,0]);}
  for(let i=0;i<5;i++)add('cone','trim',[0,.48+i*.115,-.22+i*.016],[.10,.16,.08],[-.5,0,0]);
  add('box','armor',[0,.69,.09],[.035,.36,.035],[-.32,0,0]);
 } else {
  add('robe',type==='q'?'stone':'armor',[0,0,0],type==='k'?[1.12,1.1,1.12]:[1,1,1]);
  for(const s of [-1,1])add('box','trim',[s*.095,.51,.16],[.025,.40,.03],[0,0,s*-.16]);
  if(type==='b'){
   add('sphere','armor',[0,.89,0],[.13,.145,.12]);
   for(const s of [-1,1])add('cone','trim',[s*.073,1.08,0],[.095,.36,.11],[0,0,s*-.15]);
   eyes(.91,.112,.09);add('crystal','soul',[0,.66,.17],[.05,.09,.035]);
   add('cylinder','trim',[.25,.66,.015],[.018,.88,.018]);
   add('ring','trim',[.25,1.12,.015],[.12,.15,.12]);add('crystal','soul',[.25,1.12,.015],[.045,.07,.035]);
   add('box','stone',[-.21,.57,.10],[.15,.21,.06],[0,-.2,-.25]);
  } else if(type==='q'){
   add('veil','armor',[0,0,-.035],[1,1,1]);add('crystal','soul',[0,.89,0],[.11,.17,.10]);crown(1.07,.165,7);
   add('crystal','soul',[0,1.28,0],[.045,.09,.045]);
   for(const s of [-1,1]){add('cone','armor',[s*.19,.63,0],[.10,.32,.11],[0,0,s*.65]);add('crystal','soul',[s*.25,.48,.04],[.035,.075,.035]);}
  } else {
   add('veil','stone',[0,0,-.055],[1.18,1.02,1.1]);
   add('box','armor',[0,.65,.035],[.30,.32,.25]);add('crystal','trim',[0,.66,.18],[.10,.14,.035]);
   for(const s of [-1,1]){add('crystal','armor',[s*.23,.79,0],[.18,.12,.21]);add('cone','trim',[s*.25,.91,-.025],[.045,.18,.045]);}
   add('sphere','armor',[0,1.00,0],[.145,.17,.135]);eyes(1.01,.128);crown(1.13,.185,6);
   add('box','trim',[0,1.34,0],[.055,.28,.055]);add('box','trim',[0,1.38,0],[.20,.045,.045]);
   add('box','trim',[-.26,.49,.13],[.035,.57,.055]);add('box','trim',[-.26,.72,.13],[.19,.035,.055]);
  }
 }
 return Object.fromEntries(Object.entries(parts).map(([surface,list])=>{
  const merged=list.length?mergeGeometries(list):null;list.forEach(g=>g.dispose());return [surface,merged];
 })) as Record<Surface,BufferGeometry|null>;
}
export const revenantGeometries=Object.fromEntries((['p','r','n','b','q','k'] as PieceSymbol[]).map(type=>[type,build(type)])) as Record<PieceSymbol,Record<Surface,BufferGeometry|null>>;
export const RevenantModel=memo(function RevenantModel({type,color}:PieceProps){
 return <group rotation={[0,color==='w'?Math.PI:0,0]} dispose={null}>{(Object.keys(revenantGeometries[type]) as Surface[]).map(surface=>revenantGeometries[type][surface]&&<mesh key={surface} geometry={revenantGeometries[type][surface]!} material={materials[color][surface]} castShadow={surface!=='soul'} receiveShadow/>)}</group>;
});
// Substitute a GLB component with the same type/color contract; game and motion stay unchanged.
export const Piece=memo(function Piece({renderer:Renderer=RevenantModel,...props}:PieceProps & {renderer?:ComponentType<PieceProps>}){
 return <Renderer {...props}/>;
});
