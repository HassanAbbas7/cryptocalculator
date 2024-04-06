import React from 'react';

function Linkify({ text }) {
  // A simple linkification function that could be improved with better URL detection
  function linkify(inputText) {
    return inputText.split(' ').map((word, i) => {
      // A very basic regexp pattern to detect URLs, need improvement for advanced cases
      const pattern = /(http|https):\/\/\S+/gi;
      const isUrl = pattern.test(word);

      return isUrl ? (
        <a key={i} href={word} target="_blank" rel="noopener noreferrer">
          {word}
        </a>
      ) : (
        word
      );
    }).reduce((acc, elem) => {
      return acc === null ? [elem] : [...acc, ' ', elem];
    }, null);
  }

  return (
    <div>
      {linkify(text)}
    </div>
  );
}

export default Linkify;