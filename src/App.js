/*--------------------------------
App.js
トップレベルのコンポーネント。
Stateや各種メソッドを格納し、下層コンポーネントをまとめている
--------------------------------*/
import Navigation from './components/Navigation';
import Field from './components/Field';
import Button from './components/Button';
import ManipulationPanel from './components/ManipulationPanel';
import useSnakeGame from './hooks/useSnakeGame';

/* Appコンポーネント */
const App = () => {

  const {
    body,
    difficulty,
    fields,
    status,
    start,
    stop,
    reload,
    updateDirection,
    updateDifficulty,
  } = useSnakeGame();
  
  return (
    <div className="App">
      <header className="header">
        <div className="title-container">
          <h1 className="title">Snake Game</h1>
        </div>
        <Navigation
          length={body.length}
          difficulty={difficulty}
          onChangeDifficulty={updateDifficulty}
        />
      </header>
      <main className="main">
        <Field fields={fields} />
      </main>
      <footer className="footer">
        <Button 
          onStart={start}
          onStop={stop}
          onRestart={reload}
          status={status}
        />
        <ManipulationPanel onChange={updateDirection} />
      </footer>
    </div>
  )
};

export default App;