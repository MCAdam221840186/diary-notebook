/**
 * Client-side image compression using Canvas API.
 * Resizes to max 400px on the longest side, outputs JPEG at quality 0.8.
 * Returns a base64 data URL ready to store in DB or display.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("仅支持图片文件"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 400;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        // Try JPEG quality 0.8; if still over 1MB step down quality
        let quality = 0.8;
        const tryQuality = (q: number): string => {
          const dataUrl = canvas.toDataURL("image/jpeg", q);
          const bytes = (dataUrl.length * 3) / 4;
          if (bytes > 1 * 1024 * 1024 && q > 0.1) {
            return tryQuality(q - 0.15);
          }
          return dataUrl;
        };

        resolve(tryQuality(quality));
      };
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}
