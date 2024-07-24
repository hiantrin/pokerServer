export function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = [
      '2', '3', '4', '5', '6', '7', '8', '9', '10',
      'J', 'Q', 'K', 'A'
    ];
    const deck = [];
  
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value, color: "black" });
        deck.push({ suit, value, color: "red" });
      }
    }
    return deck;
  }
  
  export function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
  
  export function dealCards(deck, numPlayers) {
    const players = Array.from({ length: numPlayers }, () => ({
      hand: []
    }));
  
    for (let i = 0; i < numPlayers; i++) {
      players[i].hand.push(deck.pop(), deck.pop());
    }
  
    return players;
}

export function dealCommunityCards(deck) {
  const communityCards = [];

  for (let i = 0; i < 5; i++) {
    communityCards.push(deck.pop());
  }

  return communityCards;
}