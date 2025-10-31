import { keccak256 } from 'ethers';

export async function canonicalizeText(text: string): Promise<string> {
  return text
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
}

export async function canonicalizeImage(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        blob.arrayBuffer().then(buffer => {
          resolve(new Uint8Array(buffer));
        });
      }, 'image/png');
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.readAsDataURL(file);
  });
}

export async function computeFingerprint(data: string | Uint8Array): Promise<string> {
  if (typeof data === 'string') {
    return keccak256('0x' + Array.from(new TextEncoder().encode(data))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
  } else {
    return keccak256('0x' + Array.from(data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
  }
}

export async function computeContentFingerprint(content: string, file?: File): Promise<string> {
  if (file && file.type.startsWith('image/')) {
    const imageData = await canonicalizeImage(file);
    return computeFingerprint(imageData);
  } else {
    const canonical = await canonicalizeText(content);
    return computeFingerprint(canonical);
  }
}
