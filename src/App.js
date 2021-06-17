/*--------------------------------
App.js
トップレベルのコンポーネント。
Stateや各種メソッドを格納し、下層コンポーネントをまとめている
--------------------------------*/

import { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import Field from './components/Field';
import Button from './components/Button';
import ManipulationPanel from './components/ManipulationPanel';
import { initFields, getFoodPosition } from './utils/index';

/* snakeの初期位置 */
const initialPosition = {x: 17, y: 17}; // useStateは初期値にオブジェクトを持てない。 ---> useEffectで設定

/* Fieldのサイズ指定 */
// const initialValues = initFields(35); ---> snakeの位置も動的に管理したいので以下の通り変更する。
const initialValues = initFields(35, initialPosition);

/* difficultyの設定と状態保持 */
// setIntervalの第2引数に渡す変数、数字が小さいほどsnakeの移動速度が速い。
const defaultDifficulty = 3; // Difficulty[3]という意味なので100msのこと。
const Difficulty = [1000, 500, 100, 50, 3];

/* GameStatus */
// ゲームの状態を文字列で管理する
// 例えば別のメソッドの中で GameStatus.gameover とすると状態をgameoverにすることができる
// 定数で一元管理することでタイポや値変化に強くなる
const GameStatus = Object.freeze( // Object.freezeメソッド = オブジェクトを凍結し変更できなくする。
  {
    init: 'init',
    playing: 'playing',
    suspended: 'suspended',
    gameover: 'gameover'
  }
);

/* Direction */
// ボタン入力に従いsnakeの移動方向を変更する
const Direction = Object.freeze( // Object.freezeメソッド = オブジェクトを凍結し変更できなくする。
  {
    up: 'up',
    right: 'right',
    left: 'left',
    down: 'down'
  }
);

/* DirectionKeyCodeMap */
// キーボード操作のため矢印キーのKeyコードとDirectionを紐付ける
const DirectionKeyCodeMap = Object.freeze(
  {
    37: Direction.left,
    38: Direction.up,
    39: Direction.right,
    40: Direction.down
  }
);

/* oppositeDirection */
// 逆方向に行かないように進行方向の逆を把握する
const OppositeDirection = Object.freeze( // Object.freezeメソッド = オブジェクトを凍結し変更できなくする。
  {
    up: 'down',
    right: 'left',
    left: 'right',
    down: 'up'
  }
);

/* Delta */
// 座標の変化量を方向別に管理する
const Delta = Object.freeze(
  {
    up: {x: 0 , y: -1 },
    right: {x: 1 , y: 0 },
    left: {x: -1, y: 0 },
    down: {x: 0 , y: 1 }
  }
);

/* timer */
const defaultInterval = 100;
let timer = undefined; // undefinedはboolean値でfalseと判断される。

/* unsubscribe */
const unsubscribe = () => {
  if (!timer) {
    return;
  } else {
    clearInterval(timer)
  }
};

/* isCollision */
// boolean値 Field外に出てしまったらGameOverになる。
const isCollision = (fieldSize, position) => { // パラメータにfieldとpositionをもらう。
  if (position.x < 0 || position.y < 0) { // positionが各軸下限のとき
    return true;
  }
  if (position.x > fieldSize - 1 || position.y > fieldSize -1) { // positionが各軸上限のとき
    return true;
  }
  return false;
};

/* isEatingMyself */
// 次のpositionがsnakeかどうかを判定する
const isEatingMyself = (fields, position) => {
  return fields[position.y][position.x] === "snake";
};


/* Appコンポーネント */
const App = () => {

  /* state管理 */
  const [fields, setFields] = useState(initialValues); // fieldの状態管理
  const [tick, setTick] = useState(0); // position === undefinedのままsetIntervalが実行されないように変数をセットする。
  const [status, setStatus] = useState(GameStatus.init) // ゲームの状態管理（初期値は init ）
  const [direction, setDirection] = useState(Direction.up) // 進行方向（初期値は up ）
  const [body, setBody] = useState([]); // snakeの体の長さ[配列として管理]
  const [difficulty, setDifficulty] = useState(defaultDifficulty); // ゲーム難易度

  /* useEffect */
  useEffect(() => { // snakeの初期値オブジェクトを初回描画時のみレンダリングする。
    setBody([initialPosition]); // snakeの初期位置位置を描画する。
    const interval = Difficulty[difficulty -1] // 配列[0~4]の中から選択する。
    timer = setInterval(() => { // コールバック関数をdefaultIntervalミリ秒ごとに呼び出す。
      setTick((tick) => tick + 1); // 一定間隔でレンダリングするようにする<------------------------- ???
    },interval);
    return unsubscribe; // useEffect内のreturnはコンポーネントが削除されるタイミングで実行される。
  },[difficulty]);

  useEffect(() => {
    if (body.length === 0 || status !== GameStatus.playing) { // 初回レンダリング時には position === undefined
      return;
    } else {
      const canContinue = handleMoving(); // <--- handleMovingメソッドが返すboolean値を受け取る。
      if (!canContinue) {
        unsubscribe();
        setStatus(GameStatus.gameover);
      }
    }
  // eslint-disable-next-line
  },[tick]); // tickが更新されるたびにこのuseEffectが発火する。依存関係Warning出るので上記コメント挿入


/* onStart */
// スタートボタンでGameStatusをPlayingにするためのメソッド
const onStart = () => {
  return (
    setStatus(GameStatus.playing)
  )
};

/* onStop */
const onStop = () => {
  return (
    setStatus(GameStatus.suspended)
  )
};

/* onRestart */
// 1.タイマー 2.ステータス 3.snakeの位置 4.フィールド を初期化する。
const onRestart = () => {
  timer = setInterval(() => {
    setTick(tick => tick + 1)
  },defaultInterval);
  setDirection(Direction.up); // <--- 教材ではResetボタン実装時に追加しているが、方向管理実装時にすべき。
  setStatus(GameStatus.init); // init状態にする。
  setBody([initialPosition]); // snakeのbodyの長さを初期状態に戻す。
  setDirection(Direction.up); // ゲームスタート時まず上に向かう。
  setFields(initFields(35, initialPosition)); // fieldとsnakeの描画を初期状態に戻す。
}

/* onChangeDirection */
// ゲームプレイ中だけボタン操作可能
// ボタンで方向を変更する。（進行方向と逆方向へは変更できない）
// useCallback(()=>{},[]) : 依存する関数の更新時に再レンダーするため、関数をメモ化できるHook
// 関数は描画ごとに新しいものとして再生成される。その計算を省略できるので、無駄な処理が少なくて済む。
// => useMemo()と同義、useMemoはあくまで値を保存するために使う。
const onChangeDirection = useCallback((newDirection) => { // ManipulationPanel.jsxからonChangeの引数を受け取る。
  if (status !== GameStatus.playing) { // プレイ中でない場合はそのままの状態を保持する。
    return direction;
  }
  if (OppositeDirection[direction] === newDirection) { // 入力値が進行方向と逆方向の場合は無視する。
    return;
  }

  setDirection(newDirection); // 問題なければ押下したボタンに対応した進行方向へ変更する。
},[direction, status]); // directionまたはstatusが更新されるたびに発火する。

/* onChangeDifficulty */
// 難易度設定の実装
// 無駄な関数再生成を回避するためにuseCallBackを使う。
const onChangeDifficulty = useCallback((difficulty) => { // メモ化しておく
  if (status !== GameStatus.init) { // gameが始まっていない場合
    return;
  }
  if (difficulty < 1 || difficulty > difficulty.length) { // 現在の難易度が最低もしくは最高の場合
    return;
  }

  setDifficulty(difficulty) // 難易度ステートを変更する。
  // eslint-disable-next-line
}, [status, difficulty]); // statusとdifficultyに変更があった時onChangeDifficultyを呼び出す。


/* handleKeyDown */
// keydownとonChangeDirectionを結びつける。
useEffect(() => {
  const handleKeyDown =  (e) => { // 押下したキーの割り当て番号をパラメータに持つ。
    const newDirection = DirectionKeyCodeMap[e.keyCode]; // Map[index]のインスタンスをnewDirectionに代入する。
    if (!newDirection) {
      return;
    }
    onChangeDirection(newDirection);
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown) // componentWillUnmount（リソースの解放）
},[onChangeDirection]); // ボタンが押下され、onChangeDirectionが再レンダーするたびに発火する。


/* handleMoving */
// Buttonに応じて進行方向を変更するメソッド
// snakeの長さ管理も行う
  const handleMoving = () => {
    const {x, y} = body[0]; // bodyの先頭を分割代入。
    // const nextY = Math.max(y -1, 0); // y-1 or 0 の大きい方をnextYに代入する。
    const delta = Delta[direction];
    const newPosition = {
      x: x + delta.x,
      y: y + delta.y
    };

    /* Delta[]positionで判定 */
    // 移動後の座標がField内かどうか or 移動後のcolがsnakeかどうかを調べ、trueならhandleMoving === falseを返す。
    // useEffectのcanContinueメソッドでゲーム続行か否かを決める。
    if (isCollision(fields.length, newPosition) || isEatingMyself(fields, newPosition)) {
      return false;
    };

    const newBody = [...body]; // body対して.popや.unshiftなど破壊的メソッドがあるため、参照コピーしておく。
    if (fields[newPosition.y][newPosition.x] !== 'food') { // エサを食べない場合
      // 紛らわしいがfields[列][cols]:初めにY軸,2つ目にX軸の位置情報を持つ。
      const removingTrack = newBody.pop(); // 配列から最後の要素を取り除き、その要素を返す。
      fields[removingTrack.y][removingTrack.x] = ''; // 取り除いた要素の座標にある中身を空にする。
    } else { // エサを食べる場合
      const food = getFoodPosition(fields.length, [...newBody, newPosition]) // 引数2はsnakeの現在位置
      fields[food.y][food.x] = "food"; // 再度ランダムでfood出現
    }

    fields[newPosition.y][newPosition.x] = 'snake'; // 移動後の座標をsnakeのbodyにする。
    newBody.unshift(newPosition); // コピーしたbodyの先頭にnewPosition({x,y})を追加する。
    setBody(newBody); // 大元のbodyに移動後の座標を追加する
    setFields(fields); // positionを更新したfields.jsで作成したFieldを描画する。
    return true;
  };
  


  return ( // コンポーネントの描画
    <div className="App">
      <header className="header">
        <div className="title-container">
          <h1 className="title">Snake Game</h1>
        </div>
        <Navigation length={body.length} difficulty={difficulty} onChangeDifficulty={onChangeDifficulty} />
      </header>
      <main className="main">
        <Field fields={fields} /> {/* fieldsのパラメータにサイズを渡す */}
      </main>
      <footer className="footer">
        <Button onStart={onStart} onStop={onStop} onRestart={onRestart} status={status} />
        <ManipulationPanel onChange={onChangeDirection} /> {/* 操作パネルに向き情報を渡す */}
      </footer>
    </div>
  )
};

export default App;