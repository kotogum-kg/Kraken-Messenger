import React, { useState } from 'react';

const stickerPacks = [
  {
    category: 'Smile Pack',
    stickers: [
      { id: 1, src: '/stickers/smile1.png', animation: true },
      { id: 2, src: '/stickers/smile2.png', animation: false },
    ],
  },
  {
    category: 'Reaction Pack',
    stickers: [
      { id: 3, src: '/stickers/reaction1.png', animation: true },
      { id: 4, src: '/stickers/reaction2.png', animation: true },
    ],
  },
  {
    category: 'Love Pack',
    stickers: [
      { id: 5, src: '/stickers/love1.png', animation: false },
      { id: 6, src: '/stickers/love2.png', animation: true },
    ],
  },
];

const StickerPicker = () => {
  const [selectedSticker, setSelectedSticker] = useState(null);

  const handleStickerClick = (sticker) => {
    setSelectedSticker(sticker.id);
  };

  return (
    <div className="sticker-picker">
      {stickerPacks.map((pack) => (
        <div key={pack.category} className="sticker-pack">
          <h3>{pack.category}</h3>
          <div className="stickers">
            {pack.stickers.map((sticker) => (
              <div
                key={sticker.id}
                className={`sticker ${selectedSticker === sticker.id ? 'selected' : ''}`}
                onClick={() => handleStickerClick(sticker)}
              >
                <img src={sticker.src} alt={`Sticker ${sticker.id}`} />
                {sticker.animation && <span className="badge">✨</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StickerPicker;