// O bloco 3 da frase — o OBJETO da mudança: escolhe o formulário ou o seletor
// conforme o sentido e a operação. Saiu de Simulador.tsx em 25/09/2026 (débito
// técnico 6).

import type {TipoDoMotor} from '../../lib/types';
import {CATALOGO, POR_ID} from '../../lib/atributos';
import type {Mudanca} from '../../lib/simulacao/tipos';
import ControleParametro from '../atributo/ControleParametro';
import {EXTINGUIVEIS} from './rotulos';
import {FormTipoAlterado, FormTipoNovo, SeletorTipo} from './Formularios';
import FormAtributoNovo from './FormAtributoNovo';
import s from './simulacao.module.css';

export default function Objeto({
  m,
  tipos,
  criados,
  atualizar,
}: {
  m: Mudanca;
  tipos: TipoDoMotor[] | null;
  /** Os tipos criados pelas mudanças anteriores do pacote, ainda de pé nesta posição. */
  criados: TipoDoMotor[];
  atualizar: (m: Mudanca) => void;
}) {
  if (m.sentido === 'tipo') {
    if (m.op === 'criar') return <FormTipoNovo campos={m.campos} onChange={(campos) => atualizar({...m, campos})} />;
    if (!tipos) return <p className={s.carregando}>carregando o catálogo…</p>;
    // O id negativo é o do tipo criado neste pacote; `criados` já o traz como
    // está logo antes desta mudança, com as modificações intermediárias.
    const t = m.id === null ? null : m.id < 0 ? (criados.find((x) => x.id === m.id) ?? null) : (tipos.find((x) => x.id === m.id) ?? null);
    const comPena = tipos.filter((x) => x.tem_pena_privativa !== false);
    return (
      <>
        <SeletorTipo
          tipos={comPena}
          criados={criados}
          escolhido={t}
          onEscolher={(id) => atualizar(m.op === 'modificar' ? {...m, id, campos: {}} : {...m, id})}
        />
        {t && m.op === 'modificar' && <FormTipoAlterado tipo={t} campos={m.campos} onChange={(campos) => atualizar({...m, campos})} />}
        {t && m.op === 'extinguir' && t.id >= 0 && (
          <p className={s.notaBloco}>
            Numa revogação real, o registro não some: passa ao acervo histórico, consultável para fato anterior.
          </p>
        )}
        {t && m.op === 'extinguir' && t.id < 0 && (
          <p className={s.notaBloco}>
            Extinguir o tipo criado neste mesmo pacote desfaz a hipótese: ele não chega ao catálogo simulado, e o saldo das duas
            mudanças é zero.
          </p>
        )}
      </>
    );
  }
  if (m.op === 'criar') return <FormAtributoNovo def={m.def} onChange={(def) => atualizar({...m, def})} />;
  const lista = m.op === 'extinguir' ? EXTINGUIVEIS : CATALOGO;
  const def = m.atributo ? POR_ID[m.atributo] : undefined;
  return (
    <>
      <label className={s.campo}>
        <span>Atributo penal</span>
        <select
          value={m.atributo ?? ''}
          onChange={(e) =>
            atualizar(m.op === 'modificar' ? {...m, atributo: e.target.value || null, params: {}} : {...m, atributo: e.target.value || null})
          }
        >
          <option value="">escolha…</option>
          {lista.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>
      </label>
      {def && <p className={`${s.normaObjeto} sem-recuo`}>{def.fundamento}</p>}
      {def && m.op === 'modificar' && (
        <div className={s.parametros}>
          {def.parametros.map((p) => (
            <ControleParametro
              key={p.id}
              def={p}
              valor={m.params[p.id] ?? p.padrao}
              onChange={(v) => {
                const params = {...m.params};
                if (v === p.padrao) delete params[p.id];
                else params[p.id] = v;
                atualizar({...m, params});
              }}
            />
          ))}
        </div>
      )}
      {m.op === 'extinguir' && (
        <p className={s.notaBloco}>O regime inicial não entra na lista: toda pena privativa de liberdade começa em algum regime.</p>
      )}
    </>
  );
}
