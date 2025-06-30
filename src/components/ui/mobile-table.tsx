import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface MobileTableColumn<T = any> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  primary?: boolean;
  secondary?: boolean;
}

interface MobileTableProps<T = any> {
  data: T[];
  columns: MobileTableColumn<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function MobileTable<T = any>({ 
  data, 
  columns, 
  onRowClick, 
  loading = false,
  emptyMessage = "No data available"
}: MobileTableProps<T>) {
  const primaryColumn = columns.find(col => col.primary);
  const secondaryColumns = columns.filter(col => col.secondary);
  const otherColumns = columns.filter(col => !col.primary && !col.secondary);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <Card 
          key={index}
          className={`transition-all duration-200 ${
            onRowClick 
              ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' 
              : ''
          }`}
          onClick={() => onRowClick?.(item)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 space-y-2">
                {/* Primary field - larger, bold */}
                {primaryColumn && (
                  <div className="font-semibold text-base leading-tight">
                    {primaryColumn.render 
                      ? primaryColumn.render(item[primaryColumn.key], item)
                      : String(item[primaryColumn.key] || '')
                    }
                  </div>
                )}

                {/* Secondary fields - smaller, muted */}
                {secondaryColumns.length > 0 && (
                  <div className="space-y-1">
                    {secondaryColumns.map((col) => (
                      <div key={String(col.key)} className="text-sm text-muted-foreground">
                        {col.render 
                          ? col.render(item[col.key], item)
                          : String(item[col.key] || '')
                        }
                      </div>
                    ))}
                  </div>
                )}

                {/* Other fields - compact list */}
                {otherColumns.length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {otherColumns.map((col) => {
                      const value = col.render 
                        ? col.render(item[col.key], item)
                        : String(item[col.key] || '');
                      
                      if (!value) return null;
                      
                      return (
                        <div key={String(col.key)} className="flex items-center gap-1">
                          <span className="font-medium">{col.label}:</span>
                          <span>{value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Arrow indicator for clickable rows */}
              {onRowClick && (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
