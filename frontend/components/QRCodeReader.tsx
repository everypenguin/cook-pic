'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRCodeReaderProps {
  onScanSuccess: (result: string) => void;
  onError?: (error: string) => void;
}

export default function QRCodeReader({ onScanSuccess, onError }: QRCodeReaderProps) {
  const readerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const startScanning = async () => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader');
        readerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScanSuccess(decodedText);
            stopScanning();
          },
          (errorMessage) => {
            // エラーは無視（スキャン中のエラーは正常）
          }
        );
        setScanning(true);
      } catch (err: any) {
        const errorMsg = err.message || 'QRコードスキャンを開始できませんでした';
        setError(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
      }
    };

    startScanning();

    return () => {
      stopScanning();
    };
  }, [onScanSuccess, onError]);

  const stopScanning = async () => {
    if (readerRef.current) {
      try {
        await readerRef.current.stop();
        readerRef.current.clear();
      } catch (err) {
        // 停止時のエラーは無視
      }
      readerRef.current = null;
      setScanning(false);
    }
  };

  return (
    <div className="w-full">
      <div id="qr-reader" className="w-full"></div>
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {scanning && (
        <p className="mt-4 text-center text-gray-600 text-sm">
          QRコードをカメラに向けてください
        </p>
      )}
    </div>
  );
}











