import { memo } from 'react';
import { BoxGeometry, CylinderGeometry, OctahedronGeometry, PlaneGeometry, RingGeometry, ExtrudeGeometry, MeshStandardMaterial, Shape } from 'three';
import { stoneTexture } from './stoneTexture';
const stone = new MeshStandardMaterial({map:stoneTexture,color:'#202a32',roughness:.94,metalness:.08});
const edge = new MeshStandardMaterial({map:stoneTexture,color:'#47555e',roughness:.72,metalness:.24});
const dark = new MeshStandardMaterial({color:'#101920',roughness:.95});
const silver = new MeshStandardMaterial({color:'#71858d',roughness:.42,metalness:.7});
const soul = new MeshStandardMaterial({color:'#90ddff',emissive:'#349bdc',emissiveIntensity:1.3});
// Decoration never intercepts the board's pointer events.
const geometryCache = new Map<string, ReturnType<typeof makeGeometry>>();
function makeGeometry(kind:string,args:number[]) {
 switch(kind){case 'box':return new BoxGeometry(...args);case 'cylinder':return new CylinderGeometry(...args);case 'octahedron':return new OctahedronGeometry(...args);case 'plane':return new PlaneGeometry(...args);default:return new RingGeometry(...args);}
}
function geometry(kind:string,args:number[]) {const key=kind+args.join(',');let g=geometryCache.get(key);if(!g){g=makeGeometry(kind,args);geometryCache.set(key,g);}return g;}
const floor = new MeshStandardMaterial({color:'#101924',roughness:.98});
const engraving = new MeshStandardMaterial({color:'#344551',roughness:.9});
const ignoreRaycast = () => {};
const shape = new Shape();
shape.moveTo(-.65,0);shape.quadraticCurveTo(-.65,.65,0,1.15);shape.quadraticCurveTo(.65,.65,.65,0);
shape.lineTo(.49,0);shape.quadraticCurveTo(.49,.55,0,.94);shape.quadraticCurveTo(-.49,.55,-.49,0);shape.closePath();
const arch = new ExtrudeGeometry(shape,{depth:.15,bevelEnabled:false,curveSegments:8});
// Missing upper voussoirs leave a jagged, open arch in the distant ruins.
const fragment = new Shape();
fragment.moveTo(-.65,0);fragment.quadraticCurveTo(-.65,.55,-.22,.91);
fragment.lineTo(-.16,.79);fragment.lineTo(-.26,.76);
fragment.quadraticCurveTo(-.49,.48,-.49,0);fragment.closePath();
const brokenArch = new ExtrudeGeometry(fragment,{depth:.3,bevelEnabled:false,curveSegments:8});
function Pillar({index}:{index:number}) {
 const height=[1.7,1.35,1.15,1.55][index];
 return <group>
  <mesh material={stone} position={[0,-.63,0]} raycast={ignoreRaycast} receiveShadow><primitive attach="geometry" object={geometry('box',[1.1,.35,1.1])} dispose={null}/></mesh>
  <mesh material={edge} position={[0,-.4,0]} raycast={ignoreRaycast}><primitive attach="geometry" object={geometry('box',[.85,.13,.85])} dispose={null}/></mesh>
  <mesh material={stone} position={[0,height/2-.35,0]} raycast={ignoreRaycast} castShadow><primitive attach="geometry" object={geometry('cylinder',[.32,.4,height,8])} dispose={null}/></mesh>
  {[-1,1].map(s=><mesh key={s} material={edge} position={[s*.3,height/2-.35,.3]} raycast={ignoreRaycast}><primitive attach="geometry" object={geometry('box',[.09,height,.09])} dispose={null}/></mesh>)}
  <mesh material={edge} position={[0,height-.33,0]} rotation={[.06,index*.3,-.06]} raycast={ignoreRaycast} castShadow><primitive attach="geometry" object={geometry('box',[.76,.17,.76])} dispose={null}/></mesh>
  <mesh material={dark} position={[0,height-.17,0]} raycast={ignoreRaycast}><primitive attach="geometry" object={geometry('cylinder',[.24,.3,.18,8])} dispose={null}/></mesh>
  <mesh material={soul} position={[0,height+.02,0]} raycast={ignoreRaycast}><primitive attach="geometry" object={geometry('octahedron',[.13])} dispose={null}/></mesh>
  <mesh geometry={arch} material={edge} position={[0,-.37,.4]} scale={[.42,.65,1]} raycast={ignoreRaycast}/>
 </group>;
}
export const Sanctuary = memo(function Sanctuary({quality}:{quality:'low'|'high'}) {
 return <group dispose={null}>
  {/* All rim details stay below the playing surface and outside the squares. */}
  <mesh material={dark} position={[0,-.52,0]} raycast={ignoreRaycast} receiveShadow><primitive attach="geometry" object={geometry('box',[9.25,.7,9.25])} dispose={null}/></mesh>
  <mesh material={stone} position={[0,-.78,0]} raycast={ignoreRaycast} receiveShadow><primitive attach="geometry" object={geometry('box',[9.8,.18,9.8])} dispose={null}/></mesh>
  <mesh material={edge} position={[0,-.16,0]} raycast={ignoreRaycast} receiveShadow><primitive attach="geometry" object={geometry('box',[9.1,.12,9.1])} dispose={null}/></mesh>
  {[0,1,2,3].map(side=><group key={side} rotation={[0,side*Math.PI/2,0]}>
   <mesh material={silver} position={[0,-.13,4.47]} raycast={ignoreRaycast}><primitive attach="geometry" object={geometry('box',[8.95,.035,.055])} dispose={null}/></mesh>
   <mesh material={stone} position={[0,-.38,4.64]} raycast={ignoreRaycast}><primitive attach="geometry" object={geometry('box',[9.3,.08,.12])} dispose={null}/></mesh>
   {[-3.5,-2.5,-1.5,-.5,.5,1.5,2.5,3.5].map(x=><group key={x} position={[x,-.65,4.64]}>
    <mesh geometry={arch} material={edge} scale={[.42,.21,.7]} raycast={ignoreRaycast}/>
    <mesh material={dark} position={[0,.1,-.02]} raycast={ignoreRaycast}><primitive attach="geometry" object={geometry('box',[.3,.16,.04])} dispose={null}/></mesh>
   </group>)}
   {[-4.48,4.48].map(x=><mesh key={x} material={silver} position={[x,-.07,4.48]} rotation={[-Math.PI/2,0,Math.PI/4]} raycast={ignoreRaycast}><primitive attach="geometry" object={geometry('box',[.19,.19,.035])} dispose={null}/></mesh>)}
  </group>)}
  {[[-6.5,-6],[6.5,-6],[-6.5,6],[6.5,6]].map(([x,z],index)=><group key={index} position={[x,0,z]} rotation={[0,Math.atan2(-x,-z),0]}><Pillar index={index}/></group>)}
  {[-1,1].map(side=><group key={side} position={[side*6.25,-.82,0]} rotation={[0,Math.PI/2,0]}>
   <mesh material={stone} raycast={ignoreRaycast} receiveShadow><primitive attach="geometry" object={geometry('box',[3.4,.2,1.1])} dispose={null}/></mesh>
   <mesh geometry={arch} material={stone} position={[0,.1,-.075]} scale={[1,.6,1]} raycast={ignoreRaycast} castShadow/>
   {[-1,1].map(x=><mesh key={x} material={edge} position={[x*1.3,.2,.15]} rotation={[.15,x*.2,-.12]} raycast={ignoreRaycast}><primitive attach="geometry" object={geometry('box',[.5,.3,.55])} dispose={null}/></mesh>)}
  </group>)}
  {quality==='high'&&<group position={[0,-.8,-11.2]}>
   {[-1,1].map(s=><group key={s} position={[s*2.7,0,0]}>
    <mesh material={stone} raycast={ignoreRaycast} castShadow position={[0,1.25,0]}><primitive attach="geometry" object={geometry('box',[.8,2.5,.8])} dispose={null}/></mesh>
    <mesh material={edge} raycast={ignoreRaycast} position={[0,2.5,0]}><primitive attach="geometry" object={geometry('box',[1.05,.16,1.05])} dispose={null}/></mesh>
    <mesh geometry={brokenArch} material={stone} raycast={ignoreRaycast} position={[s*-.83,2.5,0]} scale={[s*1.35,1.55,1]} rotation={[0,0,s*.12]}/>
    <mesh material={soul} raycast={ignoreRaycast} position={[0,1.35,.414]}><primitive attach="geometry" object={geometry('box',[.035,.65,.015])} dispose={null}/></mesh>
    {[0,1,2].map(i=><mesh key={i} material={edge} raycast={ignoreRaycast} position={[s*(.8+i*.58),.1,i*.17]} rotation={[.1,i*.35,.18]}><primitive attach="geometry" object={geometry('box',[.48,.32,.6])} dispose={null}/></mesh>)}
   </group>)}
   <mesh material={stone} raycast={ignoreRaycast} receiveShadow position={[0,-.05,0]}><primitive attach="geometry" object={geometry('box',[9,.18,2.4])} dispose={null}/></mesh>
  </group>}
  {[0,1,2,3,4,5,6,7].map(i=><group key={`rune-${i}`} rotation={[0,i*Math.PI/4,0]}>
   <mesh material={silver} raycast={ignoreRaycast} position={[0,-.89,5.9]} rotation={[-Math.PI/2,0,Math.PI/4]}><primitive attach="geometry" object={geometry('box',[.13,.13,.012])} dispose={null}/></mesh>
   <mesh material={edge} raycast={ignoreRaycast} position={[0,-.89,6.2]} rotation={[-Math.PI/2,0,0]}><primitive attach="geometry" object={geometry('box',[.025,.35,.012])} dispose={null}/></mesh>
  </group>)}
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.9,0]} raycast={ignoreRaycast} receiveShadow><primitive attach="geometry" object={geometry('plane',[200,200])} dispose={null}/><primitive attach="material" object={floor}/></mesh>
  {[0,1].map(i=><mesh key={i} rotation={[-Math.PI/2,0,i*Math.PI]} position={[0,-.895,0]} raycast={ignoreRaycast}><primitive attach="geometry" object={geometry('ring',[5.45+i*.18,5.48+i*.18,64,1,.15,Math.PI*1.3])} dispose={null}/><primitive attach="material" object={engraving}/></mesh>)}
 </group>;
});
