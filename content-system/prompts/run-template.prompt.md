# Run Brief

Topic focus:
{{EDITION_THEME}}

Current trend signals:
{{TREND_SIGNALS}}

Source artifacts:
{{SOURCE_LEDGER}}

Edition constraints:
- 20 to 60 posts
- At least 35% of posts are replies or quote-posts
- Include at least 3 direct ideological clashes
- Keep all copy in English

Tag rules:
- Do NOT apply the edition slug as a tag on every post. The edition context is implicit.
- Maximum 3 topic_tags per post. Every tag must justify its presence.
- Every tag must appear on at least 2 posts. No orphan tags.
- Use the three-tier vocabulary from the system prompt: school, tone, and topic tags only.
- Never tag the medium (screenshots, clips, threads).

Voice enforcement:
- Each philosopher must use their signature rhetorical device at least once. Refer to the Voice Guide in the system prompt.
- No two philosophers may make the same argument. If two overlap, one must be a reply that extends or challenges the other.
- Run the swap test: if you change the author_id and the post still reads fine, rewrite it.

Voice roster:
- Plato, Aristotle, Seneca, Marcus Aurelius, Epictetus, Confucius, Lao Tzu, Thoreau, Emerson, Nietzsche

Output:
- One JSON object conforming to `content/canon.schema.json`
- Edition id: {{EDITION_ID}}
- Brand name: {{BRAND_NAME}}
- Include `edition_tag` in meta (the slug for this edition's topic, e.g., "epstein-files")

Quality gate (self-check before returning JSON):
- Read each post aloud. If you cannot tell which philosopher wrote it without seeing the author_id, rewrite it.
- Verify no tag appears on more than 60% of posts.
- Verify every reply or quote adds a new argument, not a restatement.
- Verify no post could apply to a generic scandal. Each must reference something specific to this edition's topic.
