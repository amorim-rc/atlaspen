// Os formulários do OBJETO da mudança no sentido do tipo penal: as qualificações
// (Marcas), o elemento subjetivo, o seletor de tipo e os dois formulários — tipo
// novo e tipo alterado. Saíram de Simulador.tsx em 25/09/2026 (débito técnico
// 6), com os comentários que registram as decisões de 24/09/2026.

import {useMemo, useState} from 'react';
import {ELEMENTOS} from '../../lib/simulacao/tipos';
import type {CamposTipo} from '../../lib/simulacao/tipos';
import type {TipoDoMotor} from '../../lib/types';
import {RESULTADO_MORTE, camposDoTipo} from '../../lib/simulacao/motor';
import CampoPena from '../ficha/CampoPena';
import {normalizar} from '../tipos/filtros';
import {CRIADO_NESTE_PACOTE, MARCAS} from './rotulos';
import s from './simulacao.module.css';

// ── O objeto da mudança ────────────────────────────────────────────────────

export function Marcas({
  atual,
  antes,
  ref_ = 'na lei',
  onChange,
}: {
  atual: CamposTipo;
  antes?: CamposTipo;
  /** Como chamar o valor de referência: "na lei", ou "no tipo criado" quando o alvo é criação do pacote. */
  ref_?: string;
  onChange: (p: Partial<CamposTipo>) => void;
}) {
  return (
    <fieldset className={s.marcas}>
      <legend className={s.legenda}>Qualificações do tipo</legend>
      {MARCAS.map(([k, r]) => (
        <label key={k} className={s.marca}>
          <input
            type="checkbox"
            checked={atual[k] as boolean}
            onChange={(e) => onChange({[k]: e.target.checked} as Partial<CamposTipo>)}
          />
          <span>{r}</span>
          {antes && atual[k] !== antes[k] && <span className={s.naLei}>{ref_}: {antes[k] ? 'sim' : 'não'}</span>}
        </label>
      ))}
    </fieldset>
  );
}


/**
 * O elemento subjetivo, nos quatro valores do catálogo. Era uma caixa
 * "culposo: sim/não" até 24/09/2026; com a decisão 31 passaram a ser quatro, e
 * a diferença entre preterdoloso e qualificado pelo resultado decide a
 * tentativa — que por sua vez decide desistência e arrependimento eficaz.
 */
