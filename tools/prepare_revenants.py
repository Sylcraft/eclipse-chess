"""Run with Blender --background --factory-startup --python tools/prepare_revenants.py -- [types].
Only reads downloads; writes local, Git-ignored GLBs and audit reports.
"""
import bpy
import bmesh
import hashlib
import json
import math
from pathlib import Path
import struct
import sys
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
 'king': ('king.glb', 16000, 1024, 1.35),
 'queen': ('_extracted/queen/source/DarkValkyrieQueen.glb', 18000, 1024, 1.28),
 'bishop': ('_extracted/fou/source/VoidboundNecromancer.glb', 12000, 1024, 1.13),
 'knight': ('cavalier.glb', 18000, 256, 1.08),
 'rook': ('tour.glb', 12000, 1024, .98),
 'pawn': ('_extracted/pion/source/model.glb', 6000, 1024, .82),
}
OUT = ROOT / 'public/models/revenants'
AUDIT = ROOT / 'pieces_3d/_prepared'
OUT.mkdir(parents=True, exist_ok=True)
AUDIT.mkdir(parents=True, exist_ok=True)

def read_glb(path):
 data=path.read_bytes()
 length=struct.unpack_from('<I',data,12)[0]
 return json.loads(data[20:20+length]), data[20+length:]

def preserve_metadata(path, original):
 doc,tail=read_glb(path)
 doc['asset']['extras'] = {**original.get('extras',{}), 'eclipseProcessing':'Blender decimation, texture resize, static export and board normalization; original rights unchanged.'}
 encoded=json.dumps(doc,separators=(',',':')).encode()
 encoded+=b' '*((-len(encoded))%4)
 path.write_bytes(struct.pack('<4sII',b'glTF',2,20+len(encoded)+len(tail))+struct.pack('<I4s',len(encoded),b'JSON')+encoded+tail)

def triangles(obj):
 return sum(max(0,len(p.vertices)-2) for p in obj.data.polygons)

def prepare(name):
 relative,budget,texture_limit,height=SOURCES[name]
 source=ROOT/'pieces_3d'/relative
 original,_=read_glb(source)
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.gltf(filepath=str(source))
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
 imported=len(meshes)
 if name=='knight':
  # The download is a diorama. Meshes 0..32 are terrain/vegetation;
  # meshes 33..54 are horse/rider/equipment, excluding 38/39 (ground and atmospheric cards).
  names={n['name'] for n in original['nodes'] if n.get('mesh',-1)>=33 and n.get('mesh') not in {38,39}}
  meshes=[o for o in meshes if o.name in names]
  if len(meshes)!=20: raise RuntimeError(f'Unexpected knight subset: {[o.name for o in meshes]}')
 if not meshes: raise RuntimeError('No mesh in '+str(source))
 before=sum(triangles(o) for o in meshes)
 for obj in meshes:
  world=obj.matrix_world.copy()
  obj.parent=None
  obj.data=obj.data.copy()
  obj.data.transform(world)
  obj.matrix_world=Matrix.Identity(4)
 bpy.ops.object.select_all(action='DESELECT')
 for obj in meshes: obj.select_set(True)
 bpy.context.view_layer.objects.active=meshes[0]
 bpy.ops.object.join()
 obj=bpy.context.object
 obj.name='Revenant_'+name
 if before>budget:
  modifier=obj.modifiers.new('Board_LOD','DECIMATE')
  modifier.ratio=budget/before
  modifier.use_collapse_triangulate=True
  bpy.ops.object.modifier_apply(modifier=modifier.name)
 # Some scans have disconnected duplicate seam vertices. Weld positions only
 # after the first reduction; per-loop UVs stay intact and the high-res source stays untouched.
 after=triangles(obj)
 if after>budget*1.05:
  bm=bmesh.new();bm.from_mesh(obj.data)
  bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=0.000001)
  bm.to_mesh(obj.data);bm.free();obj.data.update()
  modifier=obj.modifiers.new('Board_LOD_final','DECIMATE')
  modifier.ratio=min(1,budget/triangles(obj));modifier.use_collapse_triangulate=True
  bpy.ops.object.modifier_apply(modifier=modifier.name)
 if name=='knight':
  # Legacy spec/gloss is converted by Blender on import. At board scale,
  # retain colour, alpha and normal maps, but use a stable metallic/roughness finish.
  for material in obj.data.materials:
   if not material or not material.use_nodes: continue
   shader=next((n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
   if shader:
    for socket in shader.inputs:
     if socket.name not in {'Base Color','Alpha','Normal'}:
      for link in list(socket.links):material.node_tree.links.remove(link)
    shader.inputs['IOR'].default_value=1.5
    shader.inputs['Metallic'].default_value=.15
    shader.inputs['Roughness'].default_value=.7
 # Bounds in Blender's Z-up coordinates. Export converts Z-up to glTF Y-up.
 points=[v.co for v in obj.data.vertices]
 lo=Vector(tuple(min(p[i] for p in points) for i in range(3)))
 hi=Vector(tuple(max(p[i] for p in points) for i in range(3)))
 size=hi-lo
 scale=min(height/size.z,.80/max(size.x,size.y))
 center=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
 obj.data.transform(Matrix.Scale(scale,4) @ Matrix.Translation(-center))
 # Resize only images referenced by the selected model's materials.
 images={n.image for m in obj.data.materials if m and m.use_nodes for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image}
 texture_report=[]
 for image in images:
  old=list(image.size)
  if max(old)>texture_limit:
   ratio=texture_limit/max(old)
   image.scale(max(1,round(old[0]*ratio)),max(1,round(old[1]*ratio)))
  texture_report.append({'name':image.name,'source':old,'output':list(image.size)})
 # Export only the joined model; no cameras, lights, scene decorations or animation.
 bpy.ops.object.select_all(action='DESELECT')
 obj.select_set(True)
 bpy.context.view_layer.objects.active=obj
 target=OUT/(name+'.glb')
 bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,
  export_apply=True,export_animations=False,export_cameras=False,export_lights=False,
  export_yup=True,export_extras=False,export_image_format='AUTO',export_jpeg_quality=85)
 preserve_metadata(target,original.get('asset',{}))
 doc,_=read_glb(target)
 report={
  'model':name,'source':str(source.relative_to(ROOT)).replace('\\','/'),
  'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
  'sourceBytes':source.stat().st_size,'outputBytes':target.stat().st_size,
  'sourceAsset':original.get('asset',{}),'importedMeshes':imported,'selectedMeshes':len(meshes),
  'sourceTriangles':before,'outputTriangles':sum(doc['accessors'][p['indices']]['count']//3 for m in doc['meshes'] for p in m['primitives']),
  'textures':texture_report,'materials':len(doc.get('materials',[])),
  'extensionsRequired':doc.get('extensionsRequired',[]),'extensionsUsed':doc.get('extensionsUsed',[]),
  'normalizedSize':list(size*scale),'heightLimit':height,'footprintLimit':.8,
  'blender':bpy.app.version_string,
 }
 (AUDIT/(name+'.json')).write_text(json.dumps(report,indent=2),encoding='utf8')
 print('ECLIPSE_REPORT',json.dumps(report),flush=True)

args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else list(SOURCES)
for name in args: prepare(name)
