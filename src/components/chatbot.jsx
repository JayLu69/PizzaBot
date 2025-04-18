import React, { useState, useRef, useEffect } from "react";

const pizzaTypes = ["Margherita", "Pepperoni", "Veggie", "BBQ Chicken", "Hawaiian"];
const sizes = ["Small", "Medium", "Large"];
const toppings = ["Extra Cheese", "Mushrooms", "Onions", "Olives", "Peppers", "Jalapenos"];

function Chatbot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Welcome! How can I help you today?", options: ["Place an Order", "Contact Support", "Cancel Order"] }
  ]);
  const [step, setStep] = useState(0); // 0: choose action, 1: order, 2: support
  const [orderStep, setOrderStep] = useState(0); // 0: type, 1: size, 2: toppings, 3: confirm
  const [order, setOrder] = useState({ type: "", size: "", toppings: [] });
  const [input, setInput] = useState("");
  const [showToppings, setShowToppings] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [supportMode, setSupportMode] = useState(false);
  const [cancelOrderStep, setCancelOrderStep] = useState(0); // 0: initial, 1: enter order ID, 2: confirmed
  const [clickedOptions, setClickedOptions] = useState([]);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    if (supportMode) {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Thank you for your message. Our support team will contact you soon." }
      ]);
      setInputEnabled(false);
      setSupportMode(false);
      setStep(2);
    } else if (step === 4 && cancelOrderStep === 1) {
      // Process order ID for cancellation
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: `Order #${input} cancellation is in process. You will be updated with refund details shortly.` }
      ]);
      setInputEnabled(false);
      setCancelOrderStep(2);
      setStep(2);
    } else if (step === 1) {
      processOrderInput(input.trim());
    }
    setInput("");
  };

  const handleOptionClick = (option) => {
    // Add this option to clicked options to disable it
    setClickedOptions(prev => [...prev, option]);
    
    setMessages((msgs) => [...msgs, { from: "user", text: option }]);
    if (step === 0) {
      if (option === "Place an Order") {
        setMessages((msgs) => [
          ...msgs,
          { from: "bot", text: `What type of pizza would you like?`, options: pizzaTypes }
        ]);
        setStep(1);
        setOrderStep(0);
        setInputEnabled(false);
      } else if (option === "Contact Support") {
        setMessages((msgs) => [
          ...msgs,
          { from: "bot", text: "Please describe your issue. Our support team will get back to you." }
        ]);
        setInputEnabled(true);
        setSupportMode(true);
        setStep(2);
      } else if (option === "Cancel Order") {
        setMessages((msgs) => [
          ...msgs,
          { from: "bot", text: "Are you sure you want to cancel your order?", options: ["Yes, cancel my order", "No, go back"] }
        ]);
        setStep(4);
      }
    } else if (step === 1) {
      if (orderStep === 0 && pizzaTypes.includes(option)) {
        setOrder((o) => ({ ...o, type: option }));
        setMessages((msgs) => [
          ...msgs,
          { from: "bot", text: `Great choice! What size would you like?`, options: sizes }
        ]);
        setOrderStep(1);
      } else if (orderStep === 1 && sizes.includes(option)) {
        setOrder((o) => ({ ...o, size: option }));
        setMessages((msgs) => [
          ...msgs,
          { from: "bot", text: `Would you like any extra toppings?`, options: [...toppings, "No"] }
        ]);
        setOrderStep(2);
      } else if (orderStep === 2) {
        if (option === "No") {
          setOrder((o) => ({ ...o, toppings: [] }));
          confirmOrder(order.type, order.size, []);
        } else {
          setOrder((o) => ({ ...o, toppings: [option] }));
          confirmOrder(order.type, order.size, [option]);
        }
        setOrderStep(3);
      } else if (orderStep === 3) {
        if (option.toLowerCase() === "yes") {
          setMessages((msgs) => [
            ...msgs,
            { from: "bot", text: "Your order has been placed! Thank you! 🍕" }
          ]);
        } else {
          setMessages((msgs) => [
            ...msgs,
            { from: "bot", text: "Order cancelled. If you'd like to start over, refresh the page." }
          ]);
        }
        setStep(2);
        setInputEnabled(false);
      }
    } else if (step === 4) {
      if (option === "Yes, cancel my order") {
        setMessages((msgs) => [
          ...msgs,
          { from: "bot", text: "Please enter your order ID to proceed with cancellation:" }
        ]);
        setCancelOrderStep(1);
        setInputEnabled(true);
      } else if (option === "No, go back") {
        setMessages((msgs) => [
          ...msgs,
          { from: "bot", text: "Welcome back! How can I help you today?", options: ["Place an Order", "Contact Support", "Cancel Order"] }
        ]);
        setStep(0);
        // Reset clicked options when going back to main menu
        setClickedOptions([]);
      }
    }
  };

  const processOrderInput = (text) => {
    // Not used in new flow, but kept for fallback
  };

  const confirmOrder = (type, size, toppingsList) => {
    setMessages((msgs) => [
      ...msgs,
      {
        from: "bot",
        text: `You ordered a ${size} ${type} pizza${toppingsList.length ? " with " + toppingsList.join(", ") : ""}.\nConfirm order?`,
        options: ["Yes", "No"]
      }
    ]);
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`msg ${msg.from}`}>
            <div>{msg.text}</div>
            {msg.options && (
              <div className="options-row">
                {msg.options.map((opt, i) => (
                  <button
                    key={i}
                    className="option-btn"
                    onClick={() => handleOptionClick(opt)}
                    disabled={step === 2 || (step === 4 && cancelOrderStep !== 0) || clickedOptions.includes(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {inputEnabled && (
        <form className="input-area" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={supportMode ? "Type your complaint here..." : "Type here..."}
            disabled={!inputEnabled}
            className="chat-input"
          />
          <button type="submit" className="send-btn">Send</button>
        </form>
      )}
    </div>
  );
}

export default Chatbot;