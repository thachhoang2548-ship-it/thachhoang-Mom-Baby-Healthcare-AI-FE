import React from 'react';
import {
  DEFAULT_MOM_AVATAR,
  HAIR_COLORS,
  OUTFIT_TONES,
  SKIN_TONES,
} from '../../../hooks/useMomAvatar';

const LINE_INK = 'rgb(43, 32, 36)';
const GOLD_MAIN = 'rgb(224, 174, 82)';
const GOLD_DEEP = 'rgb(176, 126, 42)';
const PEARL_FILL = 'rgb(253, 250, 245)';
const PEARL_SHADE = 'rgb(226, 216, 206)';
const JADE_FILL = 'rgb(106, 178, 148)';
const JADE_LIGHT = 'rgb(190, 232, 212)';
const IVORY_FABRIC = 'rgb(252, 248, 243)';
const CORAL_LIP = 'rgb(206, 102, 112)';

function resolveTimePeriod(hourOverride) {
  const hour =
    typeof hourOverride === 'number' ? hourOverride : new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 18) return 'afternoon';
  return 'evening';
}

function resolveExpression(expressionSetting, moodLabel) {
  if (expressionSetting && expressionSetting !== 'auto') {
    return expressionSetting;
  }
  if (!moodLabel) return 'pleasant';
  const normalized = String(moodLabel).trim().toLowerCase();
  if (normalized.includes('vui') || normalized.includes('năng lượng')) return 'happy';
  if (normalized.includes('mệt')) return 'tired';
  if (normalized.includes('lo')) return 'worried';
  if (normalized.includes('dễ chịu') || normalized.includes('bình thường') || normalized.includes('ổn')) {
    return 'calm';
  }
  return 'pleasant';
}

