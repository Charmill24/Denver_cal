import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

// CRC32
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  crcTable[n] = c
}
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length)
  const crcVal = Buffer.allocUnsafe(4); crcVal.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crcVal])
}

function makePNG(size) {
  // Draw Denver "D" on dark background with a blue circle
  const cx = size / 2, cy = size / 2, r = size * 0.42
  const pixels = Buffer.allocUnsafe(size * size * 3)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 3
      const dx = x - cx, dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < r) {
        // Blue gradient from center
        const t = dist / r
        pixels[i]   = Math.round(0x5B + (0x0A - 0x5B) * t * 0.3) // R
        pixels[i+1] = Math.round(0x9E + (0x0E - 0x9E) * t * 0.3) // G
        pixels[i+2] = Math.round(0xF5 + (0x1A - 0xF5) * t * 0.3) // B
      } else {
        pixels[i] = 0x0A; pixels[i+1] = 0x0E; pixels[i+2] = 0x1A
      }
    }
  }

  // Pack scanlines (filter byte 0 per row)
  const raw = Buffer.allocUnsafe(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 3)] = 0
    pixels.copy(raw, y * (1 + size * 3) + 1, y * size * 3, (y + 1) * size * 3)
  }

  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public', { recursive: true })
writeFileSync('public/icon-192.png', makePNG(192))
writeFileSync('public/icon-512.png', makePNG(512))
console.log('✓ icons generated')
