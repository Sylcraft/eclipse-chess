import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Chess } from 'chess.js';
import { describeGame } from './game';
import { MOVE_DURATION, motion, snapshot, squarePosition, transitionPieces } from './presentation';
import { useGame } from '../store/gameStore';
function visualMove(fen:string,from:string,to:string,promotion?:string){
 const chess=new Chess(fen),before=snapshot(chess);
 const move=chess.move({from,to,promotion});
 return {chess,pieces:transitionPieces(before,chess,move)};
}
describe('Présentation des transitions',()=>{
 it('conserve une source et destination sans déplacer visuellement instantanément',()=>{
  const {pieces}=visualMove(new Chess().fen(),'e2','e4');
  expect(pieces.find(p=>p.square==='e4')).toMatchObject({from:'e2',type:'p'});
  expect(pieces).toHaveLength(32);expect(squarePosition('a8')).toEqual([-3.5,0,-3.5]);expect(squarePosition('h1')).toEqual([3.5,0,3.5]);
 });
 it.each([['g1','f1','h1'],['c1','d1','a1']])('anime les deux pièces du roque vers %s',(to,rook,source)=>{
  const {pieces}=visualMove('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1','e1',to);
  expect(pieces.find(p=>p.square===to)).toMatchObject({from:'e1',type:'k'});
  expect(pieces.find(p=>p.square===rook)).toMatchObject({from:source,type:'r'});
 });
 it('garde la victime sur sa case pour la disparition',()=>{
  const {pieces,chess}=visualMove('7k/8/8/3p4/4P3/8/8/7K w - - 0 1','e4','d5');
  expect(pieces.find(p=>p.captured)).toMatchObject({square:'d5',color:'b',type:'p'});
  expect(chess.get('d5')?.color).toBe('w');
 });
 it('retire la victime de la prise en passant depuis la bonne case',()=>{
  const c=new Chess();['e4','a6','e5','d5'].forEach(m=>c.move(m));
  const {pieces}=visualMove(c.fen(),'e5','d6');
  expect(pieces.find(p=>p.captured)?.square).toBe('d5');
  expect(pieces.find(p=>p.square==='d6')?.from).toBe('e5');
 });
 it('conserve la silhouette du pion pendant une promotion avec capture',()=>{
  const {pieces,chess}=visualMove('1r5k/P7/8/8/8/8/8/7K w - - 0 1','a7','b8','n');
  expect(pieces.find(p=>p.color==='w'&&p.square==='b8')).toMatchObject({type:'n',promotedFrom:'p',from:'a7'});
  expect(pieces.filter(p=>p.captured)).toHaveLength(1);expect(chess.get('b8')?.type).toBe('n');
 });
 it('termine exactement sur la case et rétrécit la victime sans échelle négative',()=>{
  expect(motion(0)).toEqual({ease:0,lift:0,scale:1});expect(motion(1).ease).toBe(1);expect(motion(1).lift).toBeCloseTo(0);
  expect(motion(.5).lift).toBeGreaterThan(0);expect(motion(2,true).scale).toBe(.001);
 });
});
describe('Verrou et paramètres',()=>{
 beforeEach(()=>{vi.useFakeTimers();useGame.getState().setAnimations(false);useGame.getState().reset();useGame.getState().setAnimations(true);});
 afterEach(()=>{useGame.getState().setAnimations(false);vi.useRealTimers();});
 const move=()=>{useGame.getState().click('e2');useGame.getState().click('e4');};
 it('bloque sélection, coup, annulation et remise à zéro pendant le déplacement',()=>{
  move();const fen=useGame.getState().chess.fen();expect(useGame.getState().transition).not.toBeNull();
  useGame.getState().click('e7');useGame.getState().click('e5');useGame.getState().undo();useGame.getState().reset();useGame.getState().cancel();
  expect(useGame.getState().chess.fen()).toBe(fen);expect(useGame.getState().selected).toBeNull();
  vi.advanceTimersByTime(MOVE_DURATION+80);expect(useGame.getState().transition).toBeNull();
  useGame.getState().click('e7');expect(useGame.getState().selected).toBe('e7');useGame.getState().undo();expect(useGame.getState().chess.history()).toEqual([]);
 });
 it('ignore la fin tardive d’une autre transition',()=>{
  move();const id=useGame.getState().transition!.id;useGame.getState().finishTransition(id+1);expect(useGame.getState().transition?.id).toBe(id);
  useGame.getState().finishTransition(id);expect(useGame.getState().transition).toBeNull();
 });
 it('permet de désactiver les animations pendant le mouvement sans altérer chess.js',()=>{
  move();const fen=useGame.getState().chess.fen();useGame.getState().setAnimations(false);
  expect(useGame.getState().transition).toBeNull();expect(useGame.getState().chess.fen()).toBe(fen);
  useGame.getState().click('e7');useGame.getState().click('e5');expect(useGame.getState().transition).toBeNull();expect(useGame.getState().chess.history()).toEqual(['e4','e5']);
 });
 it('change la qualité et réinitialise la vue sans changer la partie',()=>{
  move();const fen=useGame.getState().chess.fen(),view=useGame.getState().view;
  useGame.getState().setQuality('low');useGame.getState().resetView();
  expect(useGame.getState().quality).toBe('low');expect(useGame.getState().view).toBe(view+1);expect(useGame.getState().chess.fen()).toBe(fen);
 });
 it('anime une promotion puis rend la nouvelle pièce autoritaire',()=>{
  useGame.setState({chess:new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1')});useGame.getState().click('a7');useGame.getState().click('a8');
  expect(useGame.getState().transition).toBeNull();useGame.getState().promote('q');
  expect(useGame.getState().transition?.pieces.find(p=>p.square==='a8')?.promotedFrom).toBe('p');
  vi.advanceTimersByTime(MOVE_DURATION+80);expect(useGame.getState().chess.get('a8')?.type).toBe('q');expect(useGame.getState().promotion).toBeNull();
 });
});
describe('États présentés au joueur',()=>{
 it('annonce le camp vainqueur et le mat',()=>{
  const c=new Chess();['f3','e5','g4','Qh4#'].forEach(m=>c.move(m));
  expect(describeGame(c)).toMatchObject({title:'Victoire des Noirs',terminal:true});expect(describeGame(c).detail).toContain('Échec et mat');
 });
 it.each([
  ['7k/5Q2/6K1/8/8/8/8/8 b - - 0 1','pat'],
  ['7k/8/6K1/8/8/8/8/8 w - - 0 1','matériel insuffisant'],
  ['7k/8/6K1/8/8/8/8/R7 w - - 100 51','50 coups']
 ])('présente la nulle avec sa raison (%s)',(fen,reason)=>{
  expect(describeGame(new Chess(fen))).toMatchObject({title:'Partie nulle',terminal:true});expect(describeGame(new Chess(fen)).detail).toContain(reason);
 });
 it('signale un échec sans annoncer une fin de partie',()=>{
  const c=new Chess('4k3/8/8/8/8/8/4R3/K7 b - - 0 1');expect(describeGame(c)).toMatchObject({title:'Les Noirs',terminal:false,phase:'ROI EN ÉCHEC'});
 });
});
