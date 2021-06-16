/*--------------------------------
index.js
Field.jsxで使うFieldを生成するコンポーネント。
App.jsからfieldSizeとinitialPositionをPropsで受け取っている。
Fieldの位置情報をデータとして保持するためのもの
fieldSize = 列数 をパラメータとして受け取る
--------------------------------*/

export const initFields = (fieldSize, initialPosition) => {

  const fields = []; // 一旦から配列として初期化する

  for (let i = 0; i < fieldSize; i++) { // 列ごとに繰り返し処理
    const cols = new Array(fieldSize).fill('') // 正方形となるよう、列数と同数の''を含むcolsを作成
    fields.push(cols) // fields配列に末尾から追加する
  };

  /* snake初期位置 */
  const x = initialPosition.x
  const y = initialPosition.y
  fields[x][y] ="snake"; // className={dot snake}となり色が指定される

  return fields
};

/*
fields = [ [col, cols, ...], [col, cols, ...], ... ]という入れ子状態の配列ができる


*/