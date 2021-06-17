/*--------------------------------
index.js
Field.jsxで使うFieldを生成するコンポーネント。
App.jsからfieldSizeとinitialPositionをPropsで受け取っている。
Field/food/snakeの位置情報をデータとして保持するためのもの。
fieldSize = 列数 をパラメータとして受け取って正方形の配列を生成する。
--------------------------------*/

/* getFoodPosition */
// foodの位置はランダム配置だが、snakeの位置を除外する必要がある。
export const getFoodPosition = (fieldSize, excludes) => {
  while (true) {
    const x = Math.floor(Math.random() * (fieldSize - 1 - 1)) + 1; // fieldSize(0~34), 端を除く-1 & +1
    const y = Math.floor(Math.random() * (fieldSize - 1 - 1)) + 1; // fieldSize(0~34), 端を除く-1 & +1
    const conflict = excludes.some(item => item.x === x && item.y === y) // some関数内の少なくとも一つの要素がtrueか判定する。

    if (!conflict) { // snakeと同位置ではない場合のみ
      return {x, y}; // foodの座標をオブジェクトで返す。
    }
  };
};

/* initFields */
export const initFields = (fieldSize, snake) => { // <--- 引数2は App.js の initPosition = { x, y }のこと。

  const fields = []; // 一旦から配列として初期化する。

  for (let i = 0; i < fieldSize; i++) { // 列ごとに繰り返し処理
    const cols = new Array(fieldSize).fill('') // 正方形となるよう、列数と同数の''を含むcolsを作成。
    fields.push(cols) // fields配列に末尾から追加する。
  };

  /* snake初期位置 */
  fields[snake.x][snake.y] ="snake"; // className={dot snake}となり色が指定される。

  /* foodの初期位置 */
  const food = getFoodPosition(fieldSize, [snake]); // 引数2はexcludes = snakeの現在位置
  fields[food.x][food.y] = 'food';

  return fields;
};

/*
fields = [ [col, cols, ...], [col, cols, ...], ... ]という入れ子状態の配列ができる


*/