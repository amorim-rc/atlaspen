import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import BuscaAtributo from '@site/src/components/BuscaAtributo';
import Citacao from '@site/src/components/Citacao';

import styles from './pesquisa.module.css';

export default function BuscaPorAtributo(): ReactNode {
  return (
    <Layout
      title="Busca por atributo"
      description="Catálogo de atributos penais brasileiros: requisitos, vedações e patamares legais editáveis, com a lista dos tipos penais alcançados.">
      <header className={styles.cabecalho}>
        <div className="container">
          <Heading as="h1" className={styles.titulo}>Busca por atributo</Heading>
          <p className={styles.subtitulo}>
            O percurso inverso: parta de um atributo penal, examine seus requisitos, vedações
            e patamares legais — e veja quais tipos penais ele alcança. Altere qualquer parâmetro
            do atributo e a lista de tipos afetados é recalculada na hora.
          </p>
        </div>
      </header>
      <main>
        <BuscaAtributo />
        <div className="container">
          <Citacao compacto />
        </div>
      </main>
    </Layout>
  );
}
