import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_PREFIX = 'momoi_mom_avatar_v1:';

export const SKIN_TONES = [
  {
    id: 'ivory',
    label: 'Sáng hồng',
    base: 'rgb(252, 224, 208)',
    shadow: 'rgb(235, 193, 173)',
    ear: 'rgb(244, 206, 188)',
    blush: 'rgba(232, 122, 138, 0.34)',
  },
  {
    id: 'peach',
    label: 'Tự nhiên ấm',
    base: 'rgb(245, 208, 184)',
    shadow: 'rgb(224, 176, 149)',
    ear: 'rgb(235, 190, 164)',
    blush: 'rgba(224, 114, 126, 0.32)',
  },
  {
    id: 'honey',
    label: 'Bánh mật',
    base: 'rgb(227, 182, 150)',
    shadow: 'rgb(201, 150, 118)',
    ear: 'rgb(214, 165, 133)',
    blush: 'rgba(209, 98, 110, 0.3)',
  },
];

export const HAIR_STYLES = [
  { id: 'bun', label: 'Tóc búi gọn' },
  { id: 'waves', label: 'Uốn sóng mềm' },
  { id: 'bob', label: 'Ngắn ngang vai' },
  { id: 'halfup', label: 'Buộc nửa đầu' },
  { id: 'ponytail', label: 'Cột thấp lệch' },
];

export const HAIR_COLORS = [
  {
    id: 'espresso',
    label: 'Đen tự nhiên',
    main: 'rgb(40, 31, 36)',
    highlight: 'rgb(78, 62, 70)',
    swatch: 'rgb(40, 31, 36)',
  },
  {
    id: 'chestnut',
    label: 'Nâu hạt dẻ',
    main: 'rgb(88, 54, 44)',
    highlight: 'rgb(128, 84, 70)',
    swatch: 'rgb(88, 54, 44)',
  },
  {
    id: 'mocha',
    label: 'Nâu trà trầm',
    main: 'rgb(114, 80, 64)',
    highlight: 'rgb(152, 112, 92)',
    swatch: 'rgb(114, 80, 64)',
  },
];

export const EARRINGS_OPTIONS = [
  { id: 'pearl_stud', label: 'Nụ ngọc trai' },
  { id: 'gold_hoop', label: 'Khuyên tròn vàng' },
  { id: 'floral_drop', label: 'Hoa sứ thả' },
  { id: 'heart_drop', label: 'Khuyên tim mảnh' },
  { id: 'jade_stud', label: 'Nụ ngọc bích' },
  { id: 'none', label: 'Không đeo' },
];

export const NECKLACE_OPTIONS = [
  { id: 'pearl_pendant', label: 'Ngọc trai đơn' },
  { id: 'gold_heart', label: 'Dây tim vàng' },
  { id: 'clover', label: 'Cỏ bốn lá' },
  { id: 'jade_drop', label: 'Ngọc bích bình an' },
  { id: 'pearl_strand', label: 'Chuỗi ngọc trai' },
  { id: 'none', label: 'Không đeo' },
];

export const ACCESSORY_OPTIONS = [
  { id: 'hair_clip', label: 'Kẹp hoa sứ' },
  { id: 'pearl_pin', label: 'Kẹp ngọc trai' },
  { id: 'headband', label: 'Băng đô lụa' },
  { id: 'round_glasses', label: 'Kính gọng tròn' },
  { id: 'none', label: 'Không dùng' },
];

export const OUTFIT_STYLES = [
  { id: 'cardigan', label: 'Áo cardigan mềm' },
  { id: 'wrapdress', label: 'Đầm cổ tim' },
  { id: 'blouse', label: 'Áo cổ sen' },
  { id: 'sweater', label: 'Áo len ấm' },
];

export const OUTFIT_TONES = [
  {
    id: 'theme',
    label: 'Theo màu giao diện',
    fill: 'rgb(var(--c-brand))',
    soft: 'rgb(var(--c-brand-soft))',
  },
  {
    id: 'sage',
    label: 'Xanh bơ dịu',
    fill: 'rgb(96, 142, 120)',
    soft: 'rgb(218, 235, 226)',
  },
  {
    id: 'butter',
    label: 'Kem nắng sớm',
    fill: 'rgb(208, 154, 84)',
    soft: 'rgb(248, 234, 206)',
  },
  {
    id: 'berry',
    label: 'Hồng mận ấm',
    fill: 'rgb(162, 76, 98)',
    soft: 'rgb(245, 220, 227)',
  },
];

export const EXPRESSION_OPTIONS = [
  { id: 'auto', label: 'Theo tâm trạng hôm nay' },
  { id: 'happy', label: 'Tươi tắn' },
  { id: 'calm', label: 'Dịu dàng' },
  { id: 'tired', label: 'Thư thái nghỉ ngơi' },
];

export const DEFAULT_MOM_AVATAR = Object.freeze({
  skinTone: 'ivory',
  hairStyle: 'bun',
  hairColor: 'espresso',
  earrings: 'pearl_stud',
  necklace: 'pearl_pendant',
  accessory: 'hair_clip',
  outfit: 'cardigan',
  outfitTone: 'theme',
  expression: 'auto',
});

