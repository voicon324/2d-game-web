/**
 * Unit Tests for ELO Rating Calculation Functions
 * 
 * Tests the ELO algorithm used in matchmaking for rating updates
 */

import { calculateNewRating } from '../src/websocket/matchmakingHandler.js';

describe('ELO Rating Calculation', () => {
  describe('calculateNewRating', () => {
    const K_FACTOR = 32; // Standard K-factor used in the system

    test('winner gains rating when beating equally rated opponent', () => {
      const winnerRating = 1000;
      const loserRating = 1000;
      const newRating = calculateNewRating(winnerRating, loserRating, 1);
      
      // Winner should gain ~16 points (K/2)
      expect(newRating).toBeGreaterThan(winnerRating);
      expect(newRating).toBe(1016); // 1000 + 32 * (1 - 0.5) = 1016
    });

    test('loser loses rating when losing to equally rated opponent', () => {
      const winnerRating = 1000;
      const loserRating = 1000;
      const newRating = calculateNewRating(loserRating, winnerRating, 0);
      
      // Loser should lose ~16 points
      expect(newRating).toBeLessThan(loserRating);
      expect(newRating).toBe(984); // 1000 + 32 * (0 - 0.5) = 984
    });

    test('underdog gains more rating when winning', () => {
      const underdogRating = 1000;
      const favoriteRating = 1200;
      const newRating = calculateNewRating(underdogRating, favoriteRating, 1);
      
      // Underdog expected score is ~0.24, so gains ~24 points
      expect(newRating).toBeGreaterThan(underdogRating + 16);
      expect(newRating).toBeLessThanOrEqual(underdogRating + K_FACTOR);
    });

    test('favorite gains less rating when winning', () => {
      const favoriteRating = 1200;
      const underdogRating = 1000;
      const newRating = calculateNewRating(favoriteRating, underdogRating, 1);
      
      // Favorite expected score is ~0.76, so only gains ~8 points
      expect(newRating).toBeGreaterThan(favoriteRating);
      expect(newRating).toBeLessThan(favoriteRating + 16);
    });

    test('draw splits rating change evenly for equal players', () => {
      const player1Rating = 1000;
      const player2Rating = 1000;
      
      const newRating1 = calculateNewRating(player1Rating, player2Rating, 0.5);
      const newRating2 = calculateNewRating(player2Rating, player1Rating, 0.5);
      
      // No change for equal players in a draw
      expect(newRating1).toBe(1000);
      expect(newRating2).toBe(1000);
    });

    test('draw favors underdog slightly', () => {
      const underdogRating = 1000;
      const favoriteRating = 1200;
      
      const newUnderdog = calculateNewRating(underdogRating, favoriteRating, 0.5);
      const newFavorite = calculateNewRating(favoriteRating, underdogRating, 0.5);
      
      // Underdog gains points from draw, favorite loses
      expect(newUnderdog).toBeGreaterThan(underdogRating);
      expect(newFavorite).toBeLessThan(favoriteRating);
    });

    test('handles extreme rating differences', () => {
      const newbieRating = 800;
      const masterRating = 2000;
      
      // Newbie beats master
      const newNewbie = calculateNewRating(newbieRating, masterRating, 1);
      expect(newNewbie).toBeGreaterThan(newbieRating + 28); // Almost full K
      
      // Master beats newbie
      const newMaster = calculateNewRating(masterRating, newbieRating, 1);
      expect(newMaster).toBeLessThan(masterRating + 4); // Very small gain
    });

    test('rating is always an integer (rounded)', () => {
      const rating1 = 1050;
      const rating2 = 1103;
      
      const newRating = calculateNewRating(rating1, rating2, 1);
      expect(Number.isInteger(newRating)).toBe(true);
    });

    test('conserves total rating points between two players', () => {
      const rating1 = 1150;
      const rating2 = 1050;
      const totalBefore = rating1 + rating2;
      
      const new1 = calculateNewRating(rating1, rating2, 1);
      const new2 = calculateNewRating(rating2, rating1, 0);
      const totalAfter = new1 + new2;
      
      // Total should remain same (or very close due to rounding)
      expect(Math.abs(totalAfter - totalBefore)).toBeLessThanOrEqual(1);
    });
  });

  describe('ELO edge cases', () => {
    test('handles zero score correctly', () => {
      const rating = 1000;
      const opponentRating = 1000;
      const newRating = calculateNewRating(rating, opponentRating, 0);
      
      expect(newRating).toBeLessThan(rating);
    });

    test('handles perfect score correctly', () => {
      const rating = 1000;
      const opponentRating = 1000;
      const newRating = calculateNewRating(rating, opponentRating, 1);
      
      expect(newRating).toBeGreaterThan(rating);
    });

    test('works with very low ratings', () => {
      const lowRating = 100;
      const normalRating = 1000;
      
      const newLow = calculateNewRating(lowRating, normalRating, 1);
      expect(newLow).toBeGreaterThan(lowRating);
      expect(newLow).toBeLessThan(lowRating + 33);
    });

    test('works with very high ratings', () => {
      const highRating = 2500;
      const normalRating = 1000;
      
      const newHigh = calculateNewRating(highRating, normalRating, 1);
      // At this extreme difference, expected score is ~0.997, so gain is near 0
      expect(newHigh).toBeGreaterThanOrEqual(highRating);
      expect(newHigh).toBeLessThanOrEqual(highRating + 2);
    });
  });
});
