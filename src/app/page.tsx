"use client"
import { useEffect, useState } from "react"
import io from "socket.io-client";
const socket = io("https://api-edulabzz-chat-913a001ad1e4.herokuapp.com", { transports: ["websocket"] });

interface IMessage {
  id: string;
  author: string;
  message: string;
}

interface IMessageSocket {
  _id: string;
  author: string;
  message: string;
  _v: string;
}

export default function Home() {
  const [alert, setAlert] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected');
    });
    socket.on('message', (data: IMessageSocket[]) => {
      const message = data.map(d => ( { id: d._id, author: d.author, message: d.message } ));
      setMessages(message);
    });
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!author) {
      console.error("Por favor, defina o nome de usuário");
      setAlert("Por favor, defina o nome de usuário");
      return;
    }

    if (!currentMessage) {
      console.error("Por favor, escreva uma mensagem");
      setAlert("Por favor, escreva uma mensagem");
      return;
    }

    socket.emit('sendMessage', { author, message: currentMessage });
    setCurrentMessage("");
    setAlert("");
  }

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <div className="p-4 flex flex-row">
        <input
          type="text"
          className="border rounded-lg p-2"
          placeholder="Digite seu nome..."
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        {alert && <div className="bg-red-400 text-white border rounded-lg p-2 font-bold ml-5">{alert}</div>}
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.author === author ? 'text-right' : 'text-left'
            }`}
          >
            <div className="text-gray-500">{message.author === author ? 'Você' : message.author}</div>
            <div
              className={`rounded-lg p-2 ${
                message.author === author ? 'bg-blue-400 text-white' : 'bg-gray-200'
              }`}
            >
              {message.message}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-4 flex items-center">
          <input
            type="text"
            className="flex-1 border rounded-l-lg p-2"
            placeholder="Digite sua mensagem..."
            value={currentMessage}
            onChange={e => setCurrentMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-r-lg ml-2"
            onClick={sendMessage}
          >
            Enviar
          </button>
      </form>
    </div>
  )
}
