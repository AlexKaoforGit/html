async function sendMessage() {
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
            <img class="head" src="./user.png" alt="You">
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
            <img class="head" src="./大頭貼.png" alt="ChatGPT">
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

    // Show loading animation
    // document.getElementById('loader').style.display = 'block';
    
    try {
        // Send message to your backend
        const response = await fetch('https://12ac-211-72-238-168.ngrok-free.app/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        // Assume backend returns response in JSON format
        const responseData = await response.json();
        let response_message = marked.parse(responseData.reply);

        // Create the actual bot message and replace the temporary one
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message_row other-message';
        botMessageDiv.innerHTML = `
            <div class="avatar-container">
                <img class="head" src="./大頭貼.png" alt="ChatGPT">
                <div class="user-name">小狸</div>
            </div>
            <div class="message-text">${response_message}</div>
        `;

        // Replace the bot message with the loading animation
        chatContainer.replaceChild(botMessageDiv, tempBotMessageDiv);
        
        Prism.highlightAll();

        chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (error) {
            console.error('Error:', error);
    }
}

function escapeHtml(html) {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}
  
// Ensure the event handler is bound after the document has loaded
document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.querySelector('.send_icon');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
});
