
import React, { createContext, useContext, ReactNode, useState } from 'react';

interface FormState {
  currentStep: number;
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
  vendorData: any[];
  brandingData: any;
}

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
}

export const FormStateProvider = ({ children }: FormStateProviderProps) => {
  const [state, setState] = useState<FormState>({
    currentStep: 1,
    validationErrors: {},
    isSubmitting: false,
    vendorData: [],
    brandingData: {}
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const updateState = (updates: Partial<FormState>) => {
    setState(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const updateVendorData = (vendors: any[]) => {
    setState(prev => ({ ...prev, vendorData: vendors }));
    setHasUnsavedChanges(true);
  };

  const updateBrandingData = (branding: any) => {
    setState(prev => ({ ...prev, brandingData: branding }));
    setHasUnsavedChanges(true);
  };

  const updateOfferRequest = (offer: any) => {
    // Handle offer request updates
    setHasUnsavedChanges(true);
  };

  const setCurrentStep = (step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const setValidationErrors = (errors: Record<string, string>) => {
    setState(prev => ({ ...prev, validationErrors: errors }));
  };

  const setIsSubmitting = (submitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting: submitting }));
  };

  const forceSave = () => {
    // Implement force save logic
    setHasUnsavedChanges(false);
  };

  const resetState = () => {
    setState({
      currentStep: 1,
      validationErrors: {},
      isSubmitting: false,
      vendorData: [],
      brandingData: {}
    });
    setHasUnsavedChanges(false);
  };

  const resolveConflict = async () => {
    // Implement conflict resolution
  };

  const retryConnection = async () => {
    // Implement connection retry
    setNetworkError(null);
  };

  const contextValue: FormStateContextType = {
    state,
    isLoading,
    networkError,
    updateState,
    updateVendorData,
    updateBrandingData,
    updateOfferRequest,
    setCurrentStep,
    setValidationErrors,
    setIsSubmitting,
    forceSave,
    resetState,
    resolveConflict,
    retryConnection,
    hasUnsavedChanges,
    isOnline
  };

  return (
    <FormStateContext.Provider value={contextValue}>
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
