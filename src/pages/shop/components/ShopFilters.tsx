
import { shopCategories } from '../../../mocks/shopProducts';

interface ShopFiltersProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalCount: number;
}

export default function ShopFilters({
  activeCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  totalCount,
}: ShopFiltersProps) {
  return (
    <div className="sticky top-24 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {shopCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-gray-900 text-yellow-400 shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${cat.icon} text-sm`} />
                </div>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort + Count */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className="text-sm text-gray-400 whitespace-nowrap">
              {totalCount} product{totalCount !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-sort-desc text-gray-400 text-sm" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
              >
                <option value="default">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
