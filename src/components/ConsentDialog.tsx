
import React from 'react';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ConsentDialogProps {
  showConsent: boolean;
  onConsent: (accepted: boolean) => void;
  t: {
    consentTitle: string;
    consentDescription: string;
    consentText: string;
    accept: string;
    decline: string;
  };
}

export const ConsentDialog: React.FC<ConsentDialogProps> = ({ showConsent, onConsent, t }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Dialog open={showConsent} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Leaf className="text-green-400" />
              {t.consentTitle}
            </DialogTitle>
            <DialogDescription className="text-slate-300 leading-relaxed">
              {t.consentDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.consentText}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => onConsent(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {t.decline}
            </Button>
            <Button 
              onClick={() => onConsent(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {t.accept}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
