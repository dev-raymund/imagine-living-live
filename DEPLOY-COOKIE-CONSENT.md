# Deploy the cookie consent update

Ships the cookie banner fix, the Google Maps consent gate and the updated cookie section of the Privacy & Cookie Policy to the live VPS.

Use the **VPS pull** (Option B in `PROJECT-HANDOFF.md`). The **Deploy to VPS** GitHub Action has failed on every push since 2 September: the server doesn't accept the deploy key, so a push alone changes nothing on live. Its red run after Step 1 is expected and harmless (it fails before copying anything).

> **First attempt, 06.10.2026:** every page returned 500 and the site was restored with `restore.sh`. The layout wrapped the banner in `{{ nocache }}`, which in Statamic 3.4 compares every page variable with the cascade, and some live data made that throw (`Object of class Statamic\Fields\Value could not be converted to int`, `NoCache/Region.php:55`). It now uses `{{ uncached }}` (`app/Tags/Uncached.php`), which stores no page variables. The script also checks the site afterwards and rolls itself back if any page fails.

## What gets deployed

| File | Purpose |
|------|---------|
| `app/Tags/Uncached.php` | `{{ uncached }}`: like `{{ nocache }}` but without the page variables that crashed it (new) |
| `config/oreos.php` | Adds the optional **Google Maps** consent group (off by default) |
| `resources/views/layout.antlers.html` | Banner check moved inside `{{ uncached }}`, so static caching can't freeze it |
| `resources/views/vendor/statamic-oreos/popup.antlers.html` | Banner wording, policy link |
| `resources/views/vendor/statamic-oreos/form.antlers.html` | Accept all / Reject all / Save choices (Cancel removed) |
| `resources/views/vendor/statamic-oreos/oreos.css` | Banner button styles (new) |
| `resources/lang/vendor/statamic-oreos/en/messages.php` | Banner and button text (new) |
| `resources/views/contact.antlers.html` | Map placeholder until the visitor opts in |
| `resources/css/views/contact.css` | Map placeholder styles |
| `resources/views/components/texteditor/textEditor.css` | Borders and cell padding for tables in editor content (the policy's cookie table) |
| `resources/views/components/footer/_footer.antlers.html` | **Cookie settings** link in the footer |
| `resources/css/site.generated.css`, `public/site.generated.css` | CSS import list and the built CSS (the pull doesn't run npm) |
| `scripts/apply-cookie-policy.php` | Updates the policy's cookie section in place (new) |
| `content/oreos.yaml` | Banner group titles and descriptions (**content**, see below) |
| `content/collections/pages/privacy-policy.md` | **Not copied.** Updated in place on the server, see below |

### Why content is handled differently

`content/` is edited in the live control panel, so the server copy is the source of truth:

- **Privacy policy.** The live policy has editor changes the repo doesn't have (a 29.09.2026 update to the date and registered office address). The script never copies the repo file over it. It runs `scripts/apply-cookie-policy.php` on the live file, which rewrites only the cookie section. It checks every paragraph it touches first and stops without writing if any has been edited.
- **Banner text (`content/oreos.yaml`).** Replaced only if it still matches what was committed before this change. Otherwise it's left alone and reported.

---

## Step 1 — Commit and push (PowerShell, on your PC)

Commit **only** these files. The other uncommitted changes in the working tree (development entries, `package-lock.json`, `public/css/*`, `public/js/*`) are unrelated and stay out.

```powershell
cd C:\projects\imagine-living-live\imagineliving.co.uk
git add app/Tags/Uncached.php config/oreos.php content/oreos.yaml content/collections/pages/privacy-policy.md `
  resources/views/layout.antlers.html resources/views/contact.antlers.html `
  resources/views/components/footer/_footer.antlers.html resources/views/vendor/statamic-oreos `
  resources/lang/vendor/statamic-oreos resources/css/views/contact.css `
  resources/views/components/texteditor/textEditor.css resources/css/site.generated.css `
  public/site.generated.css public/site.generated.css.map `
  scripts/apply-cookie-policy.php scripts/vps-pull-cookie-consent.sh DEPLOY-COOKIE-CONSENT.md
git status    # check nothing else is staged
git commit -m "Make the cookie banner work with static caching and gate Google Maps behind consent"
git push origin main
```

The repo copy of `privacy-policy.md` is a record only; live is updated by Step 2.

## Step 2 — Run on the VPS (Fasthosts web console or SSH, as `ploi`)

Wait about 5 minutes after the push (raw.githubusercontent.com can serve stale copies right after one), then run each line on its own:

```bash
cd /home/ploi/imagineliving.co.uk
curl -fsSL "https://raw.githubusercontent.com/dev-raymund/imagine-living-live/main/scripts/vps-pull-cookie-consent.sh" -o /tmp/vps-pull-cookie-consent.sh
bash /tmp/vps-pull-cookie-consent.sh dev-raymund imagine-living-live
```

To deploy one exact commit instead of `main`, add its hash as a third argument to the `bash` line and use it in place of `main` in the URL.

The script:

1. Downloads every file first. If any download fails, it stops before changing anything.
2. Backs up everything it will replace to `~/backups/cookie-consent-<time>/` and writes a `restore.sh` there.
3. Installs the code files.
4. Updates the banner text (if unchanged on live) and the policy's cookie section, setting "Last updated" to today.
5. Regenerates the autoloader and clears the Stache, compiled views, application cache and static page cache.
6. Loads `/`, `/about-us`, `/contact-us`, `/privacy-policy`, `/developments` and `/faq` twice each (fresh, then from the static cache). If any of them doesn't return 200, or step 5 fails, it prints the last logged error, runs `restore.sh` itself, and ends with `✗ Deploy rolled back`.

The `PHP Deprecated: … Logger::__construct()` lines it prints are harmless warnings, because the server's PHP is newer than this Laravel version.

A good run ends like this:

```
→ Checking the site
   ✓ /
   ✓ /about-us
   ✓ /contact-us
   ✓ /privacy-policy
   ✓ /developments
   ✓ /faq

✓ Done.
  Check: / (banner), /contact-us (map placeholder), /privacy-policy (cookie section)
  Undo everything: bash /home/ploi/backups/cookie-consent-…/restore.sh
```

Note the **Undo** line. If it ends with `✗ Deploy rolled back` instead, the site is already back as it was; send the error line it printed.

## Step 3 — Check on live

Open https://imagineliving.co.uk in a **new browser profile or after clearing the site's cookies**, with DevTools → Network open and filtered to `google`:

1. **Any page:** the "Cookies on this website" banner with **Accept all**, **Reject all** and **Save choices**.
2. **/contact-us:** a grey **Google Maps** box with a **Load map** button, no map, and no `google.com` / `maps.googleapis.com` requests.
3. **Reject all:** the banner disappears and stays gone on every page. The contact page still shows the placeholder, and still makes no Google requests.
4. **Footer → Cookie settings:** the banner comes back.
5. **Accept all** (or **Load map** on the contact page): the map loads.
6. **/privacy-policy:** the new cookie section with a bordered table, today's "Last updated" date, and the registered office address still reading Ealing Cross.
7. **DevTools → Application → Cookies:** before any choice only `imagine_living_session` and `XSRF-TOKEN`; `TP_OREOS` appears once a choice is made.

Visitors who chose before this deploy see the banner once more. Adding the Google Maps group resets saved choices, by design.

## If the script skipped something

**"Banner text was not replaced".** Enter the texts in the control panel under **Tools → Oreos**:

| Field | Text |
|-------|------|
| essentials → Title | Strictly necessary |
| essentials → Description | Needed for our website to work, for example to keep forms secure and remember your cookie choices. Always on. |
| maps → Title | Google Maps |
| maps → Description | Shows a Google map of our office on the Contact Us page. When the map loads, Google receives your IP address and may set cookies. |

**"Privacy policy was not changed".** The script prints which paragraph didn't match. Someone has edited the cookie section since. Make the changes in the control panel by hand, copying the wording from the repo's `content/collections/pages/privacy-policy.md` (the "Cookies" section through "When you visit our website…", plus the heading renamed to "How your information is used").

## Undo

```bash
bash ~/backups/cookie-consent-<time>/restore.sh
```

This puts back every replaced file, removes the four new files, regenerates the autoloader and clears the caches. It also restores the policy and banner text exactly as they were before the deploy. Any control panel edits to those two pages made after deploying would be lost, so copy them first if there are any.

## Notes

- Nothing else on the server changes. The script doesn't run composer or npm.
- The built `public/site.generated.css` also contains styles from the 2–7 September commits, which were never deployed (`development-properties__*`). They do nothing until those templates ship.
