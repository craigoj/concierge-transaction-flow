
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { 
  VendorData, 
  BrandingData, 
  OfferRequestData,
  AgentConciergeFormData,
  SafeError 
} from '@/types/common';

interface FormState {
  currentStep: number;
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
  vendorData: VendorData[];
  brandingData: BrandingData;
  offerRequestData?: OfferRequestData;
}

interface FormStateContextType {
  state: FormState;
  isLoading: boolean;
  networkError: string | null;
  updateState: (updates: Partial<FormState>) => void;
  updateVendorData: (vendors: VendorData[]) => void;
  updateBrandingData: (branding: BrandingData) => void;
  updateOfferRequest: (offer: OfferRequestData) => void;
  setCurrentStep: (step: number) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
  setIsSubmitting: (submitting: boolean) => void;
  forceSave: () => Promise<void>;
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
    brandingData: {
      reviewLink: '',
      favoriteColor: undefined,
      birthday: undefined,
      drinksAlcohol: undefined,
      drinksCoffee: undefined,
      hasBrandedSign: undefined,
      signNotes: undefined,
      hasCanvaTemplate: undefined,
      canvaTemplateUrl: undefined,
      socialMediaPermission: undefined
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const updateState = (updates: Partial<FormState>) => {
    setState(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const updateVendorData = (vendors: VendorData[]): void => {
    setState(prev => ({ ...prev, vendorData: vendors }));
    setHasUnsavedChanges(true);
  };

  const updateBrandingData = (branding: BrandingData): void => {
    setState(prev => ({ ...prev, brandingData: branding }));
    setHasUnsavedChanges(true);
  };

  const updateOfferRequest = (offer: OfferRequestData): void => {
    setState(prev => ({ ...prev, offerRequestData: offer }));
    setHasUnsavedChanges(true);
  };

  const setCurrentStep = (step: number): void => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const setValidationErrors = (errors: Record<string, string>): void => {
    setState(prev => ({ ...prev, validationErrors: errors }));
  };

  const setIsSubmitting = (submitting: boolean): void => {
    setState(prev => ({ ...prev, isSubmitting: submitting }));
  };

  const forceSave = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // TODO: Implement actual save logic to backend
      // This would typically involve calling an API to persist the form data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setHasUnsavedChanges(false);
      setNetworkError(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to save form data';
      setNetworkError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = (): void => {
    setState({
      currentStep: 1,
      validationErrors: {},
      isSubmitting: false,
      vendorData: [],
      brandingData: {
        reviewLink: '',
        favoriteColor: undefined,
        birthday: undefined,
        drinksAlcohol: undefined,
        drinksCoffee: undefined,
        hasBrandedSign: undefined,
        signNotes: undefined,
        hasCanvaTemplate: undefined,
        canvaTemplateUrl: undefined,
        socialMediaPermission: undefined
      }
    });
    setHasUnsavedChanges(false);
    setNetworkError(null);
  };

  const resolveConflict = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // TODO: Implement conflict resolution logic
      // This would typically involve merging conflicting data or showing a resolution UI
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulated resolution
      setNetworkError(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to resolve conflict';
      setNetworkError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const retryConnection = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // TODO: Implement connection retry logic
      // This would typically involve re-establishing network connection or retrying failed requests
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated retry
      setNetworkError(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Connection retry failed';
      setNetworkError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
