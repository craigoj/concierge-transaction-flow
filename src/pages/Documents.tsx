
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Upload, File, Search, Filter, FileText, Download, Share2, Eye } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', selectedTransaction, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select(`
          *,
          transactions!documents_transaction_id_fkey(property_address),
          profiles!documents_uploaded_by_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (selectedTransaction !== 'all') {
        query = query.eq('transaction_id', selectedTransaction);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Fetch transactions for filter
  const { data: transactions } = useQuery({
    queryKey: ['transactions-for-docs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, property_address')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.transactions?.property_address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const documentCategories = [
    'Purchase Agreement',
    'Disclosures',
    'Inspection Reports',
    'Appraisal',
    'Loan Documents',
    'Title Documents',
    'Closing Documents',
    'Other'
  ];

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="h-8 w-8 text-green-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AppHeader />
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <FolderOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Documents</h1>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button className="bg-primary hover:bg-primary/90">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
          
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                {transactions?.map((transaction) => (
                  <SelectItem key={transaction.id} value={transaction.id}>
                    {transaction.property_address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {documentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Documents Grid */}
        <Card>
          <CardHeader>
            <CardTitle>
              Document Library ({filteredDocuments?.length || 0} documents)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading documents...</div>
            ) : filteredDocuments && filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((document) => (
                  <Card key={document.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        {getFileIcon(document.file_name)}
                        
                        <div className="space-y-1 w-full">
                          <h4 className="font-medium text-sm truncate" title={document.file_name}>
                            {document.file_name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {document.transactions?.property_address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(document.created_at), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {document.profiles ? `${document.profiles.first_name} ${document.profiles.last_name}` : 'Unknown'}
                          </p>
                        </div>

                        {/* Document Status */}
                        <div className="w-full">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            document.e_sign_status === 'signed' ? 'bg-green-100 text-green-800' :
                            document.e_sign_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {document.e_sign_status || 'Uploaded'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1 w-full">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Documents Found</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your first document to get started with document management.
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documents;
