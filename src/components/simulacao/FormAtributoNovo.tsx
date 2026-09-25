// O formulário do atributo penal que ainda não existe: de que pena depende, o
// limiar ou a faixa, o que devolve (veredito, fração ou prazo por faixa), as
// vedações e os requisitos do réu. Saiu de Simulador.tsx em 25/09/2026 (débito
// técnico 6).

import {
  DEFINICAO_FRACAO_PADRAO,
  FAIXAS_PADRAO,
  ROTULO_DEVOLUCAO,
  ROTULO_INCIDENCIA,
  ROTULO_REQUISITO,
  ROTULO_VEDACAO,
  devolucaoDe,
} from '../../lib/simulacao/motor';
import type {
  DefinicaoAtributo,
  Devolucao as DevolucaoModo,
  FaixaValor,
  Incidencia,
  RequisitoReu,
  VedacaoNova,
} from '../../lib/simulacao/tipos';
import CampoPena from '../ficha/CampoPena';
import {rotuloFracao} from '../atributo/estado';
import s from './simulacao.module.css';

/** As frações que o seletor oferece: os vinte e quatro avos, como o controle de parâmetro da ficha. */
const FRACOES_NOVAS = Array.from({length: 24}, (_, k) => (k + 1) / 24);

/**
 * O que o atributo novo devolve (25/09/2026, débito técnico 5). Até então só
 * cabia ou não cabia; fração e tabela por faixa são o que progressão, saída
 * temporária, prescrição e regime calculam, e sem elas essas hipóteses só se
 * simulavam editando os institutos que existem. O veredito continua decidido
 * por limiar, vedações e requisitos; o valor é acréscimo.
 */
