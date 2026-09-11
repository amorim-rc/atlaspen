import React, {useCallback, useEffect, useMemo, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useCrimes} from '@site/src/lib/useCrimes';
import {
  CATALOGO,
  CATEGORIA_LABEL,
  NATUREZA_LABEL,
  POR_ID,
  type Categoria,
} from '@site/src/lib/atributos';
import DetalheAtributo from './DetalheAtributo';
import styles from './styles.module.css';

const GRUPOS: Categoria[] = ['processual', 'aplicacao', 'execucao'];

function BuscaAtributoInner() {
  const {crimes, loading, error} = useCrimes();
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    // `?atributo=` desde a frente 2; `?beneficio=` é o dos links antigos, que o
    // redirecionamento de /pesquisa/beneficios preserva.
    const q = new URLSearchParams(window.location.search);
    return q.get('atributo') ?? q.get('beneficio');
  });

  const selectAtributo = useCallback((id: string | null) => {
    setSelectedId(id);
    const url = new URL(window.location.href);
    url.searchParams.delete('beneficio');
    if (id === null) url.searchParams.delete('atributo');
    else url.searchParams.set('atributo', id);
    window.history.pushState({atributo: id}, '', url.toString());
    window.scrollTo({top: 0, behavior: 'auto'});
  }, []);

  useEffect(() => {
    const sync = () => {
      const q = new URLSearchParams(window.location.search);
      setSelectedId(q.get('atributo') ?? q.get('beneficio'));
    };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const filtrados = useMemo(() => {
    if (!q.trim()) return CATALOGO;
    const termo = q.toLowerCase();
    return CATALOGO.filter(
      (b) =>
        b.nome.toLowerCase().includes(termo) ||
        b.fundamento.toLowerCase().includes(termo) ||
        b.descricao.toLowerCase().includes(termo) ||
        b.requisitos.some((r) => r.toLowerCase().includes(termo)) ||
        b.vedacoes.some((v) => v.toLowerCase().includes(termo)),
    );
  }, [q]);

  const selecionado = selectedId ? POR_ID[selectedId] : null;

  if (selecionado) {
    if (loading) return <div className={styles.loading}>Carregando catálogo de tipos penais…</div>;
    if (error) return <div className={styles.error}>Erro ao carregar os dados: {error}</div>;
    return (
      <div className={styles.wrap}>
        <button className={styles.voltarBtn} onClick={() => selectAtributo(null)}>
          ← Voltar aos atributos
        </button>
        <DetalheAtributo def={selecionado} crimes={crimes} />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.searchBar}>
        <input
          className={styles.search}
          type="text"
          placeholder="Buscar por atributo, fundamento legal ou requisito…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className={styles.count}>
          {filtrados.length} de {CATALOGO.length} atributos
        </span>
      </div>

      {GRUPOS.map((g) => {
        const doGrupo = filtrados.filter((b) => b.categoria === g);
        if (doGrupo.length === 0) return null;
        return (
          <div key={g} className={styles.grupo}>
            <div className={styles.grupoTitulo}>{CATEGORIA_LABEL[g]}</div>
            <div className={styles.cardGrid}>
              {doGrupo.map((b) => (
                <button key={b.id} className={styles.card} onClick={() => selectAtributo(b.id)}>
                  <div className={styles.cardHead}>
                    <span className={styles.cardNome}>{b.nome}</span>
                    <span className={`${styles.natTag} ${styles['nat_' + b.natureza]}`}>
                      {NATUREZA_LABEL[b.natureza]}
                    </span>
                  </div>
                  <div className={styles.cardFund}>{b.fundamento}</div>
                  <p className={styles.cardDesc}>{b.descricao}</p>
                  <div className={styles.cardMeta}>
                    {b.parametros.length} {b.parametros.length === 1 ? 'parâmetro editável' : 'parâmetros editáveis'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {filtrados.length === 0 && (
        <div className={styles.vazio}>Nenhum atributo encontrado para “{q}”.</div>
      )}

      <div className={styles.placeholder}>
        Selecione um atributo para examinar seus requisitos e vedações, editar seus patamares
        legais e ver a lista dos tipos penais afetados.
      </div>
    </div>
  );
}

export default function BuscaAtributo() {
  return (
    <BrowserOnly fallback={<div className={styles.loading}>Carregando…</div>}>
      {() => <BuscaAtributoInner />}
    </BrowserOnly>
  );
}
