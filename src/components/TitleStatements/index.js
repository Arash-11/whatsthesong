import PropTypes from 'prop-types';

const TitleStatements = ({children}) => {
  return (
    <section className="titlestatements">
      <h1>What's The <br></br> Song?</h1>
      <h3>
        Challenge yourself or your friends <br></br> and test how well you know your favourite songs.
      </h3>
      {children}
    </section>
  );
};

TitleStatements.propTypes = {
  children: PropTypes.array
};

export default TitleStatements;
