import { memo, useEffect, useMemo, useState } from 'react';
import { CylinderGeometry, MeshStandardMaterial, TorusGeometry } from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { RevenantModel, type PieceProps } from './Piece';
import { campYaw, MODEL_BASE_HEIGHT } from './modelConfig';
import { loadModel, peekModel, type ModelResource } from './modelAssets';
const baseGeometry=new CylinderGeometry(.305,.32,MODEL_BASE_HEIGHT,24);
const rimGeometry=new TorusGeometry(.305,.008,5,24);
const bases={w:new MeshStandardMaterial({color:'#a8b7bd',metalness:.42,roughness:.6}),b:new MeshStandardMaterial({color:'#344758',metalness:.35,roughness:.65})};
const rims={w:new MeshStandardMaterial({color:'#b9ecff',emissive:'#81cef2',emissiveIntensity:.7}),b:new MeshStandardMaterial({color:'#448bdf',emissive:'#2269ce',emissiveIntensity:.6})};
export const ImportedPiece=memo(function ImportedPiece({type,color}:PieceProps){
 const [loaded,setLoaded]=useState<{type:PieceProps['type'];resource:ModelResource}|null>(()=>{const resource=peekModel(type);return resource?{type,resource}:null;});
 useEffect(()=>{
  let mounted=true;
  void loadModel(type).then(resource=>{if(mounted)setLoaded(previous=>previous?.type===type&&previous.resource===resource?previous:{type,resource});},()=>{/* Keep this type's procedural model. */});
  return ()=>{mounted=false;};
 },[type]);
 const instance=useMemo(()=>loaded?.type===type?clone(loaded.resource[color]):null,[loaded,type,color]);
 if(!instance)return <RevenantModel type={type} color={color}/>;
 return <group rotation={[0,campYaw(color),0]} dispose={null}>
  <mesh geometry={baseGeometry} material={bases[color]} position={[0,MODEL_BASE_HEIGHT/2,0]} castShadow receiveShadow/>
  <mesh geometry={rimGeometry} material={rims[color]} rotation={[-Math.PI/2,0,0]} position={[0,MODEL_BASE_HEIGHT+.002,0]}/>
  <group position={[0,MODEL_BASE_HEIGHT+.002,0]}><primitive object={instance}/></group>
 </group>;
});
