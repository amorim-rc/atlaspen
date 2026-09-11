// Notas de atualizações. Até o lançamento da v1.0.0 a página não publica nada
// (decisão de 10/09/2026): as notas do protótipo foram expurgadas. Depois do
// lançamento, o feed volta a ser alimentado a partir de src/data/changelog/entries/,
// e só com o que criar, modificar ou extinguir tipos penais ou atributos penais.

import type {ReactNode} from 'react';
import Layout from '@theme/Layout';

import styles from './styles.module.css';

export default function NotasDeAtualizacoes(): ReactNode {
  return (
    <Layout
      title="Notas de atualizações"
      description="As atualizações do SISPENAS que criem, modifiquem ou extingam tipos ou atributos penais, a partir do lançamento da versão 1.0.0.">
      <main className={styles.wrap}>
        <h1>Notas de atualizações</h1>
        <p>
          Esta página passa a ser alimentada depois do lançamento da versão 1.0.0. Vai
          registrar as atualizações que criem, modifiquem ou extingam tipos penais ou
          atributos penais.
        </p>
      </main>
    </Layout>
  );
}
