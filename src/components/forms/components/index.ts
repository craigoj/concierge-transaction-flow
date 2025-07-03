
// Form Components Export
export { VendorCard } from './VendorCard';
export { CurrencyInput } from './CurrencyInput';
export { ContactArrayInput } from './ContactArrayInput';
export { ServiceTierCard, ServiceTierComparison } from './ServiceTierCard';
export { ProgressIndicator } from './ProgressIndicator';

// Animation Components Export
export { 
  StepTransition, 
  AnimatedField, 
  ErrorMessage, 
  SuccessMessage, 
  ConditionalField,
  Skeleton,
  AnimatedProgress
} from './FormTransitions';

export { 
  AutoSaveStatus, 
  ConnectionStatus, 
  LoadingButton, 
  FormLoadingOverlay,
  SkeletonField,
  PulsingDot
} from './LoadingStates';

export { AnimatedInput } from './AnimatedInput';
export { AnimatedCard } from './AnimatedCard';
export { ConflictResolutionDialog } from './ConflictResolutionDialog';

// State Management Components
export { FormStateProvider, useFormStateContext } from '../FormStateProvider';
export { NetworkStatusIndicator, FormStatusBar } from '../NetworkStatusIndicator';

// Types Export - using basic types instead of complex database types
export type VendorData = {
  type: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

export type ContactData = {
  phones: string[];
  emails: string[];
};

// Navigation Integration Components
export { FormNavigationIntegration } from '../../navigation/FormNavigationIntegration';

// Enhanced Transaction Components
export { default as EnhancedCreateTransactionDialog } from '../../transactions/EnhancedCreateTransactionDialog';

// Workflow Integration
export { FormWorkflowIntegration, useWorkflowIntegration } from '../../workflows/FormWorkflowIntegration';

// Profile Sync Hook
export { useProfileSync } from '../../../hooks/useProfileSync';
