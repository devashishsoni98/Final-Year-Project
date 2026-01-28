export const stopSpeech = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};
