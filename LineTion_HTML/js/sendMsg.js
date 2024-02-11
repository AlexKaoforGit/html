import config from './config.js';
import { escapeHtml } from "./utils.js";
import { getEncryptedUserId } from './eventHandlers.js';

export async function sendMessage() {
    const input = document.getElementById('messageInput');
    let message = input.value.trim();
    if (!message) return;
    input.value = '';
    message = escapeHtml(message);

    const chatContainer = document.getElementById('chatRoom');
    createUserMessageDiv(message, chatContainer);
    const tempBotMessageDiv = createBotMessageDiv(chatContainer);
    toggleElementsDisabled(true); // Disable elements while sending

    try {
        const response = await sendToBackend(message);
        onResponse(response, tempBotMessageDiv, chatContainer);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        toggleElementsDisabled(false); // Re-enable elements
    }
}

function nowTimeStamp() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime
}

function toggleElementsDisabled(disabled) {
    document.getElementById('sending-button').disabled = disabled;
    document.getElementById('status').disabled = disabled;
    document.getElementById('messageInput').disabled = disabled;
}

function createUserMessageDiv(message, container) {
    const formattedTime = nowTimeStamp()
    const div = document.createElement('div');
    div.className = 'message_row you-message';
    div.innerHTML = `
        <div class="avatar-container">
            <img class="head" src="images/user.png" alt="You">
            <div class="user-name">You</div>
        </div>
        <div class="message-content">
            <pre class="message-text">${message}</pre>
            <div class="timestamp">${formattedTime}</div>
        </div>
    `;
    container.appendChild(div);
}

function createBotMessageDiv(container) {
    const div = document.createElement('div');
    div.className = 'message_row other-message';
    div.innerHTML = `
        <div class="avatar-container">
            <img class="head" src="images/大頭貼.png" alt="ChatGPT">
            <div class="user-name">小狸</div>
        </div>
        <div id="loader" class="loader">
            <div class="spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
            </div>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
}

async function sendToBackend(message) {
    const encryptedUserId = getEncryptedUserId();
    const response = await fetch(`${config.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message, encryptedUserId: encryptedUserId })
    });
    return response.json();
}

function onResponse(responseData, tempDiv, container) {
    const formattedTime = nowTimeStamp()
    let response_message = marked.parse(responseData.reply);
    let message_id = responseData.message_id;

    // Create the actual bot message and replace the temporary one
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message_row other-message';
    botMessageDiv.style.position = 'relative';
    
    botMessageDiv.innerHTML = `
        <div class="avatar-container">
            <img class="head" src="images/大頭貼.png" alt="ChatGPT">
            <div class="user-name">小狸</div>
        </div>
        <div class="message-content">
            <div class="message-text" ${!message_id ? 'style="display: flex;"' : ''} >${response_message}
                ${message_id ? `<button class="send-button insertNotion" data-message-id="${message_id}">
                <img src="images/notion.png" alt="Notion icon" class="notion-icon">
                <span style="text-decoration: underline;">Click to import Notion</span>
                </button>` : ''}
            </div>
            <div class="timestamp">${formattedTime}</div>
        </div>
    `;

    // Replace the bot message with the loading animation
    container.replaceChild(botMessageDiv, tempDiv);     
    Prism.highlightAll();
    container.scrollTop = container.scrollHeight;

}