import React, { useState, useEffect, useCallback } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from 'lucide-react'

import VendorPreferencesStep from './intake-steps/VendorPreferencesStep'
import BrandingPreferencesStep from './intake-steps/BrandingPreferencesStep'
import ReviewAndSubmitStep from './intake-steps/ReviewAndSubmitStep'

import type { 
  AgentIntakeFormData, 
  AgentVendorInsert, 
  AgentBrandingInsert,
  AgentIntakeSessionInsert
} from '@/integrations/supabase/agent-concierge-types'

// =============================================================================
// FORM VALIDATION SCHEMA
// =============================================================================

const vendorSchema = z.object({
  vendor_type: z.string(),
  company_name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  is_primary: z.boolean().default(false),
  is_active: z.boolean().default(true)
})

const brandingSchema = z.object({
  has_branded_sign: z.boolean().default(false),
  sign_notes: z.string().optional(),
  review_link: z.string().url('Please enter a valid URL'),
  has_canva_template: z.boolean().default(false),
  canva_template_url: z.string().url().optional().or(z.literal('')),
  social_media_permission: z.boolean().default(false),
  favorite_color: z.string().optional(),
  drinks_coffee: z.boolean().optional(),
  drinks_alcohol: z.boolean().optional(),
  birthday: z.string().optional(),
  preferred_communication_time: z.enum(['morning', 'afternoon', 'evening', 'anytime']).optional(),
  communication_style: z.enum(['formal', 'casual', 'detailed', 'brief']).optional(),
  email_signature: z.string().optional()
})

const agentIntakeSchema = z.object({
  vendors: z.array(vendorSchema),
  branding: brandingSchema
})

type AgentIntakeFormValues = z.infer<typeof agentIntakeSchema>

// =============================================================================
// STEP CONFIGURATION
// =============================================================================

