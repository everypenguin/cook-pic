/**
 * 画像リサイズユーティリティ
 */

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * 画像をリサイズしてBase64文字列を返す
 */
export function resizeImage(
  file: File,
  options: ResizeOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // キャンバスを作成
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // アスペクト比を保ちながらリサイズ
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // 画像を描画
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Base64に変換
        const mimeType = `image/${format}`;
        const base64 = canvas.toDataURL(mimeType, quality);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * サムネイル用に画像をリサイズ（小さいサイズ）
 */
export function createThumbnail(
  file: File,
  maxSize: number = 400
): Promise<string> {
  return resizeImage(file, {
    maxWidth: maxSize,
    maxHeight: maxSize,
    quality: 0.7,
    format: 'jpeg',
  });
}

/**
 * 一覧表示用に画像をリサイズ（中サイズ）
 * 品質を下げてファイルサイズを削減
 */
export function resizeForList(
  file: File,
  maxSize: number = 800
): Promise<string> {
  return resizeImage(file, {
    maxWidth: maxSize,
    maxHeight: maxSize,
    quality: 0.65, // 品質を0.75から0.65に下げてファイルサイズを削減
    format: 'jpeg',
  });
}


