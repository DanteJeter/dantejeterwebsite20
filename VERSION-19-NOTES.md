# Version 19.0 Notes

## Cinematic Homepage Hero

Version 19 introduces a full-screen video-led homepage hero while preserving the existing Dante Jeter website architecture and brand system.

### What changed
- Added the supplied optimized 31-second MP4 as the homepage hero background.
- Added a poster-frame fallback for first paint, reduced-motion users, mobile reliability, and connections where autoplay is unavailable.
- Preserved the existing hero messaging, Dante portrait, proof points, and three primary calls to action.
- Added layered navy/gold overlays for legibility and brand continuity.
- Added a subtle scroll cue into the Featured Properties section.
- Kept all Version 18.6 listings, Seller Strategy, Seller Essentials, commercial showcases, Formspree lead capture, listing statuses, galleries, and site configuration intact.

### Performance
- Hero video: H.264 MP4, 854×480, 30 fps, approximately 3.8 MB.
- Video is muted, looping, inline, and uses metadata preload rather than aggressive full preload.
- Static poster image is preloaded for fast first paint.
- Video is disabled automatically for users who prefer reduced motion.
