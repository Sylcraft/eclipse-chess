import { describe, it, expect, beforeEach } from 'vitest';
import { Chess } from 'chess.js';
import { play, status } from './game';
import { useGame } from '../store/gameStore';
describe('Règles chess.js',()=>{
 it('accepte un coup légal et refuse un coup illégal',()=>{const c=new Chess();expect(play(c,'e2','e5')).toBe(false);expect(play(c,'e2','e4')).toBe(true);expect(c.turn()).toBe('b');expect(play(c,'d2','d4')).toBe(false);});
 it('déplace la tour pendant le roque',()=>{const c=new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');expect(play(c,'e1','g1')).toBe(true);expect(c.get('f1')?.type).toBe('r');expect(c.get('g1')?.type).toBe('k');});
 it('applique la promotion choisie',()=>{const c=new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');expect(play(c,'a7','a8','n')).toBe(true);expect(c.get('a8')?.type).toBe('n');});
 it('gère la prise en passant',()=>{const c=new Chess();['e4','a6','e5','d5'].forEach(m=>c.move(m));play(c,'e5','d6');expect(c.get('d5')).toBeUndefined();expect(c.get('d6')?.type).toBe('p');});
 it('détecte le mat',()=>{const c=new Chess();['f3','e5','g4','Qh4#'].forEach(m=>c.move(m));expect(c.isCheckmate()).toBe(true);expect(status(c)).toContain('les Noirs');});
 it('détecte pat, répétition, matériel insuffisant et 50 coups',()=>{expect(status(new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1'))).toContain('pat');expect(status(new Chess('7k/8/6K1/8/8/8/8/8 w - - 0 1'))).toContain('matériel');expect(status(new Chess('7k/8/6K1/8/8/8/8/R7 w - - 100 51'))).toContain('50 coups');const c=new Chess();['Nf3','Nf6','Ng1','Ng8','Nf3','Nf6','Ng1','Ng8'].forEach(m=>c.move(m));expect(status(c)).toContain('répétition');});
});
describe('Interactions Zustand',()=>{
 beforeEach(()=>{useGame.getState().setAnimations(false);useGame.getState().reset();});
 it('sélectionne, joue, annule et recommence',()=>{useGame.getState().click('e7');expect(useGame.getState().selected).toBeNull();useGame.getState().click('e2');useGame.getState().click('e4');expect(useGame.getState().chess.history()).toEqual(['e4']);useGame.getState().undo();expect(useGame.getState().chess.history()).toEqual([]);expect(useGame.getState().chess.board().flat().filter(Boolean)).toHaveLength(32);});
 it('attend le choix de promotion et bloque les autres interactions',()=>{useGame.setState({chess:new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1')});useGame.getState().click('a7');useGame.getState().click('a8');expect(useGame.getState().promotion).toEqual({from:'a7',to:'a8'});useGame.getState().click('h1');expect(useGame.getState().selected).toBe('a7');useGame.getState().promote('r');expect(useGame.getState().chess.get('a8')?.type).toBe('r');expect(useGame.getState().promotion).toBeNull();});
 it('bloque les coups après un mat',()=>{const c=new Chess();['f3','e5','g4','Qh4#'].forEach(m=>c.move(m));useGame.setState({chess:c});useGame.getState().click('e2');expect(useGame.getState().selected).toBeNull();});
});
