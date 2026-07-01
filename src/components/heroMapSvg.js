// Auto-extracted from the Claude Design handoff "El Paso Hero Map".
// Hand-drawn illustrated map of El Paso; {{tokens}} are filled per time-of-day.
export const HERO_MAP_SVG = `<svg viewBox="0 0 1600 900" width="100%" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="wob"><feTurbulence type="turbulence" baseFrequency="0.014" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"/></filter>
    <pattern id="grid" width="86" height="86" patternUnits="userSpaceOnUse" patternTransform="rotate(-7)">
      <path d="M0 0 H86 M0 0 V86" stroke="#DFCDAE" stroke-width="2" fill="none"/>
    </pattern>
    <clipPath id="land"><rect x="34" y="384" width="1532" height="452" rx="200" ry="170"/></clipPath>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#EFC77A" stop-opacity=".85"/><stop offset="100%" stop-color="#EFC77A" stop-opacity="0"/></radialGradient>
    <path id="rio" d="M-30 802 C 220 782 360 852 620 824 C 860 798 1010 860 1250 822 C 1440 797 1560 828 1660 802" fill="none"/>
  </defs>

  <rect x="0" y="0" width="1600" height="900" fill="#FAF4EB"/>

  <!-- ===================== ILLUSTRATION (hand-drawn wobble) ===================== -->
  <g filter="url(#wob)">

    <!-- sun + glow -->
    <g style="opacity:{{ sunOpacity }}" transform="{{ sunTransform }}">
      <g style="animation:sunbob 11s ease-in-out infinite">
      <circle cx="1392" cy="132" r="150" fill="url(#glow)"/>
      <circle cx="1392" cy="132" r="46" fill="#E3A035" stroke="#2C231D" stroke-width="3"/>
      <g stroke="#E3A035" stroke-width="5" stroke-linecap="round">
        <line x1="1392" y1="60" x2="1392" y2="40"/><line x1="1462" y1="132" x2="1484" y2="132"/>
        <line x1="1443" y1="81" x2="1459" y2="65"/><line x1="1443" y1="183" x2="1459" y2="199"/>
        <line x1="1341" y1="81" x2="1325" y2="65"/>
      </g>
      </g>
    </g>
    <circle cx="770" cy="200" r="150" fill="url(#glow)" opacity=".55"/>

    <!-- Franklin Mountains, 3 ridges -->
    <path d="M0,372 L0,250 L120,206 L232,270 L342,176 L470,250 L560,140 L690,238 L780,116 L900,232 L1012,166 L1150,250 L1282,188 L1420,262 L1522,198 L1600,250 L1600,372 Z" fill="#EBAF79" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M0,378 L0,300 L104,282 L206,332 L306,258 L432,320 L544,246 L664,322 L772,226 L884,312 L1004,258 L1124,326 L1244,268 L1384,330 L1502,282 L1600,320 L1600,378 Z" fill="#D15A3A" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M0,382 L0,344 L152,332 L322,362 L522,330 L722,356 L902,330 L1102,360 L1300,336 L1502,360 L1600,346 L1600,382 Z" fill="#A8432B" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- ridge shading lines -->
    <g stroke="#2C231D" stroke-width="1.6" opacity=".35" fill="none" stroke-linecap="round">
      <path d="M560,146 L546,246"/><path d="M780,122 L772,226"/><path d="M1012,172 L1004,258"/><path d="M342,182 L306,258"/>
    </g>
    <!-- Star on the Mountain -->
    <g transform="translate(780,110)">
      <path d="M0,-15 L4.4,-4.6 L15.6,-4.6 L6.6,2.8 L9.6,14 L0,7.2 L-9.6,14 L-6.6,2.8 L-15.6,-4.6 L-4.4,-4.6 Z" fill="#E3A035" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
    </g>

    <!-- birds -->
    <g stroke="#2C231D" stroke-width="2.4" fill="none" stroke-linecap="round">
      <path d="M300,150 q9,-9 18,0 q9,-9 18,0"/><path d="M360,128 q7,-7 14,0 q7,-7 14,0"/><path d="M1120,96 q8,-8 16,0 q8,-8 16,0"/>
    </g>

    <!-- land / street grid -->
    <g clip-path="url(#land)">
      <rect x="34" y="384" width="1532" height="452" fill="#F4EAD8"/>
      <rect x="34" y="384" width="1532" height="452" fill="url(#grid)"/>
    </g>

    <!-- roads -->
    <path d="M960,640 C 1080,600 1180,540 1280,460 C 1320,428 1350,412 1372,404" stroke="#E6D2A9" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M120,560 C 460,540 900,548 1500,516" stroke="#E6D2A9" stroke-width="12" fill="none" stroke-linecap="round"/>

    <!-- ===== FREEWAYS ===== -->
    <path d="M-20,412 C 180,420 300,452 420,470 C 620,500 760,505 940,478 C 1120,452 1260,436 1660,430" fill="none" stroke="#CBB693" stroke-width="15" stroke-linecap="round"/>
    <path d="M-20,412 C 180,420 300,452 420,470 C 620,500 760,505 940,478 C 1120,452 1260,436 1660,430" fill="none" stroke="#FAF4EB" stroke-width="2.5" stroke-dasharray="9 12"/>
    <path d="M-20,776 C 220,758 360,824 620,798 C 860,774 1010,832 1250,796 C 1440,773 1560,802 1660,778" fill="none" stroke="#CBB693" stroke-width="8" stroke-linecap="round"/>
    <path d="M-20,776 C 220,758 360,824 620,798 C 860,774 1010,832 1250,796 C 1440,773 1560,802 1660,778" fill="none" stroke="#FAF4EB" stroke-width="1.8" stroke-dasharray="7 9"/>
    <!-- interstate + highway shields -->
    <g transform="translate(250,452)"><path d="M-15,-16 Q0,-19 15,-16 L15,-3 Q15,8 0,16 Q-15,8 -15,-3 Z" fill="#FBF6EE" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/><path d="M-15,-16 Q0,-19 15,-16 L15,-9 L-15,-9 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="2"/></g>
    <g transform="translate(1330,436)"><path d="M-15,-16 Q0,-19 15,-16 L15,-3 Q15,8 0,16 Q-15,8 -15,-3 Z" fill="#FBF6EE" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/><path d="M-15,-16 Q0,-19 15,-16 L15,-9 L-15,-9 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="2"/></g>
    <g transform="translate(1238,452)"><path d="M-14,-15 Q0,-18 14,-15 L14,-3 Q14,7 0,15 Q-14,7 -14,-3 Z" fill="#FBF6EE" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/><path d="M-14,-15 Q0,-18 14,-15 L14,-8 L-14,-8 Z" fill="#D15A3A" stroke="#2C231D" stroke-width="2"/></g>
    <g transform="translate(520,772)"><rect x="-15" y="-15" width="30" height="30" rx="5" fill="#FBF6EE" stroke="#2C231D" stroke-width="2.5"/></g>

    <!-- ===== CARS ===== -->
    <g transform="translate(0,546)"><g style="animation:driveR 19s linear infinite">
      <rect x="-26" y="-4" width="52" height="16" rx="7" fill="#D15A3A" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-15,-4 Q-12,-16 0,-16 L6,-16 Q16,-16 18,-4 Z" fill="#D15A3A" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="-9" y="-13" width="20" height="9" rx="3" fill="#FAF4EB" stroke="#2C231D" stroke-width="1.5"/>
      <circle cx="-14" cy="12" r="6" fill="#2C231D"/><circle cx="14" cy="12" r="6" fill="#2C231D"/><circle cx="-14" cy="12" r="2" fill="#FAF4EB"/><circle cx="14" cy="12" r="2" fill="#FAF4EB"/>
    </g></g>
    <g transform="translate(0,560)"><g style="animation:driveL 26s linear infinite"><g transform="scale(-1,1)">
      <rect x="-26" y="-4" width="52" height="16" rx="7" fill="#2E6F69" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-15,-4 Q-12,-16 0,-16 L6,-16 Q16,-16 18,-4 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="-9" y="-13" width="20" height="9" rx="3" fill="#FAF4EB" stroke="#2C231D" stroke-width="1.5"/>
      <circle cx="-14" cy="12" r="6" fill="#2C231D"/><circle cx="14" cy="12" r="6" fill="#2C231D"/><circle cx="-14" cy="12" r="2" fill="#FAF4EB"/><circle cx="14" cy="12" r="2" fill="#FAF4EB"/>
    </g></g></g>


    <!-- Rio Grande -->
    <use href="#rio" stroke="#2E6F69" stroke-width="46" stroke-linecap="round"/>
    <g stroke="#1F4F4A" stroke-width="2.5" fill="none" opacity=".55" stroke-linecap="round">
      <path d="M180,795 q14,-7 28,0"/><path d="M470,808 q14,-7 28,0"/><path d="M760,806 q14,-7 28,0"/><path d="M1080,820 q14,-7 28,0"/><path d="M1360,806 q14,-7 28,0"/>
    </g>

    <!-- ===== McKELLIGON CANYON (concerts under the stars) ===== -->
    <g transform="translate(1120,430)">
      <path d="M-90,40 L-70,-70 L-30,20 L-10,-40 L10,30 Z" fill="#B84A2E" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M90,40 L70,-64 L34,24 L14,-30 L-6,34 Z" fill="#C96A44" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M-40,58 a44,20 0 0 1 88,0 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-30,52 a30,13 0 0 1 60,0" fill="none" stroke="#FAF4EB" stroke-width="2"/>
      <path d="M-18,46 a18,8 0 0 1 36,0" fill="none" stroke="#FAF4EB" stroke-width="2"/>
      <g stroke="#E3A035" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M20,20 q8,-10 2,-20"/><path d="M30,26 q10,-8 18,-2"/></g>
    </g>

    <!-- ===== SCENIC DRIVE overlook ===== -->
    <g transform="translate(1372,398)">
      <line x1="-16" y1="0" x2="16" y2="0" stroke="#2C231D" stroke-width="4" stroke-linecap="round"/>
      <line x1="-13" y1="0" x2="-13" y2="12" stroke="#2C231D" stroke-width="3"/><line x1="13" y1="0" x2="13" y2="12" stroke="#2C231D" stroke-width="3"/>
      <circle cx="-2" cy="-14" r="9" fill="none" stroke="#2C231D" stroke-width="3"/><line x1="5" y1="-8" x2="16" y2="2" stroke="#2C231D" stroke-width="3" stroke-linecap="round"/>
    </g>

    <!-- ===== DOWNTOWN skyline ===== -->
    <g>
      <rect x="820" y="512" width="46" height="128" fill="#2E6F69" stroke="#2C231D" stroke-width="2.5"/>
      <rect x="872" y="468" width="56" height="172" fill="#D15A3A" stroke="#2C231D" stroke-width="2.5"/>
      <line x1="900" y1="468" x2="900" y2="446" stroke="#2C231D" stroke-width="3"/>
      <path d="M900,432 L903,439 L910,439 L904,443 L906,450 L900,446 L894,450 L896,443 L890,439 L897,439 Z" fill="#E3A035" stroke="#2C231D" stroke-width="1.5"/>
      <rect x="934" y="540" width="42" height="100" fill="#E3A035" stroke="#2C231D" stroke-width="2.5"/>
      <rect x="982" y="556" width="38" height="84" fill="#C97A54" stroke="#2C231D" stroke-width="2.5"/>
      <rect x="786" y="558" width="34" height="82" fill="#C96A44" stroke="#2C231D" stroke-width="2.5"/>
      <g fill="#FAF4EB" opacity=".55">
        <rect x="828" y="522" width="8" height="10"/><rect x="844" y="522" width="8" height="10"/><rect x="828" y="544" width="8" height="10"/><rect x="844" y="544" width="8" height="10"/><rect x="828" y="566" width="8" height="10"/><rect x="844" y="566" width="8" height="10"/>
        <rect x="882" y="482" width="9" height="11"/><rect x="899" y="482" width="9" height="11"/><rect x="882" y="506" width="9" height="11"/><rect x="899" y="506" width="9" height="11"/><rect x="882" y="530" width="9" height="11"/><rect x="899" y="530" width="9" height="11"/><rect x="882" y="554" width="9" height="11"/><rect x="899" y="554" width="9" height="11"/>
        <rect x="944" y="552" width="8" height="10"/><rect x="958" y="552" width="8" height="10"/><rect x="944" y="574" width="8" height="10"/><rect x="958" y="574" width="8" height="10"/>
      </g>
    </g>

    <!-- ===== PLAZA THEATRE ===== -->
    <g transform="translate(690,588)">
      <rect x="-46" y="-8" width="92" height="66" fill="#E3A035" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-52,-8 L0,-40 L52,-8 Z" fill="#D15A3A" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M-16,58 L-16,22 a16,16 0 0 1 32,0 L16,58 Z" fill="#2C231D"/>
      <rect x="-40" y="6" width="14" height="16" fill="#FAF4EB" stroke="#2C231D" stroke-width="1.5"/><rect x="26" y="6" width="14" height="16" fill="#FAF4EB" stroke="#2C231D" stroke-width="1.5"/>
      <!-- vertical blade -->
      <rect x="-6" y="-96" width="12" height="58" fill="#2E6F69" stroke="#2C231D" stroke-width="2"/>
      <g fill="#E3A035"><circle cx="-6" cy="-90" r="2.4"/><circle cx="6" cy="-90" r="2.4"/><circle cx="-6" cy="-78" r="2.4"/><circle cx="6" cy="-78" r="2.4"/><circle cx="-6" cy="-66" r="2.4"/><circle cx="6" cy="-66" r="2.4"/><circle cx="-6" cy="-54" r="2.4"/><circle cx="6" cy="-54" r="2.4"/></g>
    </g>

    <!-- ===== MISSION TRAIL (Ysleta · Socorro · San Elizario) ===== -->
    <path d="M498,674 Q556,680 616,676" fill="none" stroke="#B84A2E" stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round"/>
    <g transform="translate(498,650) scale(.78)">
      <rect x="-20" y="-4" width="40" height="34" fill="#E9C69A" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-20,-4 Q-20,-18 -6,-20 Q0,-27 6,-20 Q20,-18 20,-4 Z" fill="#E0B583" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="0" y1="-27" x2="0" y2="-34" stroke="#2C231D" stroke-width="2.5"/><line x1="-4" y1="-31" x2="4" y2="-31" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-6,30 L-6,10 a6,6 0 0 1 12,0 L6,30 Z" fill="#2C231D"/>
      <circle cx="0" cy="-8" r="4" fill="none" stroke="#2C231D" stroke-width="1.5"/>
    </g>
    <g transform="translate(618,652) scale(.84)">
      <rect x="-20" y="-4" width="40" height="34" fill="#E9C69A" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-20,-4 Q-20,-18 -6,-20 Q0,-27 6,-20 Q20,-18 20,-4 Z" fill="#E0B583" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="0" y1="-27" x2="0" y2="-34" stroke="#2C231D" stroke-width="2.5"/><line x1="-4" y1="-31" x2="4" y2="-31" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-6,30 L-6,10 a6,6 0 0 1 12,0 L6,30 Z" fill="#2C231D"/>
      <circle cx="0" cy="-8" r="4" fill="none" stroke="#2C231D" stroke-width="1.5"/>
    </g>
    <!-- Ysleta (bell tower) -->
    <g transform="translate(556,632)">
      <rect x="-40" y="-6" width="72" height="52" fill="#E9C69A" stroke="#2C231D" stroke-width="2.5"/>
      <rect x="-58" y="-40" width="26" height="86" fill="#E0B583" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-58,-40 a13,13 0 0 1 26,0 Z" fill="#D15A3A" stroke="#2C231D" stroke-width="2.5"/>
      <line x1="-45" y1="-58" x2="-45" y2="-40" stroke="#2C231D" stroke-width="2.5"/><line x1="-51" y1="-52" x2="-39" y2="-52" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-16,46 L-16,16 a10,10 0 0 1 20,0 L4,46 Z" fill="#2C231D"/>
      <circle cx="14" cy="10" r="7" fill="none" stroke="#2C231D" stroke-width="2"/>
    </g>

    <!-- ===== SAN JACINTO PLAZA + alligators ===== -->
    <g transform="translate(936,690)">
      <line x1="0" y1="20" x2="0" y2="0" stroke="#7A4A2E" stroke-width="6" stroke-linecap="round"/>
      <circle cx="0" cy="-16" r="30" fill="#2E6F69" stroke="#2C231D" stroke-width="2.5"/>
      <circle cx="-20" cy="0" r="18" fill="#2E6F69" stroke="#2C231D" stroke-width="2.5"/>
      <circle cx="20" cy="-2" r="16" fill="#2E6F69" stroke="#2C231D" stroke-width="2.5"/>
      <!-- alligator sculpture -->
      <g transform="translate(-6,44)">
        <path d="M-42,0 q10,-12 26,-8 q6,-10 18,-6 q10,-2 16,6 l14,2 l-10,6 l-16,2 q-16,8 -30,2 q-14,4 -18,-6 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="16" cy="-6" r="2" fill="#2C231D"/>
        <g stroke="#2C231D" stroke-width="2" fill="none"><path d="M-24,-3 l-3,-6"/><path d="M-14,-6 l-2,-6"/><path d="M-4,-7 l-1,-6"/></g>
      </g>
    </g>

    <!-- ===== MERCADO / market stalls ===== -->
    <g transform="translate(600,700)">
      <!-- stall 1 -->
      <g transform="translate(-46,0)">
        <line x1="-22" y1="-2" x2="-22" y2="30" stroke="#2C231D" stroke-width="3"/><line x1="22" y1="-2" x2="22" y2="30" stroke="#2C231D" stroke-width="3"/>
        <path d="M-26,-2 q6.5,10 13,0 q6.5,10 13,0 q6.5,10 13,0 q6.5,10 13,0" fill="#D15A3A" stroke="#2C231D" stroke-width="2"/>
        <rect x="-24" y="30" width="48" height="10" fill="#E9C69A" stroke="#2C231D" stroke-width="2"/>
        <circle cx="-10" cy="24" r="3" fill="#E3A035"/><circle cx="2" cy="24" r="3" fill="#E3A035"/><circle cx="12" cy="24" r="3" fill="#D15A3A"/>
      </g>
      <!-- stall 2 -->
      <g transform="translate(46,4)">
        <line x1="-22" y1="-2" x2="-22" y2="26" stroke="#2C231D" stroke-width="3"/><line x1="22" y1="-2" x2="22" y2="26" stroke="#2C231D" stroke-width="3"/>
        <path d="M-26,-2 q6.5,10 13,0 q6.5,10 13,0 q6.5,10 13,0 q6.5,10 13,0" fill="#2E6F69" stroke="#2C231D" stroke-width="2"/>
        <rect x="-24" y="26" width="48" height="10" fill="#E9C69A" stroke="#2C231D" stroke-width="2"/>
      </g>
    </g>

    <!-- ===== desert plants ===== -->
    <g stroke="#2C231D" stroke-width="2" stroke-linejoin="round">
      <!-- agave -->
      <g transform="translate(250,760)" fill="#2E6F69"><path d="M0,0 L-16,-14 L-4,-2 Z"/><path d="M0,0 L-8,-22 L2,-4 Z"/><path d="M0,0 L4,-24 L0,-4 Z"/><path d="M0,0 L14,-16 L4,-2 Z"/><path d="M0,0 L18,-6 L6,0 Z"/></g>
      <!-- yucca -->
      <g transform="translate(340,712)" fill="#2E6F69"><path d="M0,0 L-14,-20 L-3,-3 Z"/><path d="M0,0 L-4,-26 L2,-3 Z"/><path d="M0,0 L8,-24 L2,-3 Z"/><path d="M0,0 L16,-16 L4,-2 Z"/></g>
    </g>

    <!-- ===== DESERT LOCALS ===== -->
    <!-- roadrunner -->
    <g transform="translate(122,662)">
      <path d="M-8,-2 L-34,-20 L-24,-6 Z" fill="#8A5A3C" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <path d="M-10,2 Q-14,-12 2,-14 Q16,-14 18,-2 Q16,6 4,6 Q-6,8 -10,2 Z" fill="#B9784E" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <path d="M4,-8 Q6,-2 0,3" fill="none" stroke="#2E6F69" stroke-width="3" stroke-linecap="round" opacity=".8"/>
      <path d="M14,-8 Q22,-16 26,-22" fill="none" stroke="#B9784E" stroke-width="6" stroke-linecap="round"/>
      <circle cx="27" cy="-24" r="5" fill="#B9784E" stroke="#2C231D" stroke-width="2"/>
      <path d="M25,-28 L23,-34 M28,-28 L30,-35" stroke="#2C231D" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M31,-24 L40,-22 L31,-20 Z" fill="#E3A035" stroke="#2C231D" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="28" cy="-25" r="1.2" fill="#2C231D"/>
      <line x1="0" y1="6" x2="-2" y2="18" stroke="#2C231D" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="6" x2="10" y2="18" stroke="#2C231D" stroke-width="2" stroke-linecap="round"/>
      <path d="M-2,18 l-4,2 M-2,18 l3,3 M10,18 l-4,2 M10,18 l3,3" stroke="#2C231D" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </g>
    <!-- javelina -->
    <g transform="translate(1408,762)">
      <ellipse cx="0" cy="0" rx="22" ry="13" fill="#7A6152" stroke="#2C231D" stroke-width="2"/>
      <path d="M-14,-11 l-2,-6 M-6,-13 l-1,-7 M2,-13 l1,-7 M10,-11 l2,-6" stroke="#2C231D" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M18,-6 Q30,-8 32,2 Q30,8 20,8 Z" fill="#7A6152" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <ellipse cx="31" cy="2" rx="4" ry="3" fill="#4A3B30" stroke="#2C231D" stroke-width="1.5"/>
      <path d="M20,-6 l-2,-8 l6,4 Z" fill="#7A6152" stroke="#2C231D" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M14,-8 Q16,0 12,10" stroke="#E9DECF" stroke-width="3" fill="none"/>
      <circle cx="26" cy="-2" r="1.3" fill="#2C231D"/>
      <line x1="-10" y1="11" x2="-10" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round"/>
      <line x1="-2" y1="12" x2="-2" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round"/>
      <line x1="8" y1="12" x2="8" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round"/>
      <line x1="16" y1="11" x2="16" y2="21" stroke="#2C231D" stroke-width="3" stroke-linecap="round"/>
    </g>
    <!-- jackrabbit -->
    <g transform="translate(112,744)">
      <ellipse cx="0" cy="4" rx="13" ry="9" fill="#C79A5E" stroke="#2C231D" stroke-width="2"/>
      <path d="M-10,2 Q-16,6 -12,14 Q-6,14 -4,8 Z" fill="#C79A5E" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="10" cy="-2" r="6" fill="#C79A5E" stroke="#2C231D" stroke-width="2"/>
      <path d="M8,-7 Q4,-22 8,-24 Q12,-22 11,-7 Z" fill="#C79A5E" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <path d="M13,-7 Q13,-20 17,-21 Q19,-18 16,-7 Z" fill="#C79A5E" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="12" cy="-2" r="1.2" fill="#2C231D"/>
      <line x1="-2" y1="12" x2="-2" y2="18" stroke="#2C231D" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="6" y1="12" x2="7" y2="18" stroke="#2C231D" stroke-width="2.5" stroke-linecap="round"/>
    </g>

    <!-- ===== BURRITO CART ===== -->
    <g transform="translate(456,706)">
      <line x1="-32" y1="-6" x2="-32" y2="-34" stroke="#2C231D" stroke-width="2.5"/><line x1="32" y1="-6" x2="32" y2="-34" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-38,-34 L38,-34 L34,-22 L-34,-22 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <path d="M-34,-22 q6.5,9 13,0 q6.5,9 13,0 q6.5,9 13,0 q6.5,9 13,0 q6.5,9 13,0" fill="#2E6F69" stroke="#2C231D" stroke-width="1.5"/>
      <path d="M-24,-34 L-27,-22 M-8,-34 L-11,-22 M8,-34 L5,-22 M24,-34 L21,-22" stroke="#FAF4EB" stroke-width="3" fill="none" opacity=".8"/>
      <rect x="-30" y="-4" width="60" height="28" rx="4" fill="#E3A035" stroke="#2C231D" stroke-width="2.5"/>
      <rect x="-34" y="-8" width="68" height="6" rx="2" fill="#D15A3A" stroke="#2C231D" stroke-width="2"/>
      <rect x="-20" y="4" width="40" height="14" rx="2" fill="#C97A54" stroke="#2C231D" stroke-width="1.5"/>
      <circle cx="-18" cy="28" r="7" fill="#2C231D"/><circle cx="18" cy="28" r="7" fill="#2C231D"/>
      <circle cx="-18" cy="28" r="2.5" fill="#FAF4EB"/><circle cx="18" cy="28" r="2.5" fill="#FAF4EB"/>
      <g transform="translate(0,-14)">
        <path d="M-13,0 q0,-5 13,-5 q13,0 13,5 q0,5 -13,5 q-13,0 -13,-5 Z" fill="#E9C69A" stroke="#2C231D" stroke-width="2"/>
        <path d="M-11,-1 q13,-3 24,0" stroke="#2C231D" stroke-width="1.3" fill="none"/>
        <path d="M-8,3 l3,-3 M0,4 l3,-3 M8,3 l3,-3" stroke="#D15A3A" stroke-width="1.3" fill="none"/>
      </g>
      <path d="M-4,-17 q4,-3 0,-6" stroke="#B9A88E" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M4,-17 q4,-3 0,-6" stroke="#B9A88E" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
    </g>
    <!-- pup by the plaza -->
    <g transform="translate(986,772)">
      <ellipse cx="0" cy="0" rx="11" ry="6" fill="#B9784E" stroke="#2C231D" stroke-width="2"/>
      <circle cx="11" cy="-4" r="4.5" fill="#B9784E" stroke="#2C231D" stroke-width="2"/>
      <path d="M9,-8 l-2,-5 l5,3 Z" fill="#8A5A3C" stroke="#2C231D" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="12.5" cy="-4" r="1" fill="#2C231D"/>
      <line x1="-6" y1="5" x2="-6" y2="12" stroke="#2C231D" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="5" x2="4" y2="12" stroke="#2C231D" stroke-width="2" stroke-linecap="round"/>
      <path d="M-10,-2 Q-16,-4 -18,-10" fill="none" stroke="#8A5A3C" stroke-width="2.5" stroke-linecap="round" style="transform-box:fill-box;transform-origin:100% 100%;animation:legf .5s ease-in-out infinite"/>
    </g>

    <!-- ===== UTEP + SUN BOWL ===== -->
    <g transform="translate(210,650)">
      <path d="M-38,-34 L38,-34 L30,-42 L-30,-42 Z" fill="#8A5A3C" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <path d="M-34,10 L-28,-34 L28,-34 L34,10 Z" fill="#E9C69A" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M-27,-30 L27,-30 L26,-23 L-26,-23 Z" fill="#D15A3A" stroke="#2C231D" stroke-width="1.5"/>
      <g fill="#2C231D"><rect x="-18" y="-18" width="6" height="9"/><rect x="-6" y="-18" width="6" height="9"/><rect x="6" y="-18" width="6" height="9"/><rect x="-16" y="-4" width="6" height="9"/><rect x="-4" y="-4" width="6" height="9"/><rect x="8" y="-4" width="6" height="9"/></g>
      <path d="M-48,10 L-44,-18 L-32,-18 L-30,10 Z" fill="#E0B583" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M-49,-18 L-31,-18 L-35,-25 L-45,-25 Z" fill="#8A5A3C" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <rect x="-42" y="-12" width="5" height="7" fill="#2C231D"/><rect x="-42" y="0" width="5" height="7" fill="#2C231D"/>
    </g>
    <g transform="translate(302,666)">
      <ellipse cx="0" cy="0" rx="40" ry="20" fill="#E0B583" stroke="#2C231D" stroke-width="2.5"/>
      <g stroke="#2C231D" stroke-width="1" opacity=".4"><line x1="0" y1="-20" x2="0" y2="-11"/><line x1="20" y1="-14" x2="14" y2="-8"/><line x1="-20" y1="-14" x2="-14" y2="-8"/><line x1="32" y1="-4" x2="24" y2="-2"/><line x1="-32" y1="-4" x2="-24" y2="-2"/></g>
      <ellipse cx="0" cy="1" rx="26" ry="11" fill="#2E6F69" stroke="#2C231D" stroke-width="2"/>
      <g stroke="#FAF4EB" stroke-width="1.5"><line x1="-13" y1="-4" x2="-13" y2="6"/><line x1="0" y1="-6" x2="0" y2="8"/><line x1="13" y1="-4" x2="13" y2="6"/></g>
      <g stroke="#2C231D" stroke-width="1.5"><line x1="-34" y1="-11" x2="-40" y2="-22"/><line x1="34" y1="-11" x2="40" y2="-22"/></g>
      <rect x="-43" y="-27" width="7" height="5" fill="#E3A035" stroke="#2C231D" stroke-width="1"/><rect x="37" y="-27" width="7" height="5" fill="#E3A035" stroke="#2C231D" stroke-width="1"/>
    </g>

    <!-- ===== EL PASO CHIHUAHUAS (baseball) ===== -->
    <g transform="translate(1118,708)">
      <circle cx="22" cy="8" r="8" fill="#FBF6EE" stroke="#2C231D" stroke-width="2"/>
      <path d="M17,3 q5,5 0,10 M27,3 q-5,5 0,10" stroke="#D15A3A" stroke-width="1.2" fill="none"/>
      <path d="M-16,4 Q-18,-10 -6,-12 Q-2,-19 4,-12 Q14,-12 14,2 Q14,12 0,14 Q-12,14 -16,4 Z" fill="#C79A5E" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <path d="M-8,-11 L-16,-24 L-2,-14 Z" fill="#C79A5E" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <path d="M5,-13 L11,-25 L15,-12 Z" fill="#C79A5E" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <path d="M-13,-9 Q0,-22 13,-9 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M9,-11 L20,-8 L9,-6 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="-4" cy="0" r="1.5" fill="#2C231D"/><circle cx="6" cy="0" r="1.5" fill="#2C231D"/>
      <circle cx="1" cy="5" r="1.8" fill="#2C231D"/>
      <path d="M1,7 v3 M-3,10 q4,3 8,0" stroke="#2C231D" stroke-width="1.3" fill="none"/>
    </g>

    <!-- ===== EL PASO RHINOS (hockey) ===== -->
    <g transform="translate(1250,690)">
      <line x1="-18" y1="8" x2="-2" y2="26" stroke="#8A5A3C" stroke-width="3" stroke-linecap="round"/>
      <path d="M-2,26 l11,3 l-3,-6 Z" fill="#8A5A3C" stroke="#2C231D" stroke-width="1.5" stroke-linejoin="round"/>
      <ellipse cx="16" cy="27" rx="5" ry="2.5" fill="#2C231D"/>
      <path d="M-16,6 Q-20,-8 -8,-12 Q0,-14 10,-10 Q20,-8 24,2 L17,4 Q15,10 4,10 Q-10,12 -16,6 Z" fill="#96897C" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <path d="M-7,-11 l-2,-8 l6,4 Z" fill="#96897C" stroke="#2C231D" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M23,1 L35,-5 L25,5 Z" fill="#E9C69A" stroke="#2C231D" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M18,-4 L24,-11 L23,-2 Z" fill="#E9C69A" stroke="#2C231D" stroke-width="1.4" stroke-linejoin="round"/>
      <circle cx="7" cy="-2" r="1.5" fill="#2C231D"/>
    </g>

    <!-- ===== MONTGOMERY BUILDING (historic downtown) ===== -->
    <g transform="translate(1014,636)">
      <rect x="-24" y="-140" width="48" height="140" fill="#C96A44" stroke="#2C231D" stroke-width="2.5"/>
      <rect x="-28" y="-150" width="56" height="12" fill="#B84A2E" stroke="#2C231D" stroke-width="2"/>
      <rect x="-14" y="-162" width="28" height="12" fill="#D15A3A" stroke="#2C231D" stroke-width="2"/>
      <line x1="-9" y1="-138" x2="-9" y2="-2" stroke="#2C231D" stroke-width="1" opacity=".35"/><line x1="9" y1="-138" x2="9" y2="-2" stroke="#2C231D" stroke-width="1" opacity=".35"/>
      <g fill="#E9DEC9" stroke="#2C231D" stroke-width="1">
        <path d="M-17,-118 h8 v-9 a4,4 0 0 0 -8,0 Z"/><path d="M-4,-118 h8 v-9 a4,4 0 0 0 -8,0 Z"/><path d="M9,-118 h8 v-9 a4,4 0 0 0 -8,0 Z"/>
        <rect x="-17" y="-100" width="8" height="12"/><rect x="-4" y="-100" width="8" height="12"/><rect x="9" y="-100" width="8" height="12"/>
        <rect x="-17" y="-78" width="8" height="12"/><rect x="-4" y="-78" width="8" height="12"/><rect x="9" y="-78" width="8" height="12"/>
        <rect x="-17" y="-56" width="8" height="12"/><rect x="-4" y="-56" width="8" height="12"/><rect x="9" y="-56" width="8" height="12"/>
        <rect x="-17" y="-34" width="8" height="12"/><rect x="-4" y="-34" width="8" height="12"/><rect x="9" y="-34" width="8" height="12"/>
      </g>
      <path d="M-8,0 v-15 a8,8 0 0 1 16,0 V0 Z" fill="#2C231D"/>
    </g>

    <!-- ===== PANCHO VILLA MONUMENT (equestrian statue) ===== -->
    <g transform="translate(1188,596)">
      <rect x="-20" y="30" width="40" height="10" fill="#B3A288" stroke="#2C231D" stroke-width="2"/>
      <rect x="-15" y="12" width="30" height="20" fill="#C7B8A0" stroke="#2C231D" stroke-width="2.5"/>
      <g fill="#8A5A3C" stroke="#2C231D" stroke-width="2" stroke-linejoin="round">
        <path d="M-16,10 L-15,-2 Q-12,-8 -2,-9 L6,-11 Q15,-12 19,-4 L20,6 L15,10 L14,0 L2,2 L0,10 L-4,10 L-3,2 L-11,3 L-12,10 Z"/>
        <path d="M17,-6 Q23,-9 22,-16 L17,-18 L13,-9 Z"/>
        <path d="M-15,-1 Q-22,-3 -25,2" fill="none" stroke-width="2.5"/>
      </g>
      <g stroke="#2C231D" stroke-width="2" stroke-linejoin="round">
        <path d="M2,-10 L5,-24 L11,-23 L9,-8 Z" fill="#7A4A2E"/>
        <circle cx="9" cy="-27" r="4" fill="#B9784E"/>
        <path d="M1,-29 Q9,-34 17,-29 L13,-26 L5,-26 Z" fill="#6E4A2E"/>
      </g>
    </g>

    <!-- ===== HUECO TANKS (rock formations + pictograph) ===== -->
    <g transform="translate(1500,452)">
      <path d="M-40,30 Q-48,2 -30,-6 Q-34,-26 -12,-24 Q-4,-38 14,-28 Q34,-30 34,-6 Q47,-2 40,28 Z" fill="#C0895A" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M-30,-6 Q-20,-2 -12,-24" fill="none" stroke="#2C231D" stroke-width="1.5" opacity=".45"/>
      <path d="M14,-28 Q18,-6 34,-6" fill="none" stroke="#2C231D" stroke-width="1.5" opacity=".45"/>
      <ellipse cx="-12" cy="6" rx="4.5" ry="3.5" fill="#8A5A3C"/><ellipse cx="18" cy="2" rx="3.5" ry="3" fill="#8A5A3C"/>
      <g stroke="#D15A3A" stroke-width="1.6" fill="none" stroke-linecap="round"><circle cx="2" cy="-8" r="4"/><path d="M2,-4 v7 M-3,0 h10"/></g>
    </g>

    <!-- ===== ASCARATE PARK (lake) ===== -->
    <g transform="translate(858,800)">
      <ellipse cx="0" cy="0" rx="42" ry="16" fill="#2E6F69" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-26,-2 a8,3 0 0 1 16,0 M4,3 a7,3 0 0 1 14,0" fill="none" stroke="#FAF4EB" stroke-width="1.5" opacity=".7"/>
      <path d="M-16,-1 q7,7 15,0 Z" fill="#E3A035" stroke="#2C231D" stroke-width="1.5"/>
      <g><line x1="-40" y1="-6" x2="-40" y2="2" stroke="#7A4A2E" stroke-width="3"/><circle cx="-40" cy="-13" r="9" fill="#2E6F69" stroke="#2C231D" stroke-width="2"/></g>
      <g><line x1="45" y1="-4" x2="45" y2="3" stroke="#7A4A2E" stroke-width="3"/><circle cx="45" cy="-11" r="8" fill="#3A8074" stroke="#2C231D" stroke-width="2"/></g>
      <g transform="translate(2,-22)">
        <line x1="-6" y1="-6" x2="0" y2="10" stroke="#2C231D" stroke-width="1.5"/><line x1="6" y1="-6" x2="0" y2="10" stroke="#2C231D" stroke-width="1.5"/>
        <g stroke="#2C231D" stroke-width="1.6" fill="none"><circle cx="0" cy="-4" r="12"/><line x1="-12" y1="-4" x2="12" y2="-4"/><line x1="0" y1="-16" x2="0" y2="8"/><line x1="-8.5" y1="-12.5" x2="8.5" y2="4.5"/><line x1="8.5" y1="-12.5" x2="-8.5" y2="4.5"/></g>
        <g fill="#D15A3A"><circle cx="0" cy="-16" r="2.4"/><circle cx="12" cy="-4" r="2.4"/><circle cx="0" cy="8" r="2.4"/><circle cx="-12" cy="-4" r="2.4"/></g>
      </g>
    </g>

    <!-- ===== EL PASO HIGH SCHOOL (the haunted Lady on the Hill) ===== -->
    <g transform="translate(430,440)">
      <path d="M-62,28 Q-24,8 0,8 Q24,8 62,28 Z" fill="#D9C6A2" stroke="#2C231D" stroke-width="2"/>
      <rect x="-40" y="-22" width="80" height="34" fill="#E4CDA0" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-17,-22 L0,-37 L17,-22 Z" fill="#C96A44" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <g stroke="#2C231D" stroke-width="1.3" fill="#FBF6EE"><rect x="-13" y="-22" width="4" height="30"/><rect x="-5" y="-22" width="4" height="30"/><rect x="3" y="-22" width="4" height="30"/><rect x="9" y="-22" width="4" height="30"/></g>
      <g fill="#2C231D"><rect x="-34" y="-14" width="6" height="9"/><rect x="-24" y="-14" width="6" height="9"/><rect x="22" y="-14" width="6" height="9"/><rect x="32" y="-14" width="6" height="9"/></g>
      <g transform="translate(50,-30)" style="animation:bob 2.6s ease-in-out infinite">
        <path d="M-8,6 Q-8,-10 0,-10 Q8,-10 8,6 L4,3 L0,6 L-4,3 Z" fill="#FBF6EE" stroke="#2C231D" stroke-width="1.5" opacity=".92"/>
        <circle cx="-3" cy="-2" r="1.2" fill="#2C231D"/><circle cx="3" cy="-2" r="1.2" fill="#2C231D"/>
      </g>
    </g>

    <!-- ===== EL PASO MUSEUM OF ART ===== -->
    <g transform="translate(600,452)">
      <rect x="-40" y="24" width="80" height="6" fill="#C7B8A0" stroke="#2C231D" stroke-width="2"/>
      <rect x="-34" y="-6" width="68" height="30" fill="#E9DEC9" stroke="#2C231D" stroke-width="2.5"/>
      <path d="M-40,-6 L0,-28 L40,-6 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/>
      <g stroke="#2C231D" stroke-width="1.4" fill="#FBF6EE"><rect x="-28" y="-6" width="6" height="30"/><rect x="-16" y="-6" width="6" height="30"/><rect x="-4" y="-6" width="6" height="30"/><rect x="8" y="-6" width="6" height="30"/><rect x="20" y="-6" width="6" height="30"/></g>
      <rect x="34" y="-4" width="9" height="24" fill="#D15A3A" stroke="#2C231D" stroke-width="1.5"/>
    </g>

    <!-- ===== SECRET UNDERGROUND TUNNELS (downtown) ===== -->
    <g>
      <path d="M726,668 Q748,650 770,668 Z" fill="#C7B08A" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <path d="M740,668 a8,11 0 0 1 16,0 Z" fill="#1A140F"/>
      <path d="M756,668 H846" stroke="#2C231D" stroke-width="2" stroke-dasharray="4 6" opacity=".55"/>
      <path d="M834,668 Q852,652 870,668 Z" fill="#C7B08A" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/>
      <path d="M844,668 a7,9 0 0 1 14,0 Z" fill="#1A140F"/>
      <g transform="translate(800,660)"><line x1="0" y1="-7" x2="0" y2="-2" stroke="#2C231D" stroke-width="1.5"/><rect x="-3.5" y="-2" width="7" height="9" rx="1.5" fill="#E3A035" stroke="#2C231D" stroke-width="1.5"/></g>
    </g>

    <!-- ===== PEOPLE ===== -->
    <g style="display:{{ peopleDisplay }}">
      <!-- plaza strollers (walking) -->
      <g transform="translate(896,752)"><g style="animation:bob .72s ease-in-out infinite">
        <line x1="-4" y1="6" x2="-9" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legf .72s ease-in-out infinite"/>
        <line x1="4" y1="6" x2="8" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legb .72s ease-in-out infinite"/>
        <path d="M-9,-6 Q0,-11 9,-6 L7,8 L-7,8 Z" fill="#D15A3A" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-12" r="5.5" fill="#B9784E" stroke="#2C231D" stroke-width="2"/>
      </g></g>
      <g transform="translate(984,758)"><g style="animation:bob .66s ease-in-out infinite;animation-delay:-.2s">
        <line x1="-6" y1="6" x2="-10" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legf .66s ease-in-out infinite;animation-delay:-.2s"/>
        <line x1="4" y1="6" x2="9" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legb .66s ease-in-out infinite;animation-delay:-.2s"/>
        <path d="M-9,-6 Q0,-11 9,-6 L7,8 L-7,8 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-12" r="5.5" fill="#8A5A3C" stroke="#2C231D" stroke-width="2"/>
      </g></g>
      <!-- downtown walkers -->
      <g transform="translate(770,700)"><g style="animation:bob .70s ease-in-out infinite;animation-delay:-.35s">
        <line x1="-5" y1="6" x2="-10" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legf .70s ease-in-out infinite;animation-delay:-.35s"/>
        <line x1="4" y1="6" x2="9" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legb .70s ease-in-out infinite;animation-delay:-.35s"/>
        <path d="M-9,-6 Q0,-11 9,-6 L7,8 L-7,8 Z" fill="#E3A035" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-12" r="5.5" fill="#B9784E" stroke="#2C231D" stroke-width="2"/>
      </g></g>
      <g transform="translate(1030,700)"><g style="animation:bob .64s ease-in-out infinite;animation-delay:-.1s">
        <line x1="-4" y1="6" x2="-8" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legf .64s ease-in-out infinite;animation-delay:-.1s"/>
        <line x1="5" y1="6" x2="10" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legb .64s ease-in-out infinite;animation-delay:-.1s"/>
        <path d="M-9,-6 Q0,-11 9,-6 L7,8 L-7,8 Z" fill="#C96A44" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-12" r="5.5" fill="#D8A57A" stroke="#2C231D" stroke-width="2"/>
      </g></g>
      <!-- market shopper -->
      <g transform="translate(670,776)"><g style="animation:bob .74s ease-in-out infinite;animation-delay:-.25s">
        <line x1="-5" y1="6" x2="-9" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legf .74s ease-in-out infinite;animation-delay:-.25s"/>
        <line x1="4" y1="6" x2="8" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legb .74s ease-in-out infinite;animation-delay:-.25s"/>
        <path d="M-9,-6 Q0,-11 9,-6 L7,8 L-7,8 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-12" r="5.5" fill="#B9784E" stroke="#2C231D" stroke-width="2"/>
      </g></g>
      <!-- customer at the burrito cart -->
      <g transform="translate(406,708)"><g style="animation:bob .9s ease-in-out infinite">
        <line x1="-4" y1="6" x2="-4" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round"/><line x1="4" y1="6" x2="4" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round"/>
        <path d="M-9,-6 Q0,-11 9,-6 L7,8 L-7,8 Z" fill="#C96A44" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-12" r="5.5" fill="#8A5A3C" stroke="#2C231D" stroke-width="2"/>
      </g></g>
      <!-- stroller heading to the mercado -->
      <g transform="translate(534,706)"><g style="animation:bob .68s ease-in-out infinite;animation-delay:-.4s">
        <line x1="-4" y1="6" x2="-9" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legf .68s ease-in-out infinite;animation-delay:-.4s"/>
        <line x1="4" y1="6" x2="8" y2="22" stroke="#2C231D" stroke-width="3" stroke-linecap="round" style="transform-box:fill-box;transform-origin:50% 0%;animation:legb .68s ease-in-out infinite;animation-delay:-.4s"/>
        <path d="M-9,-6 Q0,-11 9,-6 L7,8 L-7,8 Z" fill="#E3A035" stroke="#2C231D" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-12" r="5.5" fill="#B9784E" stroke="#2C231D" stroke-width="2"/>
      </g></g>
      <!-- concert crowd at canyon (swaying) -->
      <g transform="translate(1096,500) scale(.8)"><g style="animation:bob 1.1s ease-in-out infinite"><line x1="-4" y1="6" x2="-8" y2="22" stroke="#2C231D" stroke-width="3.5" stroke-linecap="round"/><line x1="4" y1="6" x2="8" y2="22" stroke="#2C231D" stroke-width="3.5" stroke-linecap="round"/><path d="M-9,-6 Q0,-11 9,-6 L7,8 L-7,8 Z" fill="#D15A3A" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/><circle cx="0" cy="-12" r="5.5" fill="#8A5A3C" stroke="#2C231D" stroke-width="2.5"/></g></g>
      <g transform="translate(1128,504) scale(.8)"><g style="animation:bob 1s ease-in-out infinite;animation-delay:-.3s"><line x1="-4" y1="6" x2="-8" y2="22" stroke="#2C231D" stroke-width="3.5" stroke-linecap="round"/><line x1="4" y1="6" x2="8" y2="22" stroke="#2C231D" stroke-width="3.5" stroke-linecap="round"/><path d="M-9,-6 Q0,-11 9,-6 L7,8 L-7,8 Z" fill="#E3A035" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/><circle cx="0" cy="-12" r="5.5" fill="#B9784E" stroke="#2C231D" stroke-width="2.5"/></g></g>
      <g transform="translate(1152,498) scale(.8)"><g style="animation:bob 1.2s ease-in-out infinite;animation-delay:-.6s"><line x1="-4" y1="6" x2="-8" y2="22" stroke="#2C231D" stroke-width="3.5" stroke-linecap="round"/><line x1="4" y1="6" x2="8" y2="22" stroke="#2C231D" stroke-width="3.5" stroke-linecap="round"/><path d="M-9,-6 Q0,-11 9,-6 L7,8 L-7,8 Z" fill="#2E6F69" stroke="#2C231D" stroke-width="2.5" stroke-linejoin="round"/><circle cx="0" cy="-12" r="5.5" fill="#D8A57A" stroke="#2C231D" stroke-width="2.5"/></g></g>
      <!-- cyclist near river -->
      <g transform="translate(1300,772)"><g style="animation:bob .5s ease-in-out infinite"><circle cx="-10" cy="8" r="9" fill="none" stroke="#2C231D" stroke-width="2.5"/><circle cx="12" cy="8" r="9" fill="none" stroke="#2C231D" stroke-width="2.5"/><path d="M-10,8 L2,8 L8,-4 M2,8 L12,8" stroke="#2C231D" stroke-width="2.5" fill="none"/><line x1="8" y1="-4" x2="14" y2="-4" stroke="#2C231D" stroke-width="2.5"/><circle cx="4" cy="-14" r="5" fill="#D15A3A" stroke="#2C231D" stroke-width="2"/></g></g>
    </g>

  </g><!-- /illustration -->

  <!-- ===================== TIME-OF-DAY TINT ===================== -->
  <rect x="0" y="0" width="1600" height="900" fill="{{ tintColor }}" style="opacity:{{ tintOpacity }};pointer-events:none"/>

  <!-- ===================== NIGHT LIGHTS ===================== -->
  <g style="opacity:{{ lightsOpacity }};pointer-events:none">
    <!-- star on mountain glow -->
    <circle cx="780" cy="110" r="30" fill="url(#glow)" style="animation:twinkle 2.6s ease-in-out infinite"/>
    <!-- twinkle stars -->
    <g fill="#FBEAD0"><circle cx="180" cy="120" r="2.5" style="animation:twinkle 3s ease-in-out infinite"/><circle cx="430" cy="90" r="2" style="animation:twinkle 2.2s ease-in-out infinite"/><circle cx="1000" cy="70" r="2.5" style="animation:twinkle 3.4s ease-in-out infinite"/><circle cx="1250" cy="120" r="2" style="animation:twinkle 2.8s ease-in-out infinite"/><circle cx="640" cy="60" r="2" style="animation:twinkle 2.4s ease-in-out infinite"/></g>
    <!-- downtown lit windows -->
    <g fill="#F6C560"><rect x="882" y="482" width="9" height="11"/><rect x="899" y="506" width="9" height="11"/><rect x="882" y="530" width="9" height="11"/><rect x="899" y="554" width="9" height="11"/><rect x="828" y="522" width="8" height="10"/><rect x="844" y="566" width="8" height="10"/><rect x="944" y="552" width="8" height="10"/><rect x="958" y="574" width="8" height="10"/></g>
    <!-- canyon stage lights -->
    <g fill="#F6C560"><circle cx="1100" cy="474" r="3"/><circle cx="1120" cy="470" r="3"/><circle cx="1140" cy="474" r="3"/></g>
    <!-- theatre marquee bulbs -->
    <g fill="#F6C560"><circle cx="684" cy="498" r="2.6"/><circle cx="696" cy="498" r="2.6"/><circle cx="684" cy="510" r="2.6"/><circle cx="696" cy="510" r="2.6"/></g>
    <!-- river reflection sparkle -->
    <g fill="#8FD3CB" opacity=".8"><circle cx="360" cy="812" r="2"/><circle cx="720" cy="812" r="2"/><circle cx="1120" cy="826" r="2"/></g>
  </g>

  <!-- ===================== LETTERING (crisp) ===================== -->
  <g style="color:{{ labelColor }};display:{{ labelsDisplay }}" fill="currentColor" font-family="'Shantell Sans',sans-serif">
    <!-- area / landmark labels -->
    <text x="392" y="300" text-anchor="middle" font-size="24" font-weight="700" letter-spacing="6" opacity=".85">FRANKLIN MOUNTAINS</text>
    <text x="780" y="96" text-anchor="middle" font-size="17" font-weight="600" letter-spacing="2" style="font-family:'Caveat',cursive">the Star on the Mountain</text>
    <text x="900" y="452" text-anchor="middle" font-size="26" font-weight="700" letter-spacing="6">DOWNTOWN</text>
    <text x="1120" y="530" text-anchor="middle" font-size="21" font-weight="700" letter-spacing="3">McKELLIGON CANYON</text>
    <text x="1120" y="552" text-anchor="middle" font-size="19" style="font-family:'Caveat',cursive" fill="#2E6F69" font-weight="700">concerts under the stars</text>
    <text x="1372" y="368" text-anchor="middle" font-size="17" font-weight="600" letter-spacing="2">SCENIC DRIVE</text>
    <text x="936" y="770" text-anchor="middle" font-size="18" font-weight="700" letter-spacing="2">SAN JACINTO PLAZA</text>
    <text x="936" y="789" text-anchor="middle" font-size="17" style="font-family:'Caveat',cursive" fill="#2E6F69" font-weight="700">say hi to the alligators</text>
    <text x="690" y="520" text-anchor="middle" font-size="18" font-weight="700" letter-spacing="2">PLAZA THEATRE</text>
    <text x="556" y="552" text-anchor="middle" font-size="18" font-weight="700" letter-spacing="2">MISSION TRAIL</text>
    <text x="556" y="568" text-anchor="middle" font-size="14" font-weight="600" style="font-family:'Caveat',cursive" fill="#2E6F69">Ysleta · Socorro · San Elizario</text>
    <text x="600" y="820" text-anchor="middle" font-size="18" font-weight="700" letter-spacing="2">EL MERCADO</text>
    <text x="456" y="768" text-anchor="middle" font-size="18" font-weight="700" style="font-family:'Caveat',cursive" fill="#D15A3A">best burritos in town</text>
    <text x="122" y="692" text-anchor="middle" font-size="16" font-weight="700" style="font-family:'Caveat',cursive" fill="#2E6F69">roadrunner</text>
    <text x="1408" y="792" text-anchor="middle" font-size="16" font-weight="700" style="font-family:'Caveat',cursive" fill="#2E6F69">javelina</text>
    <!-- campus + stadium -->
    <text x="206" y="694" text-anchor="middle" font-size="18" font-weight="700" letter-spacing="2">UTEP</text>
    <text x="302" y="700" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="1.5">SUN BOWL</text>
    <!-- teams -->
    <text x="1118" y="740" text-anchor="middle" font-size="15" font-weight="700" letter-spacing="1.5">CHIHUAHUAS</text>
    <text x="1250" y="720" text-anchor="middle" font-size="15" font-weight="700" letter-spacing="1.5">RHINOS</text>
    <text x="996" y="478" text-anchor="middle" font-size="12" font-weight="700" letter-spacing="1">MONTGOMERY BLDG</text>
    <text x="1188" y="646" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="1">PANCHO VILLA</text>
    <text x="1500" y="502" text-anchor="middle" font-size="15" font-weight="700" letter-spacing="1.5">HUECO TANKS</text>
    <text x="858" y="828" text-anchor="middle" font-size="15" font-weight="700" letter-spacing="1.5">ASCARATE PARK</text>
    <text x="430" y="400" text-anchor="middle" font-size="15" font-weight="700" letter-spacing="1">EL PASO HIGH</text>
    <text x="486" y="416" text-anchor="middle" font-size="13" font-weight="700" style="font-family:'Caveat',cursive" fill="#D15A3A">the haunted one</text>
    <text x="600" y="418" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="1">MUSEUM OF ART</text>
    <text x="798" y="692" text-anchor="middle" font-size="12" font-weight="700" letter-spacing="1">SECRET TUNNELS</text>
    <!-- freeway shields -->
    <text x="250" y="459" text-anchor="middle" font-size="15" font-weight="700" fill="#2C231D">10</text>
    <text x="1330" y="443" text-anchor="middle" font-size="15" font-weight="700" fill="#2C231D">10</text>
    <text x="1238" y="459" text-anchor="middle" font-size="14" font-weight="700" fill="#2C231D">54</text>
    <text x="520" y="768" text-anchor="middle" font-size="8" font-weight="700" letter-spacing="1" fill="#2C231D">LOOP</text>
    <text x="520" y="782" text-anchor="middle" font-size="13" font-weight="700" fill="#2C231D">375</text>
    <text x="596" y="782" text-anchor="middle" font-size="12" font-weight="600" letter-spacing="1.5" fill="#2C231D">BORDER HWY</text>
    <!-- neighborhood labels -->
    <text x="212" y="408" text-anchor="middle" font-size="20" font-weight="600" letter-spacing="4" opacity=".8">SUNSET HEIGHTS</text>
    <text x="150" y="720" text-anchor="middle" font-size="18" font-weight="600" letter-spacing="3" opacity=".8">UPPER VALLEY</text>
    <text x="700" y="756" text-anchor="middle" font-size="18" font-weight="600" letter-spacing="3" opacity=".8">SEGUNDO BARRIO</text>
    <text x="1360" y="640" text-anchor="middle" font-size="18" font-weight="600" letter-spacing="3" opacity=".8">EAST SIDE</text>
    <!-- street names -->
    <text x="700" y="540" text-anchor="middle" font-size="14" font-weight="500" letter-spacing="2" opacity=".55">MESA STREET</text>
    <text x="300" y="586" text-anchor="middle" font-size="14" font-weight="500" letter-spacing="2" opacity=".55">MONTANA AVE</text>
    <!-- Rio Grande along river -->
    <text font-size="30" font-weight="700" letter-spacing="14" fill="#FAF4EB"><textPath href="#rio" startOffset="30%">RIO  GRANDE</textPath></text>

    <!-- TITLE -->
    <g style="display:{{ titleDisplay }}">
    <text x="1560" y="66" font-size="60" font-weight="700" style="font-family:'Caveat',cursive" fill="#D15A3A" text-anchor="end">El Paso</text>
    <text x="1560" y="90" font-size="19" font-weight="700" letter-spacing="9" text-anchor="end">TEXAS</text>
    </g>

    <!-- compass -->
    <g transform="translate(1486,706)">
      <circle cx="0" cy="0" r="30" fill="#FAF4EB" stroke="currentColor" stroke-width="2.5"/>
      <path d="M0,-22 L6,0 L0,20 L-6,0 Z" fill="#D15A3A" stroke="#2C231D" stroke-width="1.5"/>
      <text x="0" y="-24" text-anchor="middle" font-size="16" font-weight="700">N</text>
    </g>
  </g>
</svg>`
