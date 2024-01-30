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

    var button = document.getElementById('sending-button');
    var status_selector = document.getElementById('status');

    button.disabled = true;
    status_selector.disabled = true;

    // Show loading animation
    // document.getElementById('loader').style.display = 'block';
    
    try {
        // Send message to your backend
        const response = await fetch('https://9f77-211-72-238-168.ngrok-free.app/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message, encryptedUserId: 'YFM1187wkjm0V21gAulJquzZUb2pOK3OMatlsjORzSzCNHygin4KgGgnWy5bXhE8-igbllQGFMMmRRONFARQOMw=' })
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
                <img class="head" src="./大頭貼.png" alt="ChatGPT">
                <div class="user-name">小狸</div>
            </div>
            <div class="message-text" ${!message_id ? 'style="display: flex;"' : ''} >${response_message}
                ${message_id ? `<button class="send-button insertNotion" onclick="ImportToNotion('${message_id}')">
                <img src="./notion.png" alt="Notion icon" class="notion-icon">
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

function escapeHtml(html) {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

async function ImportToNotion(messageId){
    try{
        const notionButton = document.querySelector(`[onclick="ImportToNotion('${messageId}')"]`);
        notionButton.removeAttribute('onclick');
        notionButton.classList.add('disabled');
        // Send messageId to your backend
        const response = await fetch('https://9f77-211-72-238-168.ngrok-free.app/importnotion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message_id: messageId, encryptedUserId: 'YFM1187wkjm0V21gAulJquzZUb2pOK3OMatlsjORzSzCNHygin4KgGgnWy5bXhE8-igbllQGFMMmRRONFARQOMw=' })
        });
        // Replace back before program deployment encryptedUserId
        // encryptedUserId for test = 'YFM1187wkjm0V21gAulJquzZUb2pOK3OMatlsjORzSzCNHygin4KgGgnWy5bXhE8-igbllQGFMMmRRONFARQOMw='
        const responseData = await response.json();
        let status = responseData.result;

        if (status == "success") {
            if (notionButton) {
                notionButton.innerHTML = `
                    <img src="./success.png" alt="Notion icon" class="notion-icon">
                    <span>Imported successfully.</span>
                `;
            } 
        } else if (status == "error") {
            notionButton.innerHTML = `
            <img src="./notion.png" alt="Notion icon" class="notion-icon">
            <span style="text-decoration: underline;">Click to try it again.</span>
            `;
            // Re-enable the onclick event handler
            notionButton.setAttribute('onclick', `ImportToNotion('${messageId}')`);
            notionButton.classList.remove('disabled');
        }
    } catch (error) {
        console.error('Error:', error);
    }

}
// Ensure the event handler is bound after the document has loaded
let encryptedUserId = null;
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const liffState = urlParams.get('liff.state');

    if (liffState) {
        // 对 liff.state 的值进行解码
        const decodedLiffState = decodeURIComponent(liffState);

        // 使用 URLSearchParams 来解析解码后的 liff.state 值
        const liffStateParams = new URLSearchParams(decodedLiffState);
        encryptedUserId = liffStateParams.get('userid');
    }

    const sendButton = document.querySelector('.send_icon');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
});

function toggleDropdown() {
    document.getElementsByClassName("dropdown-content")[0].classList.toggle("show");
  }
  
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      for (var i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }

window.onload = async () => {
    await fetchUserState();
};

async function fetchUserState() {
    const indicator = document.getElementById('statusIndicator');
    try {
        const response = await fetch('https://9f77-211-72-238-168.ngrok-free.app/get_userstate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ encryptedUserId: 'YFM1187wkjm0V21gAulJquzZUb2pOK3OMatlsjORzSzCNHygin4KgGgnWy5bXhE8-igbllQGFMMmRRONFARQOMw=' })
          });
        // Replace back before program deployment encryptedUserId
        // encryptedUserId for test = 'YFM1187wkjm0V21gAulJquzZUb2pOK3OMatlsjORzSzCNHygin4KgGgnWy5bXhE8-igbllQGFMMmRRONFARQOMw='

      if (response.ok) {
        const data = await response.json();
        if (data.language_option) {
          document.getElementById('status').value = data.language_option;
          indicator.className = 'status-indicator success';
        } else {
          indicator.className = 'status-indicator failure';
          console.error('Error: Status not found in response');
        }
      } else {
        indicator.className = 'status-indicator failure';
        console.error('Error: Response not OK or not JSON');
      }
    } catch (error) {
      indicator.className = 'status-indicator failure';
      console.error('Error:', error);
    }
  }

let previousStatus = null;
async function sendStatusToBackend(status) {
    const nowStatus = document.getElementById('status');
    const indicator = document.getElementById('statusIndicator');
    
    if (!previousStatus) {
        previousStatus = 'python';
      }
    
    indicator.className = 'status-indicator loading';
    
    try {
    const response = await fetch('https://9f77-211-72-238-168.ngrok-free.app/switchstatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: status, encryptedUserId: 'YFM1187wkjm0V21gAulJquzZUb2pOK3OMatlsjORzSzCNHygin4KgGgnWy5bXhE8-igbllQGFMMmRRONFARQOMw=' })
    });
    // Replace back before program deployment encryptedUserId
    // encryptedUserId for test = 'YFM1187wkjm0V21gAulJquzZUb2pOK3OMatlsjORzSzCNHygin4KgGgnWy5bXhE8-igbllQGFMMmRRONFARQOMw='

    if (response.ok) {
        indicator.className = 'status-indicator success';
        previousStatus = status;
      } else {
        indicator.className = 'status-indicator failure';
        nowStatus.value = previousStatus;
      }
  } catch (error) {
    indicator.className = 'status-indicator failure';
    nowStatus.value = previousStatus;
    console.error('Error:', error);
  }
}

document.getElementById('messageInput').addEventListener('keydown', function(event) {
    // 檢查是否按下了 Enter 鍵而沒有按下 Shift 鍵
    if (event.key === 'Enter' && !event.shiftKey) {
        // 防止預設事件（換行）
        event.preventDefault();
        // 觸發發送按鈕的點擊事件
        document.getElementById('sending-button').click();
    }
});

  