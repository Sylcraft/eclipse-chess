import { describe, expect, it } from 'vitest';
import { Color, MeshStandardMaterial, ShaderLib, Texture, Vector2 } from 'three';
import type { WebGLProgramParametersWithUniforms, WebGLRenderer } from 'three';
import { styleMaterial } from './modelMaterials';
function shaderFor(material:MeshStandardMaterial){
 const shader={uniforms:{},vertexShader:ShaderLib.standard.vertexShader,fragmentShader:ShaderLib.standard.fragmentShader} as WebGLProgramParametersWithUniforms;
 material.onBeforeCompile(shader,{} as WebGLRenderer);
 return shader;
}
describe('Revenant material presentation',()=>{
 it('preserves source maps, opacity cutouts, normals and source material parameters',()=>{
  const map=new Texture(),normalMap=new Texture(),roughnessMap=new Texture(),metalnessMap=new Texture();
  const source=new MeshStandardMaterial({map,normalMap,roughnessMap,metalnessMap,alphaTest:.12,roughness:.2,metalness:.9});
  source.normalScale.set(1,-1);
  const material=styleMaterial(source,'w') as MeshStandardMaterial;
  expect(material.map).toBe(map);expect(material.normalMap).toBe(normalMap);
  expect(material.roughnessMap).toBe(roughnessMap);expect(material.metalnessMap).toBe(metalnessMap);
  expect(material.alphaTest).toBe(.12);expect(material.transparent).toBe(false);
  expect(material.alphaHash).toBe(false);expect(material.alphaToCoverage).toBe(true);expect(material.depthWrite).toBe(true);
  expect(material.normalScale).toEqual(new Vector2(.42,-.42));
  expect(source.normalScale).toEqual(new Vector2(1,-1));expect(source.roughness).toBe(.2);expect(source.metalness).toBe(.9);
 });
 it('keeps genuine translucency and authored emissive details if present',()=>{
  const source=new MeshStandardMaterial({transparent:true,opacity:.6,emissive:'#53afff',emissiveIntensity:2});
  const material=styleMaterial(source,'b') as MeshStandardMaterial;
  expect(material.transparent).toBe(true);expect(material.opacity).toBe(.6);
  expect(material.emissive.equals(source.emissive)).toBe(true);expect(material.emissiveIntensity).toBe(2);
 });
 it('gives the dark camp a nonzero albedo floor even for a black source texture',()=>{
  const source=new MeshStandardMaterial({color:0});
  const white=styleMaterial(source,'w') as MeshStandardMaterial,black=styleMaterial(source,'b') as MeshStandardMaterial;
  const whiteShader=shaderFor(white),blackShader=shaderFor(black);
  const w=whiteShader.uniforms.eclipseAlbedo.value as Color,b=blackShader.uniforms.eclipseAlbedo.value as Color;
  expect(b.r).toBeGreaterThan(.05);expect(b.g).toBeGreaterThan(.05);expect(b.b).toBeGreaterThan(.05);
  expect(w.r+w.g+w.b).toBeGreaterThan((b.r+b.g+b.b)*2);
  expect(blackShader.fragmentShader).toContain('(0.72 + 0.48 * eclipseRelief)');
  expect(black.emissive.getHex()).not.toBe(0);
  expect(white.customProgramCacheKey()).not.toBe(black.customProgramCacheKey());
 });
 it('patches the installed Three shader chunks and preserves their texture sampling',()=>{
  const material=styleMaterial(new MeshStandardMaterial(),'b') as MeshStandardMaterial;
  const shader=shaderFor(material);
  expect(shader.fragmentShader).toContain('#include <map_fragment>');
  expect(shader.fragmentShader).toContain('diffuseColor.rgb = mix(');
  expect(shader.fragmentShader).toContain('roughnessFactor = clamp(roughnessFactor, 0.52, 0.90)');
  expect(shader.fragmentShader).toContain('metalnessFactor = clamp(metalnessFactor, 0.10, 0.50)');
  expect(shader.fragmentShader.match(/uniform vec3 eclipseAlbedo;/g)).toHaveLength(1);
 });
});
