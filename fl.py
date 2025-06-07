import websocket
import json
import time

# --- Configuration ---
CWC_URL = "ws://localhost:55155"
VSCODE_TOKEN = "gemini-coder-vscode"
AI_STUDIO_URL = "https://aistudio.google.com/prompts/new_chat"
MODEL_ID = "gemini-2.5-pro-preview-06-05"

# PROMPT_TEXT = """Print out a phrase that u love the most !
# """
PROMPT_TEXT = """Write sum of a and b in python
"""

def send_prompts_to_cwc():
    """
    Connects to the CWC WebSocket server, sends a request
    to initialize chats, and then disconnects without waiting for a response.
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

        # 2. Construct the message with two chat configurations
        init_message = {
            "action": "initialize-chats",
            "text": PROMPT_TEXT,
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
        print("✅ Sent 'initialize-chats' message to CWC for two Gemini instances.")
        print("   - Instance 1: Temperature 0.0")
        print("   - Instance 2: Temperature 0.5")
        
        print("✅ Message sent. Not waiting for response.")

    except ConnectionRefusedError:
        print("❌ Error: Connection refused. Is Code Web Chat (and VS Code) running?")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
    finally:
        if ws and ws.connected:
            ws.close()
            print("✅ Connection closed.")

if __name__ == '__main__':
    send_prompts_to_cwc()