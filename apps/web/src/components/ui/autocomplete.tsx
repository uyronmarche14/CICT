import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { cn } from '@/lib/utils';
import { Input } from './input';

type AutoCompleteOption<T = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type AutoCompleteProps<T = string> = {
  /** Array of options to display in the dropdown */
  options: AutoCompleteOption<T>[];
  /** Currently selected value */
  value?: T;
  /** Callback when selection changes */
  onValueChange?: (value: T | undefined) => void;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Message to show when no options match the search */
  emptyMessage?: string;
  /** Placeholder text while searching */
  searchPlaceholder?: string;
  /** Debounce delay for search in milliseconds */
  debounceMs?: number;
  /** Maximum height of the dropdown */
  maxHeight?: string;
  /** Custom filter function for options */
  filterFunction?: (
    option: AutoCompleteOption<T>,
    searchValue: string
  ) => boolean;
  /** Custom render function for options */
  renderOption?: (option: AutoCompleteOption<T>) => React.ReactNode;
  /** Whether to show a clear button when value is selected */
  allowClear?: boolean;
};

/**
 * AutoComplete component provides a searchable dropdown interface.
 *
 * @example
 * // Basic usage with string values
 * const options = [
 *   { value: 'apple', label: 'Apple' },
 *   { value: 'banana', label: 'Banana' },
 *   { value: 'cherry', label: 'Cherry' }
 * ];
 *
 * <AutoComplete
 *   options={options}
 *   value={selectedFruit}
 *   onValueChange={setSelectedFruit}
 *   placeholder="Select a fruit..."
 * />
 *
 * @example
 * // With custom object values
 * const userOptions = [
 *   { value: { id: 1, name: 'John' }, label: 'John Doe' },
 *   { value: { id: 2, name: 'Jane' }, label: 'Jane Smith' }
 * ];
 *
 * <AutoComplete
 *   options={userOptions}
 *   value={selectedUser}
 *   onValueChange={setSelectedUser}
 *   renderOption={(option) => (
 *     <div>
 *       <strong>{option.value.name}</strong>
 *       <span className="text-muted-foreground"> (ID: {option.value.id})</span>
 *     </div>
 *   )}
 * />
 */
