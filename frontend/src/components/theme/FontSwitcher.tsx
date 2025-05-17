'use client';

import { useState, useEffect } from 'react';

type FontOption = {
  name: string;
  variable: string;
};

const fontOptions: FontOption[] = [
  { name: 'Bungee Shade', variable: '--font-bungee-shade' },
  { name: 'Rubik Bubbles', variable: '--font-rubik-bubbles' },
  { name: 'Creepster', variable: '--font-creepster' },
  { name: 'Faster One', variable: '--font-faster-one' },
  { name: 'Henny Penny', variable: '--font-henny-penny' },
];

export default function FontSwitcher() {
  const [currentFont, setCurrentFont] = useState<string>('--font-bungee-shade');

  const handleFontChange = (variable: string) => {
    document.documentElement.style.setProperty('--font-heading', `var(${variable})`);
    setCurrentFont(variable);
    
    // Save the font preference to localStorage
    localStorage.setItem('preferred-font', variable);
  };

  // Load the saved font preference on component mount
  useEffect(() => {
    const savedFont = localStorage.getItem('preferred-font');
    if (savedFont) {
      document.documentElement.style.setProperty('--font-heading', `var(${savedFont})`);
      setCurrentFont(savedFont);
    }
  }, []);

  return (
    <div className="flex flex-col">
      <div className="mb-2 text-sm">Heading Font:</div>
      <div className="flex flex-wrap gap-2">
        {fontOptions.map((font) => (
          <button
            key={font.variable}
            onClick={() => handleFontChange(font.variable)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              currentFont === font.variable
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
            style={{ fontFamily: `var(${font.variable})` }}
          >
            {font.name}
          </button>
        ))}
      </div>
    </div>
  );
}
