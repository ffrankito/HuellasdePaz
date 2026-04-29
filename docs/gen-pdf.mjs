import puppeteer from 'puppeteer'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const html = resolve(__dirname, 'huellas-de-paz-presupuesto-demo.html')

const browser = await puppeteer.launch()
const page    = await browser.newPage()
await page.goto(`file://${html}`, { waitUntil: 'networkidle0' })
await page.pdf({
  path: resolve(__dirname, 'huellas-de-paz-presupuesto-demo.pdf'),
  format: 'A4',
  printBackground: true,
  margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
})
await browser.close()
console.log('✅ PDF generado: huellas-de-paz-presupuesto-demo.pdf')
