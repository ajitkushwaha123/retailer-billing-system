export function calculateDemand(baseScore, productTags, activeSignals) {
  let score = baseScore;

  for (const tag of productTags) {
    if (activeSignals.includes(tag)) {
      score += 15;
    }
  }

  let level = "LOW";
  if (score >= 85) level = "HIGH";
  else if (score >= 65) level = "MEDIUM";

  return { score, level };
}
