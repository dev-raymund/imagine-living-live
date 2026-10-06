<?php
// Applies the cookie-section update to a copy of the Privacy & Cookie Policy entry
// (content/collections/pages/privacy-policy.md), wherever it lives: the local repo or
// a copy downloaded from the live server, where editors may have changed other parts.
//
// It finds every paragraph by its text, not its position, checks each one still says
// what it is expected to say, and changes nothing else in the file. If anything in the
// cookie section has been edited since, it stops without writing.
//
// Usage (from the site root, locally or on the VPS):
//   php scripts/apply-cookie-policy.php content/collections/pages/privacy-policy.md 06.10.2026
// The date becomes the policy's "Last updated" line.

require dirname(__DIR__) . '/vendor/autoload.php';

use Symfony\Component\Yaml\Yaml;

[, $file, $date] = $argv + [null, null, null];
if (! $file || ! preg_match('/^\d{2}\.\d{2}\.\d{4}$/', (string) $date)) {
    fwrite(STDERR, "usage: php scripts/apply-cookie-policy.php <privacy-policy.md> <dd.mm.yyyy>\n");
    exit(2);
}

$dump = fn ($data) => "---\n" . rtrim(Yaml::dump($data, 100, 2, Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK)) . "\n---\n";
$fail = function (string $why) { fwrite(STDERR, "STOPPED, nothing written: $why\n"); exit(1); };

$src = str_replace("\r\n", "\n", file_get_contents($file));
if (! preg_match('/^---\n(.*)\n---\n$/s', $src, $m)) {
    $fail('unexpected file layout');
}
$data = Yaml::parse($m[1]);
if ($dump($data) !== $src) {
    $fail('re-saving the file unchanged would alter it, so a rewrite could touch more than intended');
}

// The Bard field holding the policy text: the only one with a table in it.
$bard = null;
foreach ($data['block_builder'] as $b => $block) {
    foreach ($block['replicator'] ?? [] as $r => $set) {
        foreach ($set['bard'] ?? [] as $node) {
            if ($node['type'] === 'table') {
                if ($bard !== null) {
                    $fail('more than one table in the entry');
                }
                $bard = &$data['block_builder'][$b]['replicator'][$r]['bard'];
                break;
            }
        }
    }
}
if ($bard === null) {
    $fail('no table found');
}

$text = fn ($node) => implode('', array_map(fn ($n) => $n['text'] ?? '', $node['content'] ?? []));
$find = function (string $startsWith, int $from = 0) use (&$bard, $text): ?int {
    foreach ($bard as $i => $node) {
        if ($i >= $from && str_starts_with($text($node), $startsWith)) {
            return $i;
        }
    }
    return null;
};

// --- Locate and check everything before changing anything --------------------------
$heading = null;
foreach ($bard as $i => $node) {
    if ($text($node) === 'Cookies' && str_starts_with($text($bard[$i + 1] ?? []), 'Our website uses cookies to distinguish you')) {
        $heading = $i;
        break;
    }
}
if ($heading === null) {
    $fail('the "Cookies" heading followed by the old intro was not found (already updated, or edited?)');
}
$expected = [
    1 => 'Our website uses cookies to distinguish you',
    2 => 'We use the following cookies:',
    3 => 'Analytical/performance cookies.',
    4 => 'Functionality cookies.',
    5 => 'Targeting cookies.',
    7 => 'You can block cookies by activating the setting',
    8 => 'During your visits to our website we may automatically collect',
];
foreach ($expected as $offset => $startsWith) {
    if (! str_starts_with($text($bard[$heading + $offset] ?? []), $startsWith)) {
        $fail("expected \"$startsWith…\" at position " . ($heading + $offset));
    }
}
$table = $bard[$heading + 6] ?? [];
if (($table['type'] ?? '') !== 'table' || ! str_contains(json_encode($table), '"text":"_ga"')) {
    $fail('the old Google Analytics cookie table is not where expected');
}
$lastUpdated = $find('Last updated: ');
$usedHeading = null;
foreach ($bard as $i => $node) {
    if ($i > $heading + 8 && $text($node) === 'Cookies' && str_starts_with($text($bard[$i + 1] ?? []), 'We will use the information given')) {
        $usedHeading = $i;
    }
}
$analytical = $find('The analytical information we gather about the visitors');
$sharing = $find('We also share information about your use of our site with our trusted social media, advertising and analytics partners');
foreach (['"Last updated" line' => $lastUpdated, 'second "Cookies" heading' => $usedHeading, '"analytical information" paragraph' => $analytical, '"advertising and analytics partners" paragraph' => $sharing] as $what => $at) {
    if ($at === null) {
        $fail("$what not found");
    }
}

