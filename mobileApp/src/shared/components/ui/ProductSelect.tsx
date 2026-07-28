import { useEffect, useMemo, useState } from 'react';

import {
  useGetProductByIdQuery,
  useGetProductsQuery,
} from '@/src/features/products/api/productsApi';
import type { Product } from '@/src/features/products/types';
import {
  SearchableSelect,
  type SearchableOption,
} from '@/src/shared/components/ui/SearchableSelect';

type ProductSelectProps = {
  label?: string;
  value?: string | null;
  onChange: (productId: string, product?: Product) => void;
  error?: string;
};

function toOption(product: Product): SearchableOption {
  const sku = product.sku ? `SKU ${product.sku}` : null;
  return {
    id: product.id,
    label: product.name,
    subtitle: [sku, `ID ${product.id.slice(0, 8)}…`].filter(Boolean).join(' · '),
    meta: `Sale ${product.salePrice} · Buy ${product.purchasePrice}`,
  };
}

export function ProductSelect({
  label = 'Product',
  value,
  onChange,
  error,
}: ProductSelectProps) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isFetching } = useGetProductsQuery({
    page: 1,
    limit: 40,
    search: debounced || undefined,
    status: 'ACTIVE',
  });

  const { data: selectedProduct } = useGetProductByIdQuery(value!, {
    skip: !value,
  });

  const products = useMemo(() => {
    const map = new Map<string, Product>();
    for (const item of data?.items ?? []) map.set(item.id, item);
    if (selectedProduct) map.set(selectedProduct.id, selectedProduct);
    return [...map.values()];
  }, [data?.items, selectedProduct]);

  const options = useMemo(() => products.map(toOption), [products]);

  return (
    <SearchableSelect
      label={label}
      value={value}
      options={options}
      error={error}
      loading={isFetching}
      placeholder="Search product by name, SKU, or ID"
      searchPlaceholder="Name, SKU, barcode, or ID"
      emptyLabel="No products match"
      onSearchChange={setSearch}
      onChange={(id) => {
        const product = products.find((p) => p.id === id);
        onChange(id, product);
      }}
    />
  );
}
