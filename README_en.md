# X Search Helper

[English](README_en.md) | [日本語](README.md)

A Chrome extension that makes it easy to use X (formerly Twitter) advanced search.
It automatically generates complex search queries simply by selecting search options in a GUI.

## Features

### Search Query Builder

- Keyword search (AND / OR / Exact match / Exclude / Hashtag / Cashtag)
- User targeting (From / To / Mention / Following only)
- Content filters (Images / Videos / Links / Verified / Exclude Replies / Exclude RTs / Quotes only)
- Date range (Since / Until)
- Engagement (Min Likes / Min RTs / Min Replies)
- Language & Location (Language / Near location / Within distance)
- Reference sheet (Check syntax and examples via the `?` button next to each option)
- Dark/Light mode toggle
- Multi-language support (Instantly switch between EN/JA from the UI)
- Real-time preview

### Background Image Customization (v1.5.0~)

A feature that allows you to set your favorite image as the background of the X screen.
Simply upload an image from the popup, and the background of X will change in real-time.

- **Image Upload** — Set a local image (up to 5MB, JPG/PNG) as the background
- **Real-time Adjustment** — Intuitively adjust opacity (0~100%) and blur (0~20px) with sliders
- **One-click ON/OFF & Clear** — Easily revert to the original background at any time

### Persistent Follow Button (v1.3.0~)

A feature that constantly displays a **Follow/Following button** on each post in your timeline.
Normally, the follow button only works on user icon hover, but this extension displays it permanently on the post.

- **Reflects follow status** — Accurately displays "Follow" / "Following"
- **Toggle directly on the page** — Click the button to instantly follow/unfollow
- **"Unfollow" on hover** — Same behavior as X's standard UI
- **Toggleable ON/OFF from the popup**

## Installation

1. Download the latest ZIP file from the [Releases page](https://github.com/neco75/x-search-helper/releases).
2. Unzip the downloaded file.
3. Open `chrome://extensions` in Chrome.
4. Turn on "Developer mode" in the top right corner.
5. Click "Load unpacked".
6. Select the unzipped folder.
7. Installation is complete when the extension icon appears in the toolbar.

## How to use

### Search Query Builder

1. Click the extension icon in the toolbar.
2. Open each category and enter your search criteria.
3. A query will be generated in real-time at the top of the screen.
4. Click "Search on X" to execute the search, or use the copy button to copy the query.

Click the `?` button next to each field to view usage and syntax examples.

### Persistent Follow Button

1. Click the extension icon in the toolbar.
2. Turn ON the "Always show follow button" toggle in the extension settings.
3. Follow buttons will appear on each post in the X timeline.

### Language Setting

1. Click the extension icon in the toolbar.
2. Click the language toggle button ("EN" or "JA") in the top right of the popup.
3. The entire UI and follow button texts will switch instantly.

## Search Options Reference

| Syntax | Description | Example |
|------|------|-----|
| `word1 word2` | AND search | `Programming AI` |
| `"phrase"` | Exact match | `"Machine Learning"` |
| `word1 OR word2` | OR search | `Python OR JavaScript` |
| `-word` | Exclude | `-Ads` |
| `#tag` | Hashtag | `#AI` |
| `$SYM` | Cashtag | `$TSLA` |
| `from:user` | From user | `from:elonmusk` |
| `to:user` | To user | `to:elonmusk` |
| `@user` | Mention | `@NASA` |
| `filter:follows` | Following only | — |
| `filter:images` | Has images | — |
| `filter:videos` | Has videos | — |
| `filter:media` | Has media | — |
| `filter:links` | Has links | — |
| `filter:verified` | Verified only | — |
| `-filter:replies` | Exclude replies | — |
| `-filter:retweets` | Exclude RTs | — |
| `filter:quote` | Quotes only | — |
| `url:domain` | URL | `url:github.com` |
| `since:YYYY-MM-DD` | Since date | `since:2025-01-01` |
| `until:YYYY-MM-DD` | Until date | `until:2025-12-31` |
| `min_faves:N` | Min Likes | `min_faves:100` |
| `min_retweets:N` | Min RTs | `min_retweets:50` |
| `min_replies:N` | Min Replies | `min_replies:10` |
| `lang:code` | Language | `lang:en` |
| `near:city` | Near location | `near:Tokyo` |
| `within:dist` | Within distance | `within:10km` |

## Technical Specifications

- Manifest Version: V3
- Permissions: `tabs` (to open search results in a new tab), `storage` (for settings persistence)
- Content scripts: Runs on `x.com` / `twitter.com` (for Follow button feature)
- Data storage: Theme settings in `localStorage`, extension settings in `chrome.storage.sync`

## Support

If you find this tool helpful, I would appreciate your support on Ko-fi!

https://ko-fi.com/neco75

## License

MIT License