function AutoComplete<T = string>({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option...',
  disabled = false,
  className,
  emptyMessage = 'No options found',
  searchPlaceholder = 'Search...',
  debounceMs = 300,
  maxHeight = '300px',
  filterFunction,
  renderOption,
  allowClear = true,
}: AutoCompleteProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, debounceMs);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [dropdownPosition, setDropdownPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
    placement: 'bottom' | 'top';
  }>({ top: 0, left: 0, width: 0, placement: 'bottom' });

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInteractingRef = React.useRef(false);
  const justSelectedRef = React.useRef(false);

  // Get the display value for the selected option
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption?.label || '';

  // Default filter function
  const defaultFilterFunction = React.useCallback(
    (option: AutoCompleteOption<T>, search: string) => {
      return option.label.toLowerCase().includes(search.toLowerCase());
    },
    []
  );

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!debouncedSearchValue) return options;
    const filter = filterFunction || defaultFilterFunction;
    return options.filter(option => filter(option, debouncedSearchValue));
  }, [options, debouncedSearchValue, filterFunction, defaultFilterFunction]);

  // Calculate dropdown position
  const updateDropdownPosition = React.useCallback(() => {
    if (inputRef.current && containerRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Estimate dropdown height (you can adjust this based on your needs)
      const estimatedDropdownHeight = Math.min(
        filteredOptions.length * 40 + 16, // approximate item height + padding
        parseInt(maxHeight) || 300
      );

      const spaceBelow = viewportHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;

      // Determine if we should place dropdown above or below
      // Add gap to the calculation to ensure adequate space including the gap
      const gap = 8;
      const shouldPlaceAbove =
        spaceBelow < estimatedDropdownHeight + gap &&
        spaceAbove > estimatedDropdownHeight + gap;

      const placement = shouldPlaceAbove ? 'top' : 'bottom';
      const top = shouldPlaceAbove
        ? inputRect.top + window.scrollY - estimatedDropdownHeight - gap
        : inputRect.bottom + window.scrollY + gap;

      setDropdownPosition({
        top,
        left: inputRect.left + window.scrollX,
        width: containerRect.width,
        placement,
      });
    }
  }, [filteredOptions.length, maxHeight]);

  // Update position when opening or window resizes
  React.useEffect(() => {
    if (open) {
      updateDropdownPosition();

      const handleResize = () => updateDropdownPosition();
      const handleScroll = () => updateDropdownPosition();

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [open, updateDropdownPosition]);

  // Reset highlighted index when filtered options change
  React.useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  // Handle option selection
  const handleSelectOption = React.useCallback(
    (option: AutoCompleteOption<T>) => {
      if (option.disabled) return;

      justSelectedRef.current = true;
      onValueChange?.(option.value);
      setSearchValue('');
      setOpen(false);
      setHighlightedIndex(-1);

      // Focus input but prevent immediate reopening
      setTimeout(() => {
        inputRef.current?.focus();
        // Reset the flag after a short delay to allow normal interaction
        setTimeout(() => {
          justSelectedRef.current = false;
        }, 150);
      }, 0);
    },
    [onValueChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelectOption(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setSearchValue('');
          inputRef.current?.blur();
          break;
        case 'Tab':
          // Allow tab to close and move focus
          setOpen(false);
          break;
      }
    },
    [open, highlightedIndex, filteredOptions, handleSelectOption]
  );

  // Handle clear selection
  const handleClear = React.useCallback(() => {
    onValueChange?.(undefined);
    setSearchValue('');
    setOpen(false);
    setHighlightedIndex(-1);
  }, [onValueChange]);

  // Scroll highlighted option into view
  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  // Handle clicking outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        open &&
        !target.closest('[data-slot="autocomplete-input"]') &&
        !target.closest('[data-slot="autocomplete-content"]') &&
        !target.closest('[data-slot="autocomplete-option"]')
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Dropdown component to be rendered in portal
  const dropdownContent = open && (
    <div
      data-slot="autocomplete-content"
      className={cn(
        'fixed z-[9999] bg-popover text-popover-foreground rounded-md border shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        dropdownPosition.placement === 'bottom'
          ? 'data-[side=bottom]:slide-in-from-top-2'
          : 'data-[side=top]:slide-in-from-bottom-2'
      )}
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
      }}
      onMouseEnter={() => {
        isInteractingRef.current = true;
      }}
      onMouseLeave={() => {
        isInteractingRef.current = false;
      }}
    >
      <div
        ref={listRef}
        className="overflow-y-auto p-1"
        style={{ maxHeight: maxHeight }}
      >
        {filteredOptions.length === 0 ? (
          <div
            data-slot="autocomplete-empty"
            className="p-3 text-center text-sm text-muted-foreground"
          >
            {emptyMessage}
          </div>
        ) : (
          filteredOptions.map((option, index) => (
            <div
              key={`${option.value}-${index}`}
              data-slot="autocomplete-option"
              className={cn(
                'relative flex w-full cursor-default items-center gap-2 rounded-sm py-2 px-3 text-sm outline-none select-none transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                highlightedIndex === index &&
                  'bg-accent text-accent-foreground',
                option.disabled && 'pointer-events-none opacity-50',
                option.value === value && 'bg-accent/50'
              )}
              onClick={() => {
                handleSelectOption(option);
              }}
              onMouseEnter={() =>
                !option.disabled && setHighlightedIndex(index)
              }
            >
              <div className="flex-1">
                {renderOption ? renderOption(option) : option.label}
              </div>

              {option.value === value && (
                <CheckIcon className="h-4 w-4 text-accent-foreground" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={cn(
          'relative flex items-center cursor-text',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <Input
          ref={inputRef}
          data-slot="autocomplete-input"
          type="text"
          placeholder={open ? searchPlaceholder : placeholder}
          value={open ? searchValue : displayValue}
          onChange={e => {
            setSearchValue(e.target.value);
            justSelectedRef.current = false; // Reset flag when user starts typing
            if (!open) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn('pr-8', allowClear && value && 'pr-16')}
          onFocus={() => {
            if (!disabled && !justSelectedRef.current) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            // Only close if we're not interacting with the dropdown
            if (!isInteractingRef.current) {
              setOpen(false);
            }
          }}
        />

        <div className="absolute right-1 flex items-center gap-1">
          {allowClear && value && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleClear();
                inputRef.current?.focus();
              }}
              disabled={disabled}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted transition-colors"
              tabIndex={-1}
            >
              <span className="text-xs">×</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (disabled) return;
              setOpen(!open);
              inputRef.current?.focus();
            }}
            disabled={disabled}
            className="flex h-6 w-6 items-center justify-center"
            tabIndex={-1}
          >
            <ChevronDownIcon
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                open && 'rotate-180'
              )}
            />
          </button>
        </div>
      </div>

      {/* Render dropdown in portal to avoid clipping */}
      {typeof document !== 'undefined' &&
        createPortal(dropdownContent, document.body)}
    </div>
  );
}

export { AutoComplete };
export type { AutoCompleteOption, AutoCompleteProps };
