import { useState, useEffect } from 'react';

const AnimatedCounter = ({ value, duration = 1500, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const target = parseInt(value, 10);
    if (isNaN(target)) {
      setCount(value);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo easing function
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  // Handle case where value is not a number
  if (isNaN(parseInt(value, 10))) {
    return <span>{value}</span>;
  }

  return (
    <span>
      {prefix}{count}{suffix}
    </span>
  );
};

export default AnimatedCounter;
