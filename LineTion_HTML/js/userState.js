import config from './config.js';
import { getEncryptedUserId } from './eventHandlers.js';

export async function fetchUserState() {
    const indicator = document.getElementById('statusIndicator');
    try {
        const encryptedUserId = getEncryptedUserId();
        const response = await fetch( `${config.apiUrl}/get_userstate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ encryptedUserId: encryptedUserId })
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
export async function sendStatusToBackend(status) {
    const encryptedUserId = getEncryptedUserId();
    const nowStatus = document.getElementById('status');
    const indicator = document.getElementById('statusIndicator');
    
    if (!previousStatus) {
        previousStatus = 'python';
      }
    
    indicator.className = 'status-indicator loading';
    
    try {
    const response = await fetch(`${config.apiUrl}/switchstatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: status, encryptedUserId: encryptedUserId })
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
