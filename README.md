# Secure Chat - End-to-End Encrypted Messaging Application

This is a real-time chat application that provides end-to-end encryption (E2EE) for all messages. It's built with a React frontend and a Python backend, ensuring that only the sender and the intended recipient can read the message content.


## Features

- **End-to-End Encryption (E2EE):** Messages are encrypted on the sender's device and decrypted on the recipient's device. The server only relays the encrypted data and cannot read the message content.
- **Real-Time Messaging:** Instantaneous message delivery using WebSockets.
- **User Authentication:** Simple username-based registration to join the chat.
- **Online User List:** See who is currently online and available to chat.
- **Chat History:** View your past conversations with other users.

## Technology Stack

### Frontend

- **React:** A JavaScript library for building user interfaces.
- **Vite:** A fast build tool and development server for modern web projects.
- **TypeScript:** A statically typed superset of JavaScript.
- **Socket.IO Client:** For real-time communication with the backend.
- **JSEncrypt:** For handling RSA encryption and decryption on the client-side.
- **Shadcn/UI & Tailwind CSS:** For a modern and responsive user interface.

### Backend

- **Python:** A versatile programming language.
- **Flask:** A lightweight web framework for the backend server.
- **Flask-SocketIO:** For WebSocket support in Flask.
- **Eventlet:** A concurrent networking library for Python.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js and npm:** [Download & Install Node.js](https://nodejs.org/)
- **Python 3 and pip:** [Download & Install Python](https://www.python.org/downloads/)

## Installation

1.  **Clone the repository:**

    ```sh
    git clone <YOUR_GIT_URL>
    cd <YOUR_PROJECT_DIRECTORY>
    ```

2.  **Install frontend dependencies:**

    ```sh
    npm install
    ```

3.  **Install backend dependencies:**

    ```sh
    pip install -r requirements.txt
    ```

## Running the Application

You need to run both the backend server and the frontend application.

1.  **Start the Python backend server:**

    Open a terminal and run the following command. The server will start on `http://localhost:5000`.

    ```sh
    python server.py
    ```

2.  **Start the React frontend application:**

    Open a second terminal and run the following command. The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

    ```sh
    npm run dev
    ```

Now you can open two browser windows, navigate to the frontend URL, register with two different usernames, and start chatting securely.

## How It Works

The end-to-end encryption is achieved using a public/private key pair (RSA) for each user.

1.  **Key Generation:** When a user registers, the client-side application generates a new RSA key pair.
2.  **Public Key Distribution:** The user's public key is sent to the server and shared with other online users.
3.  **Encryption:** When sending a message, the sender's client encrypts the message using the recipient's public key.
4.  **Decryption:** The encrypted message is sent to the recipient via the server. The recipient's client then decrypts the message using their own private key, which never leaves their device.

This ensures that the server, or any other third party, cannot decipher the messages.

## Project Structure

```
.
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ChatInterface.tsx # Main chat UI
│   │   └── ...
│   ├── lib/
│   │   ├── encryption.ts  # E2EE logic
│   │   └── socket.ts      # Socket.IO client setup
│   ├── pages/           # Page components
│   └── main.tsx         # App entry point
├── server.py            # Python backend server
├── package.json         # Frontend dependencies and scripts
└── requirements.txt     # Backend dependencies
```
