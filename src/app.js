const CANON_PATH = "content/canon.json";
const LIKES_STORAGE_KEY = "agoraWireLikes";

const icons = {
  verified:
    '<svg class="verified" viewBox="0 0 22 22" aria-hidden="true"><path fill="currentColor" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>',
  heartOutline:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>',
  heartFilled:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>'
};

const state = {
  canon: null,
  authorsById: new Map(),
  postsById: new Map(),
  sortedPosts: [],
  likedPostIds: new Set()
};

const viewRoot = document.getElementById("viewRoot");
const topbarTitle = document.getElementById("topbarTitle");
const topbarSubtitle = document.getElementById("topbarSubtitle");
const backBtn = document.getElementById("backBtn");
const logoBtn = document.getElementById("logoBtn");
const mobileLogoBtn = document.getElementById("mobileLogoBtn");

init();

async function init() {
  bindGlobalEvents();

  try {
    await loadCanon();
  } catch (error) {
    renderFatalError(error);
    return;
  }

  window.addEventListener("hashchange", renderRoute);
  renderRoute();
}

function bindGlobalEvents() {
  const goHome = () => navigate("/");

  logoBtn.addEventListener("click", goHome);
  mobileLogoBtn.addEventListener("click", goHome);

  backBtn.addEventListener("click", () => {
    if (window.history.length > 1 && window.location.hash) {
      window.history.back();
      return;
    }

    navigate("/");
  });
}

async function loadCanon() {
  const response = await fetch(CANON_PATH, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to load canon file (${response.status}).`);
  }

  const canon = await response.json();

  state.canon = canon;
  state.authorsById = new Map(canon.authors.map((author) => [author.id, author]));
  state.postsById = new Map(canon.posts.map((post) => [post.id, post]));
  state.sortedPosts = [...canon.posts].sort(sortPosts);
  state.likedPostIds = loadLikedSet();

  document.title = canon.meta.brand_name;
}

function loadLikedSet() {
  const raw = localStorage.getItem(LIKES_STORAGE_KEY);
  if (!raw) {
    return new Set();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function persistLikedSet() {
  localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify([...state.likedPostIds]));
}

function parseRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const segments = hash.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { name: "feed" };
  }

  if (segments[0] === "profile" && segments[1]) {
    return { name: "profile", authorId: decodeURIComponent(segments[1]) };
  }

  if (segments[0] === "post" && segments[1]) {
    return { name: "post", postId: decodeURIComponent(segments[1]) };
  }

  return { name: "not_found" };
}

function navigate(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (window.location.hash === `#${normalized}`) {
    renderRoute();
    return;
  }
  window.location.hash = normalized;
}

function renderRoute() {
  if (!state.canon) {
    return;
  }

  const route = parseRoute();

  if (route.name === "feed") {
    renderFeedView();
    return;
  }

  if (route.name === "profile") {
    if (!state.authorsById.has(route.authorId)) {
      navigate("/");
      return;
    }

    renderProfileView(route.authorId);
    return;
  }

  if (route.name === "post") {
    if (!state.postsById.has(route.postId)) {
      navigate("/");
      return;
    }

    renderPostView(route.postId);
    return;
  }

  navigate("/");
}

function setTopbar({ title, subtitle, showBack }) {
  topbarTitle.textContent = title;
  topbarSubtitle.textContent = subtitle || "";
  topbarSubtitle.classList.toggle("hidden", !subtitle);
  backBtn.classList.toggle("hidden", !showBack);
}

