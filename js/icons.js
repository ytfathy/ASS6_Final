/* Inline SVG icon set (original drawings, stroke style). App.icon(name) returns markup. */
(function(){
const P={
 print:'<path d="M7 9V3h10v6M7 17H4v-7a1 1 0 011-1h14a1 1 0 011 1v7h-3"/><path d="M7 14h10v7H7z"/>',
 trophy:'<path d="M7 4h10v5a5 5 0 01-10 0z"/><path d="M7 6H4a3 3 0 003 4M17 6h3a3 3 0 01-3 4"/><path d="M12 14v3M8 21h8M9 21l1-4h4l1 4"/>',
 bolt:'<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',
 volume:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/>',
 mute:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/>',
 home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
 book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/><path d="M9 7h6M9 11h6"/>',
 quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 115 0c0 1.7-2.5 2-2.5 4"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
 clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M8 10l1.5 1.5L12 9M8 15l1.5 1.5L12 14M14 10.5h3M14 15.5h3"/>',
 speaker:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
 play:'<path d="M7 4l13 8-13 8z" fill="currentColor"/>', pause:'<path d="M7 4v16M17 4v16" stroke-width="3.2"/>', stop:'<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>', close:'<path d="M6 6l12 12M18 6L6 18"/>',
 full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', text:'<path d="M5 6h14M5 10h14M5 14h9M5 18h12"/>', pages:'<rect x="4" y="3" width="12" height="16" rx="2"/><path d="M8 21h10a2 2 0 002-2V7"/>',
 next:'<path d="M9 5l7 7-7 7"/>', prev:'<path d="M15 5l-7 7 7 7"/>', up:'<path d="M5 15l7-7 7 7"/>', down:'<path d="M5 9l7 7 7-7"/>',
 check:'<path d="M4 12.5l5 5L20 6.5"/>', redo:'<path d="M4 12a8 8 0 1014-5.3L20 9"/><path d="M20 4v5h-5"/>', shuffle:'<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4"/><path d="M19 5l2 2-2 2M19 15l2 2-2 2"/>',
 bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-4 10.5c.7.7 1 1.4 1 2.5h6c0-1.1.3-1.8 1-2.5A6 6 0 0012 3z"/>', info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6" fill="currentColor"/>',
 flag:'<path d="M5 21V4"/><path d="M5 5c5-3 8 3 14 0v9c-6 3-9-3-14 0"/>', star:'<path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 mountain:'<path d="M2 20l7-12 4 6 2-3 7 9z"/><path d="M7.5 11l1.5 1 1.5-1"/>', sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
 drop:'<path d="M12 3c4 5 6 8 6 11a6 6 0 01-12 0c0-3 2-6 6-11z"/>', wave:'<path d="M2 9c3-3 5 3 8 0s5 3 8 0 3 1 4 0M2 15c3-3 5 3 8 0s5 3 8 0 3 1 4 0"/>',
 tree:'<path d="M12 22v-7"/><path d="M12 3l6 8h-3l4 6H5l4-6H6z"/>', palm:'<path d="M12 22c0-6 0-9 1-12"/><path d="M13 10c-3-4-7-3-9-1 3 0 6 0 9 1zM13 10c0-4 3-6 6-6-2 2-4 3-6 6zM13 10c3-2 7-1 8 2-3-1-5-2-8-2zM13 10c-2-3-1-6 1-8 0 3 0 5-1 8z"/>',
 dune:'<path d="M2 18c4-7 8-7 11-2 2-4 5-4 9 2z"/><circle cx="17" cy="6" r="2.5"/>', factory:'<path d="M3 21V10l6 4v-4l6 4V5h4v16z"/><path d="M7 17h2M12 17h2"/>',
 pyramid:'<path d="M12 3L2 20h20z"/><path d="M12 3l3 17"/>', mosque:'<path d="M5 21v-8a7 7 0 0114 0v8z"/><path d="M12 3v3M3 21h18M19 21V9l1.5-2L22 9v12M10 21v-4a2 2 0 014 0v4"/>',
 kaaba:'<path d="M4 8l8-4 8 4v10l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v10M4 11.5l8 4 8-4"/>', dome:'<path d="M4 21v-7h16v7M6 14a6 6 0 0112 0M12 4v4M3 21h18"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.2 6 4.1 0 1.300-1.300 2.200-3 2.200-1.400 0-2.600-.600-3.200-1.600M12 6v2M12 16.500V18"/>',
 hands:'<path d="M3 12l4-4 5 2 4-3 5 5-5 6-4-2-5 1z"/><path d="M12 10l-2 3"/>', shield:'<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 scroll:'<path d="M7 4h11a2 2 0 012 2v2h-4"/><path d="M16 6v12a2 2 0 01-2 2H5a2 2 0 01-2-2v-2h10v2"/><path d="M7 4a2 2 0 00-2 2v10M9 9h4M9 12h4"/>',
 calendar:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>', city:'<path d="M3 21V9l5-3v15M8 21V4l7 3v14M15 21V11l6 2v8M2 21h20"/>',
 ship:'<path d="M3 15h18l-2 5H5z"/><path d="M12 15V4l6 8h-6M12 6L7 12h5"/>', wheat:'<path d="M12 22V8"/><path d="M12 8c-2-1-2-3 0-5 2 2 2 4 0 5zM12 13c-3 0-4-2-4-4 2 0 4 1 4 4zM12 13c3 0 4-2 4-4-2 0-4 1-4 4zM12 18c-3 0-4-2-4-4 2 0 4 1 4 4zM12 18c3 0 4-2 4-4-2 0-4 1-4 4z"/>',
 cow:'<path d="M5 8c-2 0-2-3 0-3M19 8c2 0 2-3 0-3"/><path d="M6 6h12v6a6 6 0 01-12 0z"/><path d="M9 15h6a3 3 0 01-6 0z"/><circle cx="9.500" cy="10" r=".7" fill="currentColor"/><circle cx="14.500" cy="10" r=".7" fill="currentColor"/>',
 camel:'<path d="M3 20v-6c0-3 2-3 3-5s2-2 3 0 2 2 3 0 2-2 3 0l1 2h2V7l2-2v9c0 1-1 2-2 2v4M7 20v-5M15 20v-4"/>',
 gem:'<path d="M6 4h12l4 6-10 11L2 10z"/><path d="M2 10h20M9 4l-2 6 5 11 5-11-2-6"/>', oil:'<path d="M7 21V9l5-6 5 6v12z"/><path d="M5 21h14M9 13h6M9 17h6"/>',
 flame:'<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>', wind:'<path d="M3 9h10a3 3 0 10-3-3M3 14h15a3 3 0 11-3 3M3 12h6"/>',
 market:'<path d="M4 10l1-5h14l1 5a2.700 2.700 0 01-5.300 0 2.700 2.700 0 01-5.400 0A2.700 2.700 0 014 10z"/><path d="M5 12v9h14v-9M10 21v-5h4v5"/>', truck:'<path d="M2 6h12v10H2zM14 9h4l4 4v3h-8z"/><circle cx="6.500" cy="18" r="2"/><circle cx="17.500" cy="18" r="2"/>',
 sprout:'<path d="M12 22v-9"/><path d="M12 13c0-4-3-6-7-6 0 4 3 6 7 6zM12 11c0-4 3-6 7-6 0 4-3 6-7 6z"/>', ball:'<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.500 5h-5L8 10z"/><path d="M12 3v4M3.500 9.500L8 10M20.500 9.500L16 10M6.500 19l3-4M17.500 19l-3-4"/>',
 chev:'<path d="M6 9l6 6 6-6"/>', chart:'<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-8"/>', trash:'<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>', eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
};
const ALIAS={soil:'sprout',cane:'wheat',cotton:'sprout',buffalo:'cow',coal:'factory',compass:'globe'};
App.icon=n=>{const p=P[n]||P[ALIAS[n]]||P.star;return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p.replace(/(\d)\.(\d)00\b/g,'$1.$2')+'</svg>';};
})();
