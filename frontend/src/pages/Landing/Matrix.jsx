import { useState,useEffect } from "react";
 export default function ScrambleTextPro() {
  const words = [
    "Start Smart Response",
    "Detect Incidents Instantly",
    "Auto Assign Teams",
    "Resolve Before Impact",
  ];

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";

  const [display, setDisplay] = useState("");
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    let iteration = 0;
    const word = words[wordIndex];

    const scramble = setInterval(() => {
      setDisplay(
        word
          .split("")
          .map((char, i) => {
            if (i < iteration) return word[i];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= word.length) {
        clearInterval(scramble);

        setTimeout(() => eraseText(), 1500);
      }

      iteration += 0.5;
    }, 30);

    const eraseText = () => {
      let eraseIndex = word.length;

      const erase = setInterval(() => {
        setDisplay(word.slice(0, eraseIndex));
        eraseIndex--;

        if (eraseIndex < 0) {
          clearInterval(erase);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }, 20);
    };

    return () => clearInterval(scramble);
  }, [wordIndex]);

  return (
    <span className="safespace-text font-bold tracking-wide">
  {display}
  <span className="animate-pulse">|</span>
</span>
  );
}