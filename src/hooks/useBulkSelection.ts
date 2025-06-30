
import { useState, useCallback } from 'react';

export const useBulkSelection = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const toggleAll = useCallback((allIds: string[]) => {
    setSelectedIds(prev => 
      prev.length === allIds.length ? [] : allIds
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  const isAllSelected = useCallback((allIds: string[]) => {
    return allIds.length > 0 && selectedIds.length === allIds.length;
  }, [selectedIds]);

  return {
    selectedIds,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
  };
};
