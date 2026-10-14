import type { PieceSymbol } from 'chess.js';
import { Box3, Group, Mesh, Vector3, type Object3D } from 'three';
export const modelConfig:Record<PieceSymbol,{file:string;height:number;yaw:number}>={
 k:{file:'king.glb',height:1.65,yaw:-Math.PI/2},
 q:{file:'queen.glb',height:1.55,yaw:0},
 b:{file:'bishop.glb',height:1.30,yaw:Math.PI},
 n:{file:'knight.glb',height:1.24,yaw:0},
 r:{file:'rook.glb',height:1.15,yaw:0},
 p:{file:'pawn.glb',height:.90,yaw:0},
};
export const MODEL_FOOTPRINT=.94;
export const MODEL_BASE_HEIGHT=.032;
export const CAMERA_POSITION:[number,number,number]=[7.8,10.8,11.8];
export const CAMERA_TARGET:[number,number,number]=[0,.25,0];
export function initialCameraPosition(aspect:number):[number,number,number] {
 const distance=Math.max(1,1.04/Math.max(.25,aspect));
 return CAMERA_POSITION.map((coordinate,i)=>CAMERA_TARGET[i]+(coordinate-CAMERA_TARGET[i])*distance) as [number,number,number];
}
// Bounds include empty corners. Measure the actual vertices instead, once at load time.
// A circular footprint keeps captures and both camp orientations inside a square.
export function modelRadius(scene:Object3D,center:Vector3):number {
 let radius=0;
 const point=new Vector3();
 scene.updateMatrixWorld(true);
 scene.traverse(node=>{
  if(!(node instanceof Mesh))return;
  const positions=node.geometry.getAttribute('position');
  if(!positions)return;
  for(let i=0;i<positions.count;i++){
   point.fromBufferAttribute(positions,i).applyMatrix4(node.matrixWorld);
   radius=Math.max(radius,Math.hypot(point.x-center.x,point.z-center.z));
  }
 });
 return radius;
}
export function fitModel(scene:Object3D,type:PieceSymbol):Group {
 const pivot=new Group();
 pivot.add(scene);
 pivot.rotation.y=modelConfig[type].yaw;
 pivot.updateMatrixWorld(true);
 const bounds=new Box3().setFromObject(pivot,true),size=bounds.getSize(new Vector3());
 if(![size.x,size.y,size.z].every(v=>Number.isFinite(v)&&v>0))throw new Error(`Invalid ${type} model bounds`);
 const center=bounds.getCenter(new Vector3());
 const radius=modelRadius(pivot,center);
 if(!Number.isFinite(radius)||radius<=0)throw new Error(`Invalid ${type} model footprint`);
 const scale=Math.min(modelConfig[type].height/size.y,MODEL_FOOTPRINT/(2*radius));
 const fitted=new Group();
 fitted.add(pivot);
 fitted.scale.setScalar(scale);
 fitted.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
 fitted.userData.presentation={height:size.y*scale,diameter:2*radius*scale,scale};
 fitted.updateMatrixWorld(true);
 return fitted;
}
export function campYaw(color:'w'|'b'){return color==='w'?Math.PI:0;}
