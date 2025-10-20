'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


interface SignatureCanvasProps {
  documentId: string;
  onSignatureComplete: () => void;
}

export function SignatureCanvas({ documentId, onSignatureComplete }: SignatureCanvasProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    if (!signerName || !signerRole) {
      alert('Please fill in all fields');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSigning(true);

    try {
      const signatureData = canvas.toDataURL('image/png');

      const { error } = await supabase.from('document_signatures').insert({
        document_id: documentId,
        signer_name: signerName,
        signer_role: signerRole,
        signature_type: 'digital',
        signature_data: signatureData,
      });

      if (error) throw error;

      setIsOpen(false);
      setSignerName('');
      setSignerRole('');
      clearSignature();
      onSignatureComplete();
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Failed to save signature');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Sign Document
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Digital Signature</DialogTitle>
            <DialogDescription>
              Sign this document digitally
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="signer-name">Full Name</Label>
              <Input
                id="signer-name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="signer-role">Role/Title</Label>
              <Input
                id="signer-role"
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                placeholder="Enter your role or title"
              />
            </div>

            <div>
              <Label>Signature</Label>
              <div className="border-2 border-gray-300 rounded-md">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Draw your signature above using your mouse or touchpad
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={clearSignature}>
              Clear
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSignature} disabled={isSigning}>
              {isSigning ? 'Saving...' : 'Save Signature'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
