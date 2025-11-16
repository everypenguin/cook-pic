import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const storageType = process.env.STORAGE_TYPE || 'local'; // 'local' or 's3'

export interface UploadResult {
  url: string;
  key?: string;
}

/**
 * 画像をアップロード
 */
export async function uploadImage(
  file: Express.Multer.File | { buffer: Buffer; mimetype: string },
  filename: string
): Promise<UploadResult> {
  if (storageType === 's3') {
    return uploadToS3(file, filename);
  } else {
    return uploadToLocal(file, filename);
  }
}

/**
 * ローカルストレージにアップロード（開発環境用）
 */
async function uploadToLocal(
  file: Express.Multer.File | { buffer: Buffer; mimetype: string },
  filename: string
): Promise<UploadResult> {
  const uploadDir = path.join(process.cwd(), 'uploads');
  
  // アップロードディレクトリが存在しない場合は作成
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filePath = path.join(uploadDir, filename);
  const buffer = 'buffer' in file ? file.buffer : fs.readFileSync(file.path);
  
  fs.writeFileSync(filePath, buffer);
  
  // URLを返す（Base64エンコードまたはファイルパス）
  const url = `/uploads/${filename}`;
  
  return { url };
}

/**
 * AWS S3にアップロード（本番環境用）
 */
async function uploadToS3(
  file: Express.Multer.File | { buffer: Buffer; mimetype: string },
  filename: string
): Promise<UploadResult> {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not configured');
  }
  
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-northeast-1',
  });
  
  const buffer = 'buffer' in file ? file.buffer : fs.readFileSync(file.path);
  const key = `images/${filename}`;
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' as const,
  };
  
  await s3.upload(params).promise();
  
  const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-northeast-1'}.amazonaws.com/${key}`;
  
  return { url, key };
}

/**
 * Base64文字列から画像をアップロード
 */
export async function uploadFromBase64(
  base64String: string,
  filename: string
): Promise<UploadResult> {
  // data:image/jpeg;base64, の形式を処理
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  
  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  const file = { buffer, mimetype: mimeType };
  return uploadImage(file, filename);
}








