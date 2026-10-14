import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { CAMERA_TARGET, initialCameraPosition } from './modelConfig';
describe('Initial sanctuary framing',()=>{
 it('keeps the complete board and tallest piece envelope inside portrait and landscape frames',()=>{
  for(const aspect of [.65,.8,.85,1,1.5,2]){
   const camera=new PerspectiveCamera(40,aspect,.1,1000);
   camera.position.set(...initialCameraPosition(aspect));camera.lookAt(...CAMERA_TARGET);camera.updateMatrixWorld();
   for(const x of [-4,4])for(const z of [-4,4])for(const y of [0,1.65]){
    const screen=new Vector3(x,y,z).project(camera);
    expect(Math.abs(screen.x)).toBeLessThan(.94);expect(Math.abs(screen.y)).toBeLessThan(.94);
   }
  }
 });
});
