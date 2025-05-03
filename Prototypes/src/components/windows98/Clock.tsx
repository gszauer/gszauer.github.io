import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Windows 98 style time format: "h:mm PM"
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    // Update immediately then set interval
    updateClock();
    const intervalId = setInterval(updateClock, 10000); // Update every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex items-center justify-center h-full px-2 border-l border-t border-gray-400 border-b border-r border-gray-800 text-sm">
      {time}
    </div>
  );
};

export default Clock;