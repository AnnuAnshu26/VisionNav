// This function uses the browser's built-in speech synthesis
export const speakText = (text) => {
  // Check if the browser supports speech synthesis
  if ('speechSynthesis' in window) {
    // Stop any speech that is currently active
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // You can change the language
    utterance.rate = 0.9;     // Speed of the speech

    // Speak the text
    window.speechSynthesis.speak(utterance);
  } else {
    console.error("Sorry, your browser doesn't support text-to-speech.");
  }
};