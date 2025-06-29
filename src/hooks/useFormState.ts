import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { useToast } from '@/hooks/use-toast';

// Form State Types
export interface AgentVendor {
  id?: string;
  vendor_type: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  is_primary: boolean;
}

export interface AgentBranding {
  has_branded_sign?: string;
  sign_notes?: string;
  review_link: string;
  has_canva_template?: string;
  canva_template_url?: string;
  favorite_color?: string;
  drinks_coffee?: boolean;
  drinks_alcohol?: boolean;
  birthday?: string;
  social_media_permission?: boolean;
}

export interface AgentIntakeSession {
  id?: string;
  status: 'in_progress' | 'completed';
  completion_percentage: number;
  vendor_data?: Record<string, any>;
  branding_data?: Record<string, any>;
}

export interface OfferRequest {
  id?: string;
  property_address?: string;
  buyer_names?: string;
  purchase_price?: number;
  loan_type?: string;
  lending_company?: string;
  emd_amount?: number;
  exchange_fee?: number;
  settlement_company?: string;
  projected_closing_date?: string;
  status?: string;
}

export type ServiceTierType = 'buyer_core' | 'buyer_elite' | 'white_glove_buyer' | 
                              'listing_core' | 'listing_elite' | 'white_glove_listing';

export interface FormState {
  // Agent Intake
  vendorData: AgentVendor[];
  brandingData: AgentBranding;
  intakeSession: AgentIntakeSession;
  
  // Offer Requests
  offerRequest: OfferRequest;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  
  // Service Tiers
  selectedTier: ServiceTierType | null;
  tierFeatures: string[];
  
  // UI State
  currentStep: number;
  isSubmitting: boolean;
  validationErrors: Record<string, string>;
}

interface FormStateOptions {
  autoSaveInterval?: number;
  enableOptimisticUpdates?: boolean;
  enableConflictResolution?: boolean;
}

