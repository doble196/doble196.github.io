#!/usr/bin/env python3
"""Sync README blocks marked <!-- IDENTITY:<key> --> from a central identity.yml.

Fetches identity data from the canonical location and re-renders every
marked block in the target README. Run from each consumer repo's
sync-identity workflow.
"""

from __future__ import annotations

import os
import pathlib
import re
import sys
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
        return f"<!-- IDENTITY:{key} -->\n{body}\n<!-- /IDENTITY:{key} -->"

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
