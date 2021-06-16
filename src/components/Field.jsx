
const Field = ({fields}) => {

  return (
    <div className="field">
      {
        fields.map((row) => { // 列を取り出す
          return row.map((column) => { // colsを取り出す
            return (
            <div className={`dots ${column}`}></div> // 各colsにはcolumnのデータが格納されている
            )
          })
        })
      }
    </div>
  )
};

export default Field;