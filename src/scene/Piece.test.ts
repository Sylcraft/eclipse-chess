import { describe, expect, it, vi } from 'vitest';
import type { PieceSymbol } from 'chess.js';
describe('Ressources procédurales des Revenants',()=>{
 it('fusionne réellement les détails sans erreur Three.js et garde les pièces dans leurs cases',async()=>{
  const error=vi.spyOn(console,'error');
  try {
   const {revenantGeometries}=await import('./Piece');
   expect(error).not.toHaveBeenCalled();
   for(const type of ['p','r','n','b','q','k'] as PieceSymbol[]){
    const surfaces=Object.values(revenantGeometries[type]);
    expect(surfaces.filter(Boolean)).toHaveLength(4);
    let vertices=0;
    for(const g of surfaces){
     expect(g).not.toBeNull();if(!g)continue;
     vertices+=g.getAttribute('position').count;
     g.computeBoundingBox();const box=g.boundingBox!;
     expect(box.min.x).toBeGreaterThan(-.49);expect(box.max.x).toBeLessThan(.49);
     expect(box.min.z).toBeGreaterThan(-.49);expect(box.max.z).toBeLessThan(.49);
     expect(box.max.y).toBeLessThan(1.7);
     expect(Array.from(g.getAttribute('position').array).every(Number.isFinite)).toBe(true);
    }
    expect(vertices/3).toBeLessThan(6000);
   }
  } finally {error.mockRestore();}
 });
});
