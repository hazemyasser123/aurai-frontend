import React from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
}

export const ProductsFilters: React.FC<Props> = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full">
      <div className="w-full lg:flex-1 relative flex items-center bg-bg-sidebar border border-border rounded-lg h-12 px-4 gap-3 min-w-0">
        <FiSearch className="w-5 h-5 text-fg-muted shrink-0" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, description.."
          className="flex-1 min-w-0 bg-transparent outline-none font-sans font-normal text-sm text-fg-strong placeholder:text-fg-muted"
        />
      </div>

      <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
        <div className="relative h-12 w-full sm:w-[160px] sm:shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="appearance-none w-full h-full bg-bg-card border border-border rounded-lg pl-3 pr-9 font-sans text-sm outline-none cursor-pointer text-transparent"
          >
            <option value="all">All Types</option>
            <option value="Product">Product</option>
            <option value="Service">Service</option>
            <option value="Solution">Solution</option>
          </select>
          <span className="absolute inset-y-0 left-3 right-9 flex items-center gap-1.5 font-sans text-xs pointer-events-none truncate">
            <span className="font-bold text-fg-muted shrink-0">Types:</span>
            <span className="font-medium text-fg-strong truncate">{typeFilter === 'all' ? 'All Types' : typeFilter}</span>
          </span>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none" />
        </div>

        <div className="relative h-12 w-full sm:w-[160px] sm:shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none w-full h-full bg-bg-card border border-border rounded-lg pl-3 pr-9 font-sans text-sm outline-none cursor-pointer text-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Ready">Ready</option>
            <option value="Processing">Processing</option>
            <option value="Failed">Failed</option>
          </select>
          <span className="absolute inset-y-0 left-3 right-9 flex items-center gap-1.5 font-sans text-xs pointer-events-none truncate">
            <span className="font-bold text-fg-muted shrink-0">Status:</span>
            <span className="font-medium text-fg-strong truncate">{statusFilter === 'all' ? 'All Statuses' : statusFilter}</span>
          </span>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
