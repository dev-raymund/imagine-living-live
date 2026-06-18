<?php

namespace App\Scopes;

class DevelopmentsPreviewListingFilters extends DevelopmentsListingFilters
{
    public function apply($query, $values): void
    {
        $query->where('preview_detail_page', true);

        parent::apply($query, $values);
    }
}