// --- New content -------------------------------------------------------------------
$span = ['type' => 'btsSpan'];
$bold = ['type' => 'bold'];
// The page has no paragraph margins; the editor spaces paragraphs with two line breaks.
$break = ['type' => 'hardBreak', 'marks' => [$span]];
$run = fn (string $t, array $marks = []) => ['type' => 'text', 'marks' => array_merge($marks, [$span]), 'text' => $t];
$paragraph = fn (array ...$runs) => ['type' => 'paragraph', 'attrs' => ['class' => null], 'content' => $runs];

$cell = fn (string $kind, ?int $width, string $t) => [
    'type' => $kind,
    'attrs' => ['colspan' => 1, 'rowspan' => 1, 'colwidth' => $width ? [$width] : null],
    'content' => [$paragraph($run($t, $kind === 'tableHeader' ? [$bold] : []))],
];
$widths = [200, 140, null, 110];
$rows = [
    ['Cookie', 'Provider', 'Purpose', 'Duration'],
    ['imagine_living_session', 'Imagine Living', 'Strictly necessary. Keeps your visit secure and lets our contact form work.', '2 hours'],
    ['XSRF-TOKEN', 'Imagine Living', 'Strictly necessary. A security cookie that stops other websites from submitting our forms on your behalf.', '2 hours'],
    ['TP_OREOS', 'Imagine Living', 'Strictly necessary. Records your cookie preferences.', '30 days'],
];
$newTable = ['type' => 'table', 'content' => array_map(fn ($row, $r) => [
    'type' => 'tableRow',
    'content' => array_map(fn ($t, $c) => $cell($r === 0 ? 'tableHeader' : 'tableCell', $widths[$c], $t), $row, array_keys($row)),
], $rows, array_keys($rows))];

$cookieSection = [
    $paragraph($run('A cookie is a small file of letters and numbers that a website stores in your browser or on your device. We only use cookies that our website needs to work, such as keeping our contact form secure and remembering your cookie choices. We don’t use analytics, advertising or tracking cookies.'), $break, $break),
    $paragraph(
        $run('Strictly necessary cookies.', [$bold]),
        $run(' These are needed for our website to work, so they’re always on and don’t need your consent. They’re all set by us:'),
        $break, $break,
    ),
    $newTable,
    $paragraph(
        $break, $break,
        $run('Google Maps (optional).', [$bold]),
        $run(' Our Contact Us page can show a map provided by Google Maps. We only load it if you agree, either through our cookie banner or by choosing “Load map” on that page. When the map loads, Google receives information such as your IP address and may set its own cookies, particularly if you’re signed in to a Google account. See '),
        // Underlined as well: this page has no link styling (the policy's email address is underlined the same way).
        ['type' => 'text', 'marks' => [
            ['type' => 'link', 'attrs' => ['href' => 'https://policies.google.com/privacy', 'rel' => 'noreferrer noopener', 'target' => '_blank', 'title' => null]],
            ['type' => 'underline'],
            $span,
        ], 'text' => 'Google’s Privacy Policy'],
        $run(' for how Google uses this information.'),
        $break, $break,
    ),
    $paragraph($run('You can change your cookie choices at any time using the Cookie settings link at the bottom of every page. You can also block or delete cookies in your browser settings, but if you block all cookies, parts of our website, such as the contact form, may not work.'), $break, $break),
    $paragraph($run('When you visit our website, our web server may automatically record technical information such as your IP address, browser type and version, the pages you request and the website that referred you to us. We use this only to keep our website secure and working properly.')),
];

// --- Apply (bottom-up, so earlier positions stay valid) -----------------------------
foreach ($bard[$lastUpdated]['content'] as &$n) {
    if (isset($n['text']) && str_starts_with($n['text'], 'Last updated: ')) {
        $n['text'] = "Last updated: $date";
    }
}
unset($n);
foreach ($bard[$usedHeading]['content'] as &$n) {
    if (($n['text'] ?? null) === 'Cookies') {
        $n['text'] = 'How your information is used';
    }
}
unset($n);
$remove = [$sharing, $analytical];
rsort($remove);
foreach ($remove as $i) {
    if ($i <= $heading + 8) {
        $fail('a paragraph to remove sits inside the cookie section being replaced');
    }
    array_splice($bard, $i, 1);
}
array_splice($bard, $heading + 1, 8, $cookieSection);
unset($bard);

file_put_contents($file, $dump($data));
echo "Updated the cookie section of $file\n";
