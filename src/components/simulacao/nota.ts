// A nota de simulação (Simulacao legislativa.dc.html, 9b): datada, citável, com
// a versão do catálogo e a data da conferência congeladas e as limitações
// declaradas. Sai em três formatos — PDF (a própria página, impressa), markdown
// para citar e CSV com a lista completa dos pares que mudam.
//
// Regra dura: nenhum número sai sem denominador e sem a definição do recorte na
// mesma linha. A tela existe para alimentar debate legislativo, e é aí que
// número solto vira desinformação.

import type {EstadoCatalogo} from '../../lib/simulacao/motor';
import {ROTULO_INCIDENCIA, ROTULO_REQUISITO, ROTULO_VEDACAO, alvoDa, camposDoTipo, descreverDevolucao} from '../../lib/simulacao/motor';
import {ROTULO_ETIQUETA_BASE} from '../../lib/simulacao/tipos';
import type {AlcanceAtributo, ContextoPacote, Etiqueta, Mudanca, Par, Resultado, Unidades} from '../../lib/simulacao/tipos';
import type {AtributoResultado} from '../../lib/atributos/types';
import {diasDeMeses, formatDias, formatFaixa} from '../../lib/pena';
import {circunstanciasPorExtenso, type CenarioReverso} from '../../lib/atributos/reverso';

import {NOME, NOME_EXTENSO} from '../../site/config';
import {dataAbnt, dataCurta} from '../../site/datas';
import {rotuloValor} from '../atributo/estado';

export const ROTULO_ETIQUETA: Record<Etiqueta, string> = {
  ...ROTULO_ETIQUETA_BASE,
  proposta: 'proposta, sem norma',
};

const fmt = (n: number) => n.toLocaleString('pt-BR');
const juntar = (l: string[]) => (l.length <= 1 ? (l[0] ?? '') : `${l.slice(0, -1).join(', ')} e ${l.at(-1)}`);

/** O recorte sob a premissa padrão — o texto que a nota trazia quando a premissa era fixa. */
export const RECORTE_PADRAO =
  'tipos penais com pena privativa de liberdade, presumido o réu primário e condenado na pena mínima cominada nos atributos que dependem da pena aplicada';

/**
 * O recorte, por extenso: acompanha todo número de alcance.
 *
 * Deixou de ser constante em 17/09/2026, quando a premissa da varredura passou a
 * ser editável na simulação. Uma nota que declara premissa diferente da que
 * calculou o número é pior que uma nota sem premissa. Sob a premissa padrão, o
 * texto é o de antes, palavra por palavra (RECORTE_PADRAO).
 */
export function recorte(rev: CenarioReverso): string {
  const circ = circunstanciasPorExtenso(rev);
  const reu = rev.reincidencia === 'primario' ? ['réu primário', ...circ] : circ;
  const pena =
    rev.base === 'fixa'
      ? `condenado a ${formatDias(diasDeMeses(rev.penaFixaMeses))}`
      : `condenado na pena ${rev.base === 'maxima' ? 'máxima' : 'mínima'} cominada`;
  return `tipos penais com pena privativa de liberdade, presumido o ${reu.join(', ')} e ${pena} nos atributos que dependem da pena aplicada`;
}

export function rotuloTipo(t: {crime: string; lei: string; artigo: string}): string {
  return `${t.crime} (${t.lei}, ${t.artigo.replace(/^Art\./, 'art.')})`;
}

/** O tipo por extenso, dizendo quando ele é criação deste mesmo pacote e não da lei. */
export function rotuloAlvo(t: {id: number; crime: string; lei: string; artigo: string}): string {
  return t.id < 0 ? `o tipo criado nesta simulação, ${rotuloTipo(t)}` : rotuloTipo(t);
}

export function rotuloResultado(r: AtributoResultado | null): string {
  if (!r) return '—';
  const s = r.status === 'cabivel' ? 'cabe' : r.status === 'condicional' ? 'depende' : 'não cabe';
  return r.valor && r.status !== 'incabivel' ? `${s} · ${r.valor}` : s;
}

export const rotuloAntes = (p: Par) => (p.atributoNovo ? 'atributo novo' : p.tipoNovo ? 'tipo novo' : rotuloResultado(p.antes));
export const rotuloDepois = (p: Par) =>
  p.atributoExtinto ? 'atributo extinto' : p.tipoExtinto ? 'tipo extinto' : rotuloResultado(p.depois);

export const alcanceTexto = (u: Unidades, total: Unidades) =>
  `${fmt(u.dispositivos)} de ${fmt(total.dispositivos)} dispositivos e ${fmt(u.cenarios)} de ${fmt(total.cenarios)} cenários`;

// ── Cada mudança, por extenso ──────────────────────────────────────────────

/**
 * Cada mudança numa frase. O `contexto` diz onde ela está no pacote, para
 * resolver a que aponta para tipo criado por outra mudança do mesmo pacote.
 */
export function descrever(m: Mudanca, legal: EstadoCatalogo, contexto?: ContextoPacote): string {
  if (m.sentido === 'tipo') {
    if (m.op === 'criar') {
      const c = m.campos;
      const marcas = [
        c.contravencao && 'contravenção penal',
        c.elemento !== 'Doloso' && c.elemento.toLowerCase(),
        c.hediondo && 'hediondo',
        c.violencia && 'com violência',
        c.graveAmeaca && 'com grave ameaça',
      ].filter(Boolean);
      return `Tipo novo: ${c.nome.trim() || 'sem nome'} (${c.lei}, ${c.artigo}), pena de ${formatFaixa(c.penaMinDias, c.penaMaxDias)}${
        marcas.length ? `, ${juntar(marcas as string[])}` : ''
      }.`;
    }
    const t = alvoDa(m, legal, contexto);
    if (!t) return m.id !== null && m.id < 0 ? 'Tipo criado no pacote que já não está lá.' : 'Tipo penal ainda não escolhido.';
    if (m.op === 'extinguir') {
      return t.id < 0
        ? `${rotuloAlvo(t)}, retirado do pacote: não chega ao catálogo simulado.`
        : `${rotuloTipo(t)} revogado: o tipo deixa o catálogo vigente.`;
    }
    const a = camposDoTipo(t);
    const d = {...a, ...m.campos};
    const partes: string[] = [];
    if (d.penaMinDias !== a.penaMinDias)
      partes.push(`pena mínima de ${formatDias(a.penaMinDias, 'zero')} para ${formatDias(d.penaMinDias, 'zero')}`);
    if (d.penaMaxDias !== a.penaMaxDias) partes.push(`pena máxima de ${formatDias(a.penaMaxDias)} para ${formatDias(d.penaMaxDias)}`);
    const flags: [keyof typeof a, string][] = [
      ['hediondo', 'hediondo'],
      ['violencia', 'com violência'],
      ['graveAmeaca', 'com grave ameaça'],
      ['contravencao', 'contravenção penal'],
    ];
    for (const [k, r] of flags) if (d[k] !== a[k]) partes.push(`${d[k] ? 'passa a ser' : 'deixa de ser'} ${r}`);
    if (d.elemento !== a.elemento) partes.push(`elemento de ${a.elemento.toLowerCase()} para ${d.elemento.toLowerCase()}`);
    if (d.nome !== a.nome) partes.push(`nome de "${a.nome}" para "${d.nome}"`);
    if (d.lei !== a.lei || d.artigo !== a.artigo) partes.push(`dispositivo de ${a.lei}, ${a.artigo} para ${d.lei}, ${d.artigo}`);
    return `${rotuloAlvo(t)}: ${partes.length ? juntar(partes) : 'nenhum campo alterado ainda'}.`;
  }
  if (m.op === 'criar') {
    const d = m.def;
    const devolve = descreverDevolucao(d);
    const extras = [
      d.vedacoes.length ? `vedado a ${juntar(d.vedacoes.map((v) => ROTULO_VEDACAO[v]))}` : '',
      d.requisitos.length ? `dependente de ${juntar(d.requisitos.map((r) => ROTULO_REQUISITO[r]))}` : '',
      devolve ? `devolve ${devolve}` : '',
    ].filter(Boolean);
    const faixa =
      d.comparacao === 'ate'
        ? `até ${formatDias(d.limiarDias)}`
        : d.comparacao === 'acima'
          ? `acima de ${formatDias(d.limiarDias)}`
          : `acima de ${formatDias(d.limiarDias)} e até ${formatDias(d.limiarSuperiorDias ?? 0)}`;
    return `Atributo novo: ${d.nome.trim() || 'sem nome'}, cabível quando a ${ROTULO_INCIDENCIA[d.incidencia]} for ${faixa}${
      extras.length ? `; ${extras.join('; ')}` : ''
    }.`;
  }
  const a = m.atributo ? legal.atributos.find((x) => x.def.id === m.atributo) : undefined;
  if (!a) return 'Atributo penal ainda não escolhido.';
  if (m.op === 'extinguir') return `${a.def.nome} (${a.def.fundamento}) extinto.`;
  const partes = a.def.parametros
    .filter((p) => m.params[p.id] !== undefined && m.params[p.id] !== p.padrao)
    .map((p) => `${p.rotulo.toLowerCase()} de ${rotuloValor(p, p.padrao)} para ${rotuloValor(p, m.params[p.id])}`);
  return `${a.def.nome} (${a.def.fundamento}): ${partes.length ? juntar(partes) : 'nenhum parâmetro alterado ainda'}.`;
}

