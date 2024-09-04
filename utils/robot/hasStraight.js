export const  hasStraight = (communityCards, robotCards) =>  {
    const rankMap = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };

    // Combine community cards and robot cards
    const allCards = [...communityCards, ...robotCards];

    // Get the ranks of all cards
    const cardRanks = allCards.map(card => rankMap[card.value]);

    // Remove duplicates and sort the ranks in ascending order
    const uniqueSortedRanks = [...new Set(cardRanks)].sort((a, b) => a - b);

    // Check for a straight: consecutive sequence of 5 cards
    for (let i = 0; i <= uniqueSortedRanks.length - 5; i++) {
        if (uniqueSortedRanks[i + 4] - uniqueSortedRanks[i] === 4) {
            return true;
        }
    }

    // Special case: check for Ace-low straight (A, 2, 3, 4, 5)
    if (uniqueSortedRanks.includes(14) && uniqueSortedRanks.slice(0, 4).every((rank, index) => rank === 2 + index)) {
        return true;
    }

    return false;
}