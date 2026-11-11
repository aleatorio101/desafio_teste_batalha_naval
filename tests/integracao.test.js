import {test,expect} from '@jest/globals';
import frotas from '../fixtures/frotas_assimetricas.json' with {type:'json'};
import {criarJogo,agir,proibir,visao} from './apoio.js';
const atirar=(jogador,linha,coluna)=>({tipo:'atirar',jogador,linha,coluna});
test('BN16 — disparo consulta a frota inimiga, não a própria',()=>{
  const e=agir(criarJogo({frotas}),atirar(0,0,0));
  expect(e.tiros[0]).toEqual([{linha:0,coluna:0,resultado:'agua',navio:null}]);
});
test('BN17 — acertar navio vertical em posição ausente na própria frota',()=>{
  const e=agir(criarJogo({frotas}),atirar(0,4,9));
  expect(e.tiros[0]).toEqual([{linha:4,coluna:9,resultado:'acerto',navio:'porta_avioes'}]);
  expect(e.turno).toBe(1);
});
for(const [nome,alvos,tipo] of [
  ['porta-aviões',[[0,9],[1,9],[2,9],[3,9],[4,9]],'porta_avioes'],
  ['encouraçado',[[0,7],[1,7],[2,7],[3,7]],'encouracado'],
  ['submarino',[[0,5],[1,5],[2,5]],'submarino'],
  ['destroier',[[0,3],[1,3]],'destroier']
])test(`BN18 — afundar ${nome} vertical só na última casa`,()=>{
  let e=criarJogo({frotas});
  for(let i=0;i<alvos.length;i++){
    e=agir(e,atirar(0,...alvos[i]));
    expect(e.tiros[0].at(-1).navio).toBe(tipo);
    expect(e.tiros[0].at(-1).resultado).toBe(i===alvos.length-1?'afundou':'acerto');
    if(i<alvos.length-1)e=agir(e,atirar(1,9,i));
  }
});
test('BN19 — partida completa desde criação também permite vitória do jogador 1',()=>{
  let e=criarJogo({frotas});
  const alvos=[[0,0],[0,1],[0,2],[0,3],[0,4],[2,0],[2,1],[2,2],[2,3],[4,0],[4,1],[4,2],[6,0],[6,1]];
  const aguas=[[9,0],[9,1],[9,2],[9,3],[9,4],[9,5],[9,6],[9,7],[9,8],[9,9],[8,0],[8,1],[8,2],[8,3]];
  for(let i=0;i<14;i++){
    e=agir(e,atirar(0,...aguas[i]));expect(e.tiros[0].at(-1).resultado).toBe('agua');
    e=agir(e,atirar(1,...alvos[i]));
    if(i<13){expect(e.fase).toBe('em_andamento');expect(e.turno).toBe(0);}
  }
  expect(e.fase).toBe('encerrado');expect(e.vencedor).toBe(1);expect(e.turno).toBe(1);
  expect(e.tiros[0]).toHaveLength(14);expect(e.tiros[1]).toHaveLength(14);
  expect(e.tiros[1].filter(t=>t.resultado==='afundou')).toHaveLength(4);
  expect(visao(e,0).vencedor).toBe(1);proibir(e,atirar(0,7,7),'JOGO_ENCERRADO');
});
test('BN20 — tiro repetido em um acerto também é proibido',()=>{
  let e=agir(criarJogo({frotas}),atirar(0,0,9));e=agir(e,atirar(1,9,9));
  proibir(e,atirar(0,0,9),'TIRO_REPETIDO');
});
