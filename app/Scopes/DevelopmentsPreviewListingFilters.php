<?php

namespace App\Scopes;

class DevelopmentsPreviewListingFilters extends DevelopmentsListingFilters
{
    public function apply($query, $values): void
    {
        $query->where('preview_detail_page', true);

        parent::apply($query, $values);
    }

    /**
     * The preview listing is ordered by an editor-controlled rank (1 = top)
     * instead of the featured toggle. Unranked entries sort last, and ties are
     * broken by the user-selected sort then name A–Z (see applySortOrder).
     */
    protected function applyPriorityOrder($query): void
    {
        $query->orderBy('listing_rank', 'asc');
    }
}
