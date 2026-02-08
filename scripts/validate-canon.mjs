import fs from "node:fs";
import path from "node:path";

const canonPath = path.resolve("content/canon.json");
const schemaPath = path.resolve("content/canon.schema.json");

function fail(message) {
  console.error(`ERROR: ${message}`);
}

function parseJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Unable to parse JSON at ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

if (!fs.existsSync(canonPath)) {
  fail(`Missing file: ${canonPath}`);
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) {
  fail(`Missing file: ${schemaPath}`);
  process.exit(1);
}

const canon = parseJson(canonPath);
parseJson(schemaPath);

const issues = [];

if (!canon || typeof canon !== "object") {
  issues.push("Top-level canon must be an object.");
}

for (const key of ["meta", "authors", "posts"]) {
  if (!(key in canon)) {
    issues.push(`Missing top-level key: ${key}`);
  }
}

if (!Array.isArray(canon.authors) || canon.authors.length === 0) {
  issues.push("authors must be a non-empty array.");
}

if (!Array.isArray(canon.posts) || canon.posts.length === 0) {
  issues.push("posts must be a non-empty array.");
}

const authorIds = new Set();
if (Array.isArray(canon.authors)) {
  for (const author of canon.authors) {
    if (!author || typeof author !== "object") {
      issues.push("Each author must be an object.");
      continue;
    }

    if (!author.id || typeof author.id !== "string") {
      issues.push("Each author must include a string id.");
      continue;
    }

    if (authorIds.has(author.id)) {
      issues.push(`Duplicate author id: ${author.id}`);
    }

    authorIds.add(author.id);
  }
}

const postIds = new Set();
const postById = new Map();
if (Array.isArray(canon.posts)) {
  for (const post of canon.posts) {
    if (!post || typeof post !== "object") {
      issues.push("Each post must be an object.");
      continue;
    }

    if (!post.id || typeof post.id !== "string") {
      issues.push("Each post must include a string id.");
      continue;
    }

    if (postIds.has(post.id)) {
      issues.push(`Duplicate post id: ${post.id}`);
    }

    postIds.add(post.id);
    postById.set(post.id, post);

    if (!authorIds.has(post.author_id)) {
      issues.push(`Post ${post.id} references unknown author_id ${post.author_id}`);
    }

    if (typeof post.text !== "string" || post.text.trim().length === 0) {
      issues.push(`Post ${post.id} has empty text.`);
    }

    if (!Number.isInteger(post.rank)) {
      issues.push(`Post ${post.id} rank must be an integer.`);
    }

    if (!Array.isArray(post.topic_tags) || post.topic_tags.length === 0) {
      issues.push(`Post ${post.id} must include at least one topic tag.`);
    }

    if (!post.metrics || typeof post.metrics !== "object") {
      issues.push(`Post ${post.id} must include metrics.`);
    } else {
      for (const metric of ["likes", "replies", "quotes"]) {
        if (!Number.isInteger(post.metrics[metric]) || post.metrics[metric] < 0) {
          issues.push(`Post ${post.id} has invalid metrics.${metric}`);
        }
      }
    }

    if (typeof post.created_at !== "string" || Number.isNaN(Date.parse(post.created_at))) {
      issues.push(`Post ${post.id} has invalid created_at.`);
    }
  }
}

function checkReference(post, key) {
  const ref = post[key];
  if (ref === null || ref === undefined) {
    return;
  }

  if (typeof ref !== "string" || ref.length === 0) {
    issues.push(`Post ${post.id} has invalid ${key}; expected string or null.`);
    return;
  }

  if (!postIds.has(ref)) {
    issues.push(`Post ${post.id} references missing ${key} post ${ref}`);
  }

  if (post.id === ref) {
    issues.push(`Post ${post.id} cannot reference itself in ${key}`);
  }
}

if (Array.isArray(canon.posts)) {
  for (const post of canon.posts) {
    checkReference(post, "reply_to");
    checkReference(post, "quote_of");
  }
}

// Detect cycles in reply chains
const visiting = new Set();
const visited = new Set();

function dfs(postId) {
  if (visited.has(postId)) {
    return;
  }

  if (visiting.has(postId)) {
    issues.push(`Reply cycle detected at post ${postId}`);
    return;
  }

  visiting.add(postId);
  const post = postById.get(postId);
  const parent = post?.reply_to;

  if (parent && postById.has(parent)) {
    dfs(parent);
  }

  visiting.delete(postId);
  visited.add(postId);
}

for (const postId of postIds) {
  dfs(postId);
}

if (issues.length > 0) {
  console.error(`Canon validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log("Canon validation passed.");
console.log(`Authors: ${authorIds.size}`);
console.log(`Posts: ${postIds.size}`);
