const roomState = {};

const setRoomState = (roomId, state) => {
  roomState[roomId] = state;
};

const getRoomState = (roomId) => {
  return roomState[roomId];
};

const removeRoomState = (roomId) => {
  delete roomState[roomId];
};

export { setRoomState, getRoomState, removeRoomState };