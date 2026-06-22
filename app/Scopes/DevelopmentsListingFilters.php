<?php

namespace App\Scopes;

use Statamic\Query\Scopes\Scope;

class DevelopmentsListingFilters extends Scope
{
    public function apply($query, $values): void
    {
        $this->applyFilters($query);
        $this->applyPriorityOrder($query);
        $this->applySortOrder($query);
    }

    protected function applyFilters($query): void
    {
        $q = trim((string) request('q', ''));
        if ($q !== '') {
            $like = '%'.addcslashes($q, '%_\\').'%';
            $query->whereNested(function ($query) use ($like) {
                $query->where('title', 'like', $like)
                    ->orWhere('subtitle', 'like', $like);
            });
        }

        $area = trim((string) request('area', ''));
        if ($area !== '') {
            $query->where('subtitle', $area);
        }

        $max = filter_var(request('max_price'), FILTER_VALIDATE_INT);
        if ($max !== false && $max > 0) {
            $query->whereNested(function ($query) use ($max) {
                $query->where('price_from', '<=', $max)
                    ->orWhereNull('price_from');
            });
        }
    }

    /**
     * Primary ordering applied before the user-selected sort.
     * The public listing pins featured developments to the top.
     */
    protected function applyPriorityOrder($query): void
    {
        $query->orderBy('featured', 'desc');
    }

    protected function applySortOrder($query): void
    {
        if (request('sort') === 'name') {
            $query->orderBy('title', 'asc');
        } else {
            $query->orderBy('price_from', 'asc');
            $query->orderBy('title', 'asc');
        }
    }
}
