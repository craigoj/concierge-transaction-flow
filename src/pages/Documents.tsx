
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Upload, File } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const Documents = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AppHeader />
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <FolderOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Documents</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Management</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <File className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Document Management Coming Soon</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload, organize, and share transaction documents with clients and agents. 
              Features will include e-signature integration and version control.
            </p>
            <Button disabled>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documents;
