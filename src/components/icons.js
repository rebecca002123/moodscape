import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

// Every glyph in Prism is drawn here by hand — one 24×24 stroke language,
// no icon fonts, no image assets.

export default function Icon({ name, color = '#fff', size = 22, strokeWidth = 1.9 }) {
  const p = { stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  const S = (children) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">{children}</Svg>
  );

  switch (name) {
    // ---- habits ----------------------------------------------------------
    case 'water':
      return S(<Path d="M12 3.5 C9.4 7.6 6.5 10.6 6.5 14 a5.5 5.5 0 0 0 11 0 C17.5 10.6 14.6 7.6 12 3.5 Z" {...p} />);
    case 'run':
      return S(<>
        <Circle cx="14.5" cy="4.6" r="1.9" {...p} />
        <Path d="M13.5 8 L9.8 11.4 L12.6 14.4 L10.8 19.5" {...p} />
        <Path d="M13.5 8.6 L17.3 10.6" {...p} />
        <Path d="M9.8 11.4 L6.6 10.9" {...p} />
        <Path d="M12.6 14.4 L16.4 16.8 L17.6 20" {...p} />
      </>);
    case 'walk':
      return S(<>
        <Circle cx="12.5" cy="4.4" r="1.9" {...p} />
        <Path d="M12.3 8 L11.4 13 L9 19.6" {...p} />
        <Path d="M11.4 13 L14 16 L14.6 19.6" {...p} />
        <Path d="M12.3 9 L9.4 11.6" {...p} />
        <Path d="M12.3 9 L15.2 11" {...p} />
      </>);
    case 'gym':
      return S(<>
        <Rect x="2.5" y="9" width="3" height="6" rx="1" {...p} />
        <Rect x="18.5" y="9" width="3" height="6" rx="1" {...p} />
        <Rect x="6.5" y="7" width="3" height="10" rx="1" {...p} />
        <Rect x="14.5" y="7" width="3" height="10" rx="1" {...p} />
        <Line x1="9.5" y1="12" x2="14.5" y2="12" {...p} />
      </>);
    case 'read':
      return S(<>
        <Path d="M12 6.2 C10 4.6 7 4.4 4.5 5.3 V18 C7 17.1 10 17.3 12 18.9 C14 17.3 17 17.1 19.5 18 V5.3 C17 4.4 14 4.6 12 6.2 Z" {...p} />
        <Line x1="12" y1="6.2" x2="12" y2="18.9" {...p} />
      </>);
    case 'write':
      return S(<>
        <Path d="M5 19 L6.2 15.4 L16.8 4.8 A1.6 1.6 0 0 1 19.2 7.2 L8.6 17.8 Z" {...p} />
        <Line x1="14.8" y1="6.8" x2="17.2" y2="9.2" {...p} />
      </>);
    case 'code':
      return S(<>
        <Path d="M8.5 7.5 L4 12 L8.5 16.5" {...p} />
        <Path d="M15.5 7.5 L20 12 L15.5 16.5" {...p} />
        <Line x1="13.3" y1="5.5" x2="10.7" y2="18.5" {...p} />
      </>);
    case 'music':
      return S(<>
        <Circle cx="7.5" cy="17" r="2.6" {...p} />
        <Circle cx="17.5" cy="15" r="2.6" {...p} />
        <Path d="M10.1 17 V6.5 L20.1 4.5 V15" {...p} />
        <Line x1="10.1" y1="9.5" x2="20.1" y2="7.5" {...p} />
      </>);
    case 'meditate':
      return S(<>
        <Circle cx="12" cy="5.6" r="2" {...p} />
        <Path d="M12 8.4 V13" {...p} />
        <Path d="M12 13 C9 13 6.5 15 5 17.5 C8 16.6 9.5 17.5 12 17.5 C14.5 17.5 16 16.6 19 17.5 C17.5 15 15 13 12 13 Z" {...p} />
        <Path d="M8.5 10.5 C7 11.4 5.8 12.6 5.2 14" {...p} />
        <Path d="M15.5 10.5 C17 11.4 18.2 12.6 18.8 14" {...p} />
      </>);
    case 'sleep':
      return S(<>
        <Path d="M19.5 14.5 A8 8 0 1 1 9.5 4.5 A6.5 6.5 0 0 0 19.5 14.5 Z" {...p} />
        <Path d="M14 6 h3.6 l-3.6 4 h3.6" {...p} strokeWidth={1.6} />
      </>);
    case 'sun':
      return S(<>
        <Circle cx="12" cy="12" r="4.2" {...p} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const r = (a * Math.PI) / 180;
          return (
            <Line
              key={a}
              x1={12 + 7.2 * Math.cos(r)} y1={12 + 7.2 * Math.sin(r)}
              x2={12 + 9.6 * Math.cos(r)} y2={12 + 9.6 * Math.sin(r)}
              {...p}
            />
          );
        })}
      </>);
    case 'leaf':
      return S(<>
        <Path d="M19 5 C11 5 5.5 9 5.5 15.5 C5.5 17 6 18.2 6.8 19 C13.5 19 19 14 19 5 Z" {...p} />
        <Path d="M6.8 19 C9.5 14.5 13 10.5 17 7.5" {...p} />
      </>);
    case 'heart':
      return S(<Path d="M12 19.5 C7 15.5 3.5 12.6 3.5 9.1 A4.3 4.3 0 0 1 12 7.2 A4.3 4.3 0 0 1 20.5 9.1 C20.5 12.6 17 15.5 12 19.5 Z" {...p} />);
    case 'money':
      return S(<>
        <Circle cx="12" cy="12" r="8.4" {...p} />
        <Path d="M14.8 8.8 C14.2 7.9 13.2 7.5 12 7.5 C10.4 7.5 9.3 8.3 9.3 9.6 C9.3 12.4 14.7 11.3 14.7 14.2 C14.7 15.6 13.5 16.5 12 16.5 C10.6 16.5 9.6 16 9 15" {...p} />
        <Line x1="12" y1="5.8" x2="12" y2="7.5" {...p} />
        <Line x1="12" y1="16.5" x2="12" y2="18.2" {...p} />
      </>);
    case 'nophone':
      return S(<>
        <Rect x="7" y="3.5" width="10" height="17" rx="2.6" {...p} />
        <Line x1="10.5" y1="17.5" x2="13.5" y2="17.5" {...p} />
        <Line x1="4.5" y1="4.5" x2="19.5" y2="19.5" {...p} />
      </>);
    case 'clean':
      return S(<>
        <Path d="M12 3.5 L13.4 9.1 L19 10.5 L13.4 11.9 L12 17.5 L10.6 11.9 L5 10.5 L10.6 9.1 Z" {...p} />
        <Path d="M18.5 15.5 L19.1 17.4 L21 18 L19.1 18.6 L18.5 20.5 L17.9 18.6 L16 18 L17.9 17.4 Z" {...p} strokeWidth={1.4} />
      </>);

    // ---- interface -------------------------------------------------------
    case 'tab-today':
      return S(<>
        <Circle cx="12" cy="12" r="8.4" {...p} />
        <Path d="M8.4 12.4 L11 15 L15.8 9.4" {...p} />
      </>);
    case 'tab-stats':
      return S(<>
        <Line x1="5" y1="19" x2="5" y2="13" {...p} strokeWidth={2.4} />
        <Line x1="12" y1="19" x2="12" y2="5" {...p} strokeWidth={2.4} />
        <Line x1="19" y1="19" x2="19" y2="9" {...p} strokeWidth={2.4} />
      </>);
    case 'tab-settings':
      return S(<>
        <Line x1="4" y1="7" x2="20" y2="7" {...p} />
        <Circle cx="9.5" cy="7" r="2.3" {...p} />
        <Line x1="4" y1="16.5" x2="20" y2="16.5" {...p} />
        <Circle cx="15" cy="16.5" r="2.3" {...p} />
      </>);
    case 'plus':
      return S(<>
        <Line x1="12" y1="5" x2="12" y2="19" {...p} strokeWidth={2.4} />
        <Line x1="5" y1="12" x2="19" y2="12" {...p} strokeWidth={2.4} />
      </>);
    case 'check':
      return S(<Path d="M5.5 12.5 L10 17 L18.5 7.5" {...p} strokeWidth={2.6} />);
    case 'flame':
      return S(<Path d="M12 3.5 C13 6.5 16.8 8.6 16.8 13 A4.8 4.8 0 0 1 7.2 13 C7.2 11.2 8 9.8 9.2 8.6 C9.5 10 10.2 10.8 11.2 11.4 C10.8 8.6 11.2 5.8 12 3.5 Z" {...p} />);
    case 'trash':
      return S(<>
        <Path d="M5.5 7 H18.5" {...p} />
        <Path d="M9.5 7 V5.5 A1.5 1.5 0 0 1 11 4 H13 A1.5 1.5 0 0 1 14.5 5.5 V7" {...p} />
        <Path d="M7 7 L7.8 19 A1.6 1.6 0 0 0 9.4 20.5 H14.6 A1.6 1.6 0 0 0 16.2 19 L17 7" {...p} />
      </>);
    case 'chevron-left':
      return S(<Path d="M14.5 5.5 L8 12 L14.5 18.5" {...p} strokeWidth={2.2} />);
    case 'chevron-right':
      return S(<Path d="M9.5 5.5 L16 12 L9.5 18.5" {...p} strokeWidth={2.2} />);
    default:
      return S(<Circle cx="12" cy="12" r="8" {...p} />);
  }
}
