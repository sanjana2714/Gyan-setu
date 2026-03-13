'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { QrCode, ScanLine } from 'lucide-react';
import QrScanner from 'react-qr-scanner';
import { useToast } from '@/hooks/use-toast';

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function QrCodeScanner() {
  const [open, setOpen] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const handleScan = async (data: any) => {
    if (data && data.text) {
      try {
        const parsedData = JSON.parse(data.text);
        setScannedData(parsedData);

        if (parsedData.studentId) {
          setSyncing(true);
          const studentRef = doc(db, 'users', parsedData.studentId);
          await updateDoc(studentRef, {
            lastSync: serverTimestamp(),
            overallScore: parsedData.overallScore || 0,
            attendance: parsedData.attendance || 100,
          });

          toast({
            title: "Progress Synced!",
            description: `Updated progress for ${parsedData.studentName}.`,
          });
          setOpen(false); // Close scanner on successful scan
        }

      } catch (error: any) {
        console.error("Failed to parse or sync QR code data:", error);
        toast({
          variant: 'destructive',
          title: 'Sync Error',
          description: error.message || 'Invalid QR code or database error.',
        })
      } finally {
        setSyncing(false);
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    toast({
      variant: 'destructive',
      title: 'Scanner Error',
      description: 'Could not access the camera. Please check permissions.',
    })
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <QrCode className="mr-2" /> Sync Progress via QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine /> Scan Student QR Code
          </DialogTitle>
          <DialogDescription>
            Point your camera at the QR code on the student's device to sync their progress.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-muted rounded-lg relative overflow-hidden">
          {open && (
            <div className="relative">
              <QrScanner
                onScan={handleScan}
                onError={handleError}
                constraints={{
                  audio: false,
                  video: { facingMode: "environment" }
                }}
                style={{ width: '100%', opacity: syncing ? 0.5 : 1 }}
              />
              {syncing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold">
                  Syncing...
                </div>
              )}
            </div>
          )}
          <div className="absolute inset-0 border-4 border-primary/50 rounded-lg pointer-events-none" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