export default function MomAvatar({
  config = DEFAULT_MOM_AVATAR,
  mood = '',
  variant = 'scene',
  className = '',
  hourOverride,
  label = 'Nhân vật minh họa của mẹ',
}) {
  const merged = { ...DEFAULT_MOM_AVATAR, ...(config || {}) };
  const skin = SKIN_TONES.find((s) => s.id === merged.skinTone) || SKIN_TONES[0];
  const hair = HAIR_COLORS.find((h) => h.id === merged.hairColor) || HAIR_COLORS[0];
  const outfitTone =
    OUTFIT_TONES.find((o) => o.id === merged.outfitTone) || OUTFIT_TONES[0];
  const expression = resolveExpression(merged.expression, mood);
  const period = resolveTimePeriod(hourOverride);
  const isBadge = variant === 'badge';

  const renderAmbientBackdrop = () => {
    if (isBadge) {
      return (
        <g>
          <rect x="30" y="18" width="180" height="184" fill="rgb(var(--c-brand-soft))" />
          <circle
            cx="120"
            cy="114"
            r="74"
            fill="rgb(var(--c-surface))"
            fillOpacity="0.62"
          />
        </g>
      );
    }

    return (
      <g>
        <rect x="0" y="0" width="240" height="240" fill="rgb(var(--c-brand-soft))" />
        {/* Khung vòm cửa sổ sáng dịu phía sau lưng mẹ */}
        <path
          d="M 40 240 L 40 104 C 40 50, 200 50, 200 104 L 200 240 Z"
          fill="rgb(var(--c-surface))"
          fillOpacity="0.68"
          stroke="rgb(var(--c-line))"
          strokeWidth="1.5"
        />
        <circle
          cx="120"
          cy="112"
          r="62"
          fill="rgb(var(--c-brand))"
          fillOpacity="0.08"
        />

        {period === 'morning' && (
          <g aria-hidden="true">
            <circle cx="182" cy="48" r="13" fill="rgb(240, 186, 102)" fillOpacity="0.88" />
            <circle cx="182" cy="48" r="19" fill="rgb(240, 186, 102)" fillOpacity="0.22" />
          </g>
        )}

        {period === 'afternoon' && (
          <g aria-hidden="true">
            <path
              d="M 166 52 C 166 45, 175 43, 179 47 C 183 42, 194 44, 194 52 C 198 52, 200 58, 195 60 L 165 60 C 160 58, 162 52, 166 52 Z"
              fill="rgb(var(--c-surface))"
              fillOpacity="0.92"
              stroke="rgb(var(--c-line))"
              strokeWidth="1.2"
            />
          </g>
        )}

        {period === 'evening' && (
          <g aria-hidden="true">
            <path
              d="M 186 36 A 12 12 0 1 0 196 54 A 9.5 9.5 0 1 1 186 36 Z"
              fill="rgb(236, 190, 108)"
            />
            <path
              d="M 164 42 L 165.5 45.5 L 169 47 L 165.5 48.5 L 164 52 L 162.5 48.5 L 159 47 L 162.5 45.5 Z"
              fill="rgb(236, 190, 108)"
            />
          </g>
        )}
      </g>
    );
  };

  const renderBackHair = () => {
    switch (merged.hairStyle) {
      case 'waves':
        return (
          <g>
            <path
              d="M 78 96 C 64 114, 62 146, 70 168 C 62 184, 65 206, 78 216 L 162 216 C 175 206, 178 184, 170 168 C 178 146, 176 114, 162 96 C 162 58, 78 58, 78 96 Z"
              fill={hair.main}
              stroke={LINE_INK}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M 75 142 C 69 154, 71 168, 79 176"
              fill="none"
              stroke={hair.highlight}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 165 142 C 171 154, 169 168, 161 176"
              fill="none"
              stroke={hair.highlight}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        );
      case 'bob':
        return (
          <g>
            <path
              d="M 78 94 C 69 116, 68 146, 82 162 C 92 168, 104 166, 110 162 L 130 162 C 136 166, 148 168, 158 162 C 172 146, 171 116, 162 94 C 160 58, 80 58, 78 94 Z"
              fill={hair.main}
              stroke={LINE_INK}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </g>
        );
      case 'halfup':
        return (
          <g>
            {/* Nút buộc nửa đầu phía trên */}
            <ellipse
              cx="120"
              cy="49"
              rx="20"
              ry="13"
              fill={hair.main}
              stroke={LINE_INK}
              strokeWidth="2.2"
            />
            <path
              d="M 104 55 Q 120 49 136 55"
              fill="none"
              stroke={outfitTone.fill}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M 76 96 C 66 122, 66 168, 76 208 L 164 208 C 174 168, 174 122, 164 96 C 160 58, 80 58, 76 96 Z"
              fill={hair.main}
              stroke={LINE_INK}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </g>
        );
      case 'ponytail':
        return (
          <g>
            <path
              d="M 79 96 C 77 60, 163 60, 161 96 C 161 118, 152 134, 142 140 L 98 140 C 88 134, 79 118, 79 96 Z"
              fill={hair.main}
              stroke={LINE_INK}
              strokeWidth="2.2"
            />
          </g>
        );
      case 'bun':
      default:
        return (
          <g>
            {/* Búi tóc tròn gọn gàng đặc trưng của mẹ trẻ */}
            <circle
              cx="120"
              cy="43"
              r="19"
              fill={hair.main}
              stroke={LINE_INK}
              strokeWidth="2.2"
            />
            <path
              d="M 108 36 Q 120 30 131 37"
              fill="none"
              stroke={hair.highlight}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Dây vải scrunchie đồng điệu màu trang phục */}
            <path
              d="M 101 55 C 108 49, 132 49, 139 55 C 134 60, 106 60, 101 55 Z"
              fill={outfitTone.fill}
              stroke={LINE_INK}
              strokeWidth="1.8"
            />
            <path
              d="M 79 96 C 77 60, 163 60, 161 96 C 161 118, 152 134, 142 140 L 98 140 C 88 134, 79 118, 79 96 Z"
              fill={hair.main}
              stroke={LINE_INK}
              strokeWidth="2.2"
            />
          </g>
        );
    }
  };

  const renderTorsoAndOutfit = () => (
    <g>
      {/* Phần cổ & bờ vai */}
      <path
        d="M 58 240 C 60 194, 86 175, 120 175 C 154 175, 180 194, 182 240 Z"
        fill={skin.base}
        stroke={LINE_INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M 107 144 L 107 177 Q 120 184 133 177 L 133 144 Z"
        fill={skin.base}
      />
      {/* Bóng đổ dịu dưới cằm */}
      <path
        d="M 107 147 Q 120 159 133 147 L 133 156 Q 120 166 107 156 Z"
        fill={skin.shadow}
      />
      {/* Nét xương quai xanh thanh mảnh */}
      <path
        d="M 101 178 Q 110 181 115 179 M 139 178 Q 130 181 125 179"
        fill="none"
        stroke={skin.shadow}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {merged.outfit === 'cardigan' && (
        <g>
          {/* Áo hai dây lót màu kem bên trong, chừa cổ thoáng cho dây chuyền */}
          <path
            d="M 94 196 Q 120 205 146 196 L 152 240 L 88 240 Z"
            fill={IVORY_FABRIC}
            stroke={LINE_INK}
            strokeWidth="2"
          />
          {/* Hai vạt cardigan mềm */}
          <path
            d="M 58 240 C 60 196, 82 178, 102 176 L 114 240 Z"
            fill={outfitTone.fill}
            stroke={LINE_INK}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M 182 240 C 180 196, 158 178, 138 176 L 126 240 Z"
            fill={outfitTone.fill}
            stroke={LINE_INK}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Đường viền nẹp len */}
          <path
            d="M 97 178 L 108 240 M 143 178 L 132 240"
            fill="none"
            stroke={IVORY_FABRIC}
            strokeOpacity="0.55"
            strokeWidth="2"
          />
        </g>
      )}

      {merged.outfit === 'wrapdress' && (
        <g>
          <path
            d="M 58 240 C 60 195, 84 177, 101 176 L 120 206 L 139 176 C 156 177, 180 195, 182 240 Z"
            fill={outfitTone.fill}
            stroke={LINE_INK}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M 101 176 L 120 206 L 132 240 M 139 176 L 114 214"
            fill="none"
            stroke={LINE_INK}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
      )}

      {merged.outfit === 'blouse' && (
        <g>
          <path
            d="M 58 240 C 60 196, 84 179, 100 178 Q 120 196 140 178 C 156 179, 180 196, 182 240 Z"
            fill={outfitTone.fill}
            stroke={LINE_INK}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Cổ lá sen màu kem nhã nhặn nằm dưới dây chuyền */}
          <path
            d="M 98 178 C 88 186, 94 202, 118 197 C 114 191, 106 184, 98 178 Z"
            fill={IVORY_FABRIC}
            stroke={LINE_INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M 142 178 C 152 186, 146 202, 122 197 C 126 191, 134 184, 142 178 Z"
            fill={IVORY_FABRIC}
            stroke={LINE_INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>
      )}

      {merged.outfit === 'sweater' && (
        <g>
          <path
            d="M 58 240 C 60 196, 84 180, 98 180 Q 120 198 142 180 C 156 180, 180 196, 182 240 Z"
            fill={outfitTone.fill}
            stroke={LINE_INK}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M 96 183 Q 120 202 144 183"
            fill="none"
            stroke={IVORY_FABRIC}
            strokeOpacity="0.65"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );

  const renderNecklace = () => {
    if (merged.necklace === 'none') return null;

    if (merged.necklace === 'pearl_strand') {
      const pearls = [
        { x: 103, y: 174, r: 2.8 },
        { x: 107, y: 179, r: 3.1 },
        { x: 111.5, y: 183, r: 3.4 },
        { x: 116, y: 185.5, r: 3.6 },
        { x: 120, y: 186.5, r: 3.9 },
        { x: 124, y: 185.5, r: 3.6 },
        { x: 128.5, y: 183, r: 3.4 },
        { x: 133, y: 179, r: 3.1 },
        { x: 137, y: 174, r: 2.8 },
      ];
      return (
        <g>
          {pearls.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill={PEARL_FILL}
              stroke={LINE_INK}
              strokeWidth="1.3"
            />
          ))}
        </g>
      );
    }

    return (
      <g>
        {/* Sợi dây chuyền vàng mảnh */}
        <path
          d="M 103 171 Q 120 189 137 171"
          fill="none"
          stroke={GOLD_DEEP}
          strokeWidth="1.9"
          strokeLinecap="round"
        />

        {merged.necklace === 'pearl_pendant' && (
          <g>
            <circle
              cx="120"
              cy="187"
              r="4.8"
              fill={PEARL_FILL}
              stroke={LINE_INK}
              strokeWidth="1.5"
            />
            <circle cx="118.5" cy="185.5" r="1.4" fill="rgb(255, 255, 255)" />
          </g>
        )}

        {merged.necklace === 'gold_heart' && (
          <path
            d="M 120 192.5 C 115 189, 113.5 184.5, 116.5 182.5 C 118.2 181.4, 119.6 182.4, 120 183.8 C 120.4 182.4, 121.8 181.4, 123.5 182.5 C 126.5 184.5, 125 189, 120 192.5 Z"
            fill={GOLD_MAIN}
            stroke={LINE_INK}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        )}

        {merged.necklace === 'clover' && (
          <g transform="translate(120, 187)">
            <circle cx="0" cy="-3.2" r="3.1" fill={PEARL_FILL} stroke={GOLD_DEEP} strokeWidth="1.3" />
            <circle cx="0" cy="3.2" r="3.1" fill={PEARL_FILL} stroke={GOLD_DEEP} strokeWidth="1.3" />
            <circle cx="-3.2" cy="0" r="3.1" fill={PEARL_FILL} stroke={GOLD_DEEP} strokeWidth="1.3" />
            <circle cx="3.2" cy="0" r="3.1" fill={PEARL_FILL} stroke={GOLD_DEEP} strokeWidth="1.3" />
            <circle cx="0" cy="0" r="1.6" fill={GOLD_MAIN} />
          </g>
        )}

        {merged.necklace === 'jade_drop' && (
          <g>
            <circle
              cx="120"
              cy="187.5"
              r="5.4"
              fill={JADE_FILL}
              stroke={LINE_INK}
              strokeWidth="1.4"
            />
            <circle cx="120" cy="187.5" r="1.8" fill={GOLD_MAIN} />
            <circle cx="118" cy="185.5" r="1.1" fill={JADE_LIGHT} />
          </g>
        )}
      </g>
    );
  };

  const renderSingleEarring = (side) => {
    const x = side === 'left' ? 78.5 : 161.5;
    const dir = side === 'left' ? -1 : 1;
    const y = 118.5;

    switch (merged.earrings) {
      case 'pearl_stud':
        return (
          <g>
            <circle
              cx={x}
              cy={y}
              r="4.2"
              fill={PEARL_FILL}
              stroke={LINE_INK}
              strokeWidth="1.5"
            />
            <circle cx={x - 1} cy={y - 1.2} r="1.2" fill="rgb(255, 255, 255)" />
          </g>
        );
      case 'gold_hoop':
        return (
          <path
            d={`M ${x} ${y - 1} C ${x + dir * 7.5} ${y - 1}, ${x + dir * 7.5} ${y + 12}, ${x + dir * 1} ${y + 11.5}`}
            fill="none"
            stroke={GOLD_MAIN}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      case 'floral_drop':
        return (
          <g>
            <circle cx={x} cy={y - 0.5} r="2.1" fill={GOLD_MAIN} stroke={LINE_INK} strokeWidth="1.2" />
            <line x1={x} y1={y + 1.5} x2={x} y2={y + 6.5} stroke={GOLD_DEEP} strokeWidth="1.4" />
            <g transform={`translate(${x}, ${y + 9.5})`}>
              <circle cx="0" cy="-3.2" r="2.5" fill={PEARL_FILL} stroke={LINE_INK} strokeWidth="1.1" />
              <circle cx="3" cy="-0.8" r="2.5" fill={PEARL_FILL} stroke={LINE_INK} strokeWidth="1.1" />
              <circle cx="1.9" cy="2.8" r="2.5" fill={PEARL_FILL} stroke={LINE_INK} strokeWidth="1.1" />
              <circle cx="-1.9" cy="2.8" r="2.5" fill={PEARL_FILL} stroke={LINE_INK} strokeWidth="1.1" />
              <circle cx="-3" cy="-0.8" r="2.5" fill={PEARL_FILL} stroke={LINE_INK} strokeWidth="1.1" />
              <circle cx="0" cy="0" r="1.8" fill={GOLD_MAIN} />
            </g>
          </g>
        );
      case 'heart_drop':
        return (
          <g>
            <circle cx={x} cy={y - 0.5} r="2" fill={GOLD_MAIN} stroke={LINE_INK} strokeWidth="1.2" />
            <line x1={x} y1={y + 1.5} x2={x} y2={y + 6} stroke={GOLD_DEEP} strokeWidth="1.4" />
            <path
              d={`M ${x} ${y + 13} C ${x - 4.5} ${y + 10}, ${x - 5.2} ${y + 6.5}, ${x - 2.5} ${y + 5.3} C ${x - 1} ${y + 4.6}, ${x - 0.2} ${y + 5.5}, ${x} ${y + 6.6} C ${x + 0.2} ${y + 5.5}, ${x + 1} ${y + 4.6}, ${x + 2.5} ${y + 5.3} C ${x + 5.2} ${y + 6.5}, ${x + 4.5} ${y + 10}, ${x} ${y + 13} Z`}
              fill={GOLD_MAIN}
              stroke={LINE_INK}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </g>
        );
      case 'jade_stud':
        return (
          <g>
            <circle
              cx={x}
              cy={y}
              r="4.3"
              fill={JADE_FILL}
              stroke={GOLD_DEEP}
              strokeWidth="1.6"
            />
            <circle cx={x - 1} cy={y - 1.1} r="1.2" fill={JADE_LIGHT} />
          </g>
        );
      default:
        return null;
    }
  };

  const renderEars = () => (
    <g>
      <ellipse
        cx="80"
        cy="110"
        rx="7"
        ry="10.5"
        fill={skin.ear}
        stroke={LINE_INK}
        strokeWidth="2.1"
      />
      <path
        d="M 78 106 Q 75 110 78 114"
        fill="none"
        stroke={skin.shadow}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <ellipse
        cx="160"
        cy="110"
        rx="7"
        ry="10.5"
        fill={skin.ear}
        stroke={LINE_INK}
        strokeWidth="2.1"
      />
      <path
        d="M 162 106 Q 165 110 162 114"
        fill="none"
        stroke={skin.shadow}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  );

  const renderEarrings = () => {
    if (merged.earrings === 'none') return null;
    return (
      <g>
        {renderSingleEarring('left')}
        {renderSingleEarring('right')}
      </g>
    );
  };

  const renderFace = () => (
    <g>
      {/* Khuôn mặt trái xoan mềm mại */}
      <path
        d="M 82 97 C 82 63, 158 63, 158 97 C 158 128, 142 150, 120 152 C 98 150, 82 128, 82 97 Z"
        fill={skin.base}
        stroke={LINE_INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Má hồng tự nhiên */}
      <ellipse cx="95" cy="120" rx="8" ry="4.8" fill={skin.blush} />
      <ellipse cx="145" cy="120" rx="8" ry="4.8" fill={skin.blush} />

      {/* Chân mày */}
      {expression === 'worried' ? (
        <g fill="none" stroke={hair.main} strokeWidth="2.2" strokeLinecap="round">
          <path d="M 95 95 Q 103 91 111 92" />
          <path d="M 129 92 Q 137 91 145 95" />
        </g>
      ) : (
        <g fill="none" stroke={hair.main} strokeWidth="2.2" strokeLinecap="round">
          <path d="M 94 94 Q 103 90 111 93" />
          <path d="M 129 93 Q 137 90 146 94" />
        </g>
      )}

      {/* Đôi mắt theo biểu cảm */}
      {expression === 'happy' && (
        <g fill="none" stroke={LINE_INK} strokeWidth="2.4" strokeLinecap="round">
          <path d="M 95 107 Q 103 100 111 107" />
          <path d="M 93 105 L 95.5 106.5" />
          <path d="M 129 107 Q 137 100 145 107" />
          <path d="M 147 105 L 144.5 106.5" />
        </g>
      )}

      {expression === 'tired' && (
        <g fill="none" stroke={LINE_INK} strokeWidth="2.2" strokeLinecap="round">
          <path d="M 96 106 Q 103 110 110 106" />
          <path d="M 130 106 Q 137 110 144 106" />
        </g>
      )}

      {(expression === 'pleasant' || expression === 'calm' || expression === 'worried') && (
        <g>
          {/* Mắt trái */}
          <path
            d="M 95 105 Q 103 100 111 105"
            fill="none"
            stroke={LINE_INK}
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <circle cx="103" cy="107" r="3.8" fill={LINE_INK} />
          <circle cx="101.7" cy="105.6" r="1.3" fill="rgb(255, 255, 255)" />

          {/* Mắt phải */}
          <path
            d="M 129 105 Q 137 100 145 105"
            fill="none"
            stroke={LINE_INK}
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <circle cx="137" cy="107" r="3.8" fill={LINE_INK} />
          <circle cx="135.7" cy="105.6" r="1.3" fill="rgb(255, 255, 255)" />
        </g>
      )}

      {/* Sống mũi tối giản */}
      <path
        d="M 120 109 C 118.5 114.5, 118 118, 121.5 119.5"
        fill="none"
        stroke={skin.shadow}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Khuôn miệng */}
      {expression === 'happy' && (
        <g>
          <path
            d="M 110 129 Q 120 139 130 129 Z"
            fill={CORAL_LIP}
            stroke={LINE_INK}
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
        </g>
      )}

      {(expression === 'pleasant' || expression === 'calm') && (
        <g>
          <path
            d="M 111.5 130.5 Q 120 137 128.5 130.5"
            fill="none"
            stroke={LINE_INK}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 115 133.5 Q 120 136.5 125 133.5"
            fill="none"
            stroke={CORAL_LIP}
            strokeOpacity="0.65"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

      {expression === 'tired' && (
        <path
          d="M 114 132 Q 120 135 126 132"
          fill="none"
          stroke={LINE_INK}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}

      {expression === 'worried' && (
        <path
          d="M 114 133 Q 120 130.5 126 133"
          fill="none"
          stroke={LINE_INK}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </g>
  );

  const renderFrontPonytail = () => {
    if (merged.hairStyle !== 'ponytail') return null;
    return (
      <g>
        {/* Đuôi tóc cột thấp vắt mềm qua bờ vai phải phía trước áo */}
        <path
          d="M 145 136 C 166 138, 179 158, 174 188 C 171 204, 159 214, 148 208 C 141 196, 141 168, 139 148 Z"
          fill={hair.main}
          stroke={LINE_INK}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M 156 154 C 162 168, 161 184, 155 196"
          fill="none"
          stroke={hair.highlight}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 142 142 Q 154 138 161 147"
          fill="none"
          stroke={outfitTone.fill}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>
    );
  };

  const renderFrontHair = () => (
    <g>
      {/* Mái bay rẽ ngôi mềm mại ôm vầng trán nhưng để lộ rõ chân mày và đôi bông tai */}
      <path
        d="M 81 99 C 79 72, 98 56, 120 56 C 142 56, 161 72, 159 99 C 154 84, 141 74, 123 69 C 117 75, 95 82, 81 99 Z"
        fill={hair.main}
        stroke={LINE_INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Lọn tóc mai nhẹ hai bên thái dương */}
      <path
        d="M 82 94 C 79 101, 81 107, 84 111"
        fill="none"
        stroke={hair.main}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M 158 94 C 161 101, 159 107, 156 111"
        fill="none"
        stroke={hair.main}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Ánh tóc mượt trên đỉnh đầu */}
      <path
        d="M 96 71 Q 112 63 125 65 M 129 66 Q 141 68 148 75"
        fill="none"
        stroke={hair.highlight}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </g>
  );

  const renderAccessory = () => {
    switch (merged.accessory) {
      case 'hair_clip':
        return (
          <g transform="translate(91, 78)">
            <circle cx="0" cy="-4.2" r="3.6" fill={PEARL_FILL} stroke={LINE_INK} strokeWidth="1.3" />
            <circle cx="4" cy="-1.2" r="3.6" fill={PEARL_FILL} stroke={LINE_INK} strokeWidth="1.3" />
            <circle cx="2.5" cy="3.5" r="3.6" fill={PEARL_FILL} stroke={LINE_INK} strokeWidth="1.3" />
            <circle cx="-2.5" cy="3.5" r="3.6" fill={PEARL_FILL} stroke={LINE_INK} strokeWidth="1.3" />
            <circle cx="-4" cy="-1.2" r="3.6" fill={PEARL_FILL} stroke={LINE_INK} strokeWidth="1.3" />
            <circle cx="0" cy="0" r="2.4" fill={GOLD_MAIN} stroke={LINE_INK} strokeWidth="1.1" />
          </g>
        );
      case 'pearl_pin':
        return (
          <g>
            <line
              x1="83"
              y1="79"
              x2="99"
              y2="74"
              stroke={GOLD_MAIN}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="85" cy="78.5" r="3" fill={PEARL_FILL} stroke={LINE_INK} strokeWidth="1.2" />
            <circle cx="91" cy="76.5" r="2.5" fill={PEARL_SHADE} stroke={LINE_INK} strokeWidth="1.1" />
            <line
              x1="85"
              y1="84"
              x2="100"
              y2="80"
              stroke={GOLD_DEEP}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        );
      case 'headband':
        return (
          <g>
            <path
              d="M 81 92 C 86 58, 154 58, 159 92 C 154 68, 86 68, 81 92 Z"
              fill={outfitTone.fill}
              stroke={LINE_INK}
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
            <ellipse
              cx="145"
              cy="69"
              rx="6"
              ry="3.6"
              transform="rotate(24 145 69)"
              fill={outfitTone.soft}
              stroke={LINE_INK}
              strokeWidth="1.5"
            />
          </g>
        );
      case 'round_glasses':
        return (
          <g>
            <circle
              cx="103"
              cy="107"
              r="12.5"
              fill="rgba(255, 255, 255, 0.14)"
              stroke={GOLD_DEEP}
              strokeWidth="2.1"
            />
            <circle
              cx="137"
              cy="107"
              r="12.5"
              fill="rgba(255, 255, 255, 0.14)"
              stroke={GOLD_DEEP}
              strokeWidth="2.1"
            />
            <path
              d="M 115.5 106 Q 120 103 124.5 106"
              fill="none"
              stroke={GOLD_DEEP}
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <line x1="82" y1="104" x2="90.5" y2="106" stroke={GOLD_DEEP} strokeWidth="1.9" />
            <line x1="149.5" y1="106" x2="158" y2="104" stroke={GOLD_DEEP} strokeWidth="1.9" />
            {/* Phản quang nhẹ trên mặt kính */}
            <line
              x1="96"
              y1="101"
              x2="100"
              y2="97"
              stroke="rgba(255, 255, 255, 0.65)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <line
              x1="130"
              y1="101"
              x2="134"
              y2="97"
              stroke="rgba(255, 255, 255, 0.65)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      viewBox={isBadge ? '36 24 168 172' : '0 0 240 240'}
      role="img"
      aria-label={label}
      className={`select-none ${className}`}
    >
      {renderAmbientBackdrop()}
      {renderBackHair()}
      {renderTorsoAndOutfit()}
      {renderNecklace()}
      {renderFrontPonytail()}
      {renderEars()}
      {renderFace()}
      {renderEarrings()}
      {renderFrontHair()}
      {renderAccessory()}
    </svg>
  );
}
