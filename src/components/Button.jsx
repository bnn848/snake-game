
const Button = ({onStart, onRestart, status}) => {
  return (
    <div className="button">
      { // ゲーム状態に応じて表示するボタンを変更する（三項演算子）
        status === "gameover" ?
        <button onClick={onRestart}>gameover</button>
        :
        <button onClick={onStart}>start</button>
      }
    </div>
  )
};

export default Button;