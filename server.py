from flask import Flask, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory storage for users and messages
users = {}  
# Format: { 'username': {'sid': 'session_id', 'public_key': 'public_key_string'} }

message_history = {}  
# Format: { ('alice','bob'): [ {'from': 'alice', 'message': '...'}, ... ] }

@app.route('/')
def index():
    return "Backend server is running"

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    

@socketio.on('disconnect')
def handle_disconnect():
    disconnected_user = None
    for username, user_data in list(users.items()):
        if user_data['sid'] == request.sid:
            disconnected_user = username
            break

    if disconnected_user:
        print(f"Client disconnected: {disconnected_user} ({request.sid})")
        del users[disconnected_user]
        emit('user_list_update', {u: d['public_key'] for u, d in users.items()}, broadcast=True)

@socketio.on('register')
def handle_register(data):
    username = data.get('username')
    public_key = data.get('public_key')

    if not username or not public_key:
        emit('error', {'message': 'Username and public key are required.'})
        return

    if username in users:
        emit('error', {'message': 'Username is already taken.'})
        return

    users[username] = {'sid': request.sid, 'public_key': public_key}
    print(f"User registered: {username} with SID {request.sid}")

    # Send updated user list
    emit('user_list_update', {u: d['public_key'] for u, d in users.items()}, broadcast=True)

    # Send this user's chat history
    user_history = []
    for (u1, u2), msgs in message_history.items():
        if username in (u1, u2):
            user_history.extend(msgs)
    emit('chat_history', user_history)

@socketio.on('private_message')
def handle_private_message(data):
    recipient_username = data.get('to')
    encrypted_message = data.get('message')

    # Find sender username
    sender_username = next((uname for uname, udata in users.items() if udata['sid'] == request.sid), None)
    if not sender_username:
        emit('error', {'message': 'You must be registered to send messages.'})
        return

    # Store in history
    conv_key = tuple(sorted([sender_username, recipient_username]))
    message_history.setdefault(conv_key, []).append({
        'from': sender_username,
        'to': recipient_username,
        'message': encrypted_message
    })

    # Forward to recipient
    recipient = users.get(recipient_username)
    if recipient:
        emit('new_private_message', {
            'from': sender_username,
            'message': encrypted_message
        }, room=recipient['sid'])

    # Also confirm back to sender (optional but useful)
    emit('new_private_message', {
        'from': sender_username,
        'message': encrypted_message
    }, room=request.sid)

if __name__ == '__main__':
    print("Starting server on port 5000...")
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)