export function tituloAutomatico(validas: Mudanca[], legal: EstadoCatalogo): string {
  if (!validas.length) return 'Simulação sem mudança';
  const primeira = descrever(validas[0], legal, {pacote: validas, indice: 0}).replace(/\.$/, '');
  return validas.length === 1 ? primeira : `${primeira}, e mais ${validas.length - 1} ${validas.length === 2 ? 'mudança' : 'mudanças'}`;
}

// ── A nota ─────────────────────────────────────────────────────────────────

export interface Nota {
  id: string;
  titulo: string;
  secoes: {titulo: string; texto: string}[];
  citacao: string;
  cabecalho: string;
}

/** AAAA-MMDD-XXXX: a data e um resumo da hipótese. Sem servidor, não há contador. */
export function identificador(hipotese: string, hoje: Date): string {
  let h = 2166136261;
  for (const ch of hipotese) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 16777619);
  }
  const sufixo = (h >>> 0).toString(36).toUpperCase().padStart(4, '0').slice(-4);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${hoje.getFullYear()}-${p(hoje.getMonth() + 1)}${p(hoje.getDate())}-${sufixo}`;
}

function listaDeTipos(pares: Par[], limite = 6): string {
  const nomes = pares.slice(0, limite).map((p) => rotuloTipo(p.tipo));
  return pares.length > limite ? `${nomes.join('; ')}; e mais ${fmt(pares.length - limite)}` : nomes.join('; ');
}

function linhaDoAtributo(a: AlcanceAtributo, r: Resultado): string {
  if (!a.antes && a.depois) return `${a.nome} (novo): alcançaria ${alcanceTexto(a.depois, r.totalDepois)}.`;
  if (a.antes && !a.depois) return `${a.nome} (extinto): deixaria de alcançar os ${alcanceTexto(a.antes, r.totalAntes)} que alcança hoje.`;
  if (a.entra === 0 && a.sai === 0)
    return `${a.nome}: o alcance não muda (${alcanceTexto(a.depois!, r.totalDepois)}); muda o que o atributo calcula em ${fmt(a.muda)} ${
      a.muda === 1 ? 'cenário' : 'cenários'
    }.`;
  return `${a.nome}: alcançaria ${alcanceTexto(a.depois!, r.totalDepois)} — hoje, ${alcanceTexto(a.antes!, r.totalAntes)}.`;
}

export function montarNota(args: {
  validas: Mudanca[];
  etiquetas: Etiqueta[][];
  legal: EstadoCatalogo;
  resultado: Resultado;
  titulo: string;
  versao: string;
  conferidoEm: string | null;
  url: string;
  hoje: Date;
  id: string;
  rev: CenarioReverso;
}): Nota {
  const {validas, etiquetas, legal, resultado: r, titulo, versao, conferidoEm, url, hoje, id, rev} = args;
  const secoes: {titulo: string; texto: string}[] = [];

  // `validas` é o pacote reduzido ao que entra no cálculo (motor.pacoteValido),
  // com os ids dos tipos criados já remapeados: a posição aqui é o contexto.
  secoes.push({
    titulo: 'Hipótese',
    texto: validas
      .map((m, i) => {
        const et = etiquetas[i]?.length ? ` [${etiquetas[i].map((e) => ROTULO_ETIQUETA[e]).join('; ')}]` : '';
        return `${validas.length > 1 ? `${i + 1}. ` : ''}${descrever(m, legal, {pacote: validas, indice: i})}${et}`;
      })
      .join('\n'),
  });

  const mudam = r.porAtributo.filter((a) => a.entra + a.sai + a.muda > 0 || !a.antes || !a.depois);
  secoes.push({
    titulo: 'Resultado',
    texto: [
      `Recorte: ${recorte(rev)}. Catálogo simulado: ${fmt(r.totalDepois.dispositivos)} dispositivos e ${fmt(
        r.totalDepois.cenarios,
      )} cenários (hoje, ${fmt(r.totalAntes.dispositivos)} e ${fmt(r.totalAntes.cenarios)}).`,
      ...(mudam.length ? mudam.map((a) => linhaDoAtributo(a, r)) : ['Nenhum atributo penal muda de alcance ou de valor.']),
    ].join('\n'),
  });

  const blocos: [string, Par['sinal'], string][] = [
    ['O que entra', '+', 'Nenhum tipo penal passa a ser alcançado por atributo algum.'],
    ['O que sai', '−', 'Nenhum tipo penal deixa de ser alcançado por atributo algum.'],
    ['O que muda de valor', '~', ''],
  ];
  for (const [t, sinal, vazio] of blocos) {
    const linhas = r.porAtributo
      .map((a) => ({a, ps: r.pares.filter((p) => p.atributo.id === a.id && p.sinal === sinal)}))
      .filter((x) => x.ps.length)
      .map(({a, ps}) => `${a.nome}, ${fmt(ps.length)} ${ps.length === 1 ? 'cenário' : 'cenários'}: ${listaDeTipos(ps)}.`);
    if (linhas.length || vazio) secoes.push({titulo: t, texto: linhas.length ? linhas.join('\n') : vazio});
  }
  if (r.pares.length) {
    secoes[secoes.length - 1].texto += '\nA lista completa acompanha esta nota em CSV.';
  }

  const parados = r.porAtributo.filter((a) => a.antes && a.depois && a.entra + a.sai + a.muda === 0);
  if (parados.length) {
    secoes.push({
      titulo: 'O que não muda',
      texto: `${fmt(parados.length)} dos ${fmt(r.atributosDepois)} atributos não se movem: ${juntar(parados.map((a) => a.nome))}.`,
    });
  }

  const limites = [
    `O cálculo pressupõe a premissa declarada no recorte, sem circunstância que altere a moldura. Conta dispositivos e cenários do catálogo, não processos.`,
  ];
  if (validas.some((m) => m.sentido === 'tipo' && m.op === 'criar'))
    limites.push('Tipo novo é hipótese pura: o cálculo não lhe aplica vedação específica além das declaradas.');
  if (validas.some((m) => m.sentido === 'tipo' && m.op === 'modificar'))
    limites.push('Cada dispositivo é tratado isoladamente: formas qualificadas e privilegiadas têm moldura própria e não acompanham o caput.');
  if (validas.some((m) => m.sentido === 'atributo' && m.op === 'criar'))
    limites.push('Atributo sem norma vigente é exercício de política criminal: o cálculo diz o alcance, não a constitucionalidade nem a conveniência.');
  limites.push('Esta nota não estima quantos casos seriam atingidos e não constitui aconselhamento jurídico.');
  secoes.push({titulo: 'Limitações', texto: limites.join(' ')});

  const conferido = conferidoEm ? `, conferido em ${dataAbnt(new Date(`${conferidoEm}T12:00:00`))}` : '';
  return {
    id,
    titulo,
    secoes,
    cabecalho: `nota de simulação ${id} · catálogo v${versao}${conferidoEm ? ` · conferido em ${dataCurta(conferidoEm)}` : ''}`,
    citacao: `${NOME}. Nota de simulação ${id}: ${titulo.replace(/\.$/, '')}. Catálogo v${versao}${conferido}. Disponível em: ${url}. Acesso em: ${dataAbnt(hoje)}.`,
  };
}

export function notaEmMarkdown(n: Nota): string {
  const partes = [
    `# ${n.titulo}`,
    `**${NOME}** — ${NOME_EXTENSO}  \n${n.cabecalho}`,
    ...n.secoes.map((s) => `## ${s.titulo}\n\n${s.texto.split('\n').join('\n\n')}`),
    `## Como citar\n\n${n.citacao}`,
  ];
  return partes.join('\n\n') + '\n';
}

export function paresEmCsv(r: Resultado): string {
  const cab = ['mudanca', 'tipo_id', 'lei', 'artigo', 'tipo_penal', 'pena', 'atributo', 'fundamento', 'antes', 'depois'];
  const aspas = (t: string | number) => `"${String(t).replace(/"/g, '""')}"`;
  const nome: Record<Par['sinal'], string> = {'+': 'entra', '−': 'sai', '~': 'muda de valor', '=': 'não muda'};
  const corpo = r.pares.map((p) =>
    [
      nome[p.sinal],
      p.tipoNovo ? 'novo' : p.tipo.id,
      p.tipo.lei,
      p.tipo.artigo,
      p.tipo.crime,
      p.tipo.pena_faixa_rotulo,
      p.atributo.nome,
      p.atributo.fundamento,
      rotuloAntes(p),
      rotuloDepois(p),
    ]
      .map(aspas)
      .join(';'),
  );
  return '﻿' + [cab.join(';'), ...corpo].join('\r\n');
}
