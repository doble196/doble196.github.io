# Portfolio — presentation script (~3:00, live demo)

**Setup:** `doble196.github.io` open on screen, **freshly loaded — do NOT touch it yet.**
Phone in hand as backup.
**Critical:** the tree auto-reveals after ~1.3s, but *any* click or scroll cancels it. Let it breathe.

---

## [0:00 – 0:20] — The thesis

> Most portfolios open with a hero shot and a job title. Mine opens with a sentence:
>
> *"I'm a reasoning-first developer — judge the logic and the complexity of what I build
> before you judge the way my button looks."*
>
> I'm fullstack, leaning backend — payments and on-chain infrastructure, where fintech lies.
> I'm going to show you my site. But really I'm going to show you a decision.

## [0:20 – 0:50] — The bet  *(card + root card on screen)*

> I didn't build a portfolio. I built an argument you can navigate. That card, top-left, is
> me — name, proof, how to reach me. The center is my thesis. And watch — I don't touch
> anything...
>
> *(the tree expands itself)*
>
> ...it opens on its own. Eight things I build: payments, identity, booking, commerce,
> provenance, AI, security, teaching. The interface is doing the thing it says I do — it's a
> system, revealed in layers.

## [0:50 – 1:40] — The turn: the 30-second test  ← the heart of it

> Here's where this week changed how I think. Someone asked me a brutal question: if a hiring
> manager landed here for **30 seconds** — what would they actually walk away with?
>
> My first honest answer was: *"...if they click."* And that's a bet. A hiring manager
> skimming forty portfolios might not click. And if they didn't — my beautiful tree gave them
> one sentence and a dark screen.
>
> So I killed the bet. Three things now reach someone who never lifts a finger: *(point to
> card)* the receipts — 1,746 tests, live on eight-plus testnets, an ENS prize at ETHGlobal.
> That I'm open to roles. And the tree reveals itself, so they see everything without clicking.
>
> The principle I walked away with: **when your design depends on a behavior, either make the
> behavior effortless — or make the design not need it.** I chose "not need it."

## [1:40 – 2:20] — The receipts  *(click Payments → Access0x1)*

> Now the proof, because reasoning-first means nothing without it. This is **Access0x1** — an
> open-source onchain payments rail I built. 1,746 passing tests. A rebate contract I took from
> idea to fuzz-proven and live on two testnets in a single day.
>
> Every claim on this site links to something you can open — a repo, a block explorer, a live
> product. Nothing here is a screenshot of a promise.

## [2:20 – 2:45] — For the person looking

> And it's honest about what it isn't. There's a second view — a **Cabinet** — a traditional
> resume for anyone who wants it, one click away. *(tap the toggle)* Because the site isn't
> built for me. It's built for the person looking. That's the whole lesson: it has to work for
> **them**, in their 30 seconds, on their phone — not just look good to the person who made it.

## [2:45 – 3:00] — Close

> It's live right now — **doble196.github.io** — pull it up on your phone. Reasoning first.
> Receipts, not adjectives. Built for you, not for me.
>
> That's the portfolio. Thank you.

---

## Delivery notes

- **The one gotcha that can wreck the demo:** the auto-reveal **cancels if you interact first.**
  Load the page, then keep your hands off for ~2 seconds and let it open itself — that
  self-reveal *is* the "seconds 0–8" story. Click too early and you lose the best beat.
- **Fallback:** the site is static and already loaded, but have a screenshot of the expanded
  tree ready in case wifi dies. Never demo without a fallback.
- **If you're at 2:30 and running long:** cut the receipts detail — go from the UX turn (1:40)
  straight to the close. Thesis → the 30-second fix → "built for the person looking" are the
  three beats that must survive.
- **Likely questions, one-liners ready:**
  - *"Why a tree instead of a normal site?"* → "Because the medium is the message — a systems
    thinker should have a portfolio that's a system. But I made sure it still works for someone
    who hates that idea: that's the Cabinet."
  - *"Isn't auto-expanding it taking control from the user?"* → "One time, on load, and it stops
    the instant they touch it. It's a self-demo, not a hijack — and it respects reduced-motion."
  - *"What's your actual focus?"* → "Payments and on-chain infrastructure. The other seven are
    range; that's the specialty."
- **The honest close if asked "is it done?":** "It's verified to work and to fit — desktop and
  mobile. It's not yet verified to *land* — I haven't put it in front of a stranger with a
  timer. That's my next step." (Naming that is stronger than claiming perfection.)
