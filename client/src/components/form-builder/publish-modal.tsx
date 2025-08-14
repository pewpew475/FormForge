import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  ExternalLink, 
  QrCode, 
  Share2, 
  CheckCircle, 
  X,
  Eye,
  BarChart3
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Form } from "@/shared/schema";

interface PublishModalProps {
  form: Form;
  onClose: () => void;
  onViewResponses?: () => void;
}

export function PublishModal({ form, onClose, onViewResponses }: PublishModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const formUrl = `${window.location.origin}/form/${form.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formUrl)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The form link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const openForm = () => {
    window.open(formUrl, '_blank');
  };

  const shareForm = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: form.title,
          text: form.description || `Fill out this form: ${form.title}`,
          url: formUrl,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-green-50 border-b border-green-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Form Published Successfully!</h3>
              <p className="text-sm text-green-600">Your form is now live and ready to collect responses</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-green-600 hover:text-green-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Form Info */}
          <div className="text-center">
            <h4 className="text-xl font-semibold text-slate-800 mb-2">{form.title}</h4>
            {form.description && (
              <p className="text-slate-600 mb-4">{form.description}</p>
            )}
            <Badge variant="default" className="bg-green-500">
              Published
            </Badge>
          </div>

          {/* Share Link */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Share this link with your audience:
            </label>
            <div className="flex space-x-2">
              <Input
                value={formUrl}
                readOnly
                className="flex-1 bg-slate-50"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className={copied ? "bg-green-50 border-green-200 text-green-700" : ""}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={openForm}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Form</span>
            </Button>
            <Button
              onClick={shareForm}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Code</span>
            </Button>
            {onViewResponses && (
              <Button
                onClick={onViewResponses}
                variant="outline"
                className="flex items-center justify-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Responses</span>
              </Button>
            )}
          </div>

          {/* QR Code */}
          {showQR && (
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-3">Scan to open form:</p>
              <img
                src={qrCodeUrl}
                alt="QR Code for form"
                className="mx-auto border border-slate-200 rounded"
                width={200}
                height={200}
              />
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-2">💡 Tips for sharing your form:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Share the link via email, social media, or messaging apps</li>
              <li>• Use the QR code for print materials or presentations</li>
              <li>• Responses are automatically saved and can be viewed anytime</li>
              <li>• You can unpublish the form at any time to stop collecting responses</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            Form ID: <code className="bg-slate-200 px-2 py-1 rounded text-xs">{form.id}</code>
          </div>
          <Button onClick={onClose} className="bg-primary text-white hover:bg-primary/90">
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
}
