
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Filter } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AppHeader />
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <SearchIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Search</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Global Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions, clients, agents, documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button disabled>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button disabled>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-12">
            <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Universal Search Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Search across all your transactions, clients, agents, documents, and communications 
              from one powerful interface with advanced filtering and sorting options.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Search;
