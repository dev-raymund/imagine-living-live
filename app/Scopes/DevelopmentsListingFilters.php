<?php

namespace App\Scopes;

use Statamic\Query\Scopes\Scope;

class DevelopmentsListingFilters extends Scope
{
    /**
     * Shared by both development listings. Neither one filters on visibility
     * here: an entry's published status is the only thing deciding where it
     * shows, applied by the collection tag — /developments takes the default
     * published-only filter, /developments-preview overrides it with
     * `status:is="draft"`.
     */
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
     * The public listing is ordered by the editor-controlled rank (1 = top).
     * Any ranked entry sorts above every unranked one; unranked entries fall
     * back to the page sort, then name A–Z (see applySortOrder).
     *
     * `listing_rank` is the only pinning mechanism: null sorts last under asc,
     * which is exactly the wanted behaviour. Promoting specific developments on
     * the homepage is a separate, manual job — the Featured Grid block there
     * picks its entries by hand.
     */
    protected function applyPriorityOrder($query): void
    {
        $query->orderBy('listing_rank', 'asc');
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
