import type { Color as Camp } from 'chess.js';
import { Color, Material, MeshStandardMaterial } from 'three';
const palette={
 w:{albedo:'#c3cfd2',emissive:'#18384b',emissiveIntensity:.10,metalness:.42,roughness:.60},
 b:{albedo:'#56677a',emissive:'#214976',emissiveIntensity:.16,metalness:.32,roughness:.67},
};
// One cached variant per original material/camp. Do not bake over the source images.
export function styleMaterial(original:Material,camp:Camp):Material {
 const material=original.clone();
 if(!(material instanceof MeshStandardMaterial))return material;
 const p=palette[camp];
 material.name=`${original.name}:revenants-${camp}-v31`;
 material.metalness=p.metalness;
 material.roughness=p.roughness;
 material.normalScale.multiplyScalar(.42);
 // glTF MASK remains cut out, never made translucent or alpha-hashed.
 if(material.opacity>=.98&&!original.transparent){material.transparent=false;material.depthWrite=true;}
 material.alphaHash=false;
 material.alphaToCoverage=material.alphaTest>0;
 if(material.emissive.getHex()===0){material.emissive.set(p.emissive);material.emissiveIntensity=p.emissiveIntensity;}
 material.onBeforeCompile=shader=>{
  shader.uniforms.eclipseAlbedo={value:new Color(p.albedo)};
  shader.fragmentShader='uniform vec3 eclipseAlbedo;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float eclipseRelief = sqrt(clamp(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0));
   vec3 eclipseSurface = eclipseAlbedo * (0.72 + 0.48 * eclipseRelief);
   diffuseColor.rgb = mix(diffuseColor.rgb, eclipseSurface, 0.78);
  `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
   roughnessFactor = clamp(roughnessFactor, 0.52, 0.90);
  `).replace('#include <metalnessmap_fragment>',`#include <metalnessmap_fragment>
   metalnessFactor = clamp(metalnessFactor, 0.10, 0.50);
  `);
 };
 material.customProgramCacheKey=()=>`eclipse-revenants-v31-${camp}`;
 material.needsUpdate=true;
 return material;
}
