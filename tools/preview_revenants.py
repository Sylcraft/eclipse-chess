"""Offline contact-sheet render of the local derivatives; not a browser test."""
import warnings
warnings.filterwarnings('ignore', category=DeprecationWarning)
import bpy
from mathutils import Vector, Matrix
import math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=12
scene.cycles.use_denoising=True
scene.render.resolution_x=1400
scene.render.resolution_y=430
scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('SanctuaryPreview')
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.08,.11,.16,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
for i,name in enumerate(['king','queen','bishop','knight','rook','pawn']):
 before=set(bpy.data.objects)
 bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/models/revenants'/(name+'.glb')))
 objects=set(bpy.data.objects)-before
 for o in objects:
  if o.parent is None:
   yaw={'king':-math.pi/2,'bishop':math.pi}.get(name,0)
   o.matrix_world=Matrix.Rotation(yaw,4,'Z')@o.matrix_world
   o.location.x+=(i-2.5)*1.25
 bpy.ops.object.text_add(location=((i-2.5)*1.25-.33,-.65,-.015),rotation=(0,0,0))
 text=bpy.context.object;text.data.body=name;text.data.size=.13
for location,energy,size in [((0,-5,7),1600,7),((1,3,5),1400,5)]:
 bpy.ops.object.light_add(type='AREA',location=location)
 light=bpy.context.object;light.data.energy=energy;light.data.shape='DISK';light.data.size=size
 light.rotation_euler=(Vector((0,0,.5))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(1,-10,5.2))
camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=8.4
scene.camera=camera
for label,location in [('front',(1,-10,5.2)),('back',(-1,10,5.2))]:
 camera.location=location;camera.rotation_euler=(Vector((0,0,.6))-camera.location).to_track_quat('-Z','Y').to_euler()
 scene.render.filepath=str(ROOT/'pieces_3d/_prepared'/('preview-'+label+'.png'))
 bpy.ops.render.render(write_still=True)