const STEPS = [
  {
    id: 1,
    title: 'Vendor Preferences',
    description: 'Set up your preferred vendors for seamless coordination'
  },
  {
    id: 2,
    title: 'Branding & Personalization',
    description: 'Customize your service experience and preferences'
  },
  {
    id: 3,
    title: 'Review & Submit',
    description: 'Review your information and complete setup'
  }
]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const AgentIntakeForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const methods = useForm<AgentIntakeFormValues>({
    resolver: zodResolver(agentIntakeSchema),
    defaultValues: {
      vendors: [],
      branding: {
        has_branded_sign: false,
        review_link: '',
        has_canva_template: false,
        social_media_permission: false
      }
    },
    mode: 'onChange'
  })

  const { handleSubmit, watch, formState: { isValid } } = methods
  const formData = watch()

  // =============================================================================
  // SESSION MANAGEMENT
  // =============================================================================

  // Initialize or resume session
  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  const initializeSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/auth')
        return
      }

      // Check for existing incomplete session
      const { data: existingSessions } = await supabase
        .from('agent_intake_sessions')
        .select('*')
        .eq('agent_id', user.id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)

      if (existingSessions && existingSessions.length > 0) {
        const session = existingSessions[0]
        setSessionId(session.id)
        
        // Restore form data if available
        if (session.vendor_data) {
          methods.setValue('vendors', session.vendor_data as AgentVendorInsert[])
        }
        if (session.branding_data) {
          methods.setValue('branding', session.branding_data as AgentBrandingInsert)
        }
        
        // Calculate and set current step based on completion
        const step = calculateCurrentStep(session.completion_percentage)
        setCurrentStep(step)

        toast({
          title: 'Session Restored',
          description: 'We\'ve restored your previous progress.',
        })
      } else {
        // Create new session
        const { data: newSession, error } = await supabase
          .from('agent_intake_sessions')
          .insert({
            agent_id: user.id,
            session_type: 'initial',
            status: 'in_progress',
            completion_percentage: 0,
            ip_address: await getUserIP(),
            user_agent: navigator.userAgent
          })
          .select()
          .single()

        if (error) throw error
        setSessionId(newSession.id)
      }
    } catch (error) {
      console.error('Error initializing session:', error)
      toast({
        title: 'Session Error',
        description: 'Failed to initialize intake session. Please try again.',
        variant: 'destructive'
      })
    }
  }, [navigate, toast, methods])

  // Auto-save form data
  useEffect(() => {
    if (!sessionId) return

    const saveInterval = setInterval(() => {
      autoSaveProgress()
    }, 30000) // Save every 30 seconds

    return () => clearInterval(saveInterval)
  }, [sessionId, autoSaveProgress])

  const autoSaveProgress = useCallback(async () => {
    if (!sessionId || !formData) return

    try {
      const completionPercentage = calculateCompletionPercentage()
      
      await supabase
        .from('agent_intake_sessions')
        .update({
          vendor_data: formData.vendors,
          branding_data: formData.branding,
          completion_percentage: completionPercentage,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId)

    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, [sessionId, formData, calculateCompletionPercentage])

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const calculateCompletionPercentage = useCallback((): number => {
    const vendorCount = formData.vendors?.length || 0
    const brandingFields = Object.values(formData.branding || {}).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length

    const vendorScore = Math.min(vendorCount / 3, 1) * 50 // Up to 50% for vendors
    const brandingScore = Math.min(brandingFields / 5, 1) * 50 // Up to 50% for branding

    return Math.round(vendorScore + brandingScore)
  }, [formData])

  const calculateCurrentStep = (percentage: number): number => {
    if (percentage === 0) return 1
    if (percentage < 60) return 1
    if (percentage < 90) return 2
    return 3
  }

  const getUserIP = async (): Promise<string | null> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return null
    }
  }

  // =============================================================================
  // STEP NAVIGATION
  // =============================================================================

  const nextStep = async () => {
    const isCurrentStepValid = await methods.trigger()
    
    if (!isCurrentStepValid) {
      toast({
        title: 'Please complete all required fields',
        description: 'Fix the errors above before continuing.',
        variant: 'destructive'
      })
      return
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
      await autoSaveProgress()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  // =============================================================================
  // FORM SUBMISSION
  // =============================================================================

  const onSubmit = async (data: AgentIntakeFormValues) => {
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Insert vendor preferences
      if (data.vendors.length > 0) {
        const vendorsWithAgent = data.vendors.map(vendor => ({
          ...vendor,
          agent_id: user.id
        }))

        const { error: vendorError } = await supabase
          .from('agent_vendors')
          .insert(vendorsWithAgent)

        if (vendorError) throw vendorError
      }

      // Insert branding preferences
      const { error: brandingError } = await supabase
        .from('agent_branding')
        .upsert({
          ...data.branding,
          agent_id: user.id
        })

      if (brandingError) throw brandingError

      // Update session to completed
      if (sessionId) {
        await supabase
          .from('agent_intake_sessions')
          .update({
            status: 'completed',
            completion_percentage: 100,
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId)
      }

      // Update profile onboarding status
      await supabase
        .from('profiles')
        .update({
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user.id)

      toast({
        title: 'Setup Complete!',
        description: 'Your agent preferences have been saved successfully.',
      })

      // Navigate to dashboard
      navigate('/')

    } catch (error) {
      console.error('Submission error:', error)
      toast({
        title: 'Submission Failed',
        description: 'Please try again or contact support if the issue persists.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // =============================================================================
  // RENDER CURRENT STEP
  // =============================================================================

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <VendorPreferencesStep />
      case 2:
        return <BrandingPreferencesStep />
      case 3:
        return <ReviewAndSubmitStep />
      default:
        return null
    }
  }

  // =============================================================================
  // COMPONENT RENDER
  // =============================================================================

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-brand-cream py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-brand-heading font-bold text-brand-charcoal mb-4">
            Agent Intake & Setup
          </h1>
          <p className="text-lg text-brand-charcoal/70 max-w-2xl mx-auto">
            Help us personalize your experience by sharing your preferred vendors and branding preferences.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-all ${
                    currentStep >= step.id
                      ? 'bg-brand-charcoal border-brand-charcoal text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                  onClick={() => goToStep(step.id)}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-20 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-brand-charcoal' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <Progress value={progress} className="w-full h-2" />
          
          <div className="text-center mt-2">
            <span className="text-sm text-brand-charcoal/60">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </span>
          </div>
        </div>

        {/* Form Content */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="bg-white shadow-brand-elevation border-brand-taupe/20">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-brand-heading text-brand-charcoal">
                  {STEPS[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="text-brand-charcoal/70">
                  {STEPS[currentStep - 1].description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                {renderCurrentStep()}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-brand-charcoal hover:bg-brand-taupe-dark"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="flex items-center space-x-2 bg-brand-charcoal hover:bg-brand-taupe-dark"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete Setup</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default AgentIntakeForm