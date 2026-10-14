// Screenshot the app: npm run shot -- [route|url] [phone|ipad|desktop|iphone] [--click <selector>]
// A route (e.g. "/") starts and stops its own Vite dev server; a full URL is used as is.
// Writes shots/<device>.jpg at DPR 1. Exits 1 if the page logged errors.
import { chromium, devices, webkit } from 'playwright'
import { createServer } from 'vite'
import { mkdirSync } from 'node:fs'

const args = process.argv.slice(2)
const clickIndex = args.indexOf('--click')
const click = clickIndex >= 0 ? args.splice(clickIndex, 2)[1] : undefined
const [target = '/', device = 'phone'] = args

const profiles = {
  phone: { browser: chromium, options: devices['Pixel 7'] },
  ipad: { browser: chromium, options: devices['iPad Mini'] },
  desktop: { browser: chromium, options: { viewport: { width: 1280, height: 800 } } },
  iphone: { browser: webkit, options: devices['iPhone 15'] },
}
const profile = profiles[device]
if (!profile) throw new Error(`Unknown device "${device}", use one of: ${Object.keys(profiles).join(', ')}`)

let server, browser
const errors = []
try {
  let url = target
  if (!target.startsWith('http')) {
    server = await createServer({ logLevel: 'error', server: { port: 0 } })
    await server.listen()
    url = new URL(target.replace(/^\//, ''), server.resolvedUrls.local[0]).href
  }
  browser = await profile.browser.launch()
  // Playwright refuses defaultBrowserType in newPage; the browser is picked above.
  const { defaultBrowserType: _, ...options } = profile.options
  const page = await browser.newPage({ ...options, deviceScaleFactor: 1 })
  page.on('pageerror', e => errors.push(e.message))
  // A poster 404 isn't a page bug; only count script errors.
  page.on('console', m => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()))
  await page.goto(url, { waitUntil: 'networkidle' })
  // TMDB posters trickle in after networkidle; wait for the ones on screen.
  await page.waitForFunction(() => [...document.images]
    .filter(i => i.getBoundingClientRect().top < innerHeight)
    .every(i => i.complete))
  if (click) {
    await page.click(click)
    await page.waitForTimeout(400) // ponytail: fixed wait for open/close transitions, wait on a selector if they grow past 400ms
  }
  mkdirSync('shots', { recursive: true })
  const path = `shots/${device}.jpg`
  await page.screenshot({ path, type: 'jpeg', quality: 70 })
  console.log(path)
} finally {
  await browser?.close()
  await server?.close()
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
