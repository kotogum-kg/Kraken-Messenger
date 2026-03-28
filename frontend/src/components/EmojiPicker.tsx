import React, { useState } from 'react';

const emojis = {
  standard: [
    { id: 'smile', symbol: '😄', category: 'Smileys' },
    { id: 'heart', symbol: '❤️', category: 'Smileys' },
    { id: 'thumbs_up', symbol: '👍', category: 'Smileys' },
  ],
  premium: [
    { id: 'unicorn', symbol: '🦄', category: 'Premium' },
    { id: 'trophy', symbol: '🏆', category: 'Premium' },
  ],
};

const EmojiPicker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  const filteredEmojis = Object.values(emojis).flat().filter((emoji) => {
    return emoji.symbol.includes(searchTerm) && (!category || emoji.category === category);
  });

  return (
    <div>
      <input 
        type="text" 
        placeholder="Search emojis..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="Smileys">Smileys</option>
        <option value="Premium">Premium</option>
      </select>
      <div>
        {filteredEmojis.map(emoji => (
          <span key={emoji.id} style={{ margin: '5px' }}>{emoji.symbol}</span>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
