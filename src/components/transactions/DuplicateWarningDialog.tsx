
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, MapPin, User, Phone, Mail } from 'lucide-react';
import { DuplicateMatch, ClientDuplicateMatch } from '@/services/DuplicateDetectionService';

interface DuplicateWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyDuplicates?: DuplicateMatch[];
  clientDuplicates?: ClientDuplicateMatch[];
  onProceed: () => void;
  onCancel: () => void;
}

export const DuplicateWarningDialog = ({
  open,
  onOpenChange,
  propertyDuplicates = [],
  clientDuplicates = [],
  onProceed,
  onCancel
}: DuplicateWarningDialogProps) => {
  const hasPropertyDuplicates = propertyDuplicates.length > 0;
  const hasClientDuplicates = clientDuplicates.length > 0;
  const hasDuplicates = hasPropertyDuplicates || hasClientDuplicates;

  if (!hasDuplicates) return null;

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'bg-red-100 text-red-800';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.9) return 'High Match';
    if (score >= 0.7) return 'Likely Match';
    return 'Possible Match';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Potential Duplicates Detected
          </DialogTitle>
        </DialogHeader>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            We found existing records that might be duplicates. Please review them before proceeding.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {hasPropertyDuplicates && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Similar Properties ({propertyDuplicates.length})
              </h3>
              <div className="space-y-3">
                {propertyDuplicates.map((duplicate, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{duplicate.property_address}</h4>
                        <p className="text-sm text-gray-600">
                          {duplicate.city}, {duplicate.state} {duplicate.zip_code}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getSimilarityColor(duplicate.similarity_score)}>
                          {getSimilarityLabel(duplicate.similarity_score)}
                        </Badge>
                        <Badge variant="outline">{duplicate.status}</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Similarity Score: {Math.round(duplicate.similarity_score * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasClientDuplicates && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Similar Clients ({clientDuplicates.length})
              </h3>
              <div className="space-y-3">
                {clientDuplicates.map((duplicate, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{duplicate.full_name}</h4>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          {duplicate.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {duplicate.email}
                            </span>
                          )}
                          {duplicate.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {duplicate.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={getSimilarityColor(duplicate.similarity_score)}>
                        {getSimilarityLabel(duplicate.similarity_score)}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Similarity Score: {Math.round(duplicate.similarity_score * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel & Review
          </Button>
          <Button onClick={onProceed} className="bg-brand-charcoal hover:bg-brand-taupe-dark">
            Proceed Anyway
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
