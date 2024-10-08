function bestCombination(userHand, communityCards) {
    const allCards = [...userHand, ...communityCards];
    const ranks = getCardRanks(allCards);
    const suits = groupBy(allCards, 'suit');
  
    if (isRoyalFlush(suits)) return { type: "Royal Flush", ranks: [14, 13, 12, 11, 10] };
    if (isStraightFlush(suits)) return { type: "Straight Flush", ranks: getStraightFlushRanks(suits) };
    if (isFourOfAKind(ranks)) return { type: "Four of a Kind", ranks: getFourOfAKindRanks(ranks) };
    if (isFullHouse(ranks)) return { type: "Full House", ranks: getFullHouseRanks(ranks) };
    if (isFlush(suits)) return { type: "Flush", ranks: getFlushRanks(suits) };
    if (isStraight(ranks)) return { type: "Straight", ranks: getStraightRanks(ranks) };
    if (isThreeOfAKind(ranks)) return { type: "Three of a Kind", ranks: getThreeOfAKindRanks(ranks) };
    if (isTwoPair(ranks)) return { type: "Two Pair", ranks: getTwoPairRanks(ranks) };
    if (isOnePair(ranks)) return { type: "One Pair", ranks: getOnePairRanks(ranks) };
  
    return { type: "High Card", ranks: ranks.slice(-5).reverse() };
  }
  
  function getCardRanks(cards) {
    const rankMap = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return cards.map(card => rankMap[card.value]).sort((a, b) => a - b);
  }
  
  function groupBy(cards, key) {
    return cards.reduce((acc, card) => {
      const groupKey = card[key];
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(card);
      return acc;
    }, {});
  }
  
  function isStraight(ranks) {
    const uniqueRanks = [...new Set(ranks)];
    if (uniqueRanks.length < 5) return false;
  
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) return true;
    }
  
    return uniqueRanks.includes(14) && // Check for Ace-low straight (5-high straight)
           uniqueRanks.slice(0, 4).every((rank, idx) => rank === 2 + idx);
  }
  
  function getStraightRanks(ranks) {
    const uniqueRanks = [...new Set(ranks)];
    for (let i = uniqueRanks.length - 5; i >= 0; i--) {
      if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) return uniqueRanks.slice(i, i + 5);
    }
    return [5, 4, 3, 2, 14]; // Ace-low straight
  }
  
  function isFlush(suits) {
    return Object.values(suits).some(group => group.length >= 5);
  }
  
  function getFlushRanks(suits) {
    const flushSuit = Object.values(suits).find(group => group.length >= 5);
    return getCardRanks(flushSuit).slice(-5).reverse();
  }
  
  function isStraightFlush(suits) {
    return Object.values(suits).some(suitCards => {
      if (suitCards.length < 5) return false;
      const suitRanks = getCardRanks(suitCards);
      return isStraight(suitRanks);
    });
  }
  
  function getStraightFlushRanks(suits) {
    const flushSuit = Object.values(suits).find(suitCards => {
      const suitRanks = getCardRanks(suitCards);
      return isStraight(suitRanks);
    });
    return getStraightRanks(getCardRanks(flushSuit));
  }
  
  function isRoyalFlush(suits) {
    const royalRanks = [10, 11, 12, 13, 14]; // 10, J, Q, K, A
    return Object.values(suits).some(suitCards => {
      const suitRanks = getCardRanks(suitCards);
      return royalRanks.every(rank => suitRanks.includes(rank));
    });
  }
  
  function isFourOfAKind(ranks) {
    const counts = ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});
    return Object.values(counts).includes(4);
  }
  
  function getFourOfAKindRanks(ranks) {
    const counts = ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});
    const fourRank = parseInt(Object.keys(counts).find(key => counts[key] === 4));
    const kicker = Math.max(...ranks.filter(rank => rank !== fourRank));
    return [fourRank, fourRank, fourRank, fourRank, kicker];
  }
  
  function isFullHouse(ranks) {
    const counts = ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});
    const values = Object.values(counts);
    return values.includes(3) && values.filter(count => count >= 2).length >= 2;
  }
  
  function getFullHouseRanks(ranks) {
    const counts = ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});
    const threeRank = parseInt(Object.keys(counts).find(key => counts[key] === 3));
    const pairRank = Math.max(...Object.keys(counts).filter(key => counts[key] >= 2 && key != threeRank).map(Number));
    return [threeRank, threeRank, threeRank, pairRank, pairRank];
  }
  
  function isThreeOfAKind(ranks) {
    const counts = ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});
    return Object.values(counts).includes(3);
  }
  
  function getThreeOfAKindRanks(ranks) {
    const counts = ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});
    const threeRank = parseInt(Object.keys(counts).find(key => counts[key] === 3));
    const kickers = ranks.filter(rank => rank !== threeRank).slice(-2).reverse();
    return [threeRank, threeRank, threeRank, ...kickers];
  }
  
  function isTwoPair(ranks) {
    const counts = ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});
    const pairs = Object.keys(counts).filter(key => counts[key] === 2).map(Number);
    return pairs.length >= 2;
  }
  
  function getTwoPairRanks(ranks) {
    const counts = ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});
    const pairs = Object.keys(counts).filter(key => counts[key] === 2).map(Number).sort((a, b) => b - a).slice(0, 2);
    const kicker = Math.max(...ranks.filter(rank => !pairs.includes(rank)));
    return [...pairs, ...pairs, kicker];
  }
  
  function isOnePair(ranks) {
    const counts = ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});
    return Object.values(counts).includes(2);
  }
  
  function getOnePairRanks(ranks) {
    const counts = ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});
    const pairRank = parseInt(Object.keys(counts).find(key => counts[key] === 2));
    const kickers = ranks.filter(rank => rank !== pairRank).slice(-3).reverse();
    return [pairRank, pairRank, ...kickers];
  }
  
  // Define the hand rankings in an array for easy comparison
  const handRankings = [
    "High Card",
    "One Pair",
    "Two Pair",
    "Three of a Kind",
    "Straight",
    "Flush",
    "Full House",
    "Four of a Kind",
    "Straight Flush",
    "Royal Flush"
  ];
  
  // Function to get the rank index of a hand
  function getHandRankIndex(handType) {
    return handRankings.indexOf(handType);
  }
  
  // Compare two hands and determine the winner
  function compareHands(hand1, hand2) {
    const rankComparison = getHandRankIndex(hand1.type) - getHandRankIndex(hand2.type);
    if (rankComparison !== 0) return rankComparison;
    // Compare the individual card ranks if the hand types are the same
    for (let i = 0; i < hand1.ranks.length; i++) {
      if (hand1.ranks[i] !== hand2.ranks[i]) {
        return hand1.ranks[i] - hand2.ranks[i];
      }
    }
    return 0; // Hands are identical
  }
  
  // Function to determine the users with the best combination
  export function getBestHandPlayers(players, communityCards) {
    let bestHands = [];
    let bestHand = null;
    let winningCombination = null;
    let winningCommunityCards = [];
  
    players.forEach(player => {
      const { userId, currentCards } = player;
      const currentHand = bestCombination(currentCards, communityCards);
  
      if (!bestHand || compareHands(currentHand, bestHand) > 0) {
        bestHand = currentHand;
        bestHands = [{ userId, hand: currentHand }];
        winningCombination = currentHand.type;
  
        // Extract the exact community cards that form the winning combination
        winningCommunityCards = extractWinningCommunityCards(currentHand, currentCards, communityCards);
      } else if (compareHands(currentHand, bestHand) === 0) {
        bestHands.push({ userId, hand: currentHand });
      }
    });
  
    return {
      winningPlayers: bestHands.map(player => player.userId),
      winningCombination,
      winningCommunityCards, // Exact community cards that form the winning combination
    };
  }
  
  // Helper function to extract the community cards that make the combination
  function extractWinningCommunityCards(currentHand, playerHand, communityCards) {
    const bestHandRanks = currentHand.ranks;
    const communityCardRanks = communityCards.map(card => getCardRank(card));
  
    // Extract the exact cards from community cards that make up the winning combination
    const winningCommunityCards = [];
    
    bestHandRanks.forEach(rank => {
      for (let i = 0; i < communityCards.length; i++) {
        if (
          communityCardRanks[i] === rank &&
          !winningCommunityCards.includes(communityCards[i])
        ) {
          winningCommunityCards.push(communityCards[i]);
          break;
        }
      }
    });
  
    return winningCommunityCards; // Return all relevant community cards that make up the combination
  }
  
  function getCardRank(card) {
    const rankMap = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
      '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return rankMap[card.value];
  }