# Tibia Mobile - Integração com WorkAdventure

## Como funciona

Este projeto transforma o WorkAdventure em um jogo estilo Tibia, adicionando mecânicas de RPG sobre a infraestrutura existente.

## O que foi modificado/arquitetura

### Arquivos Criados (play/src/front/Phaser/Tibia/)

```
Tibia/
├── TibiaIntegration.ts  # Classe principal que integra RPG ao WorkAdventure
├── hook.ts              # Hook que conecta ao GameScene existente
├── index.ts             # Entry point e exports
├── data/
│   ├── types.ts         # Tipos TypeScript
│   ├── items.ts         # 40+ itens (armas, armaduras, poções)
│   ├── monsters.ts      # 20+ monstros com loot
│   └── quests.ts        # 8 quests progressivas
├── systems/
│   ├── PlayerStats.ts   # Stats do jogador (HP, MP, Level, Skills)
│   ├── BattleSystem.ts  # Sistema de batalha por turnos
│   ├── Inventory.ts     # Inventário com 20 slots
│   ├── QuestSystem.ts   # Sistema de quests
│   ├── SaveSystem.ts    # Save/Load no localStorage
│   └── SoundManager.ts  # Efeitos sonoros
├── entities/
│   └── MonsterManager.ts # Gerenciamento de monstros com AI
├── ui/
│   └── TibiaUI.ts       # Interface estilo Tibia
└── maps/
    └── maps.ts          # Mapas 64x64 com NPCs e transições
```

### Como a integração funciona

1. **hook.ts** - Faz patch no GameScene.prototype.update para chamar o Tibia
2. **TibiaIntegration.ts** - Classe que gerencia todo o estado RPG
3. Quando o jogador entra no jogo, a integração é inicializada automaticamente

### Funcionalidades

- **Sistema de Stats**: HP, MP, Level, XP, Gold, Skills
- **Batalha por turnos**: Atacar, Magia, Heal, Defender, Fugir
- **Inventário**: 20 slots, equipamento, consumíveis
- **Monstros com AI**: Passivos e agressivos, perseguição
- **Quests**: 8 quests progressivas com recompensas
- **Mapas**: Thais, Floresta, Masmorra, Covil de Dragões, Salão dos Demônios
- **NPCs**: Comércio, quests, diálogos
- **Save/Load**: Auto-save a cada 30 segundos

### Controles

| Tecla | Ação |
|-------|------|
| WASD / Setas | Mover |
| Espaço | Ação / Atacar |
| I | Inventário |
| C | Stats |
| Q | Quests |
| E | Interagir NPC |
| 1 | Aceitar quest |
| 2 | Atacar (batalha) |
| 3 | Magia (batalha) |
| 4 | Heal (batalha) |
| 5 | Defender (batalha) |
| 6 | Fugir (batalha) |

## Como rodar

### Opção 1: Docker (Recomendado)

```bash
cd /sdcard/mimo
cp .env.template .env
docker-compose up
```

Acesse: http://play.workadventure.localhost/

### Opção 2: Desenvolvimento

```bash
cd /sdcard/mimo/play
npm install
npm run dev
```

Acesse: http://localhost:8080/

### Opção 3: Standalone (Teste rápido)

```bash
cd /sdcard/mimo
python3 -m http.server 8080
```

Acesse: http://localhost:8080/tibia.html

## Mapas

| Mapa | Nível | Monstros |
|------|-------|----------|
| Thais | 1+ | Rat, Bug, Snake |
| Floresta Somria | 5+ | Spider, Troll, Goblin, Wolf |
| Masmorra | 15+ | Skeleton, Zombie, Orc |
| Masmorra Profunda | 25+ | Minotaur, Orc Warrior |
| Covil de Dragões | 40+ | Dragon, Dragon Lord |
| Salão dos Demônios | 70+ | Demon, Archdemon |

## NPCs

| NPC | Mapa | Função |
|-----|------|--------|
| Thal | Thais | Quest giver |
| Capt. Gnostus | Thais | Quest giver |
| Rashid | Thais | Vendedor |
| Daniela | Thais | Poções |
| Xod | Thais | Armas/Armaduras |
| Hermit | Floresta | Quest giver |
| Father Clement | Masmorra | Quest giver |
| Dragon Slayer | Covil | Quest giver |
| Archmage | Demônios | Quest giver |

## Próximos passos

1. Criar sprites customizados para monstros e NPCs
2. Adicionar mais mapas
3. Melhorar a UI com elementos visuais
4. Adicionar sistema de magias mais complexo
5. Implementar batalha multiplayer
