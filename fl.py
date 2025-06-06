import websocket
import json
import time

# --- Configuration ---
CWC_URL = "ws://localhost:55155"
VSCODE_TOKEN = "gemini-coder-vscode"
AI_STUDIO_URL = "https://aistudio.google.com/prompts/new_chat"
MODEL_ID = "gemini-2.5-pro-preview-06-05"

PROMPT_TEXT = """Print out a phrase that u love the most !
"""

def send_prompts_to_cwc():
    """
    Connects to the CWC WebSocket server, sends a request
    to initialize chats, and waits to receive and print the full responses.
    """
    connection_url = f"{CWC_URL}?token={VSCODE_TOKEN}"
    
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
            ws.close()
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
                {
                    "url": AI_STUDIO_URL,
                    "model": MODEL_ID,
                    "temperature": 0.5
                }
            ],
            "client_id": client_id
        }

        # 3. Send the message
        ws.send(json.dumps(init_message))
        print("✅ Sent 'initialize-chats' message to CWC for two Gemini instances.")
        print("   - Instance 1: Temperature 0.0")
        print("   - Instance 2: Temperature 0.5")
        
        # 4. Keep connection open to listen for responses
        num_chats = len(init_message["chats"])
        finished_chats = 0
        print(f"⏳ Waiting for {num_chats} responses from the browser...")
        
        try:
            while finished_chats < num_chats:
                message_str = ws.recv()
                message = json.loads(message_str)
                
                if message.get("action") == "chat-response-finished":
                    finished_chats += 1
                    print(f"\n🎉 Received finished response ({finished_chats}/{num_chats}):")
                    print("-" * 30)
                    print(message.get("content"))
                    print("-" * 30)
                # This handles other messages that might be sent, such as the one to apply the response
                elif message.get("action") == "apply-chat-response":
                    print(f"ℹ️ Received 'apply-chat-response' from client {message.get('client_id')}. No action taken in this script.")
                else:
                    print(f"ℹ️ Received other message: {message.get('action')}")

        except websocket.WebSocketConnectionClosedException:
            print("❗️Connection closed before all responses were received.")
        except KeyboardInterrupt:
            print("\n🛑 User interrupted. Closing connection.")
        except Exception as e:
            print(f"An error occurred while waiting for responses: {e}")
        finally:
            if ws.connected:
                ws.close()
            print("✅ Connection closed.")

    except ConnectionRefusedError:
        print("❌ Error: Connection refused. Is Code Web Chat (and VS Code) running?")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == '__main__':
    send_prompts_to_cwc()