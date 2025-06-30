
import { supabase } from '@/integrations/supabase/client';

export interface DuplicateMatch {
  transaction_id: string;
  property_address: string;
  city: string;
  state: string;
  zip_code: string;
  similarity_score: number;
  status: string;
}

export interface ClientDuplicateMatch {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  similarity_score: number;
  transaction_id: string;
}

export class DuplicateDetectionService {
  static async detectPropertyDuplicates(
    propertyAddress: string,
    city: string,
    state: string,
    zipCode: string,
    excludeTransactionId?: string
  ): Promise<DuplicateMatch[]> {
    const { data, error } = await supabase.rpc('detect_property_duplicates', {
      p_property_address: propertyAddress,
      p_city: city,
      p_state: state,
      p_zip_code: zipCode,
      p_exclude_transaction_id: excludeTransactionId || null
    });

    if (error) {
      console.error('Error detecting property duplicates:', error);
      return [];
    }

    return data || [];
  }

  static async detectClientDuplicates(
    fullName: string,
    email?: string,
    phone?: string
  ): Promise<ClientDuplicateMatch[]> {
    let query = supabase
      .from('clients')
      .select('id, full_name, email, phone, transaction_id');

    // Build dynamic query based on available data
    const conditions = [];
    
    if (email) {
      conditions.push(`email.ilike.%${email}%`);
    }
    
    if (phone) {
      // Clean phone number for comparison
      const cleanPhone = phone.replace(/\D/g, '');
      conditions.push(`phone.ilike.%${cleanPhone}%`);
    }

    // Add name similarity check
    if (fullName) {
      conditions.push(`full_name.ilike.%${fullName}%`);
    }

    if (conditions.length === 0) {
      return [];
    }

    // For now, use a simple approach - in a real implementation,
    // you'd want more sophisticated fuzzy matching
    const { data, error } = await query.or(conditions.join(','));

    if (error) {
      console.error('Error detecting client duplicates:', error);
      return [];
    }

    // Calculate similarity scores (simplified)
    return (data || []).map(client => ({
      ...client,
      similarity_score: this.calculateClientSimilarity(
        { full_name: fullName, email, phone },
        client
      )
    })).filter(client => client.similarity_score > 0.6);
  }

  private static calculateClientSimilarity(
    input: { full_name: string; email?: string; phone?: string },
    existing: any
  ): number {
    let score = 0;
    let factors = 0;

    // Name similarity (most important)
    if (input.full_name && existing.full_name) {
      const nameScore = this.stringSimilarity(
        input.full_name.toLowerCase(),
        existing.full_name.toLowerCase()
      );
      score += nameScore * 0.5;
      factors += 0.5;
    }

    // Email match (exact)
    if (input.email && existing.email) {
      score += input.email.toLowerCase() === existing.email.toLowerCase() ? 0.3 : 0;
      factors += 0.3;
    }

    // Phone match (cleaned)
    if (input.phone && existing.phone) {
      const inputPhone = input.phone.replace(/\D/g, '');
      const existingPhone = existing.phone.replace(/\D/g, '');
      score += inputPhone === existingPhone ? 0.2 : 0;
      factors += 0.2;
    }

    return factors > 0 ? score / factors : 0;
  }

  private static stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  static async logDuplicateDetection(
    entityType: string,
    entityId: string,
    potentialDuplicateId: string,
    similarityScore: number,
    detectionMethod: string,
    metadata?: any
  ) {
    const { error } = await supabase
      .from('duplicate_detection_logs')
      .insert([{
        entity_type: entityType,
        entity_id: entityId,
        potential_duplicate_id: potentialDuplicateId,
        similarity_score: similarityScore,
        detection_method: detectionMethod,
        metadata: metadata || {}
      }]);

    if (error) {
      console.error('Error logging duplicate detection:', error);
    }
  }
}
