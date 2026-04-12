import { supabase } from '@/integrations/supabase/client';
import { storageService } from './storage-service';
import { logger } from '@/lib/logger';

export async function initializeStorage() {
  try {
    // Initialize storage bucket
    const bucketResult = await storageService.initializeBucket();
    if (!bucketResult.success) {
      logger.error('Failed to initialize storage bucket:', bucketResult.error);
      return false;
    }

    // Create document templates table and insert default templates
    await initializeDocumentTemplates();

    logger.info('Storage initialization completed successfully');
    return true;
  } catch (error) {
    logger.error('Storage initialization failed:', error);
    return false;
  }
}

async function initializeDocumentTemplates() {
  try {
    // Create document templates table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.document_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('purchase_agreement', 'offer_letter', 'disclosure', 'custom')),
        content TEXT NOT NULL,
        variables TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT true
      );
    `;

    await supabase.rpc('exec_sql', { sql: createTableQuery });

    // Add columns to documents table if they don't exist
    await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'documents' 
            AND column_name = 'template_id'
          ) THEN
            ALTER TABLE public.documents ADD COLUMN template_id UUID;
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'documents' 
            AND column_name = 'url'
          ) THEN
            ALTER TABLE public.documents ADD COLUMN url TEXT;
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'documents' 
            AND column_name = 'generation_metadata'
          ) THEN
            ALTER TABLE public.documents ADD COLUMN generation_metadata JSONB DEFAULT '{}';
          END IF;
        END$$;
      `,
    });

    // Insert default templates
    const { error: insertError } = await supabase.from('document_templates').upsert(
      [
        {
          name: 'Purchase Agreement Template',
          type: 'purchase_agreement',
          content: `<h1>PURCHASE AGREEMENT</h1>
<p><strong>Property Address:</strong> {{property_address}}</p>
<p><strong>Buyer:</strong> {{buyer_name}}</p>
<p><strong>Seller:</strong> {{seller_name}}</p>
<p><strong>Purchase Price:</strong> ${{ purchase_price }}</p>
<p><strong>Closing Date:</strong> {{closing_date}}</p>

<h2>Terms and Conditions</h2>
<p>This Purchase Agreement is made between the Buyer and Seller for the purchase of the above-mentioned property.</p>

<h3>Purchase Price</h3>
<p>The total purchase price for the property is ${{ purchase_price }}, to be paid as follows:</p>
<ul>
  <li>Earnest Money: ${{ earnest_money }}</li>
  <li>Down Payment: ${{ down_payment }}</li>
  <li>Loan Amount: ${{ loan_amount }}</li>
</ul>

<h3>Contingencies</h3>
<p>This agreement is contingent upon:</p>
<ul>
  <li>Satisfactory home inspection</li>
  <li>Mortgage approval</li>
  <li>Clear title</li>
</ul>

<h3>Closing Information</h3>
<p>Closing Date: {{closing_date}}</p>
<p>Closing Location: {{closing_location}}</p>

<p><strong>Buyer Signature:</strong> _______________________</p>
<p><strong>Seller Signature:</strong> _______________________</p>
<p><strong>Date:</strong> {{agreement_date}}</p>`,
          variables: [
            'property_address',
            'buyer_name',
            'seller_name',
            'purchase_price',
            'closing_date',
            'earnest_money',
            'down_payment',
            'loan_amount',
            'closing_location',
            'agreement_date',
          ],
        },
        {
          name: 'Offer Letter Template',
          type: 'offer_letter',
          content: `<h1>OFFER LETTER</h1>
<p><strong>Date:</strong> {{offer_date}}</p>
<p><strong>To:</strong> {{seller_name}}</p>
<p><strong>From:</strong> {{buyer_name}}</p>
<p><strong>Property:</strong> {{property_address}}</p>

<h2>Offer Details</h2>
<p>We are pleased to submit this offer for the purchase of your property located at {{property_address}}.</p>

<h3>Financial Terms</h3>
<p><strong>Offered Price:</strong> ${{ offer_price }}</p>
<p><strong>Earnest Money:</strong> ${{ earnest_money }}</p>
<p><strong>Down Payment:</strong> ${{ down_payment }}</p>
<p><strong>Financing:</strong> {{financing_type}}</p>

<h3>Timeline</h3>
<p><strong>Closing Date:</strong> {{closing_date}}</p>
<p><strong>Inspection Period:</strong> {{inspection_period}} days</p>
<p><strong>Financing Contingency:</strong> {{financing_contingency}} days</p>

<h3>Additional Terms</h3>
<p>{{additional_terms}}</p>

<p>This offer is valid until {{offer_expiration}}.</p>

<p>Sincerely,</p>
<p>{{buyer_name}}</p>
<p>{{buyer_contact}}</p>`,
          variables: [
            'offer_date',
            'seller_name',
            'buyer_name',
            'property_address',
            'offer_price',
            'earnest_money',
            'down_payment',
            'financing_type',
            'closing_date',
            'inspection_period',
            'financing_contingency',
            'additional_terms',
            'offer_expiration',
            'buyer_contact',
          ],
        },
      ],
      {
        onConflict: 'name',
        ignoreDuplicates: true,
      }
    );

    if (insertError) {
      logger.error('Error inserting default templates:', insertError);
    }

    logger.info('Document templates initialized successfully');
  } catch (error) {
    logger.error('Error initializing document templates:', error);
    throw error;
  }
}

export default initializeStorage;
