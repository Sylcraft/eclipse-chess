import { memo, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { BoxGeometry, MeshStandardMaterial, RingGeometry, type Group } from 'three';
import type { OrbitControls as Controls } from 'three-stdlib';
import type { Square } from 'chess.js';
import { useGame } from '../store/gameStore';
import { MOVE_DURATION, motion, snapshot, squarePosition, type Transition, type VisualPiece } from '../chess/presentation';
import { Piece } from './Piece';
import { Sanctuary } from './Sanctuary';
const files='abcdefgh';
const tileGeometry=new BoxGeometry(.985,.12,.985);
const tileMaterials=Object.fromEntries(Object.entries({light:'#89969b',dark:'#293944',selected:'#2c7487',recent:'#465f6b',check:'#81394d'}).map(([key,color])=>[key,new MeshStandardMaterial({color,roughness:.79,metalness:.19})]));
const dot=new RingGeometry(.075,.135,24),ring=new RingGeometry(.38,.43,32),selection=new RingGeometry(.34,.37,32);
const markers={move:new MeshStandardMaterial({color:'#9df3ff',emissive:'#59d6ff',emissiveIntensity:1.1}),capture:new MeshStandardMaterial({color:'#ffb292',emissive:'#f67b52',emissiveIntensity:.7}),check:new MeshStandardMaterial({color:'#ff6a7f',emissive:'#ff4262',emissiveIntensity:1.4})};
const Tiles=memo(function Tiles(){
 const chess=useGame(s=>s.chess);useGame(s=>s.revision);
 const selected=useGame(s=>s.selected),locked=useGame(s=>!!s.transition);
 const moves=selected?chess.moves({square:selected,verbose:true}):[];
 const last=chess.history({verbose:true}).at(-1);
 return <group dispose={null}>{chess.board().flatMap((row,r)=>row.map((piece,f)=>{
  const square=(files[f]+(8-r)) as Square;
  const legal=!locked&&moves.find(m=>m.to===square);
  const checked=piece?.type==='k'&&piece.color===chess.turn()&&chess.isCheck();
  const recent=last?.from===square||last?.to===square;
  const material=checked?'check':selected===square?'selected':recent?'recent':(r+f)%2===0?'light':'dark';
  return <group key={square} position={[f-3.5,0,r-3.5]} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();if(e.delta<5)useGame.getState().click(square);}}>
   <mesh geometry={tileGeometry} material={tileMaterials[material]} position={[0,-.065,0]} receiveShadow/>
   {legal&&<mesh geometry={legal.isCapture()||legal.isEnPassant()?ring:dot} material={legal.isCapture()||legal.isEnPassant()?markers.capture:markers.move} rotation={[-Math.PI/2,0,0]} position={[0,.012,0]}/>}
   {(selected===square||checked)&&<mesh geometry={selection} material={checked?markers.check:markers.move} rotation={[-Math.PI/2,0,0]} position={[0,.015,0]}/>}
  </group>;
 }))}</group>;
});
function Army({pieces,transition}:{pieces:VisualPiece[];transition:Transition|null}){
 const groups=useRef(new Map<string,Group>());
 const invalidate=useThree(s=>s.invalidate);
 useEffect(()=>{invalidate();},[transition,invalidate]);
 useFrame(()=>{
  if(!transition)return;
  const progress=(performance.now()-transition.started)/MOVE_DURATION;
  pieces.forEach(p=>{
   const group=groups.current.get(`${p.color}-${p.square}`);if(!group)return;
   const moving=p.from!==p.square;
   const pose=motion(progress,p.captured);
   const from=squarePosition(p.from),to=squarePosition(p.square);
   group.position.set(from[0]+(to[0]-from[0])*pose.ease,moving||p.captured?pose.lift:0,from[2]+(to[2]-from[2])*pose.ease);
   group.scale.setScalar(pose.scale);
   group.rotation.y=p.captured?pose.ease*.65:0;
  });
  if(progress>=1)useGame.getState().finishTransition(transition.id);else invalidate();
 });
 return <group>{pieces.map(p=>{
  const key=`${p.color}-${p.square}`;
  return <group key={`${transition?.id??'rest'}-${key}`} ref={node=>{if(node)groups.current.set(key,node);else groups.current.delete(key);}} position={squarePosition(p.from)} onClick={p.captured?undefined:e=>{e.stopPropagation();if(e.delta<5)useGame.getState().click(p.square);}}>
   <Piece type={p.promotedFrom??p.type} color={p.color}/>
  </group>;
 })}</group>;
}
function Camera(){
 const controls=useRef<Controls>(null);
 const view=useGame(s=>s.view);
 const camera=useThree(s=>s.camera),invalidate=useThree(s=>s.invalidate);
 useEffect(()=>{camera.position.set(9,12,12);controls.current?.target.set(0,0,0);controls.current?.update();invalidate();},[view,camera,invalidate]);
 return <OrbitControls ref={controls} makeDefault target={[0,0,0]} minDistance={11} maxDistance={25} minPolarAngle={.15} maxPolarAngle={Math.PI/3} enablePan={false}/>;
}
function Scene(){
 const chess=useGame(s=>s.chess);useGame(s=>s.revision);
 const transition=useGame(s=>s.transition),quality=useGame(s=>s.quality);
 return <>
  <color attach="background" args={['#0b131e']}/><fog attach="fog" args={['#0b131e',23,52]}/>
  <ambientLight intensity={.45}/><hemisphereLight args={['#b3d7f5','#121622',.85]}/>
  <directionalLight position={[3,11,5]} intensity={3} castShadow={quality==='high'} shadow-mapSize={[2048,2048]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-normalBias={.035}/>
  <directionalLight position={[-6,6,-7]} color="#649edb" intensity={2}/>
  <pointLight position={[-5,3,-4]} color="#3a9dff" intensity={25} distance={18}/>
  <Sanctuary quality={quality}/><Tiles/><Army pieces={transition?.pieces??snapshot(chess)} transition={transition}/>
  {[...files].map((f,i)=><Html key={f} position={[i-3.5,.01,4.23]} center style={{pointerEvents:'none'}}><span className="coordinate">{f.toUpperCase()}</span></Html>)}
  {[1,2,3,4,5,6,7,8].map(n=><Html key={n} position={[-4.25,.01,4.5-n]} center style={{pointerEvents:'none'}}><span className="coordinate">{n}</span></Html>)}
  <Camera/>
 </>;
}
export function Board(){
 const quality=useGame(s=>s.quality);
 return <Canvas frameloop="demand" fallback={<div className="webgl-fallback">WebGL indisponible. Utilisez le plateau textuel ci-dessous.</div>} shadows={quality==='high'} camera={{position:[9,12,12],fov:40}} dpr={quality==='high'?[1,1.75]:1} gl={{antialias:true,powerPreference:'high-performance'}} onPointerMissed={()=>useGame.getState().cancel()}><Scene/></Canvas>;
}
