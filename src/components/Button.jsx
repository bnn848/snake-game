import { GameStatus } from '../constants';

const Button = ({onStart, onStop, onRestart, status}) => {
  return (
    <div className="button">
      {/* ゲーム状態に応じて表示するボタンを変更する（三項演算子）*/}
      {status === GameStatus.gameover && <button className="btn btn-gameover" onClick={onRestart}>gameover</button>}
      {status === GameStatus.init && <button className="btn btn-init" onClick={onStart}>start</button>}
      {status === GameStatus.suspended && <button className="btn btn-suspended" onClick={onStart}>start</button>}
      {status === GameStatus.playing && <button className="btn btn-playing" onClick={onStop}>stop</button>}
    </div>
  )
};

export default Button;