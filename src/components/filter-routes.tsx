"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DualRangeSlider } from '@/components/ui/dual-range-slider';
import {
  SearchIcon,
} from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useEffect, useState } from "react"
import { FilterVariant, SortVariant } from "@/enums/enums";
import { useDebounce } from "use-debounce";

const DISTANCE_MAX = 1000
const DISTANCE_MIN = 0
const DISTANCE_MIN_ALLOWED = 0
const MIN_GAP = 10;

interface FilterRoutesProps {
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
  onDistanceRangeChange?: (range: [number, number]) => void;
  onSearchChange?: (search: string) => void;
}

const DEBOUNCE_DELAY = 750

export default function FilterRoutes({
  onFilterChange,
  onSortChange,
  onDistanceRangeChange,
  onSearchChange,
}: FilterRoutesProps) {
  const [distanceRange, setDistanceRange] = useState<[number, number]>([DISTANCE_MIN, DISTANCE_MAX]);
  const [debouncedDistanceRange] = useDebounce(distanceRange, DEBOUNCE_DELAY);
  const [filter, setFilter] = useState<string>(FilterVariant.DateCreated);
  const [sort, setSort] = useState<string>(SortVariant.Ascending);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch] = useDebounce(search, DEBOUNCE_DELAY);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    onFilterChange?.(value);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    onSortChange?.(value);
  };

  const handleDistanceChange = ([min, max]: [number, number]) => {
    const clampedMin = Math.max(min, DISTANCE_MIN_ALLOWED);
    const clampedMax = Math.max(
      max,
      clampedMin + MIN_GAP
    );

    setDistanceRange([clampedMin, Math.min(clampedMax, DISTANCE_MAX)]);
  };


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      onSearchChange?.(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange]);

  useEffect(() => {
    if (debouncedDistanceRange) {
      onDistanceRangeChange?.(debouncedDistanceRange);
    }
  }, [debouncedDistanceRange, onDistanceRangeChange]);

  return (
    <div>
      <div className="flex space-x-4 md:space-x-3 flex-col md:flex-row">
        <InputGroup>
          <InputGroupInput value={search} onChange={handleSearchChange} placeholder="Search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <div className="flex mt-4 md:mt-0 flex-row space-x-4 md:space-x-3">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filter by</SelectLabel>
                <SelectItem value={FilterVariant.DateCreated}>Recent</SelectItem>
                <SelectItem value={FilterVariant.Favourites}>Favourites</SelectItem>
                <SelectItem value={FilterVariant.TotalViews}>Total Views</SelectItem>
                <SelectItem value={FilterVariant.Distance}>Distance</SelectItem>
                <SelectItem value={FilterVariant.Duration}>Duration</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort By</SelectLabel>
                <SelectItem value={SortVariant.Ascending}>Ascending</SelectItem>
                <SelectItem value={SortVariant.Descending}>Descending</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">Distance Range</label>
          <span className="text-sm text-muted-foreground">
            {distanceRange[0]} - {distanceRange[1] === DISTANCE_MAX ? `${DISTANCE_MAX}+` : distanceRange[1]}
            &nbsp;miles
          </span>
        </div>
        <DualRangeSlider
          min={DISTANCE_MIN}
          max={DISTANCE_MAX}
          step={10}
          value={distanceRange}
          onValueChange={handleDistanceChange}
          className="w-full"
        />
      </div>
    </div>
  )
}