export function SeletorElemento({
  atual,
  antes,
  ref_ = 'na lei',
  onChange,
}: {
  atual: CamposTipo['elemento'];
  antes?: CamposTipo['elemento'];
  ref_?: string;
  onChange: (e: CamposTipo['elemento']) => void;
}) {
  return (
    <label className={s.campo}>
      <span className="rotulo">elemento subjetivo</span>
      <select value={atual} onChange={(e) => onChange(e.target.value as CamposTipo['elemento'])}>
        {ELEMENTOS.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      <span className={s.ajudaCampo}>
        decide a tentativa: culposo e preterdoloso não a admitem; qualificado pelo resultado, sim
        {antes && atual !== antes ? ` · ${ref_}: ${antes.toLowerCase()}` : ''}
      </span>
    </label>
  );
}

export function SeletorTipo({
  tipos,
  criados = [],
  escolhido,
  onEscolher,
}: {
  tipos: TipoDoMotor[];
  /** Os tipos criados por mudanças anteriores do pacote, que também podem ser alvo (25/09/2026). */
  criados?: TipoDoMotor[];
  escolhido: TipoDoMotor | null;
  onEscolher: (id: number) => void;
}) {
  const [q, setQ] = useState('');
  const achados = useMemo(() => {
    const t = normalizar(q.trim());
    if (t.length < 2) return [];
    return [...criados, ...tipos].filter((x) => normalizar(`${x.crime} ${x.lei} ${x.artigo}`).includes(t)).slice(0, 8);
  }, [q, tipos, criados]);
  const linha = (x: TipoDoMotor) => (
    <button
      type="button"
      onClick={() => {
        onEscolher(x.id);
        setQ('');
      }}
    >
      <span>{x.crime}</span>
      <span className={s.notaMono}>
        {x.lei} · {x.artigo} · {x.pena_faixa_rotulo}
        {x.id < 0 ? ` · ${CRIADO_NESTE_PACOTE}` : ''}
      </span>
    </button>
  );
  return (
    <div className={s.seletor}>
      {escolhido && (
        <div className={s.escolhido}>
          <span className={s.normaObjeto}>
            {escolhido.lei} · {escolhido.artigo}
            {escolhido.id < 0 ? ` · ${CRIADO_NESTE_PACOTE}` : ''}
          </span>
          <span className={s.nomeObjeto}>{escolhido.crime}</span>
          <span className={s.notaMono}>{escolhido.pena_faixa_rotulo}</span>
        </div>
      )}
      {/* O tipo criado neste pacote não precisa de busca: são poucos, e quem os
          criou sabe que estão aqui. A lista some quando um deles é o escolhido. */}
      {criados.some((x) => x.id !== escolhido?.id) && (
        <ul className={s.achados} aria-label="Tipos criados neste pacote">
          {criados.filter((x) => x.id !== escolhido?.id).map((x) => <li key={x.id}>{linha(x)}</li>)}
        </ul>
      )}
      <label className={s.campo}>
        <span>{escolhido ? 'Trocar o tipo penal' : 'Buscar o tipo penal'}</span>
        <input type="search" value={q} placeholder="nome, lei ou artigo — ex.: furto, art. 155" onChange={(e) => setQ(e.target.value)} />
      </label>
      {achados.length > 0 && (
        <ul className={s.achados}>
          {achados.map((x) => (
            <li key={x.id}>{linha(x)}</li>
          ))}
        </ul>
      )}
      {q.trim().length >= 2 && achados.length === 0 && <p className={s.notaBloco}>Nenhum tipo penal responde a essa busca.</p>}
    </div>
  );
}

export function FormTipoAlterado({tipo, campos, onChange}: {tipo: TipoDoMotor; campos: Partial<CamposTipo>; onChange: (c: Partial<CamposTipo>) => void}) {
  const antes = camposDoTipo(tipo);
  const atual = {...antes, ...campos};
  // Sobre tipo criado neste pacote, "na lei" seria mentira: o valor de
  // referência é o que a mudança anterior deu ao tipo.
  const ref = tipo.id < 0 ? 'no tipo criado' : 'na lei';
  const mudar = (patch: Partial<CamposTipo>) => {
    const novo: Partial<CamposTipo> = {...campos, ...patch};
    for (const k of Object.keys(novo) as (keyof CamposTipo)[]) if (novo[k] === antes[k]) delete novo[k];
    onChange(novo);
  };
  return (
    <div className={s.campos}>
      {/* Nome e dispositivo entraram em 24/09/2026. Faltavam para simular o que
          a lei faz com frequência: renomear o tipo, transferi-lo de artigo ou
          movê-lo de diploma. O resultado morte é derivado do nome, e acompanha. */}
      <label className={s.campo}>
        <span className="rotulo">nome do tipo</span>
        <input value={atual.nome} onChange={(e) => mudar({nome: e.target.value})} />
        {atual.nome !== antes.nome && <span className={s.naLei}>{ref}: {antes.nome}</span>}
      </label>
      <div className={s.dupla}>
        <label className={s.campo}>
          <span className="rotulo">diploma</span>
          <input value={atual.lei} onChange={(e) => mudar({lei: e.target.value})} />
          {atual.lei !== antes.lei && <span className={s.naLei}>{ref}: {antes.lei}</span>}
        </label>
        <label className={s.campo}>
          <span className="rotulo">dispositivo</span>
          <input value={atual.artigo} onChange={(e) => mudar({artigo: e.target.value})} />
          {atual.artigo !== antes.artigo && <span className={s.naLei}>{ref}: {antes.artigo}</span>}
        </label>
      </div>
      <CampoPena rotulo="pena mínima" dias={atual.penaMinDias} legal={antes.penaMinDias} zero="sem mínimo" onChange={(d) => mudar({penaMinDias: d})} />
      <CampoPena rotulo="pena máxima" dias={atual.penaMaxDias} legal={antes.penaMaxDias} onChange={(d) => mudar({penaMaxDias: d})} />
      <SeletorElemento atual={atual.elemento} antes={antes.elemento} ref_={ref} onChange={(e) => mudar({elemento: e})} />
      <Marcas atual={atual} antes={antes} ref_={ref} onChange={mudar} />
      {atual.nome !== antes.nome && RESULTADO_MORTE.test(atual.nome) !== RESULTADO_MORTE.test(antes.nome) && (
        <p className={s.ajudaCampo}>
          O resultado morte deriva do nome, e muda com ele: passa a{' '}
          {RESULTADO_MORTE.test(atual.nome) ? 'sim' : 'não'}.
        </p>
      )}
    </div>
  );
}

export function FormTipoNovo({campos, onChange}: {campos: CamposTipo; onChange: (c: CamposTipo) => void}) {
  const mudar = (p: Partial<CamposTipo>) => onChange({...campos, ...p});
  return (
    <div className={s.campos}>
      <label className={s.campo}>
        <span>Nome do tipo</span>
        <input value={campos.nome} placeholder="ex.: fraude por sistema automatizado" onChange={(e) => mudar({nome: e.target.value})} />
      </label>
      <div className={s.duasColunas}>
        <label className={s.campo}>
          <span>Diploma</span>
          <input value={campos.lei} onChange={(e) => mudar({lei: e.target.value})} />
        </label>
        <label className={s.campo}>
          <span>Dispositivo</span>
          <input value={campos.artigo} onChange={(e) => mudar({artigo: e.target.value})} />
        </label>
      </div>
      <CampoPena rotulo="pena mínima" dias={campos.penaMinDias} zero="sem mínimo" onChange={(d) => mudar({penaMinDias: d})} />
      <CampoPena rotulo="pena máxima" dias={campos.penaMaxDias} onChange={(d) => mudar({penaMaxDias: d})} />
      <SeletorElemento atual={campos.elemento} onChange={(e) => mudar({elemento: e})} />
      <Marcas atual={campos} onChange={mudar} />
      <p className={s.notaBloco}>
        Derivado, nunca pedido: resultado morte — {RESULTADO_MORTE.test(campos.nome) ? 'sim' : 'não'}, pela leitura do nome, como no
        catálogo.
      </p>
    </div>
  );
}
