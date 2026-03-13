declare module 'react-qr-scanner' {
    import { Component } from 'react';

    interface QrScannerProps {
        onScan: (data: any) => void;
        onError: (err: any) => void;
        constraints?: {
            audio?: boolean;
            video?: {
                facingMode?: string;
            };
        };
        style?: React.CSSProperties;
        className?: string;
        facingMode?: string;
        delay?: number;
    }

    export default class QrScanner extends Component<QrScannerProps> { }
}
