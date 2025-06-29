
import React, { createContext, useContext, ReactNode } from 'react';
import { useFormState, FormState } from '@/hooks/useFormState';

interface FormStateContextType {
  state: FormState;
  isLoading: boolean;
  networkError: string | null;
  updateState: (updates: Partial<FormState>) => void;
  updateVendorData: (vendors: any[]) => void;
  updateBrandingData: (branding: any) => void;
  updateOfferRequest: (offer: any) => void;
  setCurrentStep: (step: number) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
  setIsSubmitting: (submitting: boolean) => void;
  forceSave: () => void;
  resetState: () => void;
  resolveConflict: () => Promise<void>;
  retryConnection: () => Promise<void>;
  hasUnsavedChanges: boolean;
  isOnline: boolean;
}

const FormStateContext = createContext<FormStateContextType | undefined>(undefined);

interface FormStateProviderProps {
  children: ReactNode;
  autoSaveInterval?: number;
  enableOptimisticUpdates?: boolean;
  enableConflictResolution?: boolean;
}

export const FormStateProvider = ({ 
  children, 
  autoSaveInterval,
  enableOptimisticUpdates,
  enableConflictResolution 
}: FormStateProviderProps) => {
  const formState = useFormState({
    autoSaveInterval,
    enableOptimisticUpdates,
    enableConflictResolution
  });

  return (
    <FormStateContext.Provider value={formState}>
      {children}
    </FormStateContext.Provider>
  );
};

export const useFormStateContext = () => {
  const context = useContext(FormStateContext);
  if (context === undefined) {
    throw new Error('useFormStateContext must be used within a FormStateProvider');
  }
  return context;
};
