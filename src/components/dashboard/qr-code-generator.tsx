'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
interface QrCodeGeneratorProps {
    studentId?: string;
    studentName?: string;
    studentClass?: string | null;
    courses?: { courseId: string; progress: number; title: string }[];
}

export function QrCodeGenerator({ studentId, studentName, studentClass, courses = [] }: QrCodeGeneratorProps) {
    // If no student information is provided, don't crash, but display a message or nothing
    if (!studentId && !studentName) {
        return null;
    }

    const studentProgress = {
        studentId: studentId || 'N/A',
        studentName: studentName || 'N/A',
        class: studentClass || 'N/A',
        courses: courses,
    };

    const qrValue = JSON.stringify(studentProgress);

    return (
        <Card className="sticky top-20 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <QrCode className="h-6 w-6 text-primary" />
                    Sync Your Progress
                </CardTitle>
                <CardDescription>
                    For offline use. Ask your teacher to scan this QR code to sync your progress from this device.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6">
                <div className="bg-white p-4 rounded-lg border">
                    <QRCodeSVG 
                        value={qrValue}
                        size={200}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"L"}
                        includeMargin={false}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
