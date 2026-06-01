<?php

namespace App\Scopes;

use Statamic\Query\Scopes\Scope;

class DevelopmentsListingFilters extends Scope
{
    public function apply($query, $values): void
    {
        $q = trim((string) request('q', ''));
        if ($q !== '') {
            $like = '%'.addcslashes($q, '%_\\').'%';
            $query->where('title', 'like', $like);
        }

        $max = filter_var(request('max_price'), FILTER_VALIDATE_INT);
        if ($max !== false && $max > 0) {
            $query->whereNotNull('price_from')
                ->where('price_from', '<=', $max);
        }
    }
}
