# Scripts

One-off tooling, not part of the app. Node builtins only.

```bash
node scripts/scrape-multi-supplier.js
```

Walks the three seed suppliers' category pages, matches each of the 50 crops to
a category on each site, and writes `scripts/plants-multi-supplier.json` — a
full copy of `data/plants.json` with its `seed_sources` arrays rebuilt. It
deliberately does not write to `data/plants.json`: diff the output, then copy it
across if it looks right.

`scrape-johnnys-seeds.js` is the earlier single-supplier version, kept because
it also collects per-category product counts the multi-supplier script does not.

Both hit live websites whose markup will change. The parsing is a handful of
regexes over the HTML, so expect to fix them rather than to run them.

See [`../docs/seed-suppliers.md`](../docs/seed-suppliers.md) for what the links
are used for and which crops each supplier is missing.
