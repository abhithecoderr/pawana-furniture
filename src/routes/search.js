import express from "express";
import FurnitureItem from "../models/FurnitureItem.js";
import FurnitureSet from "../models/FurnitureSet.js";

const router = express.Router();

// Helper function to create search conditions for multi-word queries
function buildSearchQuery(query) {
  const trimmedQuery = query.trim();
  const words = trimmedQuery.split(/\s+/).filter(word => word.length > 0);

  if (words.length === 0) {
    return null;
  }

  // If single word, use simple regex
  if (words.length === 1) {
    const searchRegex = new RegExp(words[0], "i");
    return {
      $or: [
        { name: searchRegex },
        { code: searchRegex },
        { style: searchRegex },
        { type: searchRegex },
        { room: searchRegex }
      ]
    };
  }

  // For multi-word queries, create conditions that match ANY word in ANY field
  // This allows "royal bed" to match items where style is "Royal" AND type is "Bed"
  const wordConditions = words.map(word => {
    const wordRegex = new RegExp(word, "i");
    return {
      $or: [
        { name: wordRegex },
        { code: wordRegex },
        { style: wordRegex },
        { type: wordRegex },
        { room: wordRegex }
      ]
    };
  });

  // Match items that contain ALL words (across any fields)
  return { $and: wordConditions };
}

// Helper function to build search query for sets (no 'type' field)
function buildSetSearchQuery(query) {
  const trimmedQuery = query.trim();
  const words = trimmedQuery.split(/\s+/).filter(word => word.length > 0);

  if (words.length === 0) {
    return null;
  }

  if (words.length === 1) {
    const searchRegex = new RegExp(words[0], "i");
    return {
      $or: [
        { name: searchRegex },
        { code: searchRegex },
        { style: searchRegex },
        { room: searchRegex }
      ]
    };
  }

  const wordConditions = words.map(word => {
    const wordRegex = new RegExp(word, "i");
    return {
      $or: [
        { name: wordRegex },
        { code: wordRegex },
        { style: wordRegex },
        { room: wordRegex }
      ]
    };
  });

  return { $and: wordConditions };
}

// Helper to score results by relevance
function scoreResult(item, words) {
  let score = 0;
  const itemName = (item.name || "").toLowerCase();
  const itemCode = (item.code || "").toLowerCase();
  const itemStyle = (item.style || "").toLowerCase();
  const itemType = (item.type || "").toLowerCase();
  const itemRoom = (item.room || "").toLowerCase();

  words.forEach(word => {
    const lowerWord = word.toLowerCase();
    // Name matches are most valuable
    if (itemName.includes(lowerWord)) score += 10;
    // Exact style match
    if (itemStyle === lowerWord) score += 8;
    if (itemStyle.includes(lowerWord)) score += 5;
    // Exact type match
    if (itemType === lowerWord) score += 8;
    if (itemType.includes(lowerWord)) score += 5;
    // Code match
    if (itemCode.includes(lowerWord)) score += 3;
    // Room match
    if (itemRoom.includes(lowerWord)) score += 2;
  });

  return score;
}

// GET /api/search?q=<query> - Search items and sets
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({ items: [], sets: [] });
    }

    const words = q.trim().split(/\s+/).filter(word => word.length > 0);

    // Build queries
    const itemQuery = buildSearchQuery(q);
    const setQuery = buildSetSearchQuery(q);

    if (!itemQuery || !setQuery) {
      return res.json({ items: [], sets: [] });
    }

    // Search items
    let items = await FurnitureItem.find(itemQuery)
      .limit(30)
      .select("name slug code style type room images")
      .lean();

    // Search sets
    let sets = await FurnitureSet.find(setQuery)
      .limit(30)
      .select("name slug code style room images")
      .lean();

    // Score and sort results by relevance
    items = items.map(item => ({
      ...item,
      _score: scoreResult(item, words)
    })).sort((a, b) => b._score - a._score).slice(0, 20);

    sets = sets.map(set => ({
      ...set,
      _score: scoreResult(set, words)
    })).sort((a, b) => b._score - a._score).slice(0, 20);

    // Remove score from response
    items = items.map(({ _score, ...item }) => item);
    sets = sets.map(({ _score, ...set }) => set);

    res.json({ items, sets });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
