# Batalha naval — especificação por testes

## Objetivo e especificação do desafio

Dois jogadores, tabuleiros **10 × 10**. Cada frota tem um porta-aviões (5 casas), um encouraçado (4), um submarino (3) e um destroier (2).

Entrega individual da disciplina Projeto, Implementação e Teste de Software, 2026.
Este repositório contém **somente testes JavaScript, fixtures e documentação**.
O professor poderá fornecer estes testes a uma IA para construir o jogo.
Não existe implementação, interface gráfica, mock ou solução de referência.

## Colaborador

- [aleatorio101](https://github.com/aleatorio101) — autoria individual dos testes e documentação.

## Execução

Requer Node.js 24 e npm. Usamos **Jest 30.5.2**, fixado no `package-lock.json`.
Instale as dependências de desenvolvimento antes de executar:

```sh
npm ci
npm test
```

**Situação esperada nesta entrega:** o comando termina com código diferente de zero,
com `Cannot find module` para `src/jogo.js`, porque `src/jogo.js` ainda não existe. Isso não demonstra
que os cenários passaram. Depois de implementar o contrato abaixo, o mesmo comando
deverá executar todos os casos e passar sem alterações nos testes.
Não desabilitar casos nem transformar falhas em sucesso.

## Contrato para a futura implementação

Criar `src/jogo.js` como ESM e exportar funções síncronas nomeadas:

```js
export function criarJogo(opcoes) { /* futura implementação */ }
export function executarAcao(estado, acao) { /* futura implementação */ }
export function obterVisao(estado, jogador) { /* futura implementação */ }
```

Essas assinaturas são documentação, não arquivos entregues. Estados, ações e opções
são objetos JavaScript simples, serializáveis. `criarJogo` não modifica as opções;
`executarAcao` retorna outro objeto sem modificar o estado, seus objetos internos ou a ação.
`obterVisao` não modifica o estado e retorna cópias sem referências mutáveis a ele.
Estados intermediários das fixtures podem ser passados diretamente a `executarAcao`:
eles são preparação de cenários, não uma implementação alternativa.

Coordenadas usam `linha` e `coluna`, começando em zero. Tipos errados, valores não inteiros
e objetos obrigatórios ausentes geram `TypeError`; inteiros fora do intervalo geram
`RangeError`. Violações de regra geram `Error` com a propriedade `code` indicada no teste.
Uma ação com `tipo` desconhecido gera `ACAO_DESCONHECIDA`. Ações em jogo encerrado geram
`JOGO_ENCERRADO`. A validação da fase de encerramento precede validações de jogadas.
Mensagens de erro são livres; classes e códigos são parte do contrato.


### Estado, posicionamento e turnos

Escolhemos o destroier entre as alternativas do enunciado. Navios são retilíneos,
horizontais (`'H'`) ou verticais (`'V'`), não podem se sobrepor nem sair do tabuleiro.
Podem se tocar, inclusive pelas diagonais. Cada jogador tem os quatro tipos exatamente uma vez.
Um tiro por turno, alternando mesmo quando acerta. Vence quem atingir as 14 casas inimigas.

`criarJogo()` inicia `{fase:'posicionamento',turno:0,vencedor:null,frotas:[[],[]],tiros:[[],[]]}`.
`criarJogo({frotas})` aceita duas frotas completas predefinidas e inicia `'em_andamento'`.
Uma frota é array de `{tipo,linha,coluna,orientacao}`. Tipos: `'porta_avioes'`,
`'encouracado'`, `'submarino'`, `'destroier'`. Tipo desconhecido ou orientação inválida:
`RangeError`. Sobreposição: `NAVIOS_SOBREPOSTOS`; repetição de tipo: `NAVIO_DUPLICADO`;
frota predefinida incompleta: `FROTA_INCOMPLETA`.

Ações:
- `{tipo:'posicionar',jogador,navio}`: permitido a qualquer jogador na fase de posicionamento.
- `{tipo:'iniciar'}`: só inicia com ambas as frotas completas; senão `FROTA_INCOMPLETA`.
- `{tipo:'atirar',jogador,linha,coluna}`: só no turno do jogador e após iniciar.

Erros: `FASE_INVALIDA`, `FORA_DA_VEZ`, `TIRO_REPETIDO`.
`tiros[jogador]` contém seus disparos em ordem: `{linha,coluna,resultado,navio}`;
`resultado` é `'agua'`, `'acerto'` ou `'afundou'`. `navio` é `null` na água e o tipo
atingido nos outros casos. O tiro que completa um navio recebe `'afundou'`;
registros anteriores continuam `'acerto'`.
Ao vencer: `fase:'encerrado'`, `vencedor:jogador` e `turno:jogador`.

`obterVisao(estado,jogador)` retorna exatamente `{fase,turno,vencedor,frotaPropria,
tirosProprios,tirosRecebidos}`; não expõe posições de navios inimigos não atingidos.
Índices de jogador válidos: 0/1.

Exemplo: `executarAcao(criarJogo({frotas}),{tipo:'atirar',jogador:0,linha:0,coluna:0})`.


## Funcionamento dos casos de teste

- `tests/*.test.js`: casos independentes com preparação, ação e resultados observáveis.
- `fixtures/*.json`: entradas fixas e estados intermediários explícitos.
- `tests/apoio.js`: importações, asserções e verificações de imutabilidade; não contém regras.
- As tabelas de casos têm expectativas literais. Laços apenas enumeram dados ou executam ações.
- Usamos `test` e `expect` de `@jest/globals`; não há `skip`, `todo`, rede, relógio ou aleatoriedade.
- Os prefixos dos casos identificam a regra. Leia cada nome e suas asserções para encontrar
  o comportamento exigido; os exemplos e as tabelas são parte da especificação.

O `npm test` já configura ESM para Jest no Windows e no Linux. O aviso de módulos VM
experimentais é esperado nessa configuração. Não instalar Jest globalmente.
Com a implementação presente, `npm run test:coverage` mede somente `src/**/*.js`.

## Critérios de aceitação

Uma implementação compatível preserva todos os testes, passa em `npm test`, respeita
os erros e a imutabilidade e não expõe informação escondida por `obterVisao`.
A cobertura medida é da implementação de ensaio, não de qualquer implementação futura;
a validação prática de uma reconstrução e seus limites estão em [VALIDACAO.md](VALIDACAO.md).

## Validação prática com Jest

Uma implementação de ensaio, mantida fora deste repositório, foi reconstruída a partir
da especificação e passou nos **44 testes ativos**. Os cinco defeitos artificiais
selecionados para este jogo foram detectados. Consulte [VALIDACAO.md](VALIDACAO.md).
