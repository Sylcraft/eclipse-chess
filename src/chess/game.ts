import { Chess, type PieceSymbol, type Square } from 'chess.js';
export type Promotion = Exclude<PieceSymbol, 'p' | 'k'>;
export const pieceNames: Record<PieceSymbol,string> = {p:'Pion',r:'Tour',n:'Cavalier',b:'Fou',q:'Dame',k:'Roi'};
export function play(chess: Chess, from: Square, to: Square, promotion: Promotion = 'q') {
  if (!chess.moves({square:from,verbose:true}).some(m=>m.to===to)) return false;
  chess.move({from,to,promotion}); return true;
}
export function status(chess: Chess): string {
  if(chess.isCheckmate()) return `Échec et mat · ${chess.turn()==='w'?'les Noirs':'les Blancs'} remportent la partie`;
  if(chess.isStalemate()) return 'Partie nulle · pat';
  if(chess.isThreefoldRepetition()) return 'Partie nulle · triple répétition';
  if(chess.isInsufficientMaterial()) return 'Partie nulle · matériel insuffisant';
  if(chess.isDrawByFiftyMoves()) return 'Partie nulle · règle des 50 coups';
  if(chess.isDraw()) return 'Partie nulle';
  return chess.isCheck()?'Votre roi est en échec':'Sélectionnez une pièce pour jouer';
}

export function describeGame(chess: Chess) {
 const terminal=chess.isGameOver();
 const title=terminal?(chess.isCheckmate()?`Victoire des ${chess.turn()==='w'?'Noirs':'Blancs'}`:'Partie nulle'):(chess.turn()==='w'?'Les Blancs':'Les Noirs');
 return {title,terminal,phase:terminal?'LA CHRONIQUE EST CLOSE':chess.isCheck()?'ROI EN \u00c9CHEC':'\u00c0 VOUS DE JOUER',detail:status(chess)};
}
