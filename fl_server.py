from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Disable Flask's default logging to focus on our messages
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
# Allow requests from the browser extension's origins
CORS(app)

@app.route('/report_result', methods=['POST'])
def report_result():
    """
    This endpoint receives the final chat response from the browser extension.
    """
    if not request.is_json:
        print("❗️ Received non-JSON request")
        return jsonify({"status": "error", "message": "Request must be JSON"}), 400

    data = request.get_json()
    client_id = data.get('client_id')
    content = data.get('content')

    if not content:
        print("❗️ Received request with no content")
        return jsonify({"status": "error", "message": "Missing 'content' in request"}), 400

    print("\n" + "="*50)
    print(f"🎉 NEW RESPONSE RECEIVED (from client_id: {client_id})")
    print("="*50)
    print(content)
    print("="*50 + "\n")

    return jsonify({"status": "ok", "message": "Result received successfully"}), 200

if __name__ == '__main__':
    port = 5001 # Using a different port to avoid conflicts
    print(f"✅ Flask server is running on http://localhost:{port}")
    print("⏳ Waiting for chat responses from the browser extension...")
    app.run(host='0.0.0.0', port=port, debug=False)