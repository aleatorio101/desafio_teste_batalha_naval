# Validação prática — Batalha Naval

Data: 11/11/2026. Node.js 24.17.0; Jest 30.5.2; ESM com módulos VM.

## Reconstrução

Uma implementação real das três funções do contrato foi escrita em uma cópia separada,
a partir do README, testes e fixtures. Ela não importa fixtures nem contém respostas
específicas para casos de teste. Nenhuma implementação é distribuída neste repositório.
O mesmo processo de autoria fez a reconstrução; não foi uma avaliação cega por outro avaliador.

- Resultado com essa implementação: **44 testes aprovados, zero falhas e zero ignorados**.
- Cobertura da implementação de ensaio: linhas 100%, funções 100%, ramificações 96.42%.
- Sem implementação: `npm ci` instala Jest; `npm test` falha por não encontrar `src/jogo.js`.
- Não há mocks de jogo, `skip`, `todo`, testes exclusivos ou captura de falhas para gerar aprovação.
- Somente fixtures, testes, configuração Jest, lockfile e documentação são entregues.

## Defeitos artificiais detectados

Cada alteração foi aplicada isoladamente ao código de ensaio. O Jest executou os casos
e encontrou pelo menos uma asserção falhando, sem erro de carregamento. A implementação
correta foi restaurada ao final de cada grupo.

| Identificador | Defeito introduzido | Exemplo de teste que detectou |
| --- | --- | --- |
| BN-M1 | Consultar própria frota ao disparar | BN16 — disparo consulta a frota inimiga, não a própria |
| BN-M2 | Tratar navios verticais como pontos na linha | BN17 — acertar navio vertical em posição ausente na própria frota |
| BN-M3 | Permitir disparo repetido | BN20 — tiro repetido em um acerto também é proibido |
| BN-M4 | Manter turno de quem dispara | BN17 — acertar navio vertical em posição ausente na própria frota |
| BN-M5 | Vencer com somente treze acertos | BN19 — partida completa desde criação também permite vitória do jogador 1 |

## Como repetir

1. Executar `npm ci` com Node.js 24.
2. Implementar `src/jogo.js` respeitando as três exportações e o contrato do README.
3. Executar `npm test` e `npm run test:coverage`, sem modificar os testes.

Todos os casos estão em `tests/`. Os cenários de `integracao.test.js` usam ações públicas
para partidas ou fluxos completos, além dos cenários unitários de regras específicas.
As implementações e resultados JSON do ensaio foram preservados separadamente para revisão local.

## Limites do resultado

Estes números demonstram compatibilidade com os cenários executados. Cobertura de linhas
não comprova todas as combinações de regras, e os cinco defeitos selecionados não representam
um teste exaustivo de mutação. Não se afirma correção universal de 100% do jogo.
As variantes e escolhas explícitas do README são parte da especificação.

## Integridade dos arquivos avaliados

SHA-256 dos arquivos de especificação e execução. Este relatório não inclui seu próprio hash.

```text
2fdfeff87d44a999d1bbd6bd90c7bd2821922a09cd6ca9d22d3f84b95cbd2455  fixtures/frotas.json
9818da5c656f227e7a43c647fb7ebe30dcb64808d6500eace776c0da9ca7bc46  fixtures/frotas_assimetricas.json
ba2654fc62e7e62442e08ba2f87cf6ce9cfcea0abbe4926c7725f7f3b75a6ea5  jest.config.js
33c01f7bb3357bed15ff046bc601a014fa322be194ecf297350d0a5e8b36e8b6  package-lock.json
915d247971fab739efe48e44015b4774d97d22768391ee95df25c38fca1da38b  package.json
44ea822ec628e84c618c532f9fa514c783549f0df8f28747b36b729dc816be27  README.md
ca0931fcb5f2fc4560d8819fd2edd9f32fceb62ac8a8b47b69924679187c646c  tests/apoio.js
cf74f88a1a9775bbe29407668887d1aec320f05b6339f50cf39814a8264eaa06  tests/batalha_naval.test.js
d2f629f6687f3b274cdbd63671de05f31b5976fdd7611932e349ea24a612c278  tests/integracao.test.js
```
