import { Group, Material, Mesh, type Object3D } from 'three';
import type { Color as Camp, PieceSymbol } from 'chess.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { fitModel, modelConfig } from './modelConfig';
import { styleMaterial } from './modelMaterials';
export interface ModelResource {w:Group;b:Group}
const cache=new Map<PieceSymbol,Promise<ModelResource>>();
const loader=new GLTFLoader();
const ready=new Map<PieceSymbol,ModelResource>();
export function peekModel(type:PieceSymbol){return ready.get(type);}
// One material variant per source material and camp; texture/geometry GPU data stay shared.
export function prepareModel(source:Object3D,type:PieceSymbol):ModelResource {
 const make=(camp:Camp)=>{
  const materials=new Map<Material,Material>();
  const root=clone(source);
  root.traverse(node=>{
   if(!(node instanceof Mesh))return;
   node.castShadow=true;node.receiveShadow=false;
   node.geometry.computeBoundingBox();node.geometry.computeBoundingSphere();
   const variant=(original:Material)=>{
    let material=materials.get(original);
    if(!material){
     material=styleMaterial(original,camp);
     materials.set(original,material);
    }
    return material;
   };
   node.material=Array.isArray(node.material)?node.material.map(variant):variant(node.material);
  });
  return fitModel(root,type);
 };
 return {w:make('w'),b:make('b')};
}
// A tiny queue avoids six simultaneous image-decode / model-parse bursts.
let active=0;
const waiting:Array<()=>void>=[];
async function slot(){if(active<2){active++;return;}await new Promise<void>(resolve=>waiting.push(resolve));}
function release(){const next=waiting.shift();if(next)next();else active--;}
export function loadModel(type:PieceSymbol):Promise<ModelResource> {
 let promise=cache.get(type);
 if(!promise){
  promise=(async()=>{
   await slot();
   try {
    const base=import.meta.env.BASE_URL;
    const gltf=await loader.loadAsync(`${base}models/revenants/${modelConfig[type].file}`);
    const resource=prepareModel(gltf.scene,type);
    ready.set(type,resource);
    return resource;
   } finally {release();}
  })();
  cache.set(type,promise);
  // One diagnostic per type; a rejected promise remains cached, with no retry storm.
  void promise.catch(error=>console.warn(`[Eclipse Chess] ${modelConfig[type].file}: fallback procédural.`,error));
 }
 return promise;
}
