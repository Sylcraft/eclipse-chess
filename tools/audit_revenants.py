"""Inventory local downloads and prepared GLBs. No third-party Python dependencies.
python tools/audit_revenants.py --extract
Existing extracted files are never overwritten. Reports remain Git-ignored.
"""
from pathlib import Path
import hashlib
import json
import struct
import sys
import zipfile
ROOT=Path(__file__).resolve().parents[1]
DOWNLOADS=ROOT/'pieces_3d'

def glb_info(data):
 magic,version,length=struct.unpack_from('<4sII',data)
 if magic!=b'glTF' or version!=2 or length!=len(data):raise ValueError('Invalid GLB header')
 n,kind=struct.unpack_from('<I4s',data,12)
 if kind!=b'JSON':raise ValueError('Missing JSON chunk')
 doc=json.loads(data[20:20+n])
 binary_start=28+n
 binary_size=struct.unpack_from('<I',data,20+n)[0]
 for view in doc.get('bufferViews',[]):
  if view.get('buffer',0)!=0 or view.get('byteOffset',0)+view['byteLength']>binary_size:raise ValueError('Invalid buffer view')
 images=[]
 for image in doc.get('images',[]):
  info={'mimeType':image.get('mimeType'),'uri':image.get('uri')}
  if 'bufferView' in image:
   view=doc['bufferViews'][image['bufferView']]
   start=binary_start+view.get('byteOffset',0)
   image_bytes=data[start:start+view['byteLength']]
   info['bytes']=len(image_bytes)
   if image_bytes[:8]==b'\x89PNG\r\n\x1a\n':info['size']=list(struct.unpack('>II',image_bytes[16:24]))
   elif image_bytes[:2]==b'\xff\xd8':
    at=2
    while at+4<len(image_bytes):
     if image_bytes[at]!=255:at+=1;continue
     marker=image_bytes[at+1];at+=2
     if marker in {0xd8,0xd9}:continue
     size=struct.unpack_from('>H',image_bytes,at)[0]
     if marker in {0xc0,0xc1,0xc2,0xc3}:
      height,width=struct.unpack_from('>HH',image_bytes,at+3);info['size']=[width,height];break
     if size<2:break
     at+=size
  images.append(info)
 return {'asset':doc.get('asset'),'bytes':len(data),
  'triangles':sum(doc['accessors'][p['indices']]['count']//3 if 'indices' in p else doc['accessors'][p['attributes']['POSITION']]['count']//3 for m in doc.get('meshes',[]) for p in m['primitives']),
  'meshes':len(doc.get('meshes',[])),'materials':len(doc.get('materials',[])),
  'animations':len(doc.get('animations',[])),'skins':len(doc.get('skins',[])),
  'extensionsRequired':doc.get('extensionsRequired',[]),'extensionsUsed':doc.get('extensionsUsed',[]),
  'externalBuffers':[b['uri'] for b in doc.get('buffers',[]) if 'uri' in b],'images':images}

def main():
 report={'downloads':[],'prepared':{}}
 for path in sorted(DOWNLOADS.iterdir()):
  if not path.is_file() or path.suffix.lower() not in {'.zip','.glb'}:continue
  data=path.read_bytes()
  info={'file':path.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
  if path.suffix.lower()=='.glb':info['glb']=glb_info(data)
  else:
   with zipfile.ZipFile(path) as archive:
    info['entries']=[]
    dest=(DOWNLOADS/'_extracted'/path.stem).resolve()
    for entry in archive.infolist():
     record={'file':entry.filename,'bytes':entry.file_size}
     if entry.filename.lower().endswith('.glb'):record['glb']=glb_info(archive.read(entry))
     if any(k in Path(entry.filename).name.lower() for k in ['license','readme','copyright','credit']):record['notice']=archive.read(entry).decode('utf8',errors='replace')
     info['entries'].append(record)
     if '--extract' in sys.argv:
      target=(dest/entry.filename).resolve()
      if not target.is_relative_to(dest):raise ValueError('Unsafe ZIP path')
      if not entry.is_dir() and not target.exists():
       target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(archive.read(entry))
  report['downloads'].append(info)
 for path in sorted((ROOT/'public/models/revenants').glob('*.glb')):
  report['prepared'][path.name]=glb_info(path.read_bytes())
 output=DOWNLOADS/'_prepared/inventory.json'
 output.parent.mkdir(exist_ok=True,parents=True)
 output.write_text(json.dumps(report,indent=2),encoding='utf8')
 for name,info in report['prepared'].items():
  assert info['bytes']<6_000_000 and info['triangles']<50_000
  assert not info['externalBuffers'] and not any(i.get('uri') for i in info['images'])
  assert all('size' in i and max(i['size'])<=1024 for i in info['images'])
  print(name,info['bytes'],'bytes;',info['triangles'],'triangles;',len(info['images']),'embedded images;',info['materials'],'materials')
 print('Inventory:',output.relative_to(ROOT))

if __name__=='__main__':main()
