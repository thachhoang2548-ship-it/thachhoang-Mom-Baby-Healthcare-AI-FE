export function getTierLevel(tier) {
  if (tier === 'SuperMomVip' || tier === 2 || tier === '2') return 2;
  if (tier === 'MomHienDai' || tier === 1 || tier === '1') return 1;
  return 0; // Free / 0
}

export function checkTierUnlocked(userTier, requiredTier) {
  const userLevel = getTierLevel(userTier);
  const requiredLevel = getTierLevel(requiredTier);
  return userLevel >= requiredLevel;
}

export function getTierNameVi(tier) {
  const level = getTierLevel(tier);
  if (level === 2) return 'Super Mom VIP 💎';
  if (level === 1) return 'Mẹ Hiện Đại ✨';
  return 'Mẹ Bầu Cơ Bản';
}
