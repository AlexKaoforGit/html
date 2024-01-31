import config from './config.js';
import { escapeHtml } from "./utils.js";
import { getEncryptedUserId } from './eventHandlers.js';

export async function sendMessage() {
    const input = document.getElementById('messageInput');
    let message = input.value;
    if (!message.trim()) return; // Don't send empty messages
    input.value = ''; // Clear input field
    message = escapeHtml(message);

    // Immediately show user message
    const chatContainer = document.getElementById('chatRoom');

    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message_row you-message';
    userMessageDiv.innerHTML = `
        <div class="avatar-container">
            <img class="head" src="images/user.png" alt="You">
            <div class="user-name">You</div>
        </div>
        <pre class="message-text">${message}</pre>
    `;
    chatContainer.appendChild(userMessageDiv);

    // Show loading animation inside the other-message
    const tempBotMessageDiv = document.createElement('div');
    tempBotMessageDiv.className = 'message_row other-message';
    tempBotMessageDiv.innerHTML = `
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
    chatContainer.appendChild(tempBotMessageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    var button = document.getElementById('sending-button');
    var status_selector = document.getElementById('status');

    button.disabled = true;
    status_selector.disabled = true;

    // Show loading animation
    // document.getElementById('loader').style.display = 'block';
    
    try {
        const encryptedUserId = getEncryptedUserId();
        // Send message to your backend
        const response = await fetch(`${config.apiUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message, encryptedUserId: encryptedUserId })
        });
        // Assume backend returns response in JSON format
        const responseData = await response.json();
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
            <div class="message-text" ${!message_id ? 'style="display: flex;"' : ''} >${response_message}
                ${message_id ? `<button class="send-button insertNotion" onclick="ImportToNotion('${message_id}')">
                <img src="images/notion.png" alt="Notion icon" class="notion-icon">
                <span style="text-decoration: underline;">Click to import Notion</span>
                </button>` : ''}
            </div>           
        `;

        // Replace the bot message with the loading animation
        chatContainer.replaceChild(botMessageDiv, tempBotMessageDiv);     
        Prism.highlightAll();
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        if (!message_id) {
            button.disabled = true;
            status_selector.disabled = true;
        } else {
            button.disabled = false;
            status_selector.disabled = false;
        }        
    } catch (error) {
            console.error('Error:', error);
    }
}