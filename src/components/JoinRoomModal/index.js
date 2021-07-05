import { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { functions } from '../../firebase';

const JoinRoomModal = () => {
  const [goToRoom, setGoToRoom] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleChange = (e) => {
    const {value} = e.target;
    setInputText(value.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validateRoomId = functions.httpsCallable('validateRoomId');
    try {
      const result = await validateRoomId({ idToValidate: inputText });
      const isRoomIdAvailable = result.data;
      return isRoomIdAvailable ? setGoToRoom(true) : alert('Room ID is invalid');
    } catch (error) {
      return console.error(error);
    }
  }

  return (
    <>
      <form className="join-room-container" onSubmit={handleSubmit}>
        <label htmlFor="room-id">Paste room ID here</label>
        <input
          id="room-id"
          type="text"
          value={inputText}
          onChange={handleChange}
          name="room-id-input"
          autoFocus
          />
        <button type="submit" className="join-room-submit-btn">Join</button>
      </form>
      {goToRoom && <Redirect to={"/lobby/" + inputText} />}
    </>
  );
};

export default JoinRoomModal;
