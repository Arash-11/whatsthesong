import PropTypes from 'prop-types';

const TopScoresSorted = ({ scoresList }) => (
  <ol className="scores-list">
    {scoresList.map((entry, index) => (
      <li key={entry[0]}>
        {!window.location.pathname.includes('/results/') && 
          <span className="rank">{index + 1}</span>}
        <div className="score-card">
          <span className="scores-card__score">
            <span className="score">{entry[1].score}</span>
            <span className="points">
              {entry[1].score === 1 ? 'point' : 'points'}
            </span>
          </span>
          <p className="scores-card__name">
            { entry[1].username ? entry[1].username : entry[0] }
          </p>
        </div>
      </li>
    ))}
  </ol>
);

TopScoresSorted.propTypes = {
  scoresList: PropTypes.array
};

export default TopScoresSorted;
