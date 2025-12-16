import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Package, 
  Building2, 
  MapPin, 
  CheckCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { 
  getSearchSuggestions, 
  type PackageSuggestion, 
  type ProviderSuggestion,
  type SearchSuggestionsResponse 
} from '@/api/packages';

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  onClose?: () => void;
}

const SearchAutocomplete = ({ 
  placeholder = 'Search treatments or clinics...', 
  className = '',
  onClose 
}: SearchAutocompleteProps) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchSuggestionsResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await getSearchSuggestions(query);
        setResults(data);
        setIsOpen(data.total > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Get all items for keyboard navigation
  const getAllItems = useCallback(() => {
    if (!results) return [];
    const items: Array<{ type: 'package' | 'provider'; item: PackageSuggestion | ProviderSuggestion }> = [];
    results.packages.forEach((pkg) => items.push({ type: 'package', item: pkg }));
    results.providers.forEach((prov) => items.push({ type: 'provider', item: prov }));
    return items;
  }, [results]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = getAllItems();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleSelect(items[selectedIndex].type, items[selectedIndex].item);
        } else if (query.length >= 2) {
          // Navigate to packages page with search query
          navigate(`/packages?search=${encodeURIComponent(query)}`);
          handleClose();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };
  
  // Handle item selection
  const handleSelect = (type: 'package' | 'provider', item: PackageSuggestion | ProviderSuggestion) => {
    if (type === 'package') {
      navigate(`/packages/${item.id}`);
    } else {
      navigate(`/providers/${item.id}`);
    }
    handleClose();
  };
  
  // Close and reset
  const handleClose = () => {
    setQuery('');
    setIsOpen(false);
    setResults(null);
    onClose?.();
  };
  
  // Clear input
  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setResults(null);
    inputRef.current?.focus();
  };
  
  const allItems = getAllItems();
  
  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results && results.total > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-gray-900 placeholder-gray-400"
        />
        {isLoading ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        ) : query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Dropdown Results */}
      {isOpen && results && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
        >
          {/* Packages Section */}
          {results.packages.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Packages
                </span>
              </div>
              {results.packages.map((pkg, index) => (
                <button
                  key={`package-${pkg.id}`}
                  onClick={() => handleSelect('package', pkg)}
                  className={`w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedIndex === index ? 'bg-primary-50' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {pkg.image ? (
                      <img 
                        src={pkg.image} 
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{pkg.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{pkg.providerName}</span>
                      <span>•</span>
                      <MapPin className="w-3 h-3" />
                      <span>{pkg.providerCity}</span>
                      {pkg.providerIsVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-primary-600">
                      ${parseFloat(pkg.price).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{pkg.categoryDisplay}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Providers Section */}
          {results.providers.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 border-t">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Clinics
                </span>
              </div>
              {results.providers.map((prov, index) => {
                const itemIndex = results.packages.length + index;
                return (
                  <button
                    key={`provider-${prov.id}`}
                    onClick={() => handleSelect('provider', prov)}
                    className={`w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left ${
                      selectedIndex === itemIndex ? 'bg-primary-50' : ''
                    }`}
                  >
                    {/* Logo */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {prov.logoUrl ? (
                        <img 
                          src={prov.logoUrl} 
                          alt={prov.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">{prov.name}</p>
                        {prov.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{prov.city}</span>
                        <span>•</span>
                        <span>{prov.packageCount} packages</span>
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
          
          {/* View All Results */}
          {results.total > 0 && (
            <button
              onClick={() => {
                navigate(`/packages?search=${encodeURIComponent(query)}`);
                handleClose();
              }}
              className="w-full px-4 py-3 bg-gray-50 text-center text-sm font-medium text-primary-600 hover:bg-gray-100 transition-colors border-t border-gray-200 flex items-center justify-center gap-2"
            >
              View all results for "{query}"
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          
          {/* No Results */}
          {results.total === 0 && query.length >= 2 && (
            <div className="px-4 py-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
