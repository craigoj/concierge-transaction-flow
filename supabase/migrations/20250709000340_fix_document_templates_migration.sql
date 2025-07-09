-- Create document templates table
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

-- Add template_id column to documents table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'template_id'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN template_id UUID REFERENCES public.document_templates(id) ON DELETE SET NULL;
    END IF;
END$$;

-- Add url column to documents table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'url'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN url TEXT;
    END IF;
END$$;

-- Add generation metadata to documents table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'generation_metadata'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN generation_metadata JSONB DEFAULT '{}';
    END IF;
END$$;

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    10485760, -- 10MB
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for document_templates table
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view active templates" ON public.document_templates;
DROP POLICY IF EXISTS "Authenticated users can create templates" ON public.document_templates;
DROP POLICY IF EXISTS "Users can update templates they created" ON public.document_templates;
DROP POLICY IF EXISTS "Users can delete templates they created" ON public.document_templates;

-- Create new policies
CREATE POLICY "Users can view active templates"
ON public.document_templates FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Authenticated users can create templates"
ON public.document_templates FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update templates they created"
ON public.document_templates FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can delete templates they created"
ON public.document_templates FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON public.document_templates(type);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON public.document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_document_templates_created_by ON public.document_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON public.documents(template_id);

-- Create updated_at trigger for document_templates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_document_templates_updated_at ON public.document_templates;
CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON public.document_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.document_templates (name, type, content, variables) VALUES 
(
    'Purchase Agreement Template',
    'purchase_agreement',
    '<h1>PURCHASE AGREEMENT</h1>
    <p><strong>Property Address:</strong> {{property_address}}</p>
    <p><strong>Buyer:</strong> {{buyer_name}}</p>
    <p><strong>Seller:</strong> {{seller_name}}</p>
    <p><strong>Purchase Price:</strong> ${{purchase_price}}</p>
    <p><strong>Closing Date:</strong> {{closing_date}}</p>
    
    <h2>Terms and Conditions</h2>
    <p>This Purchase Agreement is made between the Buyer and Seller for the purchase of the above-mentioned property.</p>
    
    <h3>Purchase Price</h3>
    <p>The total purchase price for the property is ${{purchase_price}}, to be paid as follows:</p>
    <ul>
        <li>Earnest Money: ${{earnest_money}}</li>
        <li>Down Payment: ${{down_payment}}</li>
        <li>Loan Amount: ${{loan_amount}}</li>
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
    <p><strong>Date:</strong> {{agreement_date}}</p>',
    ARRAY['property_address', 'buyer_name', 'seller_name', 'purchase_price', 'closing_date', 'earnest_money', 'down_payment', 'loan_amount', 'closing_location', 'agreement_date']
) ON CONFLICT DO NOTHING;

-- Comment explaining the setup
COMMENT ON TABLE public.document_templates IS 'Stores document templates for generating PDFs from form data';
COMMENT ON COLUMN public.document_templates.variables IS 'Array of variable names that can be substituted in the template content';
COMMENT ON COLUMN public.documents.template_id IS 'Reference to the template used to generate this document';
COMMENT ON COLUMN public.documents.url IS 'Storage URL for the document file';
COMMENT ON COLUMN public.documents.generation_metadata IS 'Additional metadata about document generation process';