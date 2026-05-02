import { useState } from "react";
import { chatbotQuery } from "../services/api";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const send = async () => {
    const res = await chatbotQuery(message);
    setResponse(res.data.response);
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "100px",
      right: "100px"
    }}>
      <button onClick={() => setOpen(!open)}>💬</button>

      {open && (
        <div style={{position: "fixed", bottom: "20px", right: "20px", zIndex: 1000}}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask..."
          />
          <button onClick={send}>Send</button>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default Chatbot;