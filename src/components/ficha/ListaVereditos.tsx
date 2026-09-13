// A lista de atributos de uma aba, com o veredito de cada um.
//
// Ordem obrigatória: cabíveis primeiro, condicionais depois, incabíveis por
// último. Em tela estreita mostra os quatro primeiros e recolhe o resto atrás
// de "ver os N restantes" — o que é cabível é a informação procurada. O status
// nunca é só cor: o selo diz, em texto, cabe, não cabe, depende ou o valor.

import {useState} from 'react';
import type {AtributoResultado} from '../../lib/atributos';
import {ordenarPorVeredito, veredito} from '../../lib/atributos/veredito';
import {caminho} from '../../site/url';
import s from './ficha.module.css';

const VISIVEIS_NO_ESTREITO = 4;

export default function ListaVereditos({itens}: {itens: AtributoResultado[]}) {
  const [aberta, setAberta] = useState(false);
  const ordenados = ordenarPorVeredito(itens);
  const restantes = ordenados.length - VISIVEIS_NO_ESTREITO;

  return (
    <>
      <ul className={`${s.vereditos} ${aberta ? s.vereditosAbertos : ''}`}>
        {ordenados.map((r, i) => {
          const v = veredito(r);
          return (
            <li key={r.id} className={`${s.linhaVeredito} ${i >= VISIVEIS_NO_ESTREITO ? s.alemDoQuarto : ''}`}>
              <div className={s.nomeAtributo}>
                <a href={caminho(`/atributos/${r.id}`)} className={s.linkAtributo}>
                  {r.nome}
                </a>
                <span className={s.norma}>{r.fundamento}</span>
              </div>
              <span className={`${s.selo} ${s[`selo_${v.tipo.replace('-', '_')}`]}`}>{v.rotulo}</span>
              <div className={s.razao}>
                <p>{r.resumo}</p>
                {r.detalhes.length > 0 && (
                  <details className={s.porque}>
                    <summary>o fundamento</summary>
                    <ul>
                      {r.detalhes.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {restantes > 0 && !aberta && (
        <button type="button" className={s.verRestantes} onClick={() => setAberta(true)}>
          ver os {restantes} restantes
        </button>
      )}
    </>
  );
}
