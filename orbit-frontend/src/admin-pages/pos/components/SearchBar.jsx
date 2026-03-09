import SearchResults from "../modals/SearchResults";
import { Search,Scan,Package,ShoppingCart } from "lucide-react"
const SearchBar = ({
  searchInputRef,
  skuSearch,
  handleSkuInputChange,
  handleSkuKeyPress,
  searchData,
  isSearching,
  searchResults,
  handleAddToCart,
  setSelectedProductIndex,
  selectedProductIndex,
  formatCurrency,
  showSearchResults,
  searchResultsRef
}) => {
  return (
    <div className="mt-4 relative" ref={searchResultsRef}>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="text-blue-200" size={20} />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={skuSearch}
            onChange={handleSkuInputChange}
            onKeyDown={handleSkuKeyPress}
            className="w-full pl-12 pr-24 py-[0.5rem] bg-white/10 border-3 border-green-300 rounded-sm text-white placeholder-blue-200 focus:outline-none focus:ring-4 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter SKU, product name or scan barcode (Press Enter to add)"
            autoFocus
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <kbd className="px-2 py-1 text-xs bg-white/20 rounded-sm text-blue-100">
              Ctrl+B
            </kbd>
            <span className="text-blue-200">|</span>
            <Scan size={16} className="text-blue-200 rounded-sm" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="hidden lg:flex items-center gap-2 text-sm">
          <div className="bg-white/10 px-3 py-1.5 rounded flex items-center gap-1">
            <Package size={14} />
            <span>Products: {searchData?.total || 0}</span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded flex items-center gap-1">
            <ShoppingCart size={14} />
            <span>In Stock: {searchData?.inStock || 0}</span>
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showSearchResults && (
        <SearchResults
          isSearching={isSearching}
          searchResults={searchResults}
          handleAddToCart={handleAddToCart}
          setSelectedProductIndex={setSelectedProductIndex}
          selectedProductIndex={selectedProductIndex}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default SearchBar;
