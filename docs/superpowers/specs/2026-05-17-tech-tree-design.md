# Tech Tree Design Spec

Date: 2026-05-17

## Overview

A Civilization-inspired tech tree for the CivilPomo Pomodoro game, spanning from primitive origins to sci-fi future. The tree includes three node categories: technology, humanities, and civic.

## Parameters

- **Total nodes**: ~152
- **Total pomodoros**: ~530-610 (avg 3.5-4 per node)
- **Pomodoros per node**: 2-5
- **Eras**: 9
- **Dependencies**: within-era only
- **Categories**: technology, humanities, civic (requires type change from current `"technology" | "humanities"`)

## Color Philosophy

- **technology**: blue/gray tones (#2563eb, #4f46e5, #64748b, #78716c)
- **humanities**: purple/warm tones (#9333ea, #7c3aed, #be123c, #c026d3)
- **civic**: gold/earth tones (#ca8a04, #d97706, #a16207, #f59e0b)
- Individual nodes may use semantic colors (e.g. fire=#e8590c, water=#0ea5e9)

## Era Breakdown

### Era 1: Primitive (18 nodes)

| id | name | category | pomodoros | prerequisites | color |
|----|------|----------|-----------|---------------|-------|
| fire | 火 | technology | 2 | — | #e8590c |
| stone-tools | 石器 | technology | 2 | — | #78716c |
| language | 语言 | humanities | 3 | — | #9333ea |
| rope | 绳索 | technology | 2 | stone-tools | #a16207 |
| hunting | 狩猎采集 | technology | 3 | stone-tools, language | #65a30d |
| shelter | 穴居 | technology | 2 | fire | #78716c |
| tribal-organization | 部落组织 | civic | 3 | language | #ca8a04 |
| primitive-beliefs | 原始信仰 | humanities | 2 | language | #a855f7 |
| animal-domestication | 动物驯化 | technology | 3 | hunting | #d97706 |
| pottery | 陶器 | technology | 3 | fire, shelter | #ea580c |
| totemism | 图腾崇拜 | humanities | 2 | tribal-organization, primitive-beliefs | #c026d3 |
| weaving | 纺织 | technology | 2 | totemism, rope | #db2777 |
| cave-painting | 洞穴壁画 | humanities | 2 | primitive-beliefs | #f59e0b |
| fishing | 渔猎 | technology | 2 | rope, hunting | #0891b2 |
| herbalism | 草药学 | technology | 3 | hunting, cave-painting | #16a34a |
| burial | 丧葬仪式 | humanities | 2 | primitive-beliefs, shelter | #6b21a8 |
| music | 音乐 | humanities | 2 | language, cave-painting | #e879f9 |
| primitive-trade | 原始以物易物 | civic | 2 | tribal-organization, rope | #f59e0b |

### Era 2: Bronze (18 nodes)

| id | name | category | pomodoros | prerequisites | color |
|----|------|----------|-----------|---------------|-------|
| wheel | 轮子 | technology | 4 | — | #64748b |
| writing | 文字 | humanities | 4 | — | #7c3aed |
| bronze-smelting | 青铜冶炼 | technology | 4 | — | #ea580c |
| agriculture-improved | 农业改良 | technology | 3 | wheel | #16a34a |
| sailing | 帆船 | technology | 3 | wheel, writing | #0284c7 |
| irrigation | 灌溉系统 | technology | 3 | agriculture-improved | #0e7490 |
| calendar | 历法 | humanities | 3 | writing, agriculture-improved | #2563eb |
| multiplication | 乘法 | technology | 2 | writing | #4f46e5 |
| arch | 拱门 | technology | 3 | wheel | #78716c |
| fortification | 城墙 | technology | 4 | arch, bronze-smelting | #57534e |
| trade | 贸易 | civic | 3 | sailing, writing | #ca8a04 |
| city-state | 城邦 | civic | 4 | trade, fortification | #d97706 |
| law | 法典 | civic | 4 | city-state, writing | #a16207 |
| mythology | 神话史诗 | humanities | 3 | writing | #9333ea |
| priest-class | 祭司阶层 | humanities | 3 | mythology, city-state | #a855f7 |
| diplomacy | 外交 | civic | 3 | city-state, law | #f59e0b |
| dyeing | 染色 | technology | 2 | trade, bronze-smelting | #e11d48 |
| sculpture | 雕塑 | humanities | 2 | arch, mythology | #c084fc |

### Era 3: Classical (16 nodes)

| id | name | category | pomodoros | prerequisites | color |
|----|------|----------|-----------|---------------|-------|
| iron-smelting | 铁器冶炼 | technology | 4 | — | #44403c |
| roads | 道路 | technology | 4 | — | #78716c |
| democracy | 民主制度 | civic | 4 | — | #ca8a04 |
| aqueduct | 渡槽 | technology | 3 | roads, iron-smelting | #0ea5e9 |
| concrete | 混凝土 | technology | 3 | iron-smelting | #78716c |
| crossbow | 弩 | technology | 3 | iron-smelting | #44403c |
| siege-weaponry | 攻城器械 | technology | 4 | crossbow, concrete | #57534e |
| philosophy | 哲学 | humanities | 4 | democracy | #7c3aed |
| drama | 戏剧 | humanities | 3 | philosophy | #c026d3 |
| epic-literature | 史诗文学 | humanities | 3 | philosophy | #9333ea |
| olympics | 奥运会 | civic | 3 | democracy, drama | #f59e0b |
| public-bath | 公共浴场 | technology | 2 | aqueduct, concrete | #06b6d4 |
| library | 图书馆 | humanities | 3 | roads, epic-literature | #2563eb |
| hospital | 医院 | civic | 3 | aqueduct, library | #16a34a |
| history | 历史学 | humanities | 3 | library, epic-literature | #6d28d9 |
| census | 人口普查 | civic | 2 | roads, democracy | #a16207 |

### Era 4: Medieval (15 nodes)

| id | name | category | pomodoros | prerequisites | color |
|----|------|----------|-----------|---------------|-------|
| stirrup | 马镫 | technology | 3 | — | #78716c |
| gunpowder | 火药 | technology | 4 | — | #dc2626 |
| mechanical-clock | 机械钟 | technology | 4 | — | #64748b |
| glasses | 眼镜 | technology | 2 | mechanical-clock | #0ea5e9 |
| windmill | 风车 | technology | 3 | mechanical-clock | #a3e635 |
| water-powered-hammer | 水力锻锤 | technology | 3 | windmill, stirrup | #0284c7 |
| gothic-architecture | 哥特式建筑 | technology | 4 | glasses, water-powered-hammer | #78716c |
| feudalism | 封建制度 | civic | 4 | — | #a16207 |
| canon-law | 教会法 | civic | 3 | feudalism | #ca8a04 |
| university | 大学 | humanities | 4 | feudalism, canon-law | #2563eb |
| scholasticism | 经院哲学 | humanities | 3 | university | #7c3aed |
| guild-system | 行会制度 | civic | 3 | feudalism, canon-law | #d97706 |
| chivalry | 骑士精神 | humanities | 3 | feudalism, stirrup | #be123c |
| monastery | 修道院 | humanities | 2 | canon-law, university | #6b21a8 |
| banking | 银行业 | civic | 3 | guild-system, university | #eab308 |

### Era 5: Renaissance (17 nodes)

| id | name | category | pomodoros | prerequisites | color |
|----|------|----------|-----------|---------------|-------|
| printing-press | 印刷术 | technology | 4 | — | #44403c |
| navigation | 航海术 | technology | 4 | — | #0284c7 |
| telescope | 天文望远镜 | technology | 3 | printing-press | #0ea5e9 |
| perspective | 透视法 | humanities | 3 | printing-press | #c026d3 |
| anatomy | 解剖学 | technology | 3 | printing-press, perspective | #dc2626 |
| humanism | 人文主义 | humanities | 4 | printing-press | #9333ea |
| renaissance-art | 文艺复兴艺术 | humanities | 3 | perspective, humanism | #e879f9 |
| exploration | 大航海探索 | civic | 4 | navigation, telescope | #0e7490 |
| scientific-method | 科学方法 | humanities | 4 | telescope, anatomy | #2563eb |
| opera | 歌剧 | humanities | 2 | renaissance-art, humanism | #f472b6 |
| city-planning | 城市规划 | civic | 3 | renaissance-art, exploration | #ca8a04 |
| double-entry-bookkeeping | 复式记账法 | civic | 3 | exploration, humanism | #a16207 |
| diplomacy-renaissance | 外交体系 | civic | 3 | city-planning, double-entry-bookkeeping | #d97706 |
| machiavellianism | 马基雅维利主义 | civic | 3 | city-planning, humanism | #57534e |
| cartography | 制图学 | technology | 3 | navigation, exploration | #0e7490 |
| banking-renaissance | 现代银行 | civic | 3 | double-entry-bookkeeping, renaissance-art | #eab308 |
| literature | 古典文学复兴 | humanities | 3 | humanism, printing-press | #7c3aed |

### Era 6: Enlightenment & Revolution (18 nodes)

| id | name | category | pomodoros | prerequisites | color |
|----|------|----------|-----------|---------------|-------|
| steam-engine | 蒸汽机 | technology | 4 | — | #44403c |
| textile-machinery | 纺织机械 | technology | 3 | — | #db2777 |
| smallpox-vaccine | 天花疫苗 | technology | 3 | — | #16a34a |
| gas-lighting | 煤气灯 | technology | 2 | steam-engine | #f59e0b |
| railway | 铁路 | technology | 4 | steam-engine | #57534e |
| telegraph | 电报 | technology | 3 | railway | #2563eb |
| empiricism | 经验主义 | humanities | 4 | — | #7c3aed |
| american-revolution | 美国独立 | civic | 4 | empiricism | #1d4ed8 |
| french-revolution | 法国大革命 | civic | 4 | empiricism | #dc2626 |
| capitalism | 资本主义 | civic | 3 | american-revolution, textile-machinery | #ca8a04 |
| romanticism | 浪漫主义 | humanities | 3 | french-revolution, empiricism | #e879f9 |
| socialism | 社会主义思潮 | civic | 3 | capitalism, french-revolution | #be123c |
| nationalism | 民族主义 | civic | 3 | french-revolution, railway | #a16207 |
| public-education | 公共教育 | civic | 3 | american-revolution, telegraph | #2563eb |
| photography | 摄影术 | technology | 2 | gas-lighting, telegraph | #64748b |
| journalism | 新闻业 | humanities | 2 | telegraph, public-education | #44403c |
| constitution | 宪政制度 | civic | 3 | american-revolution, french-revolution | #d97706 |
| classical-economics | 古典经济学 | civic | 3 | capitalism, empiricism | #a16207 |

### Era 7: Industrial & Empire (18 nodes)

| id | name | category | pomodoros | prerequisites | color |
|----|------|----------|-----------|---------------|-------|
| internal-combustion-engine | 内燃机 | technology | 4 | — | #44403c |
| electricity | 电力 | technology | 4 | — | #eab308 |
| telephone | 电话 | technology | 3 | electricity | #2563eb |
| radio | 无线电 | technology | 3 | telephone | #0ea5e9 |
| airplane | 飞机 | technology | 4 | internal-combustion-engine | #64748b |
| automobile | 汽车 | technology | 3 | internal-combustion-engine | #57534e |
| steel-production | 炼钢 | technology | 3 | internal-combustion-engine | #78716c |
| assembly-line | 流水线生产 | technology | 3 | steel-production, automobile | #44403c |
| imperialism | 帝国主义 | civic | 4 | — | #a16207 |
| industrial-nationalism | 工业民族主义 | civic | 3 | imperialism, steel-production | #ca8a04 |
| socialism-movement | 社会主义运动 | civic | 3 | imperialism, assembly-line | #dc2626 |
| feminism | 女权运动 | civic | 3 | industrial-nationalism, radio | #db2777 |
| public-health | 公共卫生 | civic | 3 | socialism-movement, electricity | #16a34a |
| mass-education | 大众教育 | civic | 3 | radio, public-health | #2563eb |
| labour-union | 工会 | civic | 3 | socialism-movement, assembly-line | #be123c |
| impressionism | 印象派 | humanities | 2 | electricity, airplane | #e879f9 |
| realism | 现实主义文学 | humanities | 2 | radio, industrial-nationalism | #7c3aed |
| modern-olympics | 现代奥运会 | civic | 2 | feminism, airplane | #f59e0b |

### Era 8: Atomic & Digital (18 nodes)

| id | name | category | pomodoros | prerequisites | color |
|----|------|----------|-----------|---------------|-------|
| nuclear-energy | 核能 | technology | 4 | — | #16a34a |
| computer | 计算机 | technology | 4 | — | #2563eb |
| internet | 互联网 | technology | 4 | computer | #0ea5e9 |
| television | 电视 | technology | 3 | — | #64748b |
| antibiotics | 抗生素 | technology | 3 | — | #16a34a |
| jet-engine | 喷气式发动机 | technology | 3 | nuclear-energy | #78716c |
| rocket | 火箭 | technology | 4 | nuclear-energy, jet-engine | #dc2626 |
| satellite | 人造卫星 | technology | 3 | rocket, computer | #0ea5e9 |
| space-exploration | 太空探索 | civic | 4 | rocket, satellite | #1e3a5f |
| united-nations | 联合国 | civic | 3 | television | #2563eb |
| cold-war | 冷战 | civic | 3 | nuclear-energy, united-nations | #57534e |
| civil-rights | 民权运动 | civic | 3 | television, united-nations | #ca8a04 |
| consumerism | 消费主义 | civic | 3 | television, internet | #d97706 |
| environmentalism | 环保运动 | civic | 3 | civil-rights, space-exploration | #16a34a |
| programming | 编程语言 | technology | 3 | computer | #4f46e5 |
| mobile-communication | 移动通信 | technology | 3 | internet, satellite | #06b6d4 |
| digital-art | 数字艺术 | humanities | 2 | internet, programming | #c026d3 |
| globalization | 全球化 | civic | 3 | internet, consumerism | #eab308 |

### Era 9: Future (14 nodes)

| id | name | category | pomodoros | prerequisites | color |
|----|------|----------|-----------|---------------|-------|
| artificial-intelligence | 人工智能 | technology | 4 | — | #4f46e5 |
| quantum-computing | 量子计算 | technology | 4 | — | #7c3aed |
| nuclear-fusion | 核聚变 | technology | 4 | — | #eab308 |
| brain-computer-interface | 脑机接口 | technology | 4 | artificial-intelligence | #db2777 |
| space-elevator | 太空电梯 | technology | 4 | quantum-computing, nuclear-fusion | #0ea5e9 |
| mars-colonization | 火星殖民 | civic | 5 | space-elevator | #dc2626 |
| ai-governance | AI 治理 | civic | 4 | artificial-intelligence | #ca8a04 |
| gene-editing | 基因编辑 | technology | 4 | brain-computer-interface | #16a34a |
| virtual-reality | 虚拟现实 | technology | 3 | brain-computer-interface, quantum-computing | #c026d3 |
| asteroid-mining | 小行星采矿 | technology | 3 | mars-colonization | #78716c |
| dyson-sphere | 戴森球 | technology | 5 | asteroid-mining, nuclear-fusion | #f59e0b |
| interstellar-ship | 星际飞船 | technology | 5 | dyson-sphere, space-elevator | #1e3a5f |
| nanotechnology | 纳米技术 | technology | 3 | gene-editing, quantum-computing | #06b6d4 |
| posthumanism | 后人类主义 | humanities | 4 | gene-editing, virtual-reality, ai-governance | #6b21a8 |

## Required Code Changes

1. **Type change**: Add `"civic"` to `TechNode.category` union type in `types.ts`
2. **No structural changes**: era-level dependencies, transition nodes, and layout logic remain the same

## Stats

- Total nodes: 152
- By category: technology ~70, humanities ~35, civic ~47
- Avg pomodoros/node: ~3.7
- Estimated total pomodoros: ~560
