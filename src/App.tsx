import React, { useState, useCallback } from 'react';
import { AbstractCanvas } from './components/AbstractCanvas';
import { StarField } from './components/StarField';
import { QuoteDisplay } from './components/QuoteDisplay';

const quotes = [
  "What mysteries lie in the spaces between thoughts?",
  "How does consciousness emerge from complexity?",
  "Where do ideas go when they're forgotten?",
  "Can beauty be measured in mathematical terms?",
  "What shapes the rhythm of our universe?",
];

function App() {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  const handleAnimationChange = useCallback(() => {
    const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(newQuote);
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <StarField />
      <AbstractCanvas onAnimationChange={handleAnimationChange} />
      <QuoteDisplay quote={currentQuote} />
    </div>
  );
}

export default App;