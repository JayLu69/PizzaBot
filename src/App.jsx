import React, { useState } from "react";
import Chatbot from "./components/Chatbot";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <h1 className="title">🍕 PizzaBot</h1>
      <h2 className="subtitle">Your virtual pizza ordering assistant!</h2>
      
      <Chatbot />
    </div>
  );
}

export default App;