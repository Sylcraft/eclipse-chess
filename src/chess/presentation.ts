import { type Chess, type Color, type PieceSymbol, type Square, type Move } from 'chess.js';
export interface VisualPiece { square: Square; type: PieceSymbol; color: Color; from: Square; captured?: boolean; promotedFrom?: PieceSymbol }
export interface Transition { id: number; started: number; pieces: VisualPiece[] }
export const MOVE_DURATION = 560;
export function snapshot(chess: Chess): VisualPiece[] {
 return chess.board().flatMap(row => row.flatMap(p => p ? [{square:p.square,from:p.square,type:p.type,color:p.color}] : []));
}
// Derive visual motion from chess.js' accepted move, including its special-move flags.
export function transitionPieces(before: VisualPiece[], chess: Chess, move: Move): VisualPiece[] {
 const pieces = snapshot(chess).map(p => {
  if (p.square === move.to) return {...p,from:move.from,promotedFrom:move.isPromotion() ? move.piece : undefined};
  if (move.isKingsideCastle() && p.square === `f${move.from[1]}`) return {...p,from:`h${move.from[1]}` as Square};
  if (move.isQueensideCastle() && p.square === `d${move.from[1]}`) return {...p,from:`a${move.from[1]}` as Square};
  return p;
 });
 const captureSquare = move.isEnPassant() ? `${move.to[0]}${move.from[1]}` : move.to;
 const victim = before.find(p => p.square === captureSquare && p.color !== move.color);
 return victim ? [...pieces,{...victim,captured:true}] : pieces;
}
export function squarePosition(square: Square): [number,number,number] {
 return ['abcdefgh'.indexOf(square[0])-3.5,0,4.5-Number(square[1])];
}
export function motion(progress: number, captured = false) {
 const t = Math.max(0,Math.min(1,progress));
 const ease = t*t*(3-2*t);
 return captured ? {ease,lift:-.4*ease,scale:Math.max(.001,1-ease)} : {ease,lift:Math.sin(t*Math.PI)*.24,scale:1};
}
