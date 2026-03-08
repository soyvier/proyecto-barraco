import DominoQuestion from './visuals/DominoQuestion';
import ShapeSeriesQuestion from './visuals/ShapeSeriesQuestion';
import OddShapeQuestion from './visuals/OddShapeQuestion';
import MatrixQuestion from './visuals/MatrixQuestion';
import DividedCircleQuestion from './visuals/DividedCircleQuestion';
import PinwheelQuestion from './visuals/PinwheelQuestion';
import ShapeCardQuestion from './visuals/ShapeCardQuestion';
import GridPatternQuestion from './visuals/GridPatternQuestion';
import OverlayQuestion from './visuals/OverlayQuestion';
import FoldingQuestion from './visuals/FoldingQuestion';
import CountingQuestion from './visuals/CountingQuestion';
import ShapeAlgebraQuestion from './visuals/ShapeAlgebraQuestion';
import CircuitQuestion from './visuals/CircuitQuestion';
import NumberCardQuestion from './visuals/NumberCardQuestion';
import SymbolFrequencyQuestion from './visuals/SymbolFrequencyQuestion';
import GridComparisonQuestion from './visuals/GridComparisonQuestion';
import TableDataQuestion from './visuals/TableDataQuestion';
import SphereRotationQuestion from './visuals/SphereRotationQuestion';
import SymbolAlphabetQuestion from './visuals/SymbolAlphabetQuestion';
import ChartQuestion from './visuals/ChartQuestion';
import CubeNetQuestion from './visuals/CubeNetQuestion';
import ClockSeriesQuestion from './visuals/ClockSeriesQuestion';
import LetterGridQuestion from './visuals/LetterGridQuestion';
import RadialSectorQuestion from './visuals/RadialSectorQuestion';
import NumberPairSeriesQuestion from './visuals/NumberPairSeriesQuestion';
import ArrowMatrixQuestion from './visuals/ArrowMatrixQuestion';
import CubeCountingQuestion from './visuals/CubeCountingQuestion';

const renderers = {
  'dominos': DominoQuestion,
  'series-figuras': ShapeSeriesQuestion,
  'figura-sobrante': OddShapeQuestion,
  'matriz': MatrixQuestion,
  'circulos-divididos': DividedCircleQuestion,
  'pinwheel': PinwheelQuestion,
  'fichas-simbolos': ShapeCardQuestion,
  'patron-cuadricula': GridPatternQuestion,
  'superposicion': OverlayQuestion,
  'simetria-plegado': FoldingQuestion,
  'conteo': CountingQuestion,
  'algebra-figuras': ShapeAlgebraQuestion,
  'circuitos': CircuitQuestion,
  'fichas-numeros': NumberCardQuestion,
  'frecuencia-simbolos': SymbolFrequencyQuestion,
  'comparacion-cuadros': GridComparisonQuestion,
  'tabla-datos': TableDataQuestion,
  'esfera-rotacion': SphereRotationQuestion,
  'alfabeto-simbolos': SymbolAlphabetQuestion,
  'graficos-datos': ChartQuestion,
  'cubo-desplegado': CubeNetQuestion,
  'reloj-serie': ClockSeriesQuestion,
  'letras-sombreadas': LetterGridQuestion,
  'sectores-radiales': RadialSectorQuestion,
  'series-pares-numeros': NumberPairSeriesQuestion,
  'matriz-flechas': ArrowMatrixQuestion,
  'conteo-cubos': CubeCountingQuestion,
};

export default function VisualQuestion({ question, selectedAnswer, onSelect }) {
  const Renderer = renderers[question.visualType];
  if (!Renderer) return null;
  return <Renderer data={question.visualData} options={question.options} selectedAnswer={selectedAnswer} onSelect={onSelect} />;
}

export function isVisualQuestion(question) {
  return !!question.visualType;
}
