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
import urllib.parse
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

# --- Sanitization ----------------------------------------------------------
# identity.yml is owner-controlled, but it lives in a *separate* public repo
# and is fetched + rendered into this README by an Action with `contents:
# write`. Treating its fields as untrusted input keeps a typo (or a
# compromised upstream) from breaking out of its markdown context: closing a
# link/code span, splitting a table row, smuggling a `javascript:` href, or
# terminating the `<!-- /IDENTITY:key -->` sentinel that the replacer keys on.

_ALLOWED_URL_SCHEMES = ("http", "https", "mailto")


def md_text(value: object) -> str:
    """Escape a value for use as inline markdown / link text / table cell.

    Neutralizes the characters that could close the surrounding construct
    (`[` `]` `` ` `` `|`), open raw HTML (`<` `>`), or escape the IDENTITY
    sentinel comment. Newlines collapse to spaces so a single field can never
    become multiple lines (which would break a table or leak outside the
    block).
    """
    s = str(value)
    s = s.replace("\\", "\\\\")
    for ch in ("[", "]", "`", "|", "<", ">"):
        s = s.replace(ch, "\\" + ch)
    # Collapse every kind of line break to a single space.
    s = re.sub(r"[\r\n]+", " ", s)
    # `-->` would terminate the surrounding HTML comment sentinel.
    s = s.replace("-->", "--\\>")
    return s


def md_code(value: object) -> str:
    """Sanitize a value rendered inside a `` `...` `` code span.

    Backslash escaping does not work inside code spans, so the only defense
    against closing the span early is to drop backticks outright; newlines
    are collapsed for the same reason as md_text.
    """
    s = re.sub(r"[\r\n]+", " ", str(value))
    return s.replace("`", "")


def md_url(value: object) -> str:
    """Sanitize a value for use inside a markdown link/image target `(...)`.

    Only http/https/mailto targets are allowed; anything else (notably
    `javascript:` / `data:`) collapses to an empty fragment so it can never
    become an executable href. The result is percent-encoded enough that it
    cannot contain `)`, whitespace, angle brackets, or a comment terminator
    that would break out of the `(...)`.
    """
    s = str(value).strip()
    if not s:
        return ""
    scheme = s.split(":", 1)[0].lower() if ":" in s else ""
    # A value with no scheme is a relative/host fragment (e.g. the bare domain
    # the caller will prefix with `https://`); that's allowed. A value WITH a
    # scheme must be on the allowlist.
    if scheme and scheme not in _ALLOWED_URL_SCHEMES:
        return ""
    # Keep URL structure intact but neutralize the break-out characters.
    return urllib.parse.quote(s, safe="/:@?#&=+,.~%-_!*'$;")


def md_host(value: object) -> str:
    """Sanitize a bare host/domain that the renderer prefixes with a scheme.

    Rejects anything that isn't a plausible hostname[/path] so a crafted
    `domain` can't smuggle a second link, a scheme, or a `)` break-out.
    """
    s = str(value).strip()
    # Strip any scheme the value tries to carry; the renderer adds its own.
    s = re.sub(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", "", s)
    return urllib.parse.quote(s, safe="/.-_~")


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


def _email_link(addr: object) -> str:
    # md_url keeps the `mailto:` scheme on its allowlist and percent-encodes
    # any break-out characters in the address portion.
    return f"[{md_text(addr)}]({md_url('mailto:' + str(addr).strip())})"


def render(key: str, d: dict) -> str:
    # Every identity value is escaped for its markdown context before
    # interpolation (see md_text / md_url / md_host): link text can't close
    # its bracket, hrefs can't carry `javascript:` or break out of `(...)`,
    # and no field can split a table row or end the IDENTITY comment.
    if key == "email":
        return _email_link(d["email"])
    if key == "x":
        h = d["x_handle"]
        return f"[@{md_text(h)}](https://x.com/{md_host(h)})"
    if key == "linkedin":
        slug = d.get("linkedin_path")
        if not slug:
            return ""
        return f"[linkedin.com/in/{md_text(slug)}](https://linkedin.com/in/{md_host(slug)})"
    if key == "github":
        u = d["github_user"]
        return f"[@{md_text(u)}](https://github.com/{md_host(u)})"
    if key == "website":
        w = d["website"]
        return f"[{md_text(w)}](https://{md_host(w)})"
    if key == "contact":
        lines = [
            f"- **Email:** {_email_link(d['email'])}",
            f"- **X:** [@{md_text(d['x_handle'])}](https://x.com/{md_host(d['x_handle'])})",
        ]
        if d.get("linkedin_path"):
            slug = d["linkedin_path"]
            lines.append(
                f"- **LinkedIn:** [linkedin.com/in/{md_text(slug)}](https://linkedin.com/in/{md_host(slug)})"
            )
        lines.extend([
            f"- **GitHub:** [@{md_text(d['github_user'])}](https://github.com/{md_host(d['github_user'])})",
            f"- **Location:** {md_text(d['location'])}",
        ])
        return "\n".join(lines)
    if key == "fleet_table":
        rows = ["| App | Domain | Role |", "|---|---|---|"]
        for f in d["fleet"]:
            rows.append(
                f"| **{md_text(f['name'])}** | [{md_text(f['domain'])}](https://{md_host(f['domain'])}) | {md_text(f['role'])} |"
            )
        return "\n".join(rows)
    if key == "fleet_links":
        items = [
            f"- **[{md_text(f['name'])}](https://{md_host(f['domain'])})** — {md_text(f['role'])}"
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
        addr = str(d["access0x1_contract"])
        chain = d["access0x1_chain"]
        scan = d["access0x1_explorer"]
        repo = str(d["access0x1_repo"])
        # Code-span text: a stray backtick would close the span, so escape it.
        short = md_code(f"{addr[:6]}…{addr[-4:]}")
        lines = [f"- **Router:** [`{short}`]({md_url(scan)}) on {md_text(chain)}"]
        if d.get("access0x1_deploy_date"):
            lines.append(f"- **Deployed:** {md_text(d['access0x1_deploy_date'])}")
        # repo flows into a github.com URL path; keep it host-safe.
        commit = fetch_latest_commit(repo)
        if commit and commit.get("sha"):
            sha = str(commit["sha"])
            msg = commit["commit"]["message"].splitlines()[0][:72]
            url = f"https://github.com/{md_host(repo)}/commit/{md_host(sha)}"
            lines.append(
                f"- **Latest commit:** [`{md_code(sha[:7])}`]({url}) — {md_text(msg)}"
            )
        return "\n".join(lines)
    # Fallback: any top-level scalar field renders as itself, escaped so it
    # cannot break out of its surrounding block.
    val = d.get(key)
    if val is None:
        raise ValueError(f"unknown IDENTITY key: {key}")
    if isinstance(val, (list, dict)):
        raise ValueError(f"key {key} is structured; needs a custom renderer")
    return md_text(val)


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
