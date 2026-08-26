import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { useProducts } from '@/features/products/hooks/useProducts';
import { ProductsHeader } from '@/features/products/components/ProductsHeader';
import { ProductsStatsGrid } from '@/features/products/components/ProductsStatsGrid';
import { ProductsFilters } from '@/features/products/components/ProductsFilters';
import { ProductsEmptyState } from '@/features/products/components/ProductsEmptyState';
import { Card } from '@/shared/components/ui';
import { ProductCard } from '@/features/products/components/ProductCard';
import type { Product } from '@/features/products/types/productTypes';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: products, isLoading, isError } = useProducts();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleRegister = () => navigate('/products/register');

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      const matchesType = typeFilter === 'all' || (p.type || '').toLowerCase() === typeFilter.toLowerCase();
      const matchesStatus = statusFilter === 'all' || (p.status || '').toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [products, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const list = products || [];
    const total = list.length;
    const ready = list.filter((p) => p.status?.toLowerCase() === 'ready').length;
    const processing = list.filter((p) => p.status?.toLowerCase() === 'processing' || p.status?.toLowerCase() === 'draft').length;
    const failed = list.filter((p) => p.status?.toLowerCase() === 'failed').length;
    return { total, ready, processing, failed };
  }, [products]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[92px] bg-bg-sidebar border border-border rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[255px] bg-bg-sidebar border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      );
    }
    if (isError) {
      return (
        <Card variant="elevated" className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="font-sans font-medium text-sm text-danger">Failed to load products</p>
        </Card>
      );
    }
    if (filtered.length === 0) {
      return <ProductsEmptyState onRegister={handleRegister} />;
    }
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((p: Product) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full pb-8 sm:pb-12 max-w-[1120px] mx-auto flex flex-col gap-6 sm:gap-8">
      <ProductsHeader onRegister={handleRegister} />
      <ProductsStatsGrid total={stats.total} ready={stats.ready} processing={stats.processing} failed={stats.failed} />
      <ProductsFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      {renderContent()}
    </div>
  );
};

export default WithNavbar(ProductsPage);
