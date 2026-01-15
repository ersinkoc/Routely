import { useSearch } from '@oxog/routely-plugin-search';
import { useState, useEffect } from 'react';

// Define the shape of our search parameters
interface ProductSearchParams {
  page?: string;
  sort?: 'name' | 'price' | 'rating';
  filter?: string;
}

export default function Products() {
  const { search, setSearch } = useSearch<ProductSearchParams>();
  const [products] = useState([
    { id: 1, name: 'Laptop', price: 999, category: 'electronics' },
    { id: 2, name: 'Mouse', price: 29, category: 'electronics' },
    { id: 3, name: 'Desk', price: 499, category: 'furniture' },
    { id: 4, name: 'Chair', price: 199, category: 'furniture' },
    { id: 5, name: 'Book', price: 19, category: 'books' },
    { id: 6, name: 'Lamp', price: 49, category: 'furniture' },
  ]);

  const page = parseInt(search.page || '1');
  const sort = search.sort || 'name';
  const filter = search.filter || '';

  // Filter products
  const filteredProducts = products.filter((p) =>
    !filter || p.category === filter
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'price' || sort === 'rating') {
      return a[sort] - b[sort];
    }
    return a.name.localeCompare(b.name);
  });

  // Paginate (2 per page for demo)
  const pageSize = 2;
  const startIndex = (page - 1) * pageSize;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(sortedProducts.length / pageSize);

  const updateParam = (key: keyof ProductSearchParams, value: string) => {
    setSearch({ ...search, [key]: value });
  };

  return (
    <div>
      <h2>Products</h2>
      <p>This page demonstrates type-safe search parameters using the <code>useSearch()</code> hook.</p>

      {/* Controls */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Filters</h3>

        <div style={{ marginBottom: '10px' }}>
          <label>Sort by:</label>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Category:</label>
          <select
            value={filter}
            onChange={(e) => updateParam('filter', e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            <option value="">All</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="books">Books</option>
          </select>
        </div>

        <div>
          <label>Page:</label>
          <span style={{ marginLeft: '10px' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => updateParam('page', String(pageNum))}
                style={{
                  margin: '0 5px',
                  padding: '5px 10px',
                  background: pageNum === page ? '#007bff' : '#fff',
                  color: pageNum === page ? '#fff' : '#000',
                  border: '1px solid #ccc',
                  cursor: 'pointer',
                }}
              >
                {pageNum}
              </button>
            ))}
          </span>
        </div>
      </div>

      {/* Current URL display */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#e3f2fd', borderRadius: '4px' }}>
        <strong>Current search params:</strong> {JSON.stringify(search)}
      </div>

      {/* Products list */}
      <div>
        {paginatedProducts.map((product) => (
          <div key={product.id} style={{ padding: '15px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h4>{product.name}</h4>
            <p>Price: ${product.price}</p>
            <p>Category: {product.category}</p>
          </div>
        ))}
      </div>

      {/* Code example */}
      <div style={{ marginTop: '30px', padding: '15px', background: '#fff3e0', borderRadius: '4px' }}>
        <h4>Code Example:</h4>
        <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
{`// Define search params interface
interface ProductSearchParams {
  page?: string;
  sort?: 'name' | 'price' | 'rating';
  filter?: string;
}

// Use the hook with type safety
const { search, setSearch } = useSearch<ProductSearchParams>();

// Access parameters with autocomplete
console.log(search.page);  // string | undefined
console.log(search.sort);  // 'name' | 'price' | 'rating' | undefined

// Update parameters
setSearch({ ...search, page: '2' });

// Update using previous state
setSearch(prev => ({
  ...prev,
  page: String(Number(prev.page) + 1)
}));`}
        </pre>
      </div>
    </div>
  );
}
