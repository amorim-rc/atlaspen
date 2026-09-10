import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-09-10-roadmap-da-lugar-ao-backlog',
  date: '2026-09-10',
  title: 'O roadmap sai do site, e as próximas frentes passam a um backlog',
  summary:
    'A página Roadmap deixou o site. Os próximos passos possíveis do projeto passam a viver num backlog, no repositório, e a regra de versionamento, única parte do roadmap que era contrato público, mudou-se para Dados abertos.',
  body: [
    'O roadmap prometia versões numeradas para frentes que ainda eram perguntas. O backlog não amarra número: registra cada frente, o que já se sabe dela e o que falta decidir, e a versão só é escolhida quando a mudança fica pronta.',
    'Entram nove frentes novas: os benefícios penais versionados em dados, a troca do termo "benefícios penais" por "atributos penais", a mudança de nome do projeto, o histórico de alterações de cada registro com a data, o número e o link da lei alteradora, a revisão da ação penal a partir do método de registro, uma amostra qualitativa para validação científica, a separação entre pena cominada e pena concreta na tela, e o acervo histórico das alterações da lei penal desde o Código Penal de 1940. O que o roadmap ainda tinha em aberto foi levado junto, sem perda.',
    'A regra de versionamento, que diz quando uma versão é MAIOR, MENOR ou correção, está agora na seção Estabilidade e versionamento da página Dados abertos. É ali que mora o contrato com quem usa os dados. Os links antigos para o Roadmap levam para lá.',
    'Para quem colabora: as instruções para agentes de IA passaram a se chamar AGENTS.md, o nome que o Codex e outras ferramentas leem. O Claude Code continua lendo o mesmo arquivo, por importação.',
  ],
  tipo: 'melhoria',
  areas: ['Documentação'],
  version: 'v2.0.7',
  links: [
    {
      label: 'Ver o backlog',
      href: 'https://github.com/amorim-rc/sispenas/blob/main/backlog.md',
    },
    {
      label: 'Ver a regra de versionamento',
      href: 'https://amorim-rc.github.io/sispenas/docs/dados-abertos#estabilidade-e-versionamento',
    },
  ],
};

export default entrada;
