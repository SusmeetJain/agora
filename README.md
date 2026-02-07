# Finite Feed — MVP

A Twitter-like, read-only feed that replaces compulsive scrolling with a finite, intellectually nourishing experience.

## What It Does

- Shows exactly 10 items per session (9 quotes + 1 closing message)
- Quotes are from public-domain philosophical texts (Stoic philosophy, Thoreau, etc.)
- After viewing, the feed is locked for 1 hour
- No social features, no infinite scroll, no accounts
- Intentionally designed to encourage disengagement

## How to Use

### Local Testing
1. Simply open `index.html` in any web browser
2. No build process or dependencies required

### Deployment Options

#### Option 1: GitHub Pages (Free)
1. Create a GitHub repository
2. Upload `index.html`
3. Enable GitHub Pages in repository settings
4. Access at: `https://yourusername.github.io/repository-name`

#### Option 2: Netlify (Free)
1. Drag and drop the folder containing `index.html` to [Netlify Drop](https://app.netlify.com/drop)
2. Your site is instantly live

#### Option 3: Vercel (Free)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in this directory
3. Follow the prompts

#### Option 4: Any Static Host
Upload `index.html` to any static hosting service (Cloudflare Pages, Amazon S3, etc.)

## How It Works

### Time Gating
- Uses browser localStorage to track when the feed was last viewed
- Automatically locks for 1 hour after viewing item #10
- No server required—all logic runs in the browser

### Content
- All quotes are from pre-1927 public domain sources
- Currently includes:
  - Seneca (Letters from a Stoic, essays)
  - Marcus Aurelius (Meditations)
  - Henry David Thoreau (Walden, essays)

### Privacy
- No tracking
- No cookies
- No external requests
- Everything runs locally in your browser

## Customization

### Adding More Quotes
Edit the `quotes` array in `index.html` around line 105. Each quote needs:
```javascript
{
    content: "The quote text...",
    author: "Author Name, Source"
}
```

### Changing the Cooldown Period
Modify `FEED_COOLDOWN_MS` around line 92:
```javascript
const FEED_COOLDOWN_MS = 60 * 60 * 1000; // Currently 1 hour
```

### Customizing Closing Messages
Edit the `closingMessages` array around line 127.

## Design Philosophy

This product intentionally:
- Limits usage
- Encourages disengagement
- Ends deliberately
- Respects attention

If a feature increases stickiness or compulsion, it should not be implemented.

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)

## License

The code is provided as-is. All quotes used are public domain.
