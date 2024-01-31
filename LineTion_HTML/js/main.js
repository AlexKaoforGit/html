// main.js
import { sendMessage } from './sendMsg.js';
import { sendStatusToBackend, fetchUserState } from './userState.js';
import { ImportToNotion } from './notionIntegration.js';
import { setEncryptedUserId } from "./eventHandlers.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const liffState = urlParams.get('liff.state');
    if (liffState) {
        const decodedLiffState = decodeURIComponent(liffState);
        const liffStateParams = new URLSearchParams(decodedLiffState);
        setEncryptedUserId(liffStateParams.get('userid'));
    }

    const sendButton = document.getElementById('sending-button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    const statusSelect = document.getElementById('status');
    if (statusSelect) {
        statusSelect.addEventListener('change', (event) => {
            sendStatusToBackend(event.target.value);
        });
    }

    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    await fetchUserState();

    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('insertNotion')) {
            const messageId = event.target.getAttribute('data-message-id');
            ImportToNotion(messageId);
        }
    });
});
