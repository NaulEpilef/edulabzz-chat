"use client"
import { useEffect, useState } from "react"
import io from "socket.io-client";
const socket = io("http://localhost:3333", { transports: ["websocket"] });

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

  const sendMessage = () => {
    if (!author) {
      console.error("Por favor, defina o nome de usuário");
      return;
    }

    if (!currentMessage) {
      console.error("Por favor, escreva uma mensagem");
      return;
    }

    socket.emit('sendMessage', { author, message: currentMessage });
    setCurrentMessage("");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="h-4/5 bg-gray-500">
        { messages && messages.map(message => (
          <p key={message.id}>
            <span>{message.author}</span>
            <span>{message.message}</span>
          </p>
        )) }
      </div>
      <div className="flex flex-col items-center">
        <input type="text" placeholder="Autor" className='border-solid border-black' value={author} onChange={(e) => setAuthor(e.target.value)} />
        <input type="text" placeholder="Mensagem" className='border-black' value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} />
        <button type="button" onClick={sendMessage}>Enviar</button>
      </div>
    </main>
  )
}
