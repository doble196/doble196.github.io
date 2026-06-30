#!/usr/bin/env python3
"""Tests for sync-identity.py — focus on markdown-injection containment.

identity.yml is owner-controlled but lives in a separate public repo and is
rendered into this README by an Action with `contents: write`. These tests
treat its fields as untrusted input and assert that no field can break out of
its markdown context (close a link/code span, split a table row, smuggle a
`javascript:` href, or terminate the `<!-- /IDENTITY:key -->` sentinel).

Run: python3 .github/scripts/test_sync_identity.py
"""

from __future__ import annotations

import importlib.util
import pathlib
import unittest


def _load_module():
    here = pathlib.Path(__file__).resolve().parent
    spec = importlib.util.spec_from_file_location(
        "sync_identity", here / "sync-identity.py"
    )
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


m = _load_module()


# A single identity dict whose every field carries a markdown break-out
# payload. A correct renderer must neutralize all of them.
EVIL = {
    "name": "Pwn](https://evil.example)[x",
    "status": "ok\n--> escaped the comment",
    "location": "NYC | col | break\n-->",
    "email": "a@b.c](mailto:evil) extra",
    "x_handle": "h)](javascript:alert(1))",
    "github_user": "u)<img src=x onerror=alert(1)>",
    "website": "site) more --> done",
    "linkedin_path": "slug)](javascript:alert(2))",
    "fleet": [
        {
            "name": "App]X",
            "domain": "d.com) [evil](http://evil",
            "role": "r | extra | col",
        }
    ],
    "access0x1_contract": "0xABCDEF`0123456789",
    "access0x1_chain": "Arc) [hijack](http://evil",
    "access0x1_explorer": "javascript:alert(1)",
    "access0x1_repo": "owner/repo",
    "access0x1_deploy_date": "2026)](javascript:1)",
}

# Keys that render a linkified/structured block from EVIL.
LINK_KEYS = [
    "name",
    "status",
    "email",
    "x",
    "github",
    "website",
    "linkedin",
    "contact",
    "fleet_table",
    "fleet_links",
]


def _render(key):
    # access0x1_card hits the network for the latest commit; stub it out.
    m.fetch_latest_commit = lambda repo: None
    return m.render(key, EVIL)


# Markdown link/image syntax: an unescaped `]` immediately followed by `(`.
# `[text](url)` and `![alt](url)`. A `]` that is backslash-escaped (`\]`) is
# literal text and does NOT open a link, so we strip escaped specials first.
_ESCAPED = ("\\]", "\\[", "\\`", "\\|", "\\<", "\\>", "\\\\", "\\>")


def _strip_escaped(s: str) -> str:
    """Remove backslash-escaped markdown specials so only *live* syntax remains.

    After this, a remaining `](` is a real link the renderer chose to emit —
    which for a hostile field would be an injection.
    """
    # Replace the escape sequences we emit with a neutral placeholder.
    out = s
    for seq in _ESCAPED:
        out = out.replace(seq, "\x00")
    return out


class TestMarkdownInjection(unittest.TestCase):
    def test_injected_payload_does_not_form_live_link(self):
        # The attacker's `](https://evil.example)` payload, after escaping,
        # must NOT survive as a live markdown link. Once backslash-escaped
        # specials are stripped, the injected break-out sequence must be gone.
        for key in LINK_KEYS + ["access0x1_card"]:
            live = _strip_escaped(_render(key))
            self.assertNotIn(
                "](https://evil.example)",
                live,
                f"{key} rendered the injected evil.example link as live markdown",
            )

    def test_no_live_javascript_href(self):
        # `javascript:` must never appear as a *live* link target. A live link
        # href is `](url)` where the `]` is an UNescaped close-bracket. After
        # stripping the backslash-escaped specials (which turn `\]` into a
        # neutral placeholder), any remaining `](javascript:` would be a real
        # executable href. In a sanitized `(...)` href the colon is also
        # percent-encoded (`javascript%3A`), so this never matches.
        for key in LINK_KEYS + ["access0x1_card"]:
            live = _strip_escaped(_render(key))
            self.assertNotIn(
                "](javascript:", live, f"{key} produced a live javascript: href"
            )

    def test_comment_sentinel_not_terminable(self):
        # No field may emit a literal `-->` that would close the IDENTITY
        # comment and let content leak outside the managed block.
        for key in LINK_KEYS + ["access0x1_card"]:
            out = _render(key)
            self.assertNotIn("-->", out, f"{key} emitted a comment terminator")

    def test_no_field_introduces_newline(self):
        # Single-line renderers must stay single-line; multi-line renderers
        # (contact, fleet_*, access0x1_card) must not gain *extra* lines from a
        # field's embedded newline. We assert the injected-newline markers from
        # EVIL never start their own line.
        for key in ["name", "status", "email", "x", "github", "website", "linkedin"]:
            out = _render(key)
            self.assertNotIn("\n", out, f"{key} produced an unexpected newline")

    def test_fleet_table_row_integrity(self):
        # The data row must have exactly the 3 intended columns; an injected
        # `|` in a field would add columns and corrupt the table.
        out = _render("fleet_table")
        data_row = out.splitlines()[-1]
        # Strip leading/trailing pipes, then count separators.
        inner = data_row.strip().strip("|")
        # Escaped pipes (\|) are literal text, not column separators.
        columns = inner.replace("\\|", "\x00").split("|")
        self.assertEqual(
            len(columns), 3, f"fleet_table row has wrong column count: {data_row!r}"
        )

    def test_access0x1_explorer_scheme_filtered(self):
        # The explorer link target was javascript: — it must collapse to an
        # empty/safe target, never an executable href. (deploy_date is also
        # hostile here, but it lands in escaped link *text*, not an href.)
        out = _render("access0x1_card")
        live = _strip_escaped(out)
        self.assertNotIn("](javascript:", live)
        # The router line should carry an empty link target `()` rather than a
        # javascript: one.
        self.assertIn("]()", out)

    def test_code_span_not_closable(self):
        # The contract address renders inside a `` `...` `` code span; a stray
        # backtick in the value must be stripped so it can't close the span.
        out = _render("access0x1_card")
        router_line = out.splitlines()[0]
        # Between the first and the matching backtick there must be no extra
        # backtick from the address value.
        self.assertNotIn("`0xABCDEF`", router_line)


