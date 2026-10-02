# Website asset inventory and optimization report

The untouched source files remain in `src/Assets` and are also archived in Google Drive under `Website/2526/Originals`. Web-ready derivatives live in `src/AssetsOptimized` and can be regenerated with `scripts/optimize_assets.py`.

## Results

- Source images processed: 79 files / 218.8 MB
- Responsive WebP derivatives: 168 files / 12.8 MB
- Image-byte reduction: 94.2%
- Previous Cloudflare upload: about 199 MB
- Optimized production build: 15.43 MB (14.52 MB media)
- Production source maps: 0
- Untouched Drive archive: 82 files; the remaining 12 source entries are empty `.gitkeep` placeholders

## Page-by-page display inventory

| Page / area | Source images | Desktop display target | Phone display target | Loading |
|---|---|---|---|---|
| Home event artwork | `Event_details.png` | Up to 1600 px wide | 100vw, 720/1600 candidate | Eager, high priority |
| Home pamphlet | `pamphlet.png` | Up to 860 px wide inside scroll frame | 100vw, 720 px candidate | Lazy |
| Home speakers | `Members/Speaker/*` | Three columns, about 380 px per portrait | One column, viewport minus padding | Lazy |
| Home performers | `Members/Performer/*` | Two columns, up to about 540 px each | One column, viewport minus padding | Lazy |
| Home sponsors | `Sponsor/*` | Maximum 360×280 CSS px | Maximum 220×180 CSS px | Lazy |
| Home team | `TEDxTeam2025.png` | 100vw, up to 1920 px source | 100vw, 960 px candidate | Lazy |
| About top collage | `About/p1.png`–`p3.png` | Each panel about 50vw | Panels reflow to 100vw | Eager; main panel high priority |
| About body/collage | `About/p4.png`–`p8.png` | 50vw or less by panel | 100vw or 50vw by panel | Lazy |
| Crew top collage | `TeamCrew/pp1.JPG`–`pp3.JPG` | Each panel about 50vw | Panels reflow to 100vw | Eager; main panel high priority |
| Crew portraits | `Members/{department}/*` | Expanded 300×350; collapsed 120×200 | 300×350 | Lazy, 400/800 candidates |
| Past Events | `PastEvents/TEDx Website Design.png` | Six tiles, maximum 1600 px wide | 100vw, 720/1600 candidates | First tile eager; rest lazy |
| Speaker pages | `About/p1.png`–`p3.png`, `Members/Speaker/*` | 50vw hero panels and portrait | Panels reflow to 100vw | Hero eager, portrait lazy |
| Event registration | `About/p1.png`–`p3.png` | 50vw hero panels | Panels reflow to 100vw | Eager; main panel high priority |
| Committee registration | No photographic assets | N/A | N/A | Route-level JS/CSS only |
| Shared navigation | `logo-black.png`, `logo-white.png` | 384×86 CSS px on desktop | 221×49 CSS px in tested phone viewport | Immediate |

Exact original filenames, dimensions, byte sizes, source references, routes, and Drive destinations remain in `docs/website-asset-inventory.csv`.

## Delivery behavior

- React routes remain code-split, so route chunks and their image references are requested only when visited.
- Home's initial viewport was observed loading only the shared logo and Home event artwork; no About, Crew, or Past Events media was requested.
- All content images now carry explicit intrinsic dimensions or are contained by fixed-aspect layout boxes to prevent layout shifts.
- `_headers` gives hashed `/static/*` files a one-year immutable cache while HTML remains revalidated.
- `.env.production` disables JavaScript source-map generation.
- The 3122×23156 Past Events source is rendered as six seamless WebP tiles so only nearby sections download.

## Verification

- Production build: passed
- Desktop visual checks: Home, About, Crew, Past Events, Committee Registration
- Phone visual checks at 390×844: Home, About, Crew, Past Events, Committee Registration
- Horizontal overflow: none on tested phone routes
- Original/WebP comparison: artwork edges, color, portrait detail, and crop were visually preserved
- Committee form: CityUHK email rule, CV/portfolio link fields, conditional portfolio requirement, and required acknowledgements present
- Google Sheet: `Applications` headers and existing synchronized submissions verified read-only after the build
