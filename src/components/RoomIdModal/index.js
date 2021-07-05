import { useRef, useEffect } from 'react';
import JoinRoomModal from '../JoinRoomModal';
import CreateRoomModal from '../CreateRoomModal';
import PropTypes from 'prop-types';


const RoomIdModal = ({closeModal, id, willJoinRoom, noRoomIdInDb}) => {
  const modalRef = useRef();

  useEffect(() => {
    const modalOverlay = modalRef.current;
    modalOverlay.addEventListener('click', () => closeModal());
    return () => (
      modalOverlay.removeEventListener('click', () => closeModal())
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="modal-overlay-background" ref={modalRef} />
      <div className="modal">
        <div className={`room_id ${noRoomIdInDb ? "show-no-data-msg" : ""}`}>
          {willJoinRoom
            ? <JoinRoomModal />
            : <CreateRoomModal id={id} />
          }
          {noRoomIdInDb && <p className="no-room-text">No rooms are available at the moment.</p>}
        </div>
      </div>
    </>
  );
};

RoomIdModal.propTypes = {
  closeModal: PropTypes.func,
  id: PropTypes.string,
  willJoinRoom: PropTypes.bool,
  noRoomIdInDb: PropTypes.bool
};

export default RoomIdModal;
