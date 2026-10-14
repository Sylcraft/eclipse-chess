import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three';

// Small deterministic surface map, generated locally; no image downloads or shader effects.
const size = 64;
const pixels = new Uint8Array(size * size * 4);
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const hash = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    const grain = hash - Math.floor(hash);
    const vein = Math.abs(Math.sin(x * .16 + Math.sin(y * .18) * 1.4));
    const value = Math.round(190 + grain * 48 - (vein < .065 ? 46 : 0));
    const offset = (y * size + x) * 4;
    pixels[offset] = value;
    pixels[offset + 1] = value;
    pixels[offset + 2] = value;
    pixels[offset + 3] = 255;
  }
}
export const stoneTexture = new DataTexture(pixels, size, size, RGBAFormat);
stoneTexture.colorSpace = SRGBColorSpace;
stoneTexture.wrapS = stoneTexture.wrapT = RepeatWrapping;
stoneTexture.magFilter = LinearFilter;
stoneTexture.minFilter = LinearMipmapLinearFilter;
stoneTexture.generateMipmaps = true;
stoneTexture.needsUpdate = true;
