# Initial UI phase (archived)

The user subsequently authorized direct GitHub edits and Supabase integration. The current scope and connection status are in README.md and roadmap.md. The initial UI plan below describes the original demo phase.

# Mana Proddatur — UI-first local shop finder

## Build
- Create a crisp bilingual site shell with the Mana Proddatur wordmark, location, language switch, and owner entry point.
- Build the browse experience at `/` with honest sample-shop notice, search, category/locality/open filters, result counts, no-results guidance, and 10 illustrative shop cards.
- Add forgiving English, transliterated Telugu, and Telugu-script matching for shop names, categories, and shop keyword tags. Keep filters in the URL where practical.
- Build shop details at `/shops/$shopId` with preserved back navigation, gallery, address/landmark, hours, availability note, and safe contact actions.
- Build the demo owner workspace at `/owners` with sample-shop selection, expiring owner-confirmed status, editable shop fields, keyword chips, validated local image preview, and explicit local-only save feedback.
- Share owner edits and statuses through a browser-only demo data adapter so later backend replacement remains isolated.

## Design and content
- Establish semantic white, ink-navy, cobalt, and marigold tokens with modern sans and Telugu-capable font fallbacks.
- Use large 3:2 licensed remote demo photography with honest captions/fallbacks, compact Lucide icons, 16px card corners, subtle borders, and responsive one/two/three-column layouts.
- Translate primary navigation, search, filters, statuses, calls to action, empty states, and owner controls between English and Telugu.
- Preserve keyboard access, visible focus, proper labels, 44px mobile targets, reduced motion, and non-overlapping mobile layouts.

## Technical details
- Keep all records in a typed demo repository and local-storage adapter; do not add authentication, a database, products, prices, carts, payments, ratings, or invented contact details.
- Add route-specific metadata for browse, shop detail, and owner preview pages.
- Update the repository README with scope, demo limitations, and intended future GitHub, Cloudflare, and user-managed backend integration.
- Validate search aliases, filters/reset, empty state, route navigation/back, owner status expiry/reflection, language switching, image fallbacks, and desktop/mobile layouts; fix build or runtime errors found.

## Assumptions
- Remote Unsplash images are illustrative licensed assets and are clearly labeled as not depicting the listed sample shops.
- Demo owner edits persist only in the current browser and are intentionally not authentication-protected.

