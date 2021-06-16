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
import { initFields } from './utils/index';

/* snakeの初期位置 */
const initialPosition = {x: 17, y: 17}; // useStateは初期値にオブジェクトを持てない。 ---> useEffectで設定

/* Fieldのサイズ指定 */
// const initialValues = initFields(35); ---> snakeの位置も動的に管理したい
const initialValues = initFields(35, initialPosition);

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


/* Appコンポーネント */
const App = () => {

  const [fields, setFields] = useState(initialValues); // fieldの状態管理
  const [position, setPosition] = useState(); // snakeの位置情報
  const [tick, setTick] = useState(0); // position === undefinedのままsetIntervalが実行されないように変数をセットする
  const [status, setStatus] = useState(GameStatus.init) // ゲームの状態管理（初期値は init ）
  const [direction, setDirection] = useState(Direction.up) // 進行方向（初期値は up ）

  useEffect(() => { // snakeの初期値オブジェクトを初回描画時のみレンダリングする
    setPosition(initialPosition); // snakeの位置
    timer = setInterval(() => { // コールバック関数をdefaultIntervalミリ秒ごとに呼び出す。
      setTick((tick) => tick + 1); // 一定間隔でレンダリングするようにする<------------------------- ???
    },defaultInterval);
    return unsubscribe; // useEffect内のreturnはコンポーネントが削除されるタイミングで実行される。
  },[]);

  useEffect(() => {
    if (!position || status !== GameStatus.playing) { // 初回レンダリング時には position === undefined
      return;
    } else {
      const canContinue = handleMoving(); // <--- goUpメソッドが返すboolean値を受け取る。
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

/* onRestart */
// 1.タイマー 2.ステータス 3.snakeの位置 4.フィールド を初期化する。
const onRestart = () => {
  timer = setInterval(() => {
    setTick(tick => tick + 1)
  },defaultInterval);
  setDirection(Direction.up); // <--- 教材ではResetボタン実装時に追加しているが、方向管理実装時にすべき。
  setStatus(GameStatus.init); // init状態にする。
  setPosition(initialPosition); // position（状態管理）を初期状態に戻す。
  setDirection(Direction.up); // ゲームスタート時まず上に向かう。
  setFields(initFields(35, initialPosition)); // fieldとsnakeの描画を初期状態に戻す。
}

/* onChangeDirection */
// ゲームプレイ中だけボタン操作可能
// ボタンで方向を変更する。（進行方向と逆方向へは変更できない）
// useCallback(()=>{},[]) : 依存する関数の更新時に再レンダーするため、関数をメモ化できるHook
// 再生成にかかる計算を省略できるので、無駄な処理が少なくて済む。
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
  const handleMoving = () => {
    const {x, y} = position; // positionはxとyに分割できるオブジェクト
    // const nextY = Math.max(y -1, 0); // y-1 or 0 の大きい方をnextYに代入する。
    const delta = Delta[direction];
    const newPosition = {
      x: x + delta.x,
      y: y + delta.y
    };

    if (isCollision(fields.length, newPosition)) { // handleMoving後のpositionで再判定
      return false;
    };

    fields[y][x] = ''; // 紛らわしいが、fields[列][cols] なので初めにY軸,2つ目にX軸の位置情報を持つ。
    fields[newPosition.y][newPosition.x] = 'snake'; // 移動後のy座標にsnakeを移動する。
    setPosition(newPosition); // positionステートにnewPosition.yとxをセットする。
    setFields(fields); // positionを更新したfields.jsで作成したFieldを描画する。
    return true;
  };
  


  return ( // コンポーネントの描画
    <div className="App">
      <header className="header">
        <div className="title-container">
          <h1 className="title">Snake Game</h1>
        </div>
        <Navigation />
      </header>
      <main className="main">
        <Field fields={fields} /> {/* fieldsのパラメータにサイズを渡す */}
      </main>
      <footer className="footer">
        <Button onStart={onStart} onRestart={onRestart} status={status} />
        <ManipulationPanel onChange={onChangeDirection} /> {/* 操作パネルに向き情報を渡す */}
      </footer>
    </div>
  )
};

export default App;