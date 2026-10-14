import { Component, lazy, Suspense, useState, type ReactNode } from 'react';
import { useGame } from './store/gameStore';
import { pieceNames, describeGame, type Promotion } from './chess/game';
import { Dialog } from './Dialog';
import type { PieceSymbol, Square } from 'chess.js';
const Board=lazy(()=>import('./scene/Board').then(m=>({default:m.Board})));
const symbols:Record<PieceSymbol,string>={k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div className="webgl-fallback" role="status">Le sanctuaire 3D est indisponible sur cet appareil.<br/>La partie reste jouable avec le plateau textuel ci-dessous.</div>:this.props.children;}
}
export function App(){
 const game=useGame();const [confirm,setConfirm]=useState(false);
 const chess=game.chess,history=chess.history({verbose:true}),ended=chess.isGameOver(),busy=!!game.transition;
 const pairs=Array.from({length:Math.ceil(history.length/2)},(_,i)=>history.slice(i*2,i*2+2));
 const legal=game.selected?chess.moves({square:game.selected,verbose:true}):[];
 const presentation=describeGame(chess);
 return <div className="app">
 <header><a className="brand" href="./"><span className="sigil">☽</span><span>ECLIPSE <b>CHESS</b><small>LES REVENANTS</small></span></a><div className="location"><span className="live-dot"/> LE SANCTUAIRE OUBLIÉ</div><span className="mode">LOCAL · 2 JOUEURS</span></header>
 <main><section className="arena" aria-label="Le sanctuaire et son échiquier"><div className="scene-heading"><span>CHAPITRE II / LE SANCTUAIRE</span><h1>Le silence avant la chute.</h1><p>Deux armées. Un trône. À vous d’écrire la dernière légende.</p></div>
 <div className="canvas-wrap"><SceneBoundary><Suspense fallback={<div className="webgl-fallback" role="status">Éveil du sanctuaire…</div>}><Board/></Suspense></SceneBoundary><div className="scene-tag">LES REVENANTS <span>PIERRE NOIRE · ARGENT OXYDÉ · ÂMES ÉTERNELLES</span></div><button className="view-button" onClick={game.resetView} title="Réinitialiser la caméra">↺ <span>Réinitialiser la vue</span></button>{busy&&<div className="motion-tag" role="status">Les ombres se déplacent…</div>}</div>
 <div className="board-help"><span><i className="hint-dot"/> Déplacement légal</span><span><i className="hint-ring"/> Capture</span><span><i className="hint-last"/> Dernier coup</span><span>Glisser pour orbiter · Molette pour zoomer</span></div></section>
 <aside><div className="eyebrow">LA PARTIE</div><div className={`turn-card ${ended?'ended':''}`}><div className="turn-top"><span>{busy?'MOUVEMENT EN COURS':presentation.phase}</span><span className="counter">{String(chess.moveNumber()).padStart(2,'0')}</span></div><div className="player"><span aria-hidden="true" className={chess.turn()==='w'?'player-icon white':'player-icon'}>{ended?'✦':'♚'}</span><div><h2>{presentation.title}</h2><p>{ended?'Le sanctuaire se souviendra.':`Les Revenants · ${chess.turn()==='w'?'Argent':'Obsidienne'}`}</p></div></div><p className={chess.isCheck()||ended?'status alert':'status'} role="status" aria-live="polite">{busy?'Résolution du mouvement…':presentation.detail}</p></div>
 <div className="captures"><div className="eyebrow">PIÈCES CAPTURÉES</div>{(['w','b'] as const).map(color=><div key={color}><span>{color==='w'?'Par les Blancs':'Par les Noirs'}</span><strong>{history.filter(m=>m.color===color&&m.captured).map((m,i)=><span aria-label={pieceNames[m.captured!]} title={pieceNames[m.captured!]} key={i}>{symbols[m.captured!]}</span>)}{!history.some(m=>m.color===color&&m.captured)&&<em>—</em>}</strong></div>)}</div>
 <div className="history"><div className="history-title"><span className="eyebrow">CHRONIQUE DES COUPS</span><span>{history.length} demi-coups</span></div><div className="history-columns"><span>Nº</span><span>BLANCS</span><span>NOIRS</span></div><div className="history-scroll" tabIndex={0} aria-label="Historique des coups">{pairs.length?pairs.map((pair,i)=><div className="history-row" key={i}><span>{i+1}.</span><span>{pair[0]?.san}</span><span>{pair[1]?.san??'—'}</span></div>):<div className="empty-history"><span>✦</span>La chronique attend<br/>votre premier mouvement.</div>}</div></div>
 <div className="actions"><button onClick={game.undo} disabled={!history.length||!!game.promotion||busy}>↶ Annuler le dernier coup</button><button className="primary" disabled={busy||!!game.promotion} onClick={()=>history.length?setConfirm(true):game.reset()}>Nouvelle partie <span>↗</span></button></div>
 <details className="settings"><summary>Réglages du sanctuaire</summary><label><span>Animations</span><input type="checkbox" checked={game.animations} onChange={e=>game.setAnimations(e.target.checked)}/></label><p>Respecte la préférence de mouvement réduit au démarrage.</p><label><span>Qualité graphique</span><select value={game.quality} onChange={e=>game.setQuality(e.target.value as 'low'|'high')}><option value="low">Faible</option><option value="high">Élevée</option></select></label><p>Faible : sans ombres, résolution limitée et ruines simplifiées.</p><button onClick={game.resetView}>Réinitialiser la caméra</button></details>
 <p className="aside-foot">Règles classiques · Sans limite de temps</p></aside></main>
 <footer><span>ECLIPSE CHESS <b>/</b> CHAPITRE II</span><span>Les ombres jouent aussi.</span><span>V2.0</span></footer>
 {game.promotion&&<Dialog titleId="promotion-title" onClose={game.cancel}><div className="eyebrow">UNE NOUVELLE PUISSANCE</div><h2 id="promotion-title">Choisissez votre promotion</h2><p>Le pion a atteint l’autre rive du sanctuaire.</p><div className="promotion-options">{(['q','r','b','n'] as Promotion[]).map(p=><button key={p} onClick={()=>game.promote(p)}><strong aria-hidden="true">{symbols[p]}</strong>{pieceNames[p]}</button>)}</div><button onClick={game.cancel}>Annuler</button></Dialog>}
 {confirm&&<Dialog titleId="reset-title" onClose={()=>setConfirm(false)}><h2 id="reset-title">Une nouvelle légende ?</h2><p>La partie en cours sera effacée.</p><div className="actions"><button onClick={()=>setConfirm(false)}>Continuer la partie</button><button className="primary" onClick={()=>{game.reset();setConfirm(false);}}>Nouvelle partie</button></div></Dialog>}
 <details className="accessible-board"><summary>Plateau textuel accessible — jouer au clavier</summary><p>Choisissez une pièce, puis une destination. Les coups légaux sont indiqués après sélection.</p><div>{chess.board().flatMap((row,r)=>row.map((piece,f)=>{
  const square=('abcdefgh'[f]+(8-r)) as Square;const move=legal.find(m=>m.to===square);const checked=piece?.type==='k'&&piece.color===chess.turn()&&chess.isCheck();
  return <button key={square} disabled={busy||!!game.promotion||ended} className={checked?'checked':move?'legal':''} aria-pressed={game.selected===square} onClick={()=>game.click(square)}>{square} {piece?`${pieceNames[piece.type]} ${piece.color==='w'?'blanc':'noir'}`:'vide'}{checked?' · en échec':move?move.isCapture()||move.isEnPassant()?' · capture légale':' · coup légal':''}</button>;
 }))}</div></details>
 </div>;
}
