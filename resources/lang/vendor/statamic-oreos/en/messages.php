<?php

// Overrides strings from the Oreos addon's own translations
// (vendor/takepart-media/statamic-oreos/resources/lang/en/messages.php).
// Laravel merges this file over the addon's, so only changed or new keys
// need to be here.

return [

    'popup' => [
        'headline' => 'Cookies on this website',
        'intro' => 'We use a few cookies that our website needs to work. With your permission, we’ll also show a Google map on our Contact Us page, which lets Google set its own cookies. You can change your choice at any time using Cookie settings at the bottom of every page.',
        'policy_link' => 'Read our Privacy & Cookie Policy.',
    ],

    'button' => [
        'save' => 'Save choices',
        'acceptall' => 'Accept all',
        'reject' => 'Reject all',
        'settings' => 'Cookie settings',
    ],

];
