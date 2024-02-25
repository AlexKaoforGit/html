import config from "./config.js";
import { getEncryptedUserId } from './eventHandlers.js';

export async function ImportToNotion(messageId){
    try{
        const encryptedUserId = getEncryptedUserId();
        const notionButton = document.querySelector(`[data-message-id="${messageId}"]`);
        const loadingIndicator = document.createElement('span');
        loadingIndicator.className = 'loading-icon';
        loadingIndicator.style.marginLeft = '10px';
        
        if (notionButton) {
            notionButton.disabled = true;
            notionButton.appendChild(loadingIndicator);
        }
        
        // Send messageId to your backend
        const response = await fetch(`${config.apiUrl}/importnotion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message_id: messageId, encryptedUserId: encryptedUserId })
        });
        // Replace back before program deployment encryptedUserId
        // encryptedUserId for test = 'YFM1187wkjm0V21gAulJquzZUb2pOK3OMatlsjORzSzCNHygin4KgGgnWy5bXhE8-igbllQGFMMmRRONFARQOMw='
        const responseData = await response.json();
        let status = responseData.result;

        loadingIndicator.remove();

        if (status == "success") {
            if (notionButton) {
                notionButton.innerHTML = `
                    <img src="images/success.png" alt="Notion icon" class="notion-icon">
                    <span>Imported successfully.</span>
                `;
            } 
        } else if (status == "error") {
            notionButton.innerHTML = `
            <img src="images/notion.png" alt="Notion icon" class="notion-icon">
            <span style="text-decoration: underline;">Click to try it again.</span>
            `;
            notionButton.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        notionButton.innerHTML = `
        <img src="images/notion.png" alt="Notion icon" class="notion-icon">
        <span style="text-decoration: underline;">Click to try it again.</span>
        `;
        notionButton.disabled = false;
    }

}