import { expect, test } from "@jest/globals";
import frotas from '../fixtures/frotas.json' with { type: 'json' };
import { criarJogo, executarAcao, obterVisao, agir, proibir, visao } from './apoio.js';
const novo = () => criarJogo({
  frotas: structuredClone(frotas)
});
const posicionar = navio => ({
  tipo: 'posicionar',
  jogador: 0,
  navio
});
const tiro = (jogador, linha, coluna) => ({
  tipo: 'atirar',
  jogador,
  linha,
  coluna
});
test('BN01 — criação sem frota inicia em posicionamento', () => {
  expect(criarJogo()).toEqual({
    fase: 'posicionamento',
    turno: 0,
    vencedor: null,
    frotas: [[], []],
    tiros: [[], []]
  });
});
test('BN02 — criação determinística com duas frotas completas', () => {
  const opcoes = {
    frotas: structuredClone(frotas)
  };
  const antes = structuredClone(opcoes);
  const e = criarJogo(opcoes);
  expect(opcoes).toEqual(antes);
  expect(e.fase).toBe('em_andamento');
  expect(e.turno).toBe(0);
  expect(e.vencedor).toBe(null);
  expect(e.frotas).toEqual(frotas);
  opcoes.frotas[0][0].linha = 9;
  expect(e.frotas[0][0].linha).toBe(0);
});
for (const [tipo, tamanho] of [['porta_avioes', 5], ['encouracado', 4], ['submarino', 3], ['destroier', 2]]) {
  for (const orientacao of ['H', 'V']) {
    test(`BN03 — ${tipo} ${orientacao} cabe exatamente na borda`, () => {
      const navio = {
        tipo,
        linha: orientacao === 'V' ? 10 - tamanho : 9,
        coluna: orientacao === 'H' ? 10 - tamanho : 9,
        orientacao
      };
      const e = agir(criarJogo(), posicionar(navio));
      expect(e.frotas[0]).toEqual([navio]);
    });
    test(`BN04 — ${tipo} ${orientacao} não cabe uma casa além`, () => {
      const navio = {
        tipo,
        linha: orientacao === 'V' ? 11 - tamanho : 9,
        coluna: orientacao === 'H' ? 11 - tamanho : 9,
        orientacao
      };
      expect(() => executarAcao(criarJogo(), posicionar(navio))).toThrow(RangeError);
    });
  }
}
test('BN05 — impedir sobreposição e repetição de tipos', () => {
  const e = agir(criarJogo(), posicionar({
    tipo: 'porta_avioes',
    linha: 0,
    coluna: 0,
    orientacao: 'H'
  }));
  proibir(e, posicionar({
    tipo: 'submarino',
    linha: 0,
    coluna: 4,
    orientacao: 'V'
  }), 'NAVIOS_SOBREPOSTOS');
  proibir(e, posicionar({
    tipo: 'porta_avioes',
    linha: 5,
    coluna: 0,
    orientacao: 'H'
  }), 'NAVIO_DUPLICADO');
});
test('BN06 — permitir navios encostados e completar posicionamento', () => {
  let e = criarJogo();
  const navios = [{
    tipo: 'porta_avioes',
    linha: 0,
    coluna: 0,
    orientacao: 'H'
  }, {
    tipo: 'encouracado',
    linha: 1,
    coluna: 0,
    orientacao: 'H'
  }, {
    tipo: 'submarino',
    linha: 2,
    coluna: 0,
    orientacao: 'H'
  }, {
    tipo: 'destroier',
    linha: 3,
    coluna: 0,
    orientacao: 'H'
  }];
  for (const jogador of [0, 1]) for (const navio of navios) e = agir(e, {
    tipo: 'posicionar',
    jogador,
    navio
  });
  expect(e.fase).toBe('posicionamento');
  e = agir(e, {
    tipo: 'iniciar'
  });
  expect(e.fase).toBe('em_andamento');
  expect(e.turno).toBe(0);
});
test('BN07 — não iniciar sem frotas completas nem atirar antes', () => {
  proibir(criarJogo(), {
    tipo: 'iniciar'
  }, 'FROTA_INCOMPLETA');
  proibir(criarJogo(), tiro(0, 0, 0), 'FASE_INVALIDA');
  expect(() => criarJogo({
    frotas: [frotas[0], []]
  })).toThrow(expect.objectContaining({
    code: 'FROTA_INCOMPLETA'
  }));
});
test('BN08 — posicionar após iniciar é proibido', () => {
  proibir(novo(), posicionar(frotas[0][0]), 'FASE_INVALIDA');
  proibir(novo(), {
    tipo: 'iniciar'
  }, 'FASE_INVALIDA');
});
for (const [linha, coluna, resultado, navio] of [[9, 9, 'agua', null], [0, 0, 'acerto', 'porta_avioes'], [2, 3, 'acerto', 'encouracado'], [4, 2, 'acerto', 'submarino'], [6, 1, 'acerto', 'destroier']]) {
  test(`BN09 — tiro (${linha},${coluna}) resulta em ${resultado}`, () => {
    const e = agir(novo(), tiro(0, linha, coluna));
    expect(e.tiros[0]).toEqual([{
      linha,
      coluna,
      resultado,
      navio
    }]);
    expect(e.turno).toBe(1);
    expect(e.fase).toBe('em_andamento');
  });
}
test('BN10 — alternância e tiro repetido não consomem turno', () => {
  let e = agir(novo(), tiro(0, 9, 9));
  proibir(e, tiro(0, 9, 8), 'FORA_DA_VEZ');
  e = agir(e, tiro(1, 9, 9));
  expect(e.turno).toBe(0);
  proibir(e, tiro(0, 9, 9), 'TIRO_REPETIDO');
  expect(e.tiros[0].length).toBe(1);
});
test('BN11 — afundar destroier exige suas duas casas', () => {
  let e = agir(novo(), tiro(0, 6, 0));
  e = agir(e, tiro(1, 9, 9));
  e = agir(e, tiro(0, 6, 1));
  expect(e.tiros[0]).toEqual([{
    linha: 6,
    coluna: 0,
    resultado: 'acerto',
    navio: 'destroier'
  }, {
    linha: 6,
    coluna: 1,
    resultado: 'afundou',
    navio: 'destroier'
  }]);
  expect(e.vencedor).toBe(null);
  expect(e.turno).toBe(1);
});
test('BN12 — atingir exatamente as 14 casas vence e bloqueia novas ações', () => {
  let e = novo();
  const alvos = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [2, 0], [2, 1], [2, 2], [2, 3], [4, 0], [4, 1], [4, 2], [6, 0], [6, 1]];
  const agua = [[9, 0], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9], [8, 0], [8, 1], [8, 2]];
  for (let i = 0; i < alvos.length; i++) {
    e = agir(e, tiro(0, ...alvos[i]));
    if (i < 13) {
      expect(e.vencedor).toBe(null);
      e = agir(e, tiro(1, ...agua[i]));
    }
  }
  expect(e.fase).toBe('encerrado');
  expect(e.vencedor).toBe(0);
  expect(e.turno).toBe(0);
  expect(e.tiros[0].length).toBe(14);
  expect(e.tiros[0].filter(t => t.resultado === 'afundou').map(t => t.navio)).toEqual(['porta_avioes', 'encouracado', 'submarino', 'destroier']);
  proibir(e, tiro(1, 7, 7), 'JOGO_ENCERRADO');
});
test('BN13 — visão não revela frota adversária e não compartilha referências', () => {
  const e = agir(novo(), tiro(0, 0, 0));
  const v = visao(e, 0);
  expect(v).toEqual({
    fase: 'em_andamento',
    turno: 1,
    vencedor: null,
    frotaPropria: frotas[0],
    tirosProprios: [{
      linha: 0,
      coluna: 0,
      resultado: 'acerto',
      navio: 'porta_avioes'
    }],
    tirosRecebidos: []
  });
  v.frotaPropria[0].linha = 9;
  v.tirosProprios[0].resultado = 'agua';
  expect(e.frotas[0][0].linha).toBe(0);
  expect(e.tiros[0][0].resultado).toBe('acerto');
  expect(visao(e, 1).tirosRecebidos).toEqual(e.tiros[0]);
});
for (const [linha, coluna] of [[-1, 0], [10, 0], [0, -1], [0, 10]]) test(`BN14 — tiro fora (${linha},${coluna})`, () => {
  expect(() => executarAcao(novo(), tiro(0, linha, coluna))).toThrow(RangeError);
});
test('BN15 — validação de tipos, jogadores e orientação', () => {
  expect(() => executarAcao(novo(), tiro('0', 0, 0))).toThrow(TypeError);
  expect(() => executarAcao(novo(), tiro(2, 0, 0))).toThrow(RangeError);
  expect(() => executarAcao(novo(), tiro(0, 0.5, 0))).toThrow(TypeError);
  expect(() => executarAcao(criarJogo(), posicionar({
    tipo: 'submarino',
    linha: 0,
    coluna: 0,
    orientacao: 'D'
  }))).toThrow(RangeError);
  expect(() => executarAcao(criarJogo(), posicionar({
    tipo: 'iate',
    linha: 0,
    coluna: 0,
    orientacao: 'H'
  }))).toThrow(RangeError);
  expect(() => obterVisao(novo(), -1)).toThrow(RangeError);
  proibir(novo(), {
    tipo: 'sonar'
  }, 'ACAO_DESCONHECIDA');
});
