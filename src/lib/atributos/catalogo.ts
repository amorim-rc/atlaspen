// O catálogo REAL de atributos penais: a base de data/atributos.json montada
// com as funções de avaliação. É o único ponto do motor de atributos que
// importa dado; tudo o mais recebe o catálogo por parâmetro (nucleo.ts).
//
// Lê a FONTE, e não o derivado de static/data: o derivado (última alteração e
// alcance) é produzido por este mesmo motor, e ler um do outro faria círculo.

import fonte from '../../../data/atributos.json';
import {indexarCatalogo, montarCatalogo, type BaseAtributos} from './carregador';

export const CATALOGO = montarCatalogo(fonte as unknown as BaseAtributos);

export const POR_ID = indexarCatalogo(CATALOGO);
