import websocket
import json
import requests
import argparse

# --- Configuration ---
CWC_URL = "ws://localhost:55155"
VSCODE_TOKEN = "gemini-coder-vscode"
AI_STUDIO_URL = "https://aistudio.google.com/prompts/new_chat"
MODEL_ID = "gemini-2.5-pro-preview-06-05"
FLASK_SERVER_URL = "http://localhost:5001"

PROMPT_TEXT = """Write sum of a and b in python
"""

def send_initial_prompt(prompt_text: str):
    """
    Connects to the CWC WebSocket server, sends a request
    to initialize chats, and then disconnects.
    """
    connection_url = f"{CWC_URL}?token={VSCODE_TOKEN}"
    ws = None
    try:
        ws = websocket.create_connection(connection_url)
        print("✅ Successfully connected to Code Web Chat WebSocket server.")

        # 1. Receive the client_id from the server
        message_str = ws.recv()
        message = json.loads(message_str)
        
        client_id = -1
        if message.get("action") == "client-id-assignment":
            client_id = message.get("client_id")
            print(f"✅ Received client_id: {client_id}")
        else:
            print("❌ Error: Did not receive client_id assignment.")
            return

        # 2. Construct the message with one chat configuration
        init_message = {
            "action": "initialize-chats",
            "text": prompt_text,
            "chats": [
                {
                    "url": AI_STUDIO_URL,
                    "model": MODEL_ID,
                    "temperature": 0.0
                },
                # {
                #     "url": AI_STUDIO_URL,
                #     "model": MODEL_ID,
                #     "temperature": 0.5
                # }
            ],
            "client_id": client_id
        }

        # 3. Send the message
        ws.send(json.dumps(init_message))
        print(f"✅ Sent 'initialize-chats' message to CWC with prompt: \"{prompt_text[:50]}...\"")
        print("✅ Message sent. Not waiting for response.")

    except ConnectionRefusedError:
        print("❌ Error: Connection refused. Is Code Web Chat (and VS Code) running?")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
    finally:
        if ws and ws.connected:
            ws.close()
            print("✅ Connection closed.")

def send_continue_chat_prompt(prompt: str):
    """
    Sends a "continue chat" prompt to the Flask server.
    """
    try:
        url = f"{FLASK_SERVER_URL}/continue_chat"
        payload = {"prompt": prompt}
        response = requests.post(url, json=payload)
        response.raise_for_status()  # Raise an exception for bad status codes
        print(f"✅ Successfully sent 'continue_chat' prompt to Flask server.")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error sending 'continue_chat' prompt to Flask server: {e}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Send prompts to Code Web Chat.")
    
    # Argument for continuing a chat
    parser.add_argument(
        "-c", "--continue_chat",
        type=str,
        help="Send a follow-up prompt to continue the chat."
    )
    
    # Argument for setting the initial prompt
    parser.add_argument(
        "-p", "--prompt",
        type=str,
        default=PROMPT_TEXT,
        help="The initial prompt to start the chat with. (default: %(default)s)"
    )

    args = parser.parse_args()

    if args.continue_chat:
        # If -c or --continue_chat is used, send a follow-up prompt
        send_continue_chat_prompt(args.continue_chat)
    else:
        # Otherwise, send the initial prompt
        send_initial_prompt(args.prompt)