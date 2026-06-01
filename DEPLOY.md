# Deploy setup (Git + GitHub Actions)

**Cursor workspace:** open this folder only:

`C:\projects\imagine-living-live\imagineliving.co.uk`

Push to **`main`** → GitHub Actions rsyncs code to the VPS and runs `scripts/deploy.sh`.

No WinSCP, no manual file uploads.

---

## One-time setup

### 1. Create a private GitHub repo

[github.com/new](https://github.com/new) → name e.g. `imagineliving-co-uk` → **Private** → no README.

### 2. Push this project

```powershell
cd C:\projects\imagine-living-live\imagineliving.co.uk
git init
git add .
git commit -m "Initial commit: live site with developments filters"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/imagineliving-co-uk.git
git push -u origin main
```

### 3. Create a deploy SSH key (PC)

```powershell
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\imagineliving_deploy -N '""'
```

### 4. Add public key on the VPS (web console)

```bash
mkdir -p /home/ploi/.ssh
chmod 700 /home/ploi/.ssh
nano /home/ploi/.ssh/authorized_keys
```

Paste the line from `C:\Users\Agility\.ssh\imagineliving_deploy.pub`, save, then:

```bash
chmod 600 /home/ploi/.ssh/authorized_keys
chown -R ploi:ploi /home/ploi/.ssh
```

Test from PC:

```powershell
ssh -i $env:USERPROFILE\.ssh\imagineliving_deploy ploi@77.68.64.22
```

### 5. GitHub Actions secrets

Repo → **Settings** → **Secrets and variables** → **Actions**

| Secret | Value |
|--------|--------|
| `SSH_HOST` | `77.68.64.22` |
| `SSH_USER` | `ploi` |
| `SSH_PRIVATE_KEY` | Full contents of `imagineliving_deploy` (private key) |

### 6. First deploy

Push to `main`, or in GitHub: **Actions** → **Deploy to VPS** → **Run workflow**.

The workflow:

1. Rsyncs code (keeps server `.env`, `storage/`, `public/assets/`)
2. Runs `composer install`, `npm run build`, clears Statamic cache

---

## Daily workflow

```powershell
cd C:\projects\imagine-living-live\imagineliving.co.uk
# edit, test locally
git add .
git commit -m "Your change"
git push
```

Watch progress under **Actions** on GitHub.

---

## Two projects

| Folder | Use |
|--------|-----|
| `imagine-living-live\imagineliving.co.uk` | **Live site** (Statamic 3) — deploy this |
| `imagine-living` | New rebuild (Statamic 6) — separate project |

---

## If SSH still fails

Reset `ploi` access in the web console:

```bash
passwd ploi
```

Or ask whoever set up the server for Ploi/FastHosts SSH credentials.

The deploy key in `authorized_keys` is still the best long-term fix.
