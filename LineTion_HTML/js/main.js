// main.js
import './utils.js';
import { sendMessage } from './sendMsg.js';
import { sendStatusToBackend,fetchUserState } from './userState.js';
import './notionIntegration.js';
import './eventHandlers.js';
import { setEncryptedUserId } from "./eventHandlers.js";

window.onload = async () => {
    await fetchUserState();
};

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('sending-button').addEventListener('click', sendMessage);
});

document.addEventListener('DOMContentLoaded', () => {
  const statusSelect = document.getElementById('status');
  statusSelect.addEventListener('change', (event) => {
    sendStatusToBackend(event.target.value);
  });
});

document.getElementById('messageInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        document.getElementById('sending-button').click();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const liffState = urlParams.get('liff.state');

    if (liffState) {
        const decodedLiffState = decodeURIComponent(liffState);
        const liffStateParams = new URLSearchParams(decodedLiffState);
        setEncryptedUserId(liffStateParams.get('userid'));
    }

    const sendButton = document.querySelector('.send_icon');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
});