function renderFeedView() {
  setTopbar({
    title: "Home",
    subtitle: "",
    showBack: false
  });

  viewRoot.innerHTML = "";

  const editorAuthor = state.authorsById.get("agora") || state.canon.authors[0];
  const intro = document.createElement("section");
  intro.className = "edition-note";

  const introPost = document.createElement("div");
  introPost.className = "post inset";

  const introAvatarWrap = document.createElement("div");
  introAvatarWrap.className = "avatar-wrap";
  introAvatarWrap.appendChild(createAvatarElement(editorAuthor));

  const introMain = document.createElement("div");
  introMain.className = "post-main";

  const introText = document.createElement("p");
  introText.className = "post-text edition-title";
  introText.textContent = state.canon.meta.edition_title;

  const introBody = document.createElement("p");
  introBody.className = "post-text";
  introBody.textContent = state.canon.meta.edition_theme;

  const introTags = document.createElement("div");
  introTags.className = "post-tags";
  const introTag = document.createElement("span");
  introTag.className = "edition-meta";
  introTag.textContent = state.canon.meta.content_note;
  introTags.appendChild(introTag);

  introMain.appendChild(introText);
  introMain.appendChild(introBody);
  introMain.appendChild(introTags);
  introPost.appendChild(introAvatarWrap);
  introPost.appendChild(introMain);
  intro.appendChild(introPost);

  viewRoot.appendChild(intro);
  viewRoot.appendChild(renderPostList(state.sortedPosts, { clickable: true, showTags: false }));
  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderProfileView(authorId) {
  const author = state.authorsById.get(authorId);

  setTopbar({
    title: author.display_name,
    subtitle: "",
    showBack: true
  });

  viewRoot.innerHTML = "";

  const cover = document.createElement("section");
  cover.className = "profile-cover";
  cover.style.background = `radial-gradient(ellipse at 20% 45%, ${author.accent_color}55 0%, transparent 55%), radial-gradient(ellipse at 80% 10%, ${author.accent_color}45 0%, transparent 45%), linear-gradient(130deg, #060606 0%, #0e0e0e 100%)`;

  const body = document.createElement("section");
  body.className = "profile-body";

  const profileAvatar = createAvatarElement(author, true);
  body.innerHTML = `
    <h2 class="profile-name">${escapeHtml(author.display_name)}${author.verified ? icons.verified : ""}</h2>
    <p class="profile-username">${escapeHtml(author.username)}</p>
    <p class="profile-bio">${escapeHtml(author.bio)}</p>
    <p class="profile-meta">${escapeHtml(author.school)} • ${escapeHtml(author.location)} • ${escapeHtml(author.era)}</p>
    <div class="profile-stats">
      <span><strong class="stat-number">${escapeHtml(author.following)}</strong> Following</span>
      <span><strong class="stat-number">${escapeHtml(author.followers)}</strong> Followers</span>
    </div>
  `;
  body.prepend(profileAvatar);

  const posts = state.sortedPosts.filter((post) => post.author_id === authorId);

  viewRoot.appendChild(cover);
  viewRoot.appendChild(body);

  if (posts.length === 0) {
    viewRoot.appendChild(renderEmptyState("No posts in this edition."));
  } else {
    viewRoot.appendChild(renderPostList(posts, { clickable: true, showTags: false }));
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderPostView(postId) {
  const focusPost = state.postsById.get(postId);

  setTopbar({
    title: "Post",
    subtitle: "",
    showBack: true
  });

  viewRoot.innerHTML = "";

  const parentChain = getParentChain(focusPost);
  parentChain.forEach((parentPost) => {
    const parentCard = renderPostCard(parentPost, {
      clickable: true,
      showTags: false,
      showActions: false
    });
    parentCard.classList.add("thread-parent");
    viewRoot.appendChild(parentCard);

    const line = document.createElement("div");
    line.className = "context-line";
    viewRoot.appendChild(line);
  });

  viewRoot.appendChild(
    renderPostCard(focusPost, {
      clickable: false,
      inset: true,
      showTags: true,
      emphasized: true
    })
  );

  const replies = getDirectReplies(postId);
  const quotes = getDirectQuotes(postId);

  if (replies.length > 0) {
    viewRoot.appendChild(renderThreadLabel("Replies"));
    viewRoot.appendChild(renderPostList(replies, { clickable: true, showTags: false }));
  }

  if (quotes.length > 0) {
    viewRoot.appendChild(renderThreadLabel("Quote posts"));
    viewRoot.appendChild(renderPostList(quotes, { clickable: true, showTags: false }));
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderPostList(posts, options = {}) {
  const list = document.createElement("ul");
  list.className = "post-list";

  posts.forEach((post, index) => {
    const item = document.createElement("li");
    item.style.animationDelay = `${Math.min(index, 15) * 40}ms`;
    item.appendChild(renderPostCard(post, options));
    list.appendChild(item);
  });

  return list;
}

function renderPostCard(post, options = {}) {
  const {
    clickable = true,
    inset = false,
    showTags = true,
    showActions = true,
    emphasized = false
  } = options;

  const author = state.authorsById.get(post.author_id);
  const card = document.createElement("article");
  card.className = `post${inset ? " inset" : ""}${emphasized ? " emphasized" : ""}`;

  const avatarWrap = document.createElement("div");
  avatarWrap.className = "avatar-wrap";
  avatarWrap.appendChild(createAvatarElement(author));

  avatarWrap.addEventListener("click", (event) => {
    event.stopPropagation();
    navigate(`/profile/${author.id}`);
  });

  const main = document.createElement("div");
  main.className = "post-main";

  const head = document.createElement("div");
  head.className = "post-head";

  const name = document.createElement("span");
  name.className = "name link";
  name.textContent = author.display_name;
  name.addEventListener("click", (event) => {
    event.stopPropagation();
    navigate(`/profile/${author.id}`);
  });

  if (emphasized) {
    const nameRow = document.createElement("div");
    nameRow.className = "name-row";
    nameRow.appendChild(name);

    if (author.verified) {
      const badge = document.createElement("span");
      badge.innerHTML = icons.verified;
      nameRow.appendChild(badge);
    }

    head.appendChild(nameRow);

    const user = document.createElement("span");
    user.className = "user link";
    user.textContent = author.username;
    user.addEventListener("click", (event) => {
      event.stopPropagation();
      navigate(`/profile/${author.id}`);
    });

    head.appendChild(user);
  } else {
    head.appendChild(name);

    if (author.verified) {
      const badge = document.createElement("span");
      badge.innerHTML = icons.verified;
      head.appendChild(badge);
    }

    const user = document.createElement("span");
    user.className = "user link";
    user.textContent = author.username;
    user.addEventListener("click", (event) => {
      event.stopPropagation();
      navigate(`/profile/${author.id}`);
    });

    const dot = document.createElement("span");
    dot.className = "dot";
    dot.textContent = "·";

    const time = document.createElement("span");
    time.className = "timestamp";
    time.textContent = formatRelativeTime(post.created_at);

    head.appendChild(user);
    head.appendChild(dot);
    head.appendChild(time);
  }

  const text = document.createElement("p");
  text.className = "post-text";
  text.textContent = post.text;

  main.appendChild(head);
  main.appendChild(text);

  if (showTags) {
    const editionSlug = state.canon.meta.edition_tag
      || (state.canon.meta.edition_id
        ? state.canon.meta.edition_id.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/-\d+$/, "")
        : null);

    const filteredTags = post.topic_tags.filter((t) => t !== editionSlug);

    if (filteredTags.length > 0) {
      const tags = document.createElement("div");
      tags.className = "post-tags";
      filteredTags.forEach((tagValue) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = "#" + tagValue;
        tags.appendChild(tag);
      });
      main.appendChild(tags);
    }
  }

  if (post.quote_of) {
    const quoteCard = renderQuoteCard(post.quote_of);
    if (quoteCard) {
      main.appendChild(quoteCard);
    }
  }

  if (emphasized) {
    const datetimeLine = document.createElement("div");
    datetimeLine.className = "post-datetime";
    datetimeLine.textContent = formatFullDateTime(post.created_at);
    main.appendChild(datetimeLine);
    main.appendChild(createDivider());

    const statsBar = renderStatsBar(post);
    if (statsBar) {
      main.appendChild(statsBar);
      main.appendChild(createDivider());
    }
  }

  if (showActions) {
    main.appendChild(renderActionRow(post));
    if (emphasized) {
      main.appendChild(createDivider());
    }
  }

  card.appendChild(avatarWrap);
  card.appendChild(main);

  if (clickable) {
    card.addEventListener("click", () => navigate(`/post/${post.id}`));
  }

  return card;
}

function renderQuoteCard(quotedId) {
  const quoted = state.postsById.get(quotedId);
  if (!quoted) {
    return null;
  }

  const quotedAuthor = state.authorsById.get(quoted.author_id);

  const card = document.createElement("div");
  card.className = "quote-card";

  const head = document.createElement("div");
  head.className = "quote-head";

  const avatar = document.createElement("img");
  avatar.className = "quote-avatar";
  avatar.src = quotedAuthor.image;
  avatar.alt = quotedAuthor.display_name;
  avatar.loading = "lazy";
  avatar.width = 20;
  avatar.height = 20;
  avatar.addEventListener("error", () => {
    const fallback = document.createElement("div");
    fallback.className = "quote-avatar-fallback";
    fallback.textContent = (quotedAuthor.display_name && quotedAuthor.display_name[0]) || "?";
    avatar.replaceWith(fallback);
  });
  head.appendChild(avatar);

  const name = document.createElement("span");
  name.className = "name";
  name.textContent = quotedAuthor.display_name;

  const user = document.createElement("span");
  user.className = "user";
  user.textContent = quotedAuthor.username;

  const dot = document.createElement("span");
  dot.className = "dot";
  dot.textContent = "·";

  const time = document.createElement("span");
  time.className = "timestamp";
  time.textContent = formatRelativeTime(quoted.created_at);

  head.appendChild(name);
  head.appendChild(user);
  head.appendChild(dot);
  head.appendChild(time);

  const text = document.createElement("p");
  text.className = "quote-text";
  text.textContent = quoted.text;

  card.appendChild(head);
  card.appendChild(text);

  card.addEventListener("click", (event) => {
    event.stopPropagation();
    navigate(`/post/${quoted.id}`);
  });

  return card;
}

function renderActionRow(post) {
  const row = document.createElement("div");
  row.className = "action-row";

  const likeBtn = document.createElement("button");
  const liked = state.likedPostIds.has(post.id);
  const displayCount = liked ? post.metrics.likes + 1 : post.metrics.likes;

  likeBtn.className = `action-btn like${liked ? " active" : ""}`;
  likeBtn.type = "button";
  likeBtn.dataset.postId = post.id;
  likeBtn.innerHTML = `${liked ? icons.heartFilled : icons.heartOutline}<span class="count">${formatCount(displayCount)}</span>`;

  likeBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleLike(post.id);
  });

  row.appendChild(likeBtn);

  return row;
}

function toggleLike(postId) {
  if (state.likedPostIds.has(postId)) {
    state.likedPostIds.delete(postId);
  } else {
    state.likedPostIds.add(postId);
  }

  persistLikedSet();
  updateLikeButtons(postId);
}

function updateLikeButtons(postId) {
  const post = state.postsById.get(postId);
  if (!post) {
    return;
  }

  const liked = state.likedPostIds.has(postId);
  const displayCount = liked ? post.metrics.likes + 1 : post.metrics.likes;
  const escapedPostId = cssEscape(postId);

  document
    .querySelectorAll(`.action-btn.like[data-post-id="${escapedPostId}"]`)
    .forEach((button) => {
      button.classList.toggle("active", liked);
      button.innerHTML = `${liked ? icons.heartFilled : icons.heartOutline}<span class="count">${formatCount(displayCount)}</span>`;

      if (liked) {
        button.classList.add("animate");
        const svg = button.querySelector("svg");
        if (svg) {
          svg.addEventListener("animationend", () => {
            button.classList.remove("animate");
          }, { once: true });
        }
      }
    });

  document
    .querySelectorAll(`.stats-like-count[data-post-id="${escapedPostId}"]`)
    .forEach((el) => {
      el.innerHTML = '<span class="stat-number">' + formatCount(displayCount) + "</span> Likes";
    });
}

function getParentChain(post) {
  const chain = [];
  let cursor = post;
  const seen = new Set();

  while (cursor.reply_to) {
    const parent = state.postsById.get(cursor.reply_to);
    if (!parent || seen.has(parent.id)) {
      break;
    }

    chain.unshift(parent);
    seen.add(parent.id);
    cursor = parent;
  }

  return chain;
}

function getDirectReplies(postId) {
  return state.sortedPosts.filter((post) => post.reply_to === postId);
}

function getDirectQuotes(postId) {
  return state.sortedPosts.filter((post) => post.quote_of === postId);
}

function createAvatarElement(author, isProfile = false) {
  const image = document.createElement("img");
  image.className = isProfile ? "profile-avatar" : "avatar avatar-link";
  image.src = author.image;
  image.alt = author.display_name;
  image.loading = "lazy";
  image.width = isProfile ? 104 : 40;
  image.height = isProfile ? 104 : 40;
  image.crossOrigin = "anonymous";

  image.addEventListener("error", () => {
    image.replaceWith(createAvatarFallback(author.display_name, isProfile));
  });

  return image;
}

function createAvatarFallback(displayName, isProfile = false) {
  const fallback = document.createElement("div");
  fallback.className = `avatar-fallback${isProfile ? " profile-avatar-fallback" : ""}`;
  fallback.textContent = (displayName && displayName[0]) || "?";
  return fallback;
}

function renderEmptyState(message) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = message;
  return empty;
}

function renderThreadLabel(text) {
  const label = document.createElement("p");
  label.className = "thread-label";
  label.textContent = text;
  return label;
}

function renderFatalError(error) {
  setTopbar({
    title: "Load Error",
    subtitle: "Content unavailable",
    showBack: false
  });

  viewRoot.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = `Could not load canon data. ${error.message}`;
  viewRoot.appendChild(empty);
}

function getPostTier(post) {
  if (post.author_id === "agora") {
    return 3;
  }

  if (post.reply_to) {
    const parent = state.postsById.get(post.reply_to);
    if (parent && parent.author_id !== "agora") {
      return 1;
    }
  }

  if (post.quote_of) {
    const quoted = state.postsById.get(post.quote_of);
    if (quoted && quoted.author_id !== "agora") {
      return 1;
    }
  }

  return 2;
}

function sortPosts(a, b) {
  const tierA = getPostTier(a);
  const tierB = getPostTier(b);

  if (tierA !== tierB) {
    return tierA - tierB;
  }

  if (a.rank !== b.rank) {
    return b.rank - a.rank;
  }

  return Date.parse(b.created_at) - Date.parse(a.created_at);
}

function formatCount(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return `${value}`;
}

function formatFullDateTime(isoDateTime) {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  var timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  var dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return timeStr + " \u00B7 " + dateStr;
}

function createDivider() {
  var div = document.createElement("div");
  div.className = "detail-divider";
  return div;
}

function renderStatsBar(post) {
  var liked = state.likedPostIds.has(post.id);
  var likeCount = liked ? post.metrics.likes + 1 : post.metrics.likes;

  if (likeCount === 0 && post.metrics.replies === 0 && post.metrics.quotes === 0) {
    return null;
  }

  var bar = document.createElement("div");
  bar.className = "stats-bar";

  if (post.metrics.replies > 0) {
    var stat = document.createElement("span");
    stat.className = "stat-item";
    stat.innerHTML = '<span class="stat-number">' + formatCount(post.metrics.replies) + "</span> Replies";
    bar.appendChild(stat);
  }

  if (post.metrics.quotes > 0) {
    var stat = document.createElement("span");
    stat.className = "stat-item";
    stat.innerHTML = '<span class="stat-number">' + formatCount(post.metrics.quotes) + "</span> Quotes";
    bar.appendChild(stat);
  }

  if (likeCount > 0) {
    var stat = document.createElement("span");
    stat.className = "stat-item stats-like-count";
    stat.dataset.postId = post.id;
    stat.innerHTML = '<span class="stat-number">' + formatCount(likeCount) + "</span> Likes";
    bar.appendChild(stat);
  }

  return bar;
}

function formatRelativeTime(isoDateTime) {
  const target = Date.parse(isoDateTime);
  if (Number.isNaN(target)) {
    return "now";
  }

  const deltaMs = Date.now() - target;

  if (deltaMs < 0) {
    return "now";
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (deltaMs < hour) {
    return `${Math.max(1, Math.floor(deltaMs / minute))}m`;
  }

  if (deltaMs < day) {
    return `${Math.floor(deltaMs / hour)}h`;
  }

  if (deltaMs < 7 * day) {
    return `${Math.floor(deltaMs / day)}d`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(target));
}

function cssEscape(value) {
  if (globalThis.CSS && typeof globalThis.CSS.escape === "function") {
    return globalThis.CSS.escape(value);
  }

  return String(value).replace(/["\\]/g, "\\$&");
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
