'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface FilterState {
  searchQuery: string
  selectedSubjects: string[]
  selectedDifficulties: string[]
  minPrizePool: string
  maxPrizePool: string
  gasSponsored: boolean
  verifiedOnly: boolean
}

interface QuizFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function QuizFilters({ filters, onFiltersChange }: QuizFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(filters.selectedSubjects)
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(filters.selectedDifficulties)
  const [minPrizePool, setMinPrizePool] = useState(filters.minPrizePool)
  const [maxPrizePool, setMaxPrizePool] = useState(filters.maxPrizePool)
  const [gasSponsored, setGasSponsored] = useState(filters.gasSponsored)
  const [verifiedOnly, setVerifiedOnly] = useState(filters.verifiedOnly)

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange({
      searchQuery,
      selectedSubjects,
      selectedDifficulties,
      minPrizePool,
      maxPrizePool,
      gasSponsored,
      verifiedOnly,
    })
  }, [searchQuery, selectedSubjects, selectedDifficulties, minPrizePool, maxPrizePool, gasSponsored, verifiedOnly, onFiltersChange])

  const subjects = ['Mathematics', 'Science', 'History', 'Languages', 'Literature', 'Technology']
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    )
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedSubjects([])
    setSelectedDifficulties([])
    setMinPrizePool('')
    setMaxPrizePool('')
    setGasSponsored(false)
    setVerifiedOnly(false)
  }

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) +
    selectedSubjects.length + 
    selectedDifficulties.length + 
    (minPrizePool ? 1 : 0) +
    (maxPrizePool ? 1 : 0) +
    (gasSponsored ? 1 : 0) + 
    (verifiedOnly ? 1 : 0)

  return (
    <Card className="border-border sticky top-20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Subject Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Subject</Label>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div key={subject} className="flex items-center gap-2">
                <Checkbox
                  id={`subject-${subject}`}
                  checked={selectedSubjects.includes(subject)}
                  onCheckedChange={() => handleSubjectToggle(subject)}
                />
                <label
                  htmlFor={`subject-${subject}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {subject}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Difficulty</Label>
          <div className="space-y-2">
            {difficulties.map((difficulty) => (
              <div key={difficulty} className="flex items-center gap-2">
                <Checkbox
                  id={`difficulty-${difficulty}`}
                  checked={selectedDifficulties.includes(difficulty)}
                  onCheckedChange={() => handleDifficultyToggle(difficulty)}
                />
                <label
                  htmlFor={`difficulty-${difficulty}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {difficulty}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Prize Pool Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Prize Pool (cUSD)</Label>
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="Min" 
              className="flex-1" 
              value={minPrizePool}
              onChange={(e) => setMinPrizePool(e.target.value)}
            />
            <Input 
              type="number" 
              placeholder="Max" 
              className="flex-1" 
              value={maxPrizePool}
              onChange={(e) => setMaxPrizePool(e.target.value)}
            />
          </div>
        </div>

        {/* Additional Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="gas-sponsored"
              checked={gasSponsored}
              onCheckedChange={(checked) => setGasSponsored(checked as boolean)}
            />
            <label htmlFor="gas-sponsored" className="text-sm cursor-pointer">
              Gas Sponsored
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="verified-only"
              checked={verifiedOnly}
              onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
            />
            <label htmlFor="verified-only" className="text-sm cursor-pointer">
              Verified Only
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={clearAllFilters}
            variant={activeFiltersCount > 0 ? "default" : "outline"}
          >
            {activeFiltersCount > 0 ? `Clear (${activeFiltersCount})` : 'No Filters'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
