import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  label?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

export default function CustomDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...', 
  label,
  className = '',
  error = false,
  disabled = false
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate menu max height when opening (always position below)
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const maxMenuHeight = 180;
      
      // Always position below - just constrain height based on available space
      // Leave 10px margin from viewport bottom, minimum 100px height
      const availableSpaceBelow = Math.max(spaceBelow - 10, 100);
      setMenuMaxHeight(Math.min(maxMenuHeight, availableSpaceBelow));
    } else {
      setMenuMaxHeight(null);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Use a small delay to avoid closing immediately when opening
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div ref={dropdownRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center justify-between gap-2 px-4 py-2 border border-primary-500 dark:border-primary-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-w-[140px] w-full ${
            error ? 'border-red-500' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 text-left">
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && menuMaxHeight !== null && (
          <div 
            ref={menuRef}
            className="custom-dropdown-menu absolute bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden hide-scrollbar z-[100]" 
            style={{ 
              top: '100%',
              left: 0,
              right: 0,
              width: '100%',
              marginTop: '4px',
              maxHeight: `${menuMaxHeight}px`, 
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {options.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                No options available
              </div>
            ) : (
              options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className={` w-full px-3 py-2 text-sm text-left transition-colors duration-150 whitespace-nowrap overflow-hidden text-ellipsis ${
                    index === 0 ? 'rounded-t-lg' : ''
                  } ${
                    index === options.length - 1 ? 'rounded-b-lg' : ''
                  } ${
                    option.value === value
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

