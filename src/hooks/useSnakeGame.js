import { useCallback, useEffect, useState } from "react";
import {
  defaultInterval,
  defaultDifficulty,
  Delta,
  Difficulty,
  Direction,
  DirectionKeyCodeMap,
  GameStatus,
  OppositeDirection,
  initialPosition,
  initialValues
} from '../constants';
import {
  initFields,
  isCollision,
  getFoodPosition,
  isEatingMyself
} from '../utils';


/* timer */
let timer = null; // なぜundefinedからnullに変更したのか？


/* unsubscribe */
const unsubscribe = () => {
  if (!timer) {
    return;
  }
  clearInterval(timer)
};


/* useSnakeGame */
// 巨大なカスタムフックの生成
const useSnakeGame = () => {

  /* state管理 */
  const [fields, setFields] = useState(initialValues); // fieldの状態管理
  const [body, setBody] = useState([]); // snakeの体の長さ[配列として管理]
  const [status, setStatus] = useState(GameStatus.init) // ゲームの状態管理（初期値は init ）
  const [direction, setDirection] = useState(Direction.up) // 進行方向（初期値は up ）
  const [difficulty, setDifficulty] = useState(defaultDifficulty); // ゲーム難易度
  const [tick, setTick] = useState(0); // positionがundefinedのままsetIntervalが実行されないよう変数セットする。


  /* useEffectその1 */
  useEffect(() => {
    setBody([initialPosition]); // snakeの初期位置位置を描画する。
    const interval = Difficulty[difficulty -1] // setIntervalの引数2に渡す変数。
    timer = setInterval(() => { // コールバック関数をIntervalミリ秒ごとに呼び出す。
      setTick((tick) => tick + 1); // 一定間隔でレンダリングするようにする<------------------------- ???
    },interval); // 配列[0~4]
    return unsubscribe; // コンポーネントが削除されるタイミングで実行される。
  },[difficulty]); // difficultyが更新されるたびに呼び出される。


  /* useEffectその2 */
  useEffect(() => {
    if (body.length === 0 || status !== GameStatus.playing) { // body.lengthは必要か？
      return;
    }
    const canContinue = handleMoving(); // <--- handleMovingメソッドが返すboolean値を受け取る。
    if (!canContinue) {
      unsubscribe();
      setStatus(GameStatus.gameover);
    }
  // eslint-disable-next-line
  },[tick]); // tickが更新されるたびにこのuseEffectが発火する。依存関係Warning出るので上記コメント挿入


  /* start */
  const start = () => setStatus(GameStatus.playing); // GameStatusをPlayingにする。
  /* stop */
  const stop = () => setStatus(GameStatus.suspended); // GameStatusをsuspendedにする。
  /* reload */
  const reload = () => {
    timer = setInterval(() => {
      setTick(tick => tick + 1)
    },defaultInterval);
    setStatus(GameStatus.init); // init状態にする。
    setBody([initialPosition]); // snakeのbodyの長さを初期状態に戻す。
    setDirection(Direction.up); // <- 教材ではResetボタン実装時に追加しているが、方向管理実装時にすべき。
    setDirection(Direction.up); // ゲームスタート時まず上に向かう。
    setFields(initFields(fields.length, initialPosition)); // fieldとsnakeの描画を初期状態に戻す。
  };


  /* updateDirection */
  // useCallback(()=>{},[]) : 依存する関数の更新時に再レンダーするため、関数をメモ化できるHook
  // 関数は描画ごとに新しいものとして再生成される。その計算を省略できるので、無駄な処理が少なくて済む。
  const updateDirection = useCallback((newDirection) => { // ManipulationPanel.jsxからonChangeの引数を受け取る。
    if (status !== GameStatus.playing) { // プレイ中でない場合はそのままの状態を保持する。
      return direction;
    }
    if (OppositeDirection[direction] === newDirection) { // 入力値が進行方向と逆方向の場合は無視する。
      return;
    }
    setDirection(newDirection); // 問題なければ押下したボタンに対応した進行方向へ変更する。
    },[direction, status] // directionまたはstatusが更新されるたびに発火する。
  );


  /* updateDifficulty */
  const updateDifficulty = useCallback((difficulty) => {
    if (status !== GameStatus.init) { // gameが始まっている場合は無視する。
      return;
    }
    if (difficulty < 1 || difficulty > difficulty.length) { // difficultyが想定外の値の場合に無視する。
      return;
    }
    setDifficulty(difficulty) // 難易度ステートを変更する。
    // eslint-disable-next-line
  }, [status]); // statusに変更があった時updateDifficultyを呼び出す。


/* useEffectその3 */
useEffect(() => { // keydownとupdateDirectionを結びつける。
  const handleKeyDown =  (e) => { // 押下したキーの割り当て番号をパラメータに持つ。
    const newDirection = DirectionKeyCodeMap[e.keyCode]; // Map[index]のインスタンスをnewDirectionに代入する。
    if (!newDirection) {
      return;
    }
    updateDirection(newDirection);
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown) // componentWillUnmount（リソースの解放）
},[updateDirection]); // ボタンが押下され、updateDirectionが再レンダーするたびに発火する。


/* handleMoving */
const handleMoving = () => { // 進行方向を変更するメソッド
  const {x, y} = body[0]; // bodyの先頭の座標を分割
  const delta = Delta[direction]; // 進行方向のstateのx,y
  const newPosition = { // 現在地 + 進行方向 = newPosition
    x: x + delta.x,
    y: y + delta.y
  };

  // 移動後の座標がField内かどうか or 移動後のcolがsnakeかどうかを調べる、
  // trueならhandleMoving === falseを返す。
  if (isCollision(fields.length, newPosition) || isEatingMyself(fields, newPosition)) {
    return false;
  };

  // bodyに対して.popや.unshiftなど破壊的メソッドがあるため参照コピーする。
  const newBody = [...body]; 
  if (fields[newPosition.y][newPosition.x] !== 'food') { // エサを食べない場合
    // 紛らわしいがfields[列][cols]:初めにY軸,2つ目にX軸の位置情報を持つ。
    const removingTrack = newBody.pop(); // 配列から最後の要素を取り除き、その要素を返す。
    fields[removingTrack.y][removingTrack.x] = ''; // 取り除いた要素の座標にある中身を空にする。
  } else { // エサを食べる場合
    const food = getFoodPosition(fields.length, [...newBody, newPosition]) // 引数2はsnakeの現在位置
    fields[food.y][food.x] = "food"; // 再度ランダムでfood出現
  }

  fields[newPosition.y][newPosition.x] = 'snake'; // 移動後の座標をsnakeのbodyにする。
  newBody.unshift(newPosition); // bodyの先頭にnewPosition({x,y})を追加する。
  setBody(newBody); // 大元のbodyに移動後の座標を追加する
  setFields(fields); // positionを更新したfields.jsで作成したFieldを描画する。
  return true;
};

/* 各コンポーネントに渡すため、定義した関数やステートをreturnする */
return {
    body,
    difficulty,
    fields,
    status,
    start,
    stop,
    reload,
    updateDirection,
    updateDifficulty,
  };
};

export default useSnakeGame;