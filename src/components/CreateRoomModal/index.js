import { Link } from 'react-router-dom';
import { MdContentCopy } from 'react-icons/md';
import PropTypes from 'prop-types';

const CreateRoomModal = ({id}) => {
  const copyToClipboard = () => navigator.clipboard.writeText(id);

  return (
    <div className="create-room-div">
      <div className="modal-id-container">
        <span className="modal-id">{id}</span>
        <MdContentCopy onClick={copyToClipboard} className="clipboard-icon" tabIndex="0" />
      </div>
      <p className="share-code-text">Share this code with others.</p>
      {id &&
      <Link to={ "/lobby/" + id } className="go-to-room-link">
        Go to room
      </Link>}
    </div>
  );
};

CreateRoomModal.propTypes = {
  id: PropTypes.string
};

export default CreateRoomModal;
