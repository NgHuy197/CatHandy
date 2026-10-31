export default function Chibi(props) {
  const p = props;
  const hair = p.hair || 'short';
  const face = p.face || 'smile';
  const outfit = p.outfit || 'aodai';
  const acc = p.accessory || 'none';
  const yes = (v) => v === true || v === '1' || v === 'true' || v === 1;
  const vals = {
    skin: p.skin || '#f7d9c4',
    hairColor: p.hairColor || '#3b2a2a',
    outfitColor: p.outfitColor || '#fd9999',
    isAodai: outfit === 'aodai',
    isVest: outfit === 'vest',
    isWedding: outfit === 'wedding',
    isShirt: outfit === 'shirt',
    isLong: hair === 'long',
    isBob: hair === 'bob',
    isBun: hair === 'bun',
    isShort: hair === 'short' || hair === 'bun',
    isLongFront: hair === 'long',
    isBobFront: hair === 'bob',
    isSmile: face === 'smile',
    isLaugh: face === 'laugh',
    isWink: face === 'wink',
    isCalm: face === 'calm',
    hasGlasses: yes(p.glasses),
    hasBeard: yes(p.beard),
    isBouquet: acc === 'bouquet',
    isBow: acc === 'bow',
    isFlower: acc === 'flower',
  };

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '200 / 260' }}>
      <svg
        viewBox="0 0 200 260"
        aria-hidden="true"
        style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
      >
        <ellipse cx="100" cy="246" rx="48" ry="7" fill="rgba(42,31,45,0.12)" />
        <ellipse cx="82" cy="238" rx="17" ry="8" fill="#3b2f3e" />
        <ellipse cx="118" cy="238" rx="17" ry="8" fill="#3b2f3e" />
      </svg>
      {vals.isAodai ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <path
              d="M74 205 L72 238 L97 238 L100 216 L103 238 L128 238 L126 205 Z"
              fill="#ffffff"
              style={{ stroke: '#e3d8ca', strokeWidth: '1.5' }}
            />
            <ellipse cx="62" cy="186" rx="11" ry="18" fill={vals.outfitColor} />
            <ellipse cx="138" cy="186" rx="11" ry="18" fill={vals.outfitColor} />
            <circle cx="60" cy="204" r="8" fill={vals.skin} />
            <circle cx="140" cy="204" r="8" fill={vals.skin} />
            <path d="M70 160 Q100 172 130 160 L139 226 Q100 234 61 226 Z" fill={vals.outfitColor} />
            <path
              d="M86 163 Q100 174 114 163"
              fill="none"
              style={{ stroke: 'rgba(255,255,255,0.85)', strokeWidth: '3', strokeLinecap: 'round' }}
            />
            <path
              d="M114 166 L125 196"
              fill="none"
              style={{ stroke: 'rgba(255,255,255,0.7)', strokeWidth: '2', strokeLinecap: 'round' }}
            />
            <circle cx="116" cy="172" r="2" fill="rgba(255,255,255,0.9)" />
            <circle cx="120" cy="184" r="2" fill="rgba(255,255,255,0.9)" />
          </svg>
        </>
      ) : null}
      {vals.isVest ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <path d="M74 205 L72 238 L97 238 L100 216 L103 238 L128 238 L126 205 Z" fill="#4a3d50" />
            <ellipse cx="62" cy="186" rx="11" ry="18" fill={vals.outfitColor} />
            <ellipse cx="138" cy="186" rx="11" ry="18" fill={vals.outfitColor} />
            <circle cx="60" cy="204" r="8" fill={vals.skin} />
            <circle cx="140" cy="204" r="8" fill={vals.skin} />
            <path d="M68 160 Q100 170 132 160 L134 216 Q100 224 66 216 Z" fill={vals.outfitColor} />
            <path d="M86 163 L100 198 L114 163 Z" fill="#ffffff" />
            <path d="M96 170 L104 170 L105 192 L100 199 L95 192 Z" fill="#b0343f" />
            <path
              d="M100 198 L100 218"
              fill="none"
              style={{ stroke: 'rgba(255,255,255,0.35)', strokeWidth: '2' }}
            />
          </svg>
        </>
      ) : null}
      {vals.isWedding ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <ellipse
              cx="66"
              cy="184"
              rx="9"
              ry="15"
              fill={vals.outfitColor}
              style={{ stroke: '#e3d8ca', strokeWidth: '1.5' }}
            />
            <ellipse
              cx="134"
              cy="184"
              rx="9"
              ry="15"
              fill={vals.outfitColor}
              style={{ stroke: '#e3d8ca', strokeWidth: '1.5' }}
            />
            <circle cx="64" cy="200" r="8" fill={vals.skin} />
            <circle cx="136" cy="200" r="8" fill={vals.skin} />
            <path
              d="M78 160 Q100 170 122 160 L130 192 Q168 236 148 242 Q100 252 52 242 Q32 236 70 192 Z"
              fill={vals.outfitColor}
              style={{ stroke: '#e3d8ca', strokeWidth: '1.5' }}
            />
            <path d="M72 190 Q100 200 128 190 L128 199 Q100 209 72 199 Z" fill="#fd9999" />
            <path
              d="M84 218 Q100 226 116 218"
              fill="none"
              style={{ stroke: 'rgba(227,216,202,0.9)', strokeWidth: '2', strokeLinecap: 'round' }}
            />
          </svg>
        </>
      ) : null}
      {vals.isShirt ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <path d="M74 205 L72 238 L97 238 L100 216 L103 238 L128 238 L126 205 Z" fill="#6b5f66" />
            <ellipse cx="62" cy="186" rx="11" ry="18" fill={vals.outfitColor} />
            <ellipse cx="138" cy="186" rx="11" ry="18" fill={vals.outfitColor} />
            <circle cx="60" cy="204" r="8" fill={vals.skin} />
            <circle cx="140" cy="204" r="8" fill={vals.skin} />
            <path d="M70 160 Q100 170 130 160 L134 218 Q100 226 66 218 Z" fill={vals.outfitColor} />
            <path d="M86 161 L100 178 L114 161 L108 158 L100 166 L92 158 Z" fill="#ffffff" />
            <path
              d="M100 178 L100 220"
              fill="none"
              style={{ stroke: 'rgba(255,255,255,0.6)', strokeWidth: '2' }}
            />
            <circle cx="100" cy="192" r="2" fill="rgba(255,255,255,0.9)" />
            <circle cx="100" cy="206" r="2" fill="rgba(255,255,255,0.9)" />
          </svg>
        </>
      ) : null}
      {vals.isLong ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <path
              d="M32 100 Q32 28 100 28 Q168 28 168 100 L174 202 Q152 208 140 188 L60 188 Q48 208 26 202 Z"
              fill={vals.hairColor}
            />
          </svg>
        </>
      ) : null}
      {vals.isBob ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <path
              d="M30 100 Q30 30 100 30 Q170 30 170 100 L168 156 Q152 164 138 152 L62 152 Q48 164 32 156 Z"
              fill={vals.hairColor}
            />
          </svg>
        </>
      ) : null}
      {vals.isBun ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <circle cx="100" cy="30" r="22" fill={vals.hairColor} />
            <path
              d="M84 44 Q100 54 116 44"
              fill="none"
              style={{ stroke: '#fd9999', strokeWidth: '5', strokeLinecap: 'round' }}
            />
          </svg>
        </>
      ) : null}
      <svg
        viewBox="0 0 200 260"
        aria-hidden="true"
        style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
      >
        <rect x="88" y="146" width="24" height="22" rx="8" fill={vals.skin} />
        <circle cx="37" cy="108" r="9" fill={vals.skin} />
        <circle cx="163" cy="108" r="9" fill={vals.skin} />
        <ellipse cx="100" cy="100" rx="64" ry="58" fill={vals.skin} />
        <ellipse cx="63" cy="124" rx="11" ry="7" fill="#fd9999" opacity="0.55" />
        <ellipse cx="137" cy="124" rx="11" ry="7" fill="#fd9999" opacity="0.55" />
      </svg>
      {vals.isSmile ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <ellipse cx="78" cy="108" rx="5.5" ry="7.5" fill="#2a1f2d" />
            <ellipse cx="122" cy="108" rx="5.5" ry="7.5" fill="#2a1f2d" />
            <circle cx="80" cy="105" r="2" fill="#ffffff" />
            <circle cx="124" cy="105" r="2" fill="#ffffff" />
            <path
              d="M91 126 Q100 135 109 126"
              fill="none"
              style={{ stroke: '#2a1f2d', strokeWidth: '3', strokeLinecap: 'round' }}
            />
          </svg>
        </>
      ) : null}
      {vals.isLaugh ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <path
              d="M70 112 Q78 100 86 112"
              fill="none"
              style={{ stroke: '#2a1f2d', strokeWidth: '3.5', strokeLinecap: 'round' }}
            />
            <path
              d="M114 112 Q122 100 130 112"
              fill="none"
              style={{ stroke: '#2a1f2d', strokeWidth: '3.5', strokeLinecap: 'round' }}
            />
            <path d="M88 123 Q100 124 112 123 Q108 142 100 142 Q92 142 88 123 Z" fill="#7a2b36" />
            <path d="M94 136 Q100 131 106 136 Q100 141 94 136 Z" fill="#fd9999" />
          </svg>
        </>
      ) : null}
      {vals.isWink ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <ellipse cx="78" cy="108" rx="5.5" ry="7.5" fill="#2a1f2d" />
            <circle cx="80" cy="105" r="2" fill="#ffffff" />
            <path
              d="M114 111 Q122 102 130 111"
              fill="none"
              style={{ stroke: '#2a1f2d', strokeWidth: '3.5', strokeLinecap: 'round' }}
            />
            <path
              d="M91 126 Q100 135 109 126"
              fill="none"
              style={{ stroke: '#2a1f2d', strokeWidth: '3', strokeLinecap: 'round' }}
            />
          </svg>
        </>
      ) : null}
      {vals.isCalm ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <circle cx="78" cy="110" r="4.5" fill="#2a1f2d" />
            <circle cx="122" cy="110" r="4.5" fill="#2a1f2d" />
            <path
              d="M94 129 L106 129"
              fill="none"
              style={{ stroke: '#2a1f2d', strokeWidth: '3', strokeLinecap: 'round' }}
            />
          </svg>
        </>
      ) : null}
      {vals.hasBeard ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <path
              d="M50 118 Q54 170 100 172 Q146 170 150 118 Q142 144 100 144 Q58 144 50 118 Z"
              fill={vals.hairColor}
            />
          </svg>
        </>
      ) : null}
      {vals.isShort ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <path
              d="M36 100 Q30 34 100 30 Q170 34 164 100 Q150 70 120 62 Q96 74 68 64 Q46 72 36 100 Z"
              fill={vals.hairColor}
            />
          </svg>
        </>
      ) : null}
      {vals.isLongFront ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <path
              d="M36 104 Q30 32 100 30 Q170 32 164 104 Q150 64 112 56 Q80 70 62 94 Q50 102 36 104 Z"
              fill={vals.hairColor}
            />
          </svg>
        </>
      ) : null}
      {vals.isBobFront ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <path d="M32 108 Q30 30 100 30 Q170 30 168 108 L162 84 Q100 56 38 84 Z" fill={vals.hairColor} />
          </svg>
        </>
      ) : null}
      {vals.hasGlasses ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <circle
              cx="78"
              cy="108"
              r="17"
              fill="rgba(255,255,255,0.25)"
              style={{ stroke: '#2a1f2d', strokeWidth: '3' }}
            />
            <circle
              cx="122"
              cy="108"
              r="17"
              fill="rgba(255,255,255,0.25)"
              style={{ stroke: '#2a1f2d', strokeWidth: '3' }}
            />
            <path d="M95 106 Q100 102 105 106" fill="none" style={{ stroke: '#2a1f2d', strokeWidth: '3' }} />
            <path
              d="M61 106 L46 102 M139 106 L154 102"
              fill="none"
              style={{ stroke: '#2a1f2d', strokeWidth: '3', strokeLinecap: 'round' }}
            />
          </svg>
        </>
      ) : null}
      {vals.isBouquet ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <ellipse cx="80" cy="176" rx="10" ry="6" fill="#a9d9c7" transform="rotate(-30 80 176)" />
            <ellipse cx="120" cy="176" rx="10" ry="6" fill="#a9d9c7" transform="rotate(30 120 176)" />
            <circle cx="86" cy="184" r="12" fill="#fd9999" />
            <circle cx="114" cy="184" r="12" fill="#fbeab4" />
            <circle cx="100" cy="172" r="12" fill="#e8e0f8" />
            <circle cx="86" cy="184" r="3.5" fill="#fbeab4" />
            <circle cx="114" cy="184" r="3.5" fill="#fd9999" />
            <circle cx="100" cy="172" r="3.5" fill="#fd9999" />
            <path
              d="M72 192 Q100 204 128 192 L106 238 Q100 243 94 238 Z"
              fill="#ffffff"
              style={{ stroke: '#e3d8ca', strokeWidth: '1.5' }}
            />
            <path
              d="M88 214 Q100 220 112 214"
              fill="none"
              style={{ stroke: '#fd9999', strokeWidth: '3', strokeLinecap: 'round' }}
            />
            <circle cx="80" cy="204" r="8" fill={vals.skin} />
            <circle cx="120" cy="204" r="8" fill={vals.skin} />
          </svg>
        </>
      ) : null}
      {vals.isBow ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <path d="M100 166 L80 154 L80 178 Z" fill="#fd9999" />
            <path d="M100 166 L120 154 L120 178 Z" fill="#fd9999" />
            <circle cx="100" cy="166" r="6" fill="#b0343f" />
          </svg>
        </>
      ) : null}
      {vals.isFlower ? (
        <>
          <svg
            viewBox="0 0 200 260"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
          >
            <circle cx="140" cy="46" r="9" fill="#fd9999" />
            <circle cx="152" cy="54" r="9" fill="#fd9999" />
            <circle cx="148" cy="68" r="9" fill="#fd9999" />
            <circle cx="132" cy="66" r="9" fill="#fd9999" />
            <circle cx="130" cy="52" r="9" fill="#fd9999" />
            <circle cx="141" cy="58" r="6" fill="#fbeab4" />
          </svg>
        </>
      ) : null}
    </div>
  );
}
