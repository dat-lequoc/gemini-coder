import { connect_websocket } from './websocket'
import { setup_keep_alive } from './keep-alive'
import { setup_message_listeners } from './message-handler'
import { clear_chat_init_data } from './clear-chat-init-data'
import browser from 'webextension-polyfill'

const FLASK_SERVER_URL = 'http://localhost:5001'

async function pollForCommands() {
  try {
    const response = await fetch(`${FLASK_SERVER_URL}/get_command`)
    if (response.ok) {
      const command = await response.json()
      if (command && command.action === 'continue_chat' && command.prompt) {
        console.log('Received continue_chat command:', command)
        const tabs = await browser.tabs.query({
          active: true,
          currentWindow: true
        })
        if (tabs.length > 0 && tabs[0].id) {
          // Send the command to the content script of the active tab
          browser.tabs.sendMessage(tabs[0].id, command)
        }
      }
    }
  } catch (error) {
    // This error is expected if the server isn't running, so we can ignore it to avoid console spam.
    // console.error('Error polling for commands:', error);
  }
}

async function init() {
  await clear_chat_init_data()
  connect_websocket()
  setup_keep_alive()
  setup_message_listeners()

  // Start polling for commands from the Flask server every 2 seconds.
  setInterval(pollForCommands, 2000)
}

init().catch((error) => {
  console.error('Error during initialization:', error)
})