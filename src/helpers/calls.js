export const closeCallStream = (stream) => {
  console.log("STREAM in closeCallStream: ", stream);
  stream.getTracks().forEach(function (track) {
    track.stop();
  });
};
