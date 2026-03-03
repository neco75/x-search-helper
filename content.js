/**
 * X Search Helper - Content Script
 * タイムラインのポストにフォローボタンを常時表示する
 * X内部APIを使用してフォロー状態の取得・切り替えを行う
 */

(function () {
    'use strict';

    let isEnabled = false;
    let observer = null;

    // フォロー状態キャッシュ: { username: { following: bool, userId: string } }
    const followCache = new Map();

    // API呼び出しのデバウンス用
    let pendingUsernames = new Set();
    let lookupTimer = null;

    // X内部APIのBearerトークン（X Web App共通）
    const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

    // =============================================
    // 設定の読み込み
    // =============================================
    function loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({ showFollowButton: false }, (result) => {
                isEnabled = result.showFollowButton;
                resolve(isEnabled);
            });
        });
    }

    // =============================================
    // CSRFトークンの取得
    // =============================================
    function getCsrfToken() {
        const match = document.cookie.match(/ct0=([^;]+)/);
        return match ? match[1] : null;
    }

    // =============================================
    // API共通ヘッダー
    // =============================================
    function getHeaders() {
        const csrf = getCsrfToken();
        if (!csrf) return null;
        return {
            'authorization': `Bearer ${BEARER_TOKEN}`,
            'x-csrf-token': csrf,
            'x-twitter-auth-type': 'OAuth2Session',
            'x-twitter-active-user': 'yes',
            'content-type': 'application/x-www-form-urlencoded',
        };
    }

    // =============================================
    // フォロー状態のバッチ取得
    // =============================================
    async function lookupFollowStatus(usernames) {
        const headers = getHeaders();
        if (!headers || usernames.length === 0) return;

        try {
            // 最大100件ずつバッチ処理
            const batches = [];
            for (let i = 0; i < usernames.length; i += 100) {
                batches.push(usernames.slice(i, i + 100));
            }

            for (const batch of batches) {
                const params = new URLSearchParams({
                    screen_name: batch.join(','),
                });

                const resp = await fetch(
                    `https://x.com/i/api/1.1/friendships/lookup.json?${params.toString()}`,
                    { method: 'GET', headers, credentials: 'include' }
                );

                if (!resp.ok) continue;
                const data = await resp.json();

                for (const user of data) {
                    const isFollowing = user.connections.includes('following');
                    followCache.set(user.screen_name.toLowerCase(), {
                        following: isFollowing,
                        userId: user.id_str,
                    });
                }
            }
        } catch (e) {
            console.error('[X Search Helper] Follow lookup error:', e);
        }
    }

    // =============================================
    // フォロー/アンフォロー実行
    // =============================================
    async function toggleFollow(username, currentlyFollowing) {
        const headers = getHeaders();
        if (!headers) return null;

        const endpoint = currentlyFollowing
            ? 'https://x.com/i/api/1.1/friendships/destroy.json'
            : 'https://x.com/i/api/1.1/friendships/create.json';

        try {
            const resp = await fetch(endpoint, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: `screen_name=${encodeURIComponent(username)}`,
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            const newFollowing = !currentlyFollowing;
            followCache.set(username.toLowerCase(), {
                following: newFollowing,
                userId: followCache.get(username.toLowerCase())?.userId || '',
            });

            return newFollowing;
        } catch (e) {
            console.error('[X Search Helper] Toggle follow error:', e);
            return null;
        }
    }

    // =============================================
    // ユーザー名をポストから抽出
    // =============================================
    function extractUsername(article) {
        const userNameArea = article.querySelector('[data-testid="User-Name"]');
        if (!userNameArea) return null;

        const links = userNameArea.querySelectorAll('a[href^="/"]');
        for (const link of links) {
            const href = link.getAttribute('href');
            const match = href.match(/^\/([A-Za-z0-9_]{1,15})$/);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    // =============================================
    // フォローボタンの状態を更新
    // =============================================
    function updateButtonState(btn, isFollowing) {
        if (isFollowing) {
            btn.classList.add('xsh-following');
            btn.classList.remove('xsh-not-following');
            btn.innerHTML = `<span class="xsh-btn-text">フォロー中</span>`;
            btn.title = 'フォロー解除';
        } else {
            btn.classList.remove('xsh-following');
            btn.classList.add('xsh-not-following');
            btn.innerHTML = `<span class="xsh-btn-text">フォロー</span>`;
            btn.title = 'フォローする';
        }
    }

    // =============================================
    // フォローボタンを作成
    // =============================================
    function createFollowButton(username) {
        const btn = document.createElement('button');
        btn.className = 'xsh-follow-btn xsh-loading';
        btn.setAttribute('data-xsh-username', username.toLowerCase());

        // 読み込み中状態
        btn.innerHTML = `<span class="xsh-btn-text">...</span>`;
        btn.title = '読み込み中...';

        // キャッシュがあれば即座に反映
        const cached = followCache.get(username.toLowerCase());
        if (cached !== undefined) {
            btn.classList.remove('xsh-loading');
            updateButtonState(btn, cached.following);
        }

        // クリックイベント
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const uname = btn.getAttribute('data-xsh-username');
            const cachedState = followCache.get(uname);
            if (!cachedState && !btn.classList.contains('xsh-loading')) return;

            const currentlyFollowing = cachedState?.following || false;

            // ボタンを処理中状態に
            btn.classList.add('xsh-processing');
            btn.disabled = true;

            const result = await toggleFollow(uname, currentlyFollowing);

            btn.classList.remove('xsh-processing');
            btn.disabled = false;

            if (result !== null) {
                // 同じユーザーの全ボタンを更新
                document.querySelectorAll(`[data-xsh-username="${uname}"]`).forEach(b => {
                    updateButtonState(b, result);
                });
            }
        });

        return btn;
    }

    // =============================================
    // ポストにフォローボタンを追加
    // =============================================
    function processArticle(article) {
        if (article.querySelector('.xsh-follow-btn')) return;

        const username = extractUsername(article);
        if (!username) return;

        const userNameArea = article.querySelector('[data-testid="User-Name"]');
        if (!userNameArea) return;

        const btn = createFollowButton(username);
        const wrapper = document.createElement('div');
        wrapper.className = 'xsh-follow-wrapper';
        wrapper.appendChild(btn);
        userNameArea.appendChild(wrapper);

        // フォロー状態を問い合わせキューに追加
        if (!followCache.has(username.toLowerCase())) {
            pendingUsernames.add(username);
            scheduleLookup();
        }
    }

    // =============================================
    // バッチルックアップをスケジュール
    // =============================================
    function scheduleLookup() {
        clearTimeout(lookupTimer);
        lookupTimer = setTimeout(async () => {
            if (pendingUsernames.size === 0) return;

            const batch = [...pendingUsernames];
            pendingUsernames.clear();

            await lookupFollowStatus(batch);

            // ルックアップ完了後、ボタン状態を更新
            batch.forEach(username => {
                const cached = followCache.get(username.toLowerCase());
                if (cached !== undefined) {
                    document.querySelectorAll(`[data-xsh-username="${username.toLowerCase()}"]`).forEach(btn => {
                        btn.classList.remove('xsh-loading');
                        updateButtonState(btn, cached.following);
                    });
                }
            });
        }, 500); // 500ms待って一括取得
    }

    // =============================================
    // 全ポストを処理
    // =============================================
    function processAllArticles() {
        if (!isEnabled) return;
        const articles = document.querySelectorAll('article[data-testid="tweet"]');
        articles.forEach(processArticle);
    }

    // =============================================
    // 全フォローボタンを削除
    // =============================================
    function removeAllFollowButtons() {
        document.querySelectorAll('.xsh-follow-wrapper').forEach((el) => el.remove());
    }

    // =============================================
    // MutationObserver の開始
    // =============================================
    function startObserver() {
        if (observer) observer.disconnect();

        observer = new MutationObserver((mutations) => {
            if (!isEnabled) return;

            let shouldProcess = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    shouldProcess = true;
                    break;
                }
            }

            if (shouldProcess) {
                clearTimeout(startObserver._timer);
                startObserver._timer = setTimeout(processAllArticles, 300);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    // =============================================
    // 設定変更のリスナー
    // =============================================
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== 'sync') return;
        if (changes.showFollowButton) {
            isEnabled = changes.showFollowButton.newValue;
            if (isEnabled) {
                processAllArticles();
            } else {
                removeAllFollowButtons();
            }
        }
    });

    // =============================================
    // 初期化
    // =============================================
    async function init() {
        await loadSettings();
        if (isEnabled) {
            processAllArticles();
        }
        startObserver();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
