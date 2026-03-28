import React from 'react';
import styled from 'styled-components';
import { COLORS, SPACING, FONT_SIZES } from '../theme/constants';

const ReactionBarContainer = styled.div`  
  display: flex;
  align-items: center;
  padding: ${SPACING.small};
  background-color: ${COLORS.background};
`;

const Badge = styled.span`  
  background-color: ${COLORS.primary};
  color: white;
  border-radius: 12px;
  padding: ${SPACING.xsmall} ${SPACING.small};
  margin-right: ${SPACING.small};
  font-size: ${FONT_SIZES.medium};
`;

const EmojiButton = styled.button`  
  background: none;
  border: none;
  font-size: ${FONT_SIZES.large};
  cursor: pointer;
  margin-right: ${SPACING.small};

  &:hover { 
    transform: scale(1.2);
  }
`;

const ReactionBar = ({ existingReactions, onAddReaction }) => {
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  return ( 
    <ReactionBarContainer>
      {existingReactions.map((reaction, index) => (
        <Badge key={index}>{reaction}</Badge>
      ))}
      {emojis.map((emoji, index) => (
        <EmojiButton key={index} onClick={() => onAddReaction(emoji)}>{emoji}</EmojiButton>
      ))}
    </ReactionBarContainer>
  );
};

export default ReactionBar;