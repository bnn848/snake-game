import { initFields } from '../utils';

const fieldSize = 35;/* Fieldのサイズ指定 */
export const initialPosition = {x: 17, y: 17};/* snakeの初期位置 */
export const initialValues = initFields(fieldSize, initialPosition);
export const defaultInterval = 100;/* setIntervalの第2引数に渡す変数 */
export const defaultDifficulty = 3;/* difficultyの設定と状態保持 */
export const Difficulty = [1000, 500, 100, 50, 3];

/* GameStatus */
export const GameStatus = Object.freeze(
  {
    init: 'init',
    playing: 'playing',
    suspended: 'suspended',
    gameover: 'gameover'
  }
);

// ボタン入力に従いsnakeの移動方向を変更する
// const Direction = Object.freeze( // Object.freezeメソッド = オブジェクトを凍結し変更できなくする。
export const Direction = Object.freeze(
  {
    up: 'up',
    right: 'right',
    left: 'left',
    down: 'down'
  }
);

/* DirectionKeyCodeMap */
// キーボード操作のため矢印キーのKeyコードとDirectionを紐付ける
export const DirectionKeyCodeMap = Object.freeze(
  {
    37: Direction.left,
    38: Direction.up,
    39: Direction.right,
    40: Direction.down
  }
);

/* oppositeDirection */
// 逆方向に行かないように進行方向の逆を把握する
// const OppositeDirection = Object.freeze( // Object.freezeメソッド = オブジェクトを凍結し変更できなくする。
export const OppositeDirection = Object.freeze(
  {
    up: 'down',
    right: 'left',
    left: 'right',
    down: 'up'
  }
);

/* Delta */
// 座標の変化量を方向別に管理する
export const Delta = Object.freeze(
  {
    up: {x: 0 , y: -1 },
    right: {x: 1 , y: 0 },
    left: {x: -1, y: 0 },
    down: {x: 0 , y: 1 }
  }
);