
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Upload, File, Search, Filter, FileText, Download, Share2, Eye } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import Breadcrumb from '@/components/navigation/Breadcrumb';
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
        return <File className="h-8 w-8 text-brand-taupe" />;
    }
  };

  return (
    <>
      <AppSidebar />
      <SidebarInset className="flex-1">
        <AppHeader />
        
        <main className="p-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <Breadcrumb />
          </div>

          {/* Premium Header Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
                  Documents
                </h1>
                <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
                  Organize and manage your transaction documents with elegance
                </p>
              </div>
              <Button 
                className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-4 rounded-xl shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 gap-3"
                size="lg"
              >
                <Upload className="h-5 w-5" />
                UPLOAD DOCUMENT
              </Button>
            </div>
            <div className="w-24 h-px bg-brand-taupe"></div>
          </div>

          {/* Enhanced Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-taupe" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl"
              />
            </div>
            
            <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
              <SelectTrigger className="w-full sm:w-64 bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
                <SelectItem value="all">All Transactions</SelectItem>
                {transactions?.map((transaction) => (
                  <SelectItem key={transaction.id} value={transaction.id}>
                    {transaction.property_address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
                <SelectItem value="all">All Categories</SelectItem>
                {documentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Documents Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-brand-heading tracking-wide text-brand-charcoal uppercase">
                Document Library ({filteredDocuments?.length || 0} documents)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="text-brand-charcoal/60 font-brand-body">Loading documents...</div>
                </div>
              ) : filteredDocuments && filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDocuments.map((document) => (
                    <Card key={document.id} className="hover:shadow-brand-elevation transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="w-16 h-16 bg-brand-taupe/10 rounded-2xl flex items-center justify-center">
                            {getFileIcon(document.file_name)}
                          </div>
                          
                          <div className="space-y-2 w-full">
                            <h4 className="font-brand-heading font-medium text-sm text-brand-charcoal tracking-wide truncate" title={document.file_name}>
                              {document.file_name}
                            </h4>
                            <p className="text-xs font-brand-body text-brand-charcoal/60 truncate">
                              {document.transactions?.property_address}
                            </p>
                            <p className="text-xs font-brand-body text-brand-charcoal/60">
                              {format(new Date(document.created_at), 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs font-brand-body text-brand-charcoal/60">
                              by {document.profiles ? `${document.profiles.first_name} ${document.profiles.last_name}` : 'Unknown'}
                            </p>
                          </div>

                          {/* Document Status */}
                          <div className="w-full">
                            <span className={`px-3 py-1 rounded-full text-xs font-brand-heading tracking-wide ${
                              document.e_sign_status === 'signed' ? 'bg-green-100 text-green-800' :
                              document.e_sign_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {(document.e_sign_status || 'uploaded').toUpperCase()}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 w-full">
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-brand-taupe/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                      <FolderOpen className="h-12 w-12 text-brand-taupe" />
                    </div>
                    <h3 className="text-2xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-4">
                      No Documents Found
                    </h3>
                    <p className="text-lg font-brand-body text-brand-charcoal/60 mb-8">
                      Upload your first document to begin organizing with excellence
                    </p>
                    <Button className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-3 rounded-xl">
                      <Upload className="h-4 w-4 mr-2" />
                      UPLOAD DOCUMENT
                    </Button>
                    <div className="w-16 h-px bg-brand-taupe mx-auto mt-8"></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </>
  );
};

export default Documents;
