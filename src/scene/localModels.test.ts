import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Box3, Mesh, Texture, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { modelConfig, modelRadius } from './modelConfig';
import { prepareModel } from './modelAssets';
// Assets intentionally stay outside Git. CI still runs the synthetic tests when absent.
// Real Three.js geometry/material parsing is checked here; image decoding needs a browser.
describe('Local GLBs parsed by Three.js',()=>{
 for(const type of ['p','r','n','b','q','k'] as const){
  const path=new URL(`../../public/models/revenants/${modelConfig[type].file}`,import.meta.url);
  it.skipIf(!existsSync(path))(`parses and fits ${modelConfig[type].file}`,async()=>{
   const bytes=readFileSync(path);
   expect(bytes.length).toBeLessThan(6_000_000);
   expect(bytes.toString('ascii',0,4)).toBe('glTF');
   const jsonLength=bytes.readUInt32LE(12);
   const json=JSON.parse(bytes.toString('utf8',20,20+jsonLength));
   expect(json.extensionsRequired??[]).not.toContain('KHR_materials_pbrSpecularGlossiness');
   expect(json.buffers.every((b:{uri?:string})=>!b.uri)).toBe(true);
   expect(json.images.every((i:{uri?:string;bufferView?:number})=>!i.uri&&i.bufferView!==undefined)).toBe(true);
   const loader=new GLTFLoader();
   loader.register(()=>({name:'ECLIPSE_HEADLESS_TEXTURE_TEST',loadTexture:()=>Promise.resolve(new Texture())}));
   const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
   const gltf=await loader.parseAsync(buffer,'');
   const beforeBox=new Box3().setFromObject(gltf.scene,true),beforeSize=beforeBox.getSize(new Vector3());
   const legacyHeight=beforeSize.y*Math.min(({k:1.35,q:1.28,b:1.13,n:1.08,r:.98,p:.82})[type]/beforeSize.y,.8/Math.hypot(beforeSize.x,beforeSize.z));
   const variants=prepareModel(gltf.scene,type);
   const currentHeight=new Box3().setFromObject(variants.w,true).getSize(new Vector3()).y;
   console.info(`${type}: height ${legacyHeight.toFixed(3)} -> ${currentHeight.toFixed(3)}, +${Math.round((currentHeight/legacyHeight-1)*100)}%`);
   expect(currentHeight).toBeGreaterThan(legacyHeight*1.08);
   expect(currentHeight).toBeGreaterThanOrEqual(({p:.86,n:.90,r:1,b:1,q:1.2,k:1.3})[type]);
   for(const camp of ['w','b'] as const){
    const bounds=new Box3().setFromObject(variants[camp]),size=bounds.getSize(new Vector3());
    expect(bounds.min.y).toBeCloseTo(0,5);
    expect(size.y).toBeGreaterThan(.4);
    expect(size.y).toBeLessThanOrEqual(modelConfig[type].height+.00001);
    expect(modelRadius(variants[camp],new Vector3())).toBeLessThanOrEqual(.47001);
    expect(Math.max(size.x,size.z)).toBeLessThanOrEqual(.94001);
   }
   let triangles=0,meshes=0;
   variants.w.traverse(node=>{if(node instanceof Mesh){meshes++;triangles+=(node.geometry.index?.count??node.geometry.getAttribute('position').count)/3;}});
   expect(meshes).toBeGreaterThan(0);expect(meshes).toBeLessThanOrEqual(20);
   expect(triangles).toBeLessThan(50_000);
  });
 }
});
