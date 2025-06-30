
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { useToast } from '@/hooks/use-toast';

interface AutoSaveOptions {
  table: 'agent_intake_sessions' | 'offer_requests' | 'agent_branding' | 'agent_vendors';
  data: Record<string, any>;
  interval?: number; // milliseconds
  enabled?: boolean;
  onSave?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useFormAutoSave = ({
  table,
  data,
  interval = 30000, // 30 seconds default
  enabled = true,
  onSave,
  onError
}: AutoSaveOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const lastSavedData = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const hasChanges = JSON.stringify(data) !== lastSavedData.current;

  const saveData = async () => {
    if (!user?.id || !hasChanges || !enabled || !data) return;

    setSaveStatus('saving');
    try {
      let saveResult;
      
      switch (table) {
        case 'agent_intake_sessions':
          saveResult = await supabase
            .from('agent_intake_sessions')
            .upsert({
              agent_id: user.id,
              vendor_data: data.vendor_data || {},
              branding_data: data.branding_data || {},
              status: data.status || 'in_progress',
              completion_percentage: data.completion_percentage || 0,
              updated_at: new Date().toISOString()
            });
          break;
        case 'offer_requests':
          // Only save offer_requests if we have required fields
          if (data.buyer_names && data.property_address && data.purchase_price && 
              data.emd_amount && data.exchange_fee && data.lending_company && 
              data.settlement_company && data.projected_closing_date && data.loan_type) {
            saveResult = await supabase
              .from('offer_requests')
              .upsert({
                agent_id: user.id,
                buyer_names: data.buyer_names,
                property_address: data.property_address,
                purchase_price: data.purchase_price,
                emd_amount: data.emd_amount,
                exchange_fee: data.exchange_fee,
                lending_company: data.lending_company,
                settlement_company: data.settlement_company,
                projected_closing_date: data.projected_closing_date,
                loan_type: data.loan_type,
                buyer_contacts: data.buyer_contacts || { phones: [], emails: [] },
                closing_cost_assistance: data.closing_cost_assistance || null,
                wdi_inspection_details: data.wdi_inspection_details || { notes: "", period: null, provider: null },
                fica_details: data.fica_details || { required: false, inspection_period: null },
                extras: data.extras || null,
                lead_eifs_survey: data.lead_eifs_survey || null,
                occupancy_notes: data.occupancy_notes || null,
                status: data.status || 'pending',
                transaction_id: data.transaction_id || null,
                updated_at: new Date().toISOString()
              });
          } else {
            // Skip saving if required fields are missing
            setSaveStatus('idle');
            return;
          }
          break;
        case 'agent_branding':
          // Only save agent_branding if we have required review_link
          if (data.review_link) {
            saveResult = await supabase
              .from('agent_branding')
              .upsert({
                agent_id: user.id,
                has_branded_sign: data.has_branded_sign || null,
                sign_notes: data.sign_notes || null,
                review_link: data.review_link,
                has_canva_template: data.has_canva_template || null,
                canva_template_url: data.canva_template_url || null,
                favorite_color: data.favorite_color || '#3C3C3C',
                drinks_coffee: data.drinks_coffee || false,
                drinks_alcohol: data.drinks_alcohol || false,
                birthday: data.birthday || null,
                social_media_permission: data.social_media_permission || false,
                updated_at: new Date().toISOString()
              });
          } else {
            // Skip saving if required fields are missing
            setSaveStatus('idle');
            return;
          }
          break;
        case 'agent_vendors':
          // Only save agent_vendors if we have required fields
          if (data.company_name && data.vendor_type) {
            saveResult = await supabase
              .from('agent_vendors')
              .upsert({
                agent_id: user.id,
                company_name: data.company_name,
                vendor_type: data.vendor_type,
                contact_name: data.contact_name || null,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null,
                notes: data.notes || null,
                is_primary: data.is_primary || false,
                updated_at: new Date().toISOString()
              });
          } else {
            // Skip saving if required fields are missing
            setSaveStatus('idle');
            return;
          }
          break;
        default:
          throw new Error(`Unsupported table: ${table}`);
      }

      if (saveResult?.error) throw saveResult.error;

      lastSavedData.current = JSON.stringify(data);
      setSaveStatus('saved');
      onSave?.(data);

      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
      onError?.(error);
      
      toast({
        title: 'Auto-save failed',
        description: 'Your changes could not be saved automatically.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (!enabled || !hasChanges) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(saveData, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, hasChanges, interval]);

  // Manual save function
  const forceSave = () => saveData();

  return {
    saveStatus,
    hasChanges,
    forceSave
  };
};
