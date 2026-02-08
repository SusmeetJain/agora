# Canon Format

`canon.json` is the only runtime content file the frontend reads.

## Top-level keys

- `meta`: brand and edition metadata.
- `authors`: all speaker profiles referenced by posts.
- `posts`: all feed items and conversation items.

## Post model

Each post must include:

- `id`: stable unique id.
- `author_id`: must exist in `authors`.
- `text`: rendered copy shown in UI.
- `created_at`: ISO 8601 UTC date-time.
- `rank`: integer feed ordering key (higher appears earlier).
- `reply_to`: post id or `null`.
- `quote_of`: post id or `null`.
- `topic_tags`: 1+ normalized tags.
- `source_refs`: optional source artifacts used by editors.
- `metrics`: integer counts for `likes`, `replies`, `quotes`.

## Graph constraints

- `reply_to` and `quote_of` must reference existing post ids when non-null.
- Replies should not form cycles.
- A post may both reply and quote at the same time.

## Editorial constraints

- Preserve philosopher voice and worldview.
- Keep text contemporary in cadence, but not slang-saturated.
- For sensitive topics, prefer commentary on discourse and evidence quality over unsourced factual claims.
- If a line cannot be defended by source material, cut it.

## Validation

Schema: `content/canon.schema.json`

Run:

```bash
node scripts/validate-canon.mjs
```
