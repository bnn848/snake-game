
const ManipulationPanel = ({onChange}) => {

  /* Clickイベント */
  // App.jsで定義したonChangeDirectionメソッドを利用する
  const onUp = () => onChange('up');
  const onRight = () => onChange('right');
  const onLeft = () => onChange('left');
  const onDown = () => onChange('down');
  
  return (
    <div className="manipulation-panel">
      <button onClick={onLeft}>←</button>
      <button onClick={onUp}>↑</button>
      <button onClick={onDown}>↓</button>
      <button onClick={onRight}>→</button>
    </div>
  );
};

export default ManipulationPanel;