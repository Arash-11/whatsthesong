const Spinner = ({text}) => {
  return (
    <div className="overlay-background">
      <div className="spinner-container">
        <div className="spinner" />
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Spinner;