export const useFormState = (options: FormStateOptions = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    autoSaveInterval = 30000,
    enableOptimisticUpdates = true,
    enableConflictResolution = true
  } = options;

  // Initial state
  const initialState: FormState = {
    vendorData: [],
    brandingData: { review_link: '' },
    intakeSession: { status: 'in_progress', completion_percentage: 0 },
    offerRequest: {},
    autoSaveStatus: 'idle',
    selectedTier: null,
    tierFeatures: [],
    currentStep: 1,
    isSubmitting: false,
    validationErrors: {}
  };

  const [state, setState] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  
  // Refs for managing auto-save and conflict resolution
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedStateRef = useRef<string>('');
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Load initial data from Supabase
  const loadInitialData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load agent intake session
      const { data: intakeSession } = await supabase
        .from('agent_intake_sessions')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Load vendor data
      const { data: vendorData } = await supabase
        .from('agent_vendors')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      // Load branding data
      const { data: brandingData } = await supabase
        .from('agent_branding')
        .select('*')
        .eq('agent_id', user.id)
        .maybeSingle();

      // Load offer requests
      const { data: offerRequests } = await supabase
        .from('offer_requests')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setState(prev => ({
        ...prev,
        vendorData: vendorData?.map(v => ({
          id: v.id,
          vendor_type: v.vendor_type,
          company_name: v.company_name,
          contact_name: v.contact_name || undefined,
          email: v.email || undefined,
          phone: v.phone || undefined,
          address: v.address || undefined,
          notes: v.notes || undefined,
          is_primary: v.is_primary
        })) || [],
        brandingData: brandingData ? {
          has_branded_sign: brandingData.has_branded_sign || undefined,
          sign_notes: brandingData.sign_notes || undefined,
          review_link: brandingData.review_link,
          has_canva_template: brandingData.has_canva_template || undefined,
          canva_template_url: brandingData.canva_template_url || undefined,
          favorite_color: brandingData.favorite_color || undefined,
          drinks_coffee: brandingData.drinks_coffee || undefined,
          drinks_alcohol: brandingData.drinks_alcohol || undefined,
          birthday: brandingData.birthday || undefined,
          social_media_permission: brandingData.social_media_permission || undefined
        } : { review_link: '' },
        intakeSession: intakeSession ? {
          id: intakeSession.id,
          status: (intakeSession.status as 'in_progress' | 'completed') || 'in_progress',
          completion_percentage: intakeSession.completion_percentage || 0,
          vendor_data: intakeSession.vendor_data as Record<string, any> || undefined,
          branding_data: intakeSession.branding_data as Record<string, any> || undefined
        } : { status: 'in_progress', completion_percentage: 0 },
        offerRequest: offerRequests || {}
      }));

      setNetworkError(null);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setNetworkError('Failed to load form data. Please refresh the page.');
      toast({
        title: 'Connection Error',
        description: 'Failed to load your form data. Please check your connection.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  // Auto-save function with optimistic updates
  const autoSave = useCallback(async (currentState: FormState) => {
    if (!user?.id || state.autoSaveStatus === 'saving') return;

    const stateSnapshot = JSON.stringify(currentState);
    if (stateSnapshot === lastSavedStateRef.current) return;

    setState(prev => ({ ...prev, autoSaveStatus: 'saving' }));

    try {
      // Save intake session - Fix: Pass single object, not array
      if (currentState.intakeSession) {
        const { error } = await supabase
          .from('agent_intake_sessions')
          .upsert({
            agent_id: user.id,
            status: currentState.intakeSession.status,
            completion_percentage: currentState.intakeSession.completion_percentage,
            vendor_data: currentState.vendorData,
            branding_data: currentState.brandingData,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Save branding data if complete
      if (currentState.brandingData.review_link) {
        const { error } = await supabase
          .from('agent_branding')
          .upsert({
            agent_id: user.id,
            ...currentState.brandingData,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      lastSavedStateRef.current = stateSnapshot;
      setState(prev => ({ ...prev, autoSaveStatus: 'saved' }));
      retryCountRef.current = 0;

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, autoSaveStatus: 'idle' }));
      }, 2000);

    } catch (error) {
      console.error('Auto-save error:', error);
      setState(prev => ({ ...prev, autoSaveStatus: 'error' }));
      
      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => autoSave(currentState), 5000 * retryCountRef.current);
      } else {
        toast({
          title: 'Auto-save Failed',
          description: 'Your changes could not be saved. Please try manually saving.',
          variant: 'destructive'
        });
      }
    }
  }, [user?.id, state.autoSaveStatus, toast]);

  // Update state with auto-save
  const updateState = useCallback((updates: Partial<FormState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Clear auto-save timeout and set new one
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave(newState);
      }, autoSaveInterval);

      return newState;
    });
  }, [autoSave, autoSaveInterval]);

  // Specific update functions
  const updateVendorData = useCallback((vendors: AgentVendor[]) => {
    updateState({ vendorData: vendors });
  }, [updateState]);

  const updateBrandingData = useCallback((branding: Partial<AgentBranding>) => {
    updateState({ 
      brandingData: { ...state.brandingData, ...branding }
    });
  }, [updateState, state.brandingData]);

  const updateOfferRequest = useCallback((offer: Partial<OfferRequest>) => {
    updateState({
      offerRequest: { ...state.offerRequest, ...offer }
    });
  }, [updateState, state.offerRequest]);

  const setCurrentStep = useCallback((step: number) => {
    updateState({ currentStep: step });
  }, [updateState]);

  const setValidationErrors = useCallback((errors: Record<string, string>) => {
    updateState({ validationErrors: errors });
  }, [updateState]);

  const setIsSubmitting = useCallback((submitting: boolean) => {
    updateState({ isSubmitting: submitting });
  }, [updateState]);

  // Force save function
  const forceSave = useCallback(() => {
    autoSave(state);
  }, [autoSave, state]);

  // Reset form state
  const resetState = useCallback(() => {
    setState(initialState);
    lastSavedStateRef.current = '';
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, []);

  // Conflict resolution
  const resolveConflict = useCallback(async () => {
    if (!enableConflictResolution) return;
    
    try {
      await loadInitialData();
      toast({
        title: 'Data Refreshed',
        description: 'Your form data has been updated with the latest changes.',
      });
    } catch (error) {
      console.error('Conflict resolution error:', error);
    }
  }, [enableConflictResolution, loadInitialData, toast]);

  // Network recovery
  const retryConnection = useCallback(async () => {
    setNetworkError(null);
    await loadInitialData();
  }, [loadInitialData]);

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    state,
    isLoading,
    networkError,
    
    // Actions
    updateState,
    updateVendorData,
    updateBrandingData,
    updateOfferRequest,
    setCurrentStep,
    setValidationErrors,
    setIsSubmitting,
    
    // Utility functions
    forceSave,
    resetState,
    resolveConflict,
    retryConnection,
    
    // Computed values
    hasUnsavedChanges: state.autoSaveStatus === 'saving' || JSON.stringify(state) !== lastSavedStateRef.current,
    isOnline: !networkError
  };
};