class TestBenignRoundTrip(unittest.TestCase):
    """Clean, real-world identity values must render exactly as before."""

    GOOD = {
        "name": "Rensley R.",
        "status": "shipping the GitHat fleet",
        "location": "New York, NY",
        "email": "rensley@githat.io",
        "x_handle": "VyperPilledDev",
        "github_user": "doble196",
        "website": "doble196.github.io",
        "linkedin_path": "rensley",
        "fleet": [
            {"name": "GitHat", "domain": "githat.io", "role": "Identity layer"},
            {"name": "Sebastn", "domain": "sebastn.com", "role": "Payments rail"},
        ],
    }

    def test_email(self):
        self.assertEqual(
            m.render("email", self.GOOD),
            "[rensley@githat.io](mailto:rensley@githat.io)",
        )

    def test_x(self):
        self.assertEqual(
            m.render("x", self.GOOD),
            "[@VyperPilledDev](https://x.com/VyperPilledDev)",
        )

    def test_github(self):
        self.assertEqual(
            m.render("github", self.GOOD),
            "[@doble196](https://github.com/doble196)",
        )

    def test_website(self):
        self.assertEqual(
            m.render("website", self.GOOD),
            "[doble196.github.io](https://doble196.github.io)",
        )

    def test_linkedin(self):
        self.assertEqual(
            m.render("linkedin", self.GOOD),
            "[linkedin.com/in/rensley](https://linkedin.com/in/rensley)",
        )

    def test_fleet_links(self):
        self.assertEqual(
            m.render("fleet_links", self.GOOD),
            "- **[GitHat](https://githat.io)** — Identity layer\n"
            "- **[Sebastn](https://sebastn.com)** — Payments rail",
        )

    def test_fleet_table(self):
        self.assertEqual(
            m.render("fleet_table", self.GOOD),
            "| App | Domain | Role |\n"
            "|---|---|---|\n"
            "| **GitHat** | [githat.io](https://githat.io) | Identity layer |\n"
            "| **Sebastn** | [sebastn.com](https://sebastn.com) | Payments rail |",
        )

    def test_status_scalar(self):
        self.assertEqual(m.render("status", self.GOOD), "shipping the GitHat fleet")

    def test_contact(self):
        self.assertEqual(
            m.render("contact", self.GOOD),
            "- **Email:** [rensley@githat.io](mailto:rensley@githat.io)\n"
            "- **X:** [@VyperPilledDev](https://x.com/VyperPilledDev)\n"
            "- **LinkedIn:** [linkedin.com/in/rensley](https://linkedin.com/in/rensley)\n"
            "- **GitHub:** [@doble196](https://github.com/doble196)\n"
            "- **Location:** New York, NY",
        )


class TestReplaceBlocks(unittest.TestCase):
    def test_unknown_key_left_verbatim(self):
        text = "<!-- IDENTITY:bogus -->old<!-- /IDENTITY:bogus -->"
        self.assertEqual(m.replace_blocks(text, {"name": "x"}), text)

    def test_known_key_replaced(self):
        text = "<!-- IDENTITY:name -->old<!-- /IDENTITY:name -->"
        out = m.replace_blocks(text, {"name": "Rensley R."})
        self.assertEqual(
            out, "<!-- IDENTITY:name -->Rensley R.<!-- /IDENTITY:name -->"
        )

    def test_injected_name_stays_inside_block(self):
        # Even a hostile name must not produce a second IDENTITY close-tag or
        # otherwise escape the single managed block.
        text = "<!-- IDENTITY:name -->old<!-- /IDENTITY:name -->"
        out = m.replace_blocks(text, {"name": EVIL["name"]})
        self.assertEqual(out.count("<!-- /IDENTITY:name -->"), 1)
        self.assertTrue(out.startswith("<!-- IDENTITY:name -->"))
        self.assertTrue(out.endswith("<!-- /IDENTITY:name -->"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