function Devolucao({def, onChange}: {def: DefinicaoAtributo; onChange: (p: Partial<DefinicaoAtributo>) => void}) {
  const modo = devolucaoDe(def);
  const trocar = (novo: DevolucaoModo) => {
    if (novo === modo) return;
    // Cada modo entra com o seu padrão e sai levando os seus campos, para que
    // a URL do veredito puro continue vazia e igual à de antes.
    if (novo === 'veredito') onChange({devolve: undefined, fracao: undefined, faixas: undefined, acimaDias: undefined});
    else if (novo === 'fracao') onChange({devolve: 'fracao', fracao: def.fracao ?? DEFINICAO_FRACAO_PADRAO, faixas: undefined, acimaDias: undefined});
    else onChange({devolve: 'faixas', fracao: undefined, faixas: def.faixas ?? FAIXAS_PADRAO.faixas, acimaDias: def.acimaDias ?? FAIXAS_PADRAO.acimaDias});
  };
  const faixas = def.faixas ?? [];
  const mudarFaixa = (k: number, patch: Partial<FaixaValor>) => onChange({faixas: faixas.map((f, j) => (j === k ? {...f, ...patch} : f))});
  const opcoes = FRACOES_NOVAS.some((v) => Math.abs(v - (def.fracao ?? 0)) < 1e-9) ? FRACOES_NOVAS : [...FRACOES_NOVAS, def.fracao ?? 0].sort((a, b) => a - b);
  return (
    <div className={s.campos}>
      <label className={s.campo}>
        <span>O que o atributo devolve</span>
        <select value={modo} onChange={(e) => trocar(e.target.value as DevolucaoModo)}>
          {(Object.keys(ROTULO_DEVOLUCAO) as DevolucaoModo[]).map((k) => (
            <option key={k} value={k}>
              {ROTULO_DEVOLUCAO[k]}
            </option>
          ))}
        </select>
      </label>
      {modo === 'fracao' && (
        <>
          <label className={s.campo}>
            <span>Fração da {ROTULO_INCIDENCIA[def.incidencia]}</span>
            <select value={String(def.fracao ?? DEFINICAO_FRACAO_PADRAO)} onChange={(e) => onChange({fracao: Number(e.target.value)})}>
              {opcoes.map((v) => (
                <option key={v} value={String(v)}>
                  {rotuloFracao(v, false)}
                </option>
              ))}
            </select>
          </label>
          <p className={s.notaBloco}>
            O valor é a pena-base vezes a fração, como a progressão e a saída temporária fazem — e a mesma pena decide o limiar acima.
          </p>
        </>
      )}
      {modo === 'faixas' && (
        <fieldset className={s.marcas}>
          <legend className={s.legenda}>Tabela por faixa da {ROTULO_INCIDENCIA[def.incidencia]}</legend>
          {faixas.map((f, k) => (
            <div key={k} className={s.campos}>
              <div className={s.dupla}>
                <CampoPena rotulo={`degrau ${k + 1}: pena até`} dias={f.ateDias} onChange={(d) => mudarFaixa(k, {ateDias: d})} />
                <CampoPena rotulo="vale" dias={f.valorDias} onChange={(d) => mudarFaixa(k, {valorDias: d})} />
              </div>
              {faixas.length > 1 && (
                <button type="button" className={s.botaoLink} onClick={() => onChange({faixas: faixas.filter((_, j) => j !== k)})}>
                  remover este degrau
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className={s.botao}
            onClick={() => {
              const ultimo = faixas.at(-1);
              onChange({faixas: [...faixas, {ateDias: (ultimo?.ateDias ?? 0) + 360, valorDias: (ultimo?.valorDias ?? 0) + 360}]});
            }}
          >
            + acrescentar degrau
          </button>
          <CampoPena rotulo="acima do último degrau, vale" dias={def.acimaDias ?? 0} onChange={(d) => onChange({acimaDias: d})} />
          <p className={s.notaBloco}>
            Cada degrau vale para a pena que não passa dele; o último valor vale acima de todos — a forma do art. 109 do CP. O
            valor de cada faixa é um tempo; rótulo livre por faixa (como o nome de um regime) fica para uma rodada futura.
          </p>
        </fieldset>
      )}
    </div>
  );
}

export default function FormAtributoNovo({def, onChange}: {def: DefinicaoAtributo; onChange: (d: DefinicaoAtributo) => void}) {
  const mudar = (p: Partial<DefinicaoAtributo>) => onChange({...def, ...p});
  const alternar = <T,>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);
  return (
    <div className={s.campos}>
      <label className={s.campo}>
        <span>Nome do instituto</span>
        <input value={def.nome} placeholder="ex.: acordo na execução da pena" onChange={(e) => mudar({nome: e.target.value})} />
      </label>
      <div className={s.duasColunas}>
        <label className={s.campo}>
          <span>Depende da</span>
          <select value={def.incidencia} onChange={(e) => mudar({incidencia: e.target.value as Incidencia})}>
            {(Object.keys(ROTULO_INCIDENCIA) as Incidencia[]).map((k) => (
              <option key={k} value={k}>
                {ROTULO_INCIDENCIA[k]}
              </option>
            ))}
          </select>
        </label>
        <label className={s.campo}>
          <span>Cabe quando a pena for</span>
          <select
            value={def.comparacao}
            onChange={(e) => mudar({comparacao: e.target.value as DefinicaoAtributo['comparacao']})}
          >
            <option value="ate">até o limiar</option>
            <option value="acima">acima do limiar</option>
            <option value="entre">entre dois limiares</option>
          </select>
        </label>
      </div>
      {/* A faixa entrou em 24/09/2026: a lei trabalha com ela tanto quanto com
          o limiar único — o sursis vai até dois anos, o semiaberto de quatro a
          oito. O piso é exclusivo e o teto inclusivo, como nos institutos. */}
      <CampoPena
        rotulo={def.comparacao === 'entre' ? 'piso da faixa' : 'limiar'}
        dias={def.limiarDias}
        onChange={(d) => mudar({limiarDias: d})}
      />
      {def.comparacao === 'entre' && (
        <CampoPena
          rotulo="teto da faixa"
          dias={def.limiarSuperiorDias ?? 0}
          onChange={(d) => mudar({limiarSuperiorDias: d})}
        />
      )}
      {def.incidencia === 'aplicada' && (
        <p className={s.notaBloco}>A pena aplicada não é campo do tipo penal: presume-se a pena da premissa da varredura, no bloco de impacto.</p>
      )}
      <Devolucao def={def} onChange={mudar} />
      <fieldset className={s.marcas}>
        <legend className={s.legenda}>Vedado a</legend>
        {(Object.keys(ROTULO_VEDACAO) as VedacaoNova[]).map((v) => (
          <label key={v} className={s.marca}>
            <input type="checkbox" checked={def.vedacoes.includes(v)} onChange={() => mudar({vedacoes: alternar(def.vedacoes, v)})} />
            <span>{ROTULO_VEDACAO[v]}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className={s.marcas}>
        <legend className={s.legenda}>Requisitos do réu</legend>
        {(Object.keys(ROTULO_REQUISITO) as RequisitoReu[]).map((r) => (
          <label key={r} className={s.marca}>
            <input type="checkbox" checked={def.requisitos.includes(r)} onChange={() => mudar({requisitos: alternar(def.requisitos, r)})} />
            <span>{ROTULO_REQUISITO[r]}</span>
          </label>
        ))}
      </fieldset>
      <p className={s.notaBloco}>
        Primariedade, confissão e reparação do dano seguem a premissa da varredura, no bloco de impacto. Requisito que a
        premissa não liga deixa o tipo como condicional, e não como cabível.
      </p>
    </div>
  );
}
