import { describe, expect, it, vi } from 'vitest';
import { Box3, BoxGeometry, Group, Mesh, MeshStandardMaterial, Texture, Vector3 } from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { fitModel, campYaw, MODEL_FOOTPRINT, modelConfig } from './modelConfig';
import { loadModel, prepareModel } from './modelAssets';
function fixture(){
 const texture=new Texture();
 const material=new MeshStandardMaterial({map:texture});
 const geometry=new BoxGeometry(3,8,2);
 const scene=new Group();
 const mesh=new Mesh(geometry,material);mesh.position.set(4,-3,7);scene.add(mesh);
 return {scene,mesh,geometry,material,texture};
}
describe('GLB fitting and shared resources',()=>{
 it.each(['p','r','n','b','q','k'] as const)('fits %s above the board and within its square at every yaw',type=>{
  const {scene}=fixture();const root=fitModel(scene,type);
  const box=new Box3().setFromObject(root),size=box.getSize(new Vector3()),center=box.getCenter(new Vector3());
  expect(box.min.y).toBeCloseTo(0);expect(center.x).toBeCloseTo(0);expect(center.z).toBeCloseTo(0);
  expect(size.y).toBeLessThanOrEqual(modelConfig[type].height+1e-6);
  expect(Math.hypot(size.x,size.z)).toBeLessThanOrEqual(MODEL_FOOTPRINT+1e-6);
  for(let i=0;i<12;i++){
   const camp=new Group();camp.rotation.y=i*Math.PI/6;camp.add(root);
   const rotated=new Box3().setFromObject(camp);
   expect(rotated.min.x).toBeGreaterThan(-.471);expect(rotated.max.x).toBeLessThan(.471);
   expect(rotated.min.z).toBeGreaterThan(-.471);expect(rotated.max.z).toBeLessThan(.471);
  }
 });
 it('rejects empty or invalid bounds so that loading can fall back',()=>{
  expect(()=>fitModel(new Group(),'p')).toThrow('Invalid');
 });
 it('faces the two camps in opposite directions',()=>{expect(campYaw('w')-campYaw('b')).toBe(Math.PI);});
 it('shares textures and geometry, preserves original materials and creates two camp variants',()=>{
  const {scene,geometry,material,texture}=fixture();const originalColor=material.color.clone();
  const resource=prepareModel(scene,'p');const meshes:Mesh[]=[];
  resource.w.traverse(o=>{if(o instanceof Mesh)meshes.push(o);});
  resource.b.traverse(o=>{if(o instanceof Mesh)meshes.push(o);});
  expect(meshes).toHaveLength(2);
  for(const mesh of meshes){
   expect(mesh.geometry).toBe(geometry);expect(mesh.castShadow).toBe(true);expect(mesh.receiveShadow).toBe(false);expect(mesh.material).not.toBe(material);
   expect((mesh.material as MeshStandardMaterial).map).toBe(texture);
  }
  expect(material.color.equals(originalColor)).toBe(true);
  expect(meshes[0].material instanceof MeshStandardMaterial).toBe(true);
  expect((meshes[0].material as MeshStandardMaterial).customProgramCacheKey()).not.toBe((meshes[1].material as MeshStandardMaterial).customProgramCacheKey());
 });
 it('loads only once per type, including repeated pieces',async()=>{
  const scene=fixture().scene;
  const load=vi.spyOn(GLTFLoader.prototype,'loadAsync').mockResolvedValue({scene} as GLTF);
  try {
   const first=loadModel('p'),second=loadModel('p');expect(first).toBe(second);
   const resource=await first;expect(resource.w).toBeInstanceOf(Group);expect(load).toHaveBeenCalledTimes(1);
   expect(load.mock.calls[0][0]).toContain('/models/revenants/pawn.glb');
  } finally {load.mockRestore();}
 });
 it('isolates a failed type, caches its failure and leaves other models available',async()=>{
  const load=vi.spyOn(GLTFLoader.prototype,'loadAsync').mockRejectedValue(new Error('missing GLB'));
  const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
  try {
   const first=loadModel('n');expect(loadModel('n')).toBe(first);
   await expect(first).rejects.toThrow('missing GLB');
   await expect(loadModel('p')).resolves.toHaveProperty('w');
   expect(load).toHaveBeenCalledTimes(1);expect(warn).toHaveBeenCalledTimes(1);
  } finally {load.mockRestore();warn.mockRestore();}
 });
});