const VALID_SETS = {
  skinTone: new Set(SKIN_TONES.map((x) => x.id)),
  hairStyle: new Set(HAIR_STYLES.map((x) => x.id)),
  hairColor: new Set(HAIR_COLORS.map((x) => x.id)),
  earrings: new Set(EARRINGS_OPTIONS.map((x) => x.id)),
  necklace: new Set(NECKLACE_OPTIONS.map((x) => x.id)),
  accessory: new Set(ACCESSORY_OPTIONS.map((x) => x.id)),
  outfit: new Set(OUTFIT_STYLES.map((x) => x.id)),
  outfitTone: new Set(OUTFIT_TONES.map((x) => x.id)),
  expression: new Set(EXPRESSION_OPTIONS.map((x) => x.id)),
};

export function resolveMomUserKey(user) {
  if (!user || typeof user !== 'object') return 'guest';
  const raw =
    user.id ||
    user.userId ||
    user.email ||
    user.userName ||
    user.username ||
    user.phoneNumber ||
    'mom';
  return String(raw).trim().toLowerCase() || 'mom';
}

function sanitizeAvatarConfig(raw) {
  if (!raw || typeof raw !== 'object') return DEFAULT_MOM_AVATAR;
  const cleaned = {};
  let matchesDefault = true;
  Object.keys(DEFAULT_MOM_AVATAR).forEach((key) => {
    const val = raw[key];
    const valid = VALID_SETS[key].has(val) ? val : DEFAULT_MOM_AVATAR[key];
    cleaned[key] = valid;
    if (valid !== DEFAULT_MOM_AVATAR[key]) matchesDefault = false;
  });
  return matchesDefault ? DEFAULT_MOM_AVATAR : Object.freeze(cleaned);
}

const cacheByUser = new Map();
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readStoredAvatar(userKey) {
  if (cacheByUser.has(userKey)) {
    return cacheByUser.get(userKey);
  }
  let parsed = DEFAULT_MOM_AVATAR;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${userKey}`);
      if (raw) {
        parsed = sanitizeAvatarConfig(JSON.parse(raw));
      }
    } catch {
      parsed = DEFAULT_MOM_AVATAR;
    }
  }
  cacheByUser.set(userKey, parsed);
  return parsed;
}

export function setMomAvatarForUser(userKey, nextOrUpdater) {
  const key = userKey || 'guest';
  const prev = readStoredAvatar(key);
  const candidate =
    typeof nextOrUpdater === 'function'
      ? nextOrUpdater(prev)
      : { ...prev, ...nextOrUpdater };
  const sanitized = sanitizeAvatarConfig(candidate);
  cacheByUser.set(key, sanitized);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(sanitized));
    } catch {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  }
  notifyListeners();
  return sanitized;
}

function pickRandomItem(list, excludeId = null) {
  const pool = excludeId ? list.filter((x) => x.id !== excludeId) : list;
  const arr = pool.length > 0 ? pool : list;
  return arr[Math.floor(Math.random() * arr.length)].id;
}

export function createRandomMomAvatar(current = DEFAULT_MOM_AVATAR) {
  const wearableEarrings = EARRINGS_OPTIONS.filter((x) => x.id !== 'none');
  const wearableNecklaces = NECKLACE_OPTIONS.filter((x) => x.id !== 'none');
  return sanitizeAvatarConfig({
    skinTone: current.skinTone || DEFAULT_MOM_AVATAR.skinTone,
    hairStyle: pickRandomItem(HAIR_STYLES, current.hairStyle),
    hairColor: pickRandomItem(HAIR_COLORS),
    earrings: pickRandomItem(wearableEarrings, current.earrings),
    necklace: pickRandomItem(wearableNecklaces, current.necklace),
    accessory: pickRandomItem(ACCESSORY_OPTIONS, current.accessory),
    outfit: pickRandomItem(OUTFIT_STYLES, current.outfit),
    outfitTone: pickRandomItem(OUTFIT_TONES),
    expression: current.expression || 'auto',
  });
}

export function getAvatarSummaryText(config = DEFAULT_MOM_AVATAR) {
  const earring = EARRINGS_OPTIONS.find((x) => x.id === config.earrings);
  const necklace = NECKLACE_OPTIONS.find((x) => x.id === config.necklace);
  const hair = HAIR_STYLES.find((x) => x.id === config.hairStyle);
  const parts = [];
  if (hair) parts.push(hair.label);
  if (earring && earring.id !== 'none') parts.push(earring.label.toLowerCase());
  if (necklace && necklace.id !== 'none') parts.push(necklace.label.toLowerCase());
  return parts.join(' · ');
}

export function useMomAvatar(user) {
  const userKey = resolveMomUserKey(user);

  const getSnapshot = useCallback(() => readStoredAvatar(userKey), [userKey]);
  const getServerSnapshot = useCallback(() => DEFAULT_MOM_AVATAR, []);

  const avatar = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateAvatar = useCallback(
    (patchOrUpdater) => setMomAvatarForUser(userKey, patchOrUpdater),
    [userKey]
  );

  const resetAvatar = useCallback(
    () => setMomAvatarForUser(userKey, DEFAULT_MOM_AVATAR),
    [userKey]
  );

  const randomizeAvatar = useCallback(
    () => setMomAvatarForUser(userKey, (prev) => createRandomMomAvatar(prev)),
    [userKey]
  );

  return {
    avatar,
    updateAvatar,
    resetAvatar,
    randomizeAvatar,
  };
}
