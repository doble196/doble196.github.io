#!/usr/bin/env python3
"""Sync README blocks marked <!-- IDENTITY:<key> --> from a central identity.yml.

Fetches identity data from the canonical location and re-renders every
marked block in the target README. Run from each consumer repo's
sync-identity workflow.
"""

from __future__ import annotations

import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.request

try:
    import yaml  # type: ignore
except ImportError:
    sys.stderr.write("missing pyyaml — install with `pip install pyyaml`\n")
    sys.exit(2)

IDENTITY_URL = os.environ.get(
    "IDENTITY_URL",
    "https://raw.githubusercontent.com/doble196/doble196/main/identity.yml",
)
README_PATH = pathlib.Path(os.environ.get("README_PATH", "README.md"))


def load_identity() -> dict:
    with urllib.request.urlopen(IDENTITY_URL, timeout=15) as r:
        return yaml.safe_load(r.read())


def fetch_latest_commit(repo: str) -> dict | None:
    # Public GitHub API, stdlib urllib only (same pattern as load_identity) — no
    # third-party HTTP client and no CDN. Returns None on any failure so a
    # transient network/rate-limit error never breaks the rest of the sync.
    api = f"https://api.github.com/repos/{repo}/commits/main"
    req = urllib.request.Request(
        api, headers={"Accept": "application/vnd.github+json"}
    )
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as e:
        sys.stderr.write(f"warn: could not fetch latest commit for {repo}: {e}\n")
        return None


def render(key: str, d: dict) -> str:
    # Custom-formatted keys (linkified)
    if key == "email":
        return f"[{d['email']}](mailto:{d['email']})"
    if key == "x":
        return f"[@{d['x_handle']}](https://x.com/{d['x_handle']})"
    if key == "linkedin":
        slug = d.get("linkedin_path")
        return f"[linkedin.com/in/{slug}](https://linkedin.com/in/{slug})" if slug else ""
    if key == "github":
        u = d["github_user"]
        return f"[@{u}](https://github.com/{u})"
    if key == "website":
        return f"[{d['website']}](https://{d['website']})"
    if key == "contact":
        lines = [
            f"- **Email:** [{d['email']}](mailto:{d['email']})",
            f"- **X:** [@{d['x_handle']}](https://x.com/{d['x_handle']})",
        ]
        if d.get("linkedin_path"):
            slug = d["linkedin_path"]
            lines.append(
                f"- **LinkedIn:** [linkedin.com/in/{slug}](https://linkedin.com/in/{slug})"
            )
        lines.extend([
            f"- **GitHub:** [@{d['github_user']}](https://github.com/{d['github_user']})",
            f"- **Location:** {d['location']}",
        ])
        return "\n".join(lines)
    if key == "fleet_table":
        rows = ["| App | Domain | Role |", "|---|---|---|"]
        for f in d["fleet"]:
            rows.append(
                f"| **{f['name']}** | [{f['domain']}](https://{f['domain']}) | {f['role']} |"
            )
        return "\n".join(rows)
    if key == "fleet_links":
        items = [
            f"- **[{f['name']}](https://{f['domain']})** — {f['role']}"
            for f in d["fleet"]
        ]
        return "\n".join(items)
    if key == "access0x1_card":
        # Deployment facts come from identity.yml so addresses/chains/links stay
        # owner-controlled and truthful; repo activity is fetched live at
        # Action time. Missing facts raise ValueError so repl keeps the existing
        # block verbatim rather than emitting a half-empty card.
        required = (
            "access0x1_contract",
            "access0x1_chain",
            "access0x1_explorer",
            "access0x1_repo",
        )
        missing = [k for k in required if not d.get(k)]
        if missing:
            raise ValueError(f"access0x1_card missing keys: {', '.join(missing)}")
        addr = d["access0x1_contract"]
        chain = d["access0x1_chain"]
        scan = d["access0x1_explorer"]
        repo = d["access0x1_repo"]
        short = f"{addr[:6]}…{addr[-4:]}"
        lines = [f"- **Router:** [`{short}`]({scan}) on {chain}"]
        if d.get("access0x1_deploy_date"):
            lines.append(f"- **Deployed:** {d['access0x1_deploy_date']}")
        commit = fetch_latest_commit(repo)
        if commit and commit.get("sha"):
            sha = commit["sha"]
            msg = commit["commit"]["message"].splitlines()[0][:72]
            url = f"https://github.com/{repo}/commit/{sha}"
            lines.append(f"- **Latest commit:** [`{sha[:7]}`]({url}) — {msg}")
        return "\n".join(lines)
    # Fallback: any top-level scalar field renders as itself.
    val = d.get(key)
    if val is None:
        raise ValueError(f"unknown IDENTITY key: {key}")
    if isinstance(val, (list, dict)):
        raise ValueError(f"key {key} is structured; needs a custom renderer")
    return str(val)


def replace_blocks(text: str, d: dict) -> str:
    pattern = re.compile(
        r"<!-- IDENTITY:(\w+) -->.*?<!-- /IDENTITY:\1 -->", re.DOTALL
    )

    def repl(m: re.Match) -> str:
        key = m.group(1)
        try:
            body = render(key, d)
        except ValueError as e:
            sys.stderr.write(f"warn: {e}\n")
            return m.group(0)
        # Multi-line bodies (composites) get block formatting;
        # single-line bodies stay inline so they don't break headings/URLs.
        if "\n" in body:
            return f"<!-- IDENTITY:{key} -->\n{body}\n<!-- /IDENTITY:{key} -->"
        return f"<!-- IDENTITY:{key} -->{body}<!-- /IDENTITY:{key} -->"

    return pattern.sub(repl, text)


def main() -> int:
    if not README_PATH.exists():
        sys.stderr.write(f"no README at {README_PATH}\n")
        return 1
    d = load_identity()
    old = README_PATH.read_text()
    new = replace_blocks(old, d)
    if new == old:
        print("no change")
        return 0
    README_PATH.write_text(new)
    print(f"updated {README_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
