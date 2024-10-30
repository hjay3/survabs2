import React, { useEffect, useState } from 'react';

interface QuoteDisplayProps {
  quote: string;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [scale, setScale] = useState(1);
  const [displayedQuote, setDisplayedQuote] = useState(quote);
  const [hue, setHue] = useState(0);

  useEffect(() => {
    setIsVisible(false);
    setScale(0.95);
    setHue((prev) => (prev + 40) % 360);
    
    const timer = setTimeout(() => {
      setDisplayedQuote(quote);
      setIsVisible(true);
      setScale(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [quote]);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none z-10">
      <div 
        style={{
          transform: `scale(${scale})`,
          transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: `hsla(${hue}, 30%, 10%, 0.6)`,
          boxShadow: `0 0 50px hsla(${hue}, 50%, 20%, 0.4)`,
          borderColor: `hsla(${hue}, 50%, 50%, 0.3)`,
        }}
        className={`
          text-center p-8 rounded-xl
          backdrop-blur-md
          border-2
          max-w-4xl
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <p 
          style={{
            color: `hsla(${hue}, 20%, 90%, 0.9)`,
            textShadow: `0 0 20px hsla(${hue}, 50%, 50%, 0.4)`,
          }}
          className="text-3xl md:text-4xl font-light tracking-wide leading-relaxed"
        >
          {displayedQuote}
        </p>
      </div>
    </div>
  );
};