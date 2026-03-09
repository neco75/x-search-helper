/**
 * X Search Helper - Popup Logic
 * 検索オプションからクエリ文字列を構築し、Xで検索を実行する
 */

document.addEventListener('DOMContentLoaded', () => {
    // カスタム辞書データ
    let currentMessages = {};

    // =============================================
    // 言語設定と言語切り替え（i18nからfetchへの移行）
    // =============================================
    const langToggle = document.getElementById('langToggle');
    const currentLangLabel = document.getElementById('currentLangLabel');

    // システムの言語を取得して初期値を決定
    function getDefaultLang() {
        return chrome.i18n.getUILanguage().startsWith('ja') ? 'ja' : 'en';
    }

    async function loadTranslations(lang) {
        try {
            const response = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
            currentMessages = await response.json();

            // UIのテキストを更新
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (currentMessages[key] && currentMessages[key].message) {
                    el.innerHTML = currentMessages[key].message;
                }
            });
            document.querySelectorAll('[data-i18n-title]').forEach(el => {
                const key = el.getAttribute('data-i18n-title');
                if (currentMessages[key] && currentMessages[key].message) {
                    el.title = currentMessages[key].message;
                }
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (currentMessages[key] && currentMessages[key].message) {
                    el.placeholder = currentMessages[key].message;
                }
            });

            // ラベルの更新
            currentLangLabel.textContent = lang.toUpperCase();

            // プレビューの再描画
            updatePreview();
        } catch (e) {
            console.error('Failed to load translations:', e);
        }
    }

    // `getMessage` を `chrome.i18n` の代わりに機能させるラッパー関数
    function getMessage(key) {
        return (currentMessages[key] && currentMessages[key].message) || '';
    }

    // 初期化と言語切り替えイベント
    chrome.storage.sync.get({ appLang: getDefaultLang() }, (result) => {
        let currentLang = result.appLang;
        loadTranslations(currentLang);

        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'ja' ? 'en' : 'ja';
            chrome.storage.sync.set({ appLang: currentLang }, () => {
                loadTranslations(currentLang);
            });
        });
    });

    // DOM要素の取得
    const queryPreview = document.getElementById('queryPreview');
    const searchBtn = document.getElementById('searchBtn');
    const copyBtn = document.getElementById('copyBtn');
    const resetBtn = document.getElementById('resetBtn');
    const themeToggle = document.getElementById('themeToggle');

    // テキスト入力フィールド
    const fields = {
        keywords: document.getElementById('keywords'),
        exactPhrase: document.getElementById('exactPhrase'),
        orKeywords: document.getElementById('orKeywords'),
        excludeKeywords: document.getElementById('excludeKeywords'),
        hashtag: document.getElementById('hashtag'),
        cashtag: document.getElementById('cashtag'),
        fromUser: document.getElementById('fromUser'),
        toUser: document.getElementById('toUser'),
        mentionUser: document.getElementById('mentionUser'),
        urlFilter: document.getElementById('urlFilter'),
        sinceDate: document.getElementById('sinceDate'),
        untilDate: document.getElementById('untilDate'),
        minFaves: document.getElementById('minFaves'),
        minRetweets: document.getElementById('minRetweets'),
        minReplies: document.getElementById('minReplies'),
        langFilter: document.getElementById('langFilter'),
        nearCity: document.getElementById('nearCity'),
        withinDistance: document.getElementById('withinDistance'),
    };

    // チェックボックス
    const checkboxes = {
        filterImages: document.getElementById('filterImages'),
        filterVideos: document.getElementById('filterVideos'),
        filterMedia: document.getElementById('filterMedia'),
        filterLinks: document.getElementById('filterLinks'),
        filterVerified: document.getElementById('filterVerified'),
        excludeReplies: document.getElementById('excludeReplies'),
        excludeRetweets: document.getElementById('excludeRetweets'),
        filterQuote: document.getElementById('filterQuote'),
        filterFollows: document.getElementById('filterFollows'),
    };

    // =============================================
    // ヘルプリファレンスデータ (Syntax mapping only)
    // =============================================
    const helpSyntax = {
        keywords: 'word1 word2',
        exact: '"exact phrase"',
        or: 'word1 OR word2',
        exclude: '-word',
        hashtag: '#hashtag',
        cashtag: '$SYMBOL',
        from: 'from:username',
        to: 'to:username',
        mention: '@username',
        follows: 'filter:follows',
        filterImages: 'filter:images',
        filterVideos: 'filter:videos',
        filterMedia: 'filter:media',
        filterLinks: 'filter:links',
        filterVerified: 'filter:verified',
        excludeReplies: '-filter:replies',
        excludeRetweets: '-filter:retweets',
        filterQuote: 'filter:quote',
        url: 'url:keyword',
        since: 'since:YYYY-MM-DD',
        until: 'until:YYYY-MM-DD',
        minFaves: 'min_faves:N',
        minRetweets: 'min_retweets:N',
        minReplies: 'min_replies:N',
        lang: 'lang:code',
        near: 'near:city',
        within: 'within:distance'
    };

    // =============================================
    // テーマ切替
    // =============================================
    const themeIconDark = document.querySelector('.theme-icon-dark');
    const themeIconLight = document.querySelector('.theme-icon-light');

    // 保存されたテーマを復元
    const savedTheme = localStorage.getItem('xsearch-theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light');
        themeIconDark.style.display = 'none';
        themeIconLight.style.display = 'block';
    }

    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light');
        themeIconDark.style.display = isLight ? 'none' : 'block';
        themeIconLight.style.display = isLight ? 'block' : 'none';
        localStorage.setItem('xsearch-theme', isLight ? 'light' : 'dark');
    });

    // =============================================
    // ヘルプポップオーバー
    // =============================================
    const helpPopover = document.getElementById('helpPopover');
    const helpOverlay = document.getElementById('helpOverlay');
    const helpTitle = document.getElementById('helpTitle');
    const helpBody = document.getElementById('helpBody');
    const helpClose = document.getElementById('helpClose');

    function showHelp(key) {
        const title = getMessage(`help_${key}_title`);
        const desc = getMessage(`help_${key}_desc`);
        const example = getMessage(`help_${key}_example`);

        if (!title) return; // key mismatch

        helpTitle.innerHTML = title;
        helpBody.innerHTML = `
            <div class="help-desc">${desc}</div>
            <code class="help-syntax">${helpSyntax[key]}</code>
            <div class="help-example">${example}</div>
        `;

        helpPopover.style.display = 'block';
        helpOverlay.style.display = 'block';
    }

    function closeHelp() {
        helpPopover.style.display = 'none';
        helpOverlay.style.display = 'none';
    }

    // ?ボタンのクリックイベント（イベント委譲）
    document.addEventListener('click', (e) => {
        const helpBtn = e.target.closest('.help-btn');
        if (helpBtn) {
            e.preventDefault();
            e.stopPropagation();
            const key = helpBtn.dataset.help;
            showHelp(key);
        }
    });

    helpClose.addEventListener('click', closeHelp);
    helpOverlay.addEventListener('click', closeHelp);

    // ESCキーで閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeHelp();
    });

    // =============================================
    // アコーディオン
    // =============================================
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isOpen = header.classList.contains('active');

            if (isOpen) {
                header.classList.remove('active');
                content.classList.remove('open');
            } else {
                header.classList.add('active');
                content.classList.add('open');
            }
        });
    });

    // =============================================
    // クエリ構築
    // =============================================
    function buildQuery() {
        const parts = [];

        // キーワード（AND検索）
        const kw = fields.keywords.value.trim();
        if (kw) {
            parts.push(kw);
        }

        // 完全一致
        const exact = fields.exactPhrase.value.trim();
        if (exact) {
            parts.push(`"${exact}"`);
        }

        // OR検索
        const orKw = fields.orKeywords.value.trim();
        if (orKw) {
            const orTerms = orKw.split(/[,、]/).map(t => t.trim()).filter(Boolean);
            if (orTerms.length > 1) {
                parts.push(`(${orTerms.join(' OR ')})`);
            } else if (orTerms.length === 1) {
                parts.push(orTerms[0]);
            }
        }

        // 除外
        const exclude = fields.excludeKeywords.value.trim();
        if (exclude) {
            const excludeTerms = exclude.split(/[,、]/).map(t => t.trim()).filter(Boolean);
            excludeTerms.forEach(term => {
                parts.push(`-${term}`);
            });
        }

        // ハッシュタグ
        const ht = fields.hashtag.value.trim().replace(/^#/, '');
        if (ht) {
            parts.push(`#${ht}`);
        }

        // キャッシュタグ
        const ct = fields.cashtag.value.trim().replace(/^\$/, '');
        if (ct) {
            parts.push(`$${ct}`);
        }

        // ユーザー
        const from = fields.fromUser.value.trim().replace(/^@/, '');
        if (from) {
            parts.push(`from:${from}`);
        }

        const to = fields.toUser.value.trim().replace(/^@/, '');
        if (to) {
            parts.push(`to:${to}`);
        }

        const mention = fields.mentionUser.value.trim().replace(/^@/, '');
        if (mention) {
            parts.push(`@${mention}`);
        }

        // フォロー中のみ
        if (checkboxes.filterFollows.checked) parts.push('filter:follows');

        // コンテンツフィルター（チェックボックス）
        if (checkboxes.filterImages.checked) parts.push('filter:images');
        if (checkboxes.filterVideos.checked) parts.push('filter:videos');
        if (checkboxes.filterMedia.checked) parts.push('filter:media');
        if (checkboxes.filterLinks.checked) parts.push('filter:links');
        if (checkboxes.filterVerified.checked) parts.push('filter:verified');
        if (checkboxes.excludeReplies.checked) parts.push('-filter:replies');
        if (checkboxes.excludeRetweets.checked) parts.push('-filter:retweets');
        if (checkboxes.filterQuote.checked) parts.push('filter:quote');

        // URL
        const url = fields.urlFilter.value.trim();
        if (url) {
            parts.push(`url:${url}`);
        }

        // 日付
        const since = fields.sinceDate.value;
        if (since) {
            parts.push(`since:${since}`);
        }

        const until = fields.untilDate.value;
        if (until) {
            parts.push(`until:${until}`);
        }

        // エンゲージメント
        const minFaves = fields.minFaves.value;
        if (minFaves && parseInt(minFaves) > 0) {
            parts.push(`min_faves:${minFaves}`);
        }

        const minRT = fields.minRetweets.value;
        if (minRT && parseInt(minRT) > 0) {
            parts.push(`min_retweets:${minRT}`);
        }

        const minRep = fields.minReplies.value;
        if (minRep && parseInt(minRep) > 0) {
            parts.push(`min_replies:${minRep}`);
        }

        // 言語
        const lang = fields.langFilter.value;
        if (lang) {
            parts.push(`lang:${lang}`);
        }

        // 位置情報
        const near = fields.nearCity.value.trim();
        if (near) {
            parts.push(`near:${near}`);
        }

        const within = fields.withinDistance.value.trim();
        if (within) {
            parts.push(`within:${within}`);
        }

        return parts.join(' ');
    }

    // =============================================
    // プレビュー更新
    // =============================================
    function updatePreview() {
        const query = buildQuery();
        const hasQuery = query.length > 0;

        queryPreview.textContent = hasQuery ? query : getMessage('queryPreviewDefault');
        queryPreview.classList.toggle('active', hasQuery);
        searchBtn.disabled = !hasQuery;
        copyBtn.disabled = !hasQuery;
    }

    // 全入力にイベントリスナーを追加
    Object.values(fields).forEach(field => {
        field.addEventListener('input', updatePreview);
        field.addEventListener('change', updatePreview);
    });

    Object.values(checkboxes).forEach(cb => {
        cb.addEventListener('change', updatePreview);
    });

    // =============================================
    // 検索実行
    // =============================================
    searchBtn.addEventListener('click', () => {
        const query = buildQuery();
        if (!query) return;

        const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query`;
        chrome.tabs.create({ url: searchUrl });
    });

    // =============================================
    // クエリコピー
    // =============================================
    copyBtn.addEventListener('click', async () => {
        const query = buildQuery();
        if (!query) return;

        try {
            await navigator.clipboard.writeText(query);
            copyBtn.classList.add('copied');
            showToast(getMessage("toastCopied"));
            setTimeout(() => {
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            // フォールバック
            const textarea = document.createElement('textarea');
            textarea.value = query;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            copyBtn.classList.add('copied');
            showToast(getMessage("toastCopied"));
            setTimeout(() => {
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    });

    // =============================================
    // リセット
    // =============================================
    resetBtn.addEventListener('click', () => {
        Object.values(fields).forEach(field => {
            if (field.tagName === 'SELECT') {
                field.selectedIndex = 0;
            } else {
                field.value = '';
            }
        });

        Object.values(checkboxes).forEach(cb => {
            cb.checked = false;
        });

        updatePreview();
        showToast(getMessage("toastReset"));
    });

    // =============================================
    // トースト通知
    // =============================================
    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // =============================================
    // フォローボタン設定トグル
    // =============================================
    const showFollowButton = document.getElementById('showFollowButton');

    // 保存された設定を復元
    chrome.storage.sync.get({ showFollowButton: false }, (result) => {
        showFollowButton.checked = result.showFollowButton;
    });

    // トグル変更時に設定を保存
    showFollowButton.addEventListener('change', () => {
        const enabled = showFollowButton.checked;
        chrome.storage.sync.set({ showFollowButton: enabled }, () => {
            showToast(enabled ? getMessage("toastFollowOn") : getMessage("toastFollowOff"));
        });
    });

    // =============================================
    // 背景画像カスタマイズ
    // =============================================
    const enableBgImage = document.getElementById('enableBgImage');
    const bgImageControls = document.getElementById('bgImageControls');
    const bgImageFile = document.getElementById('bgImageFile');
    const bgImagePreview = document.getElementById('bgImagePreview');
    const bgImageClear = document.getElementById('bgImageClear');
    const bgOpacity = document.getElementById('bgOpacity');
    const bgOpacityValue = document.getElementById('bgOpacityValue');
    const bgBlur = document.getElementById('bgBlur');
    const bgBlurValue = document.getElementById('bgBlurValue');

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

    // コントロールパネルの表示/非表示
    function toggleBgControls(enabled) {
        bgImageControls.style.display = enabled ? 'block' : 'none';
    }

    // プレビューに画像を表示
    function showBgPreview(dataUrl) {
        if (dataUrl) {
            bgImagePreview.innerHTML = `<img src="${dataUrl}" alt="preview">`;
            bgImagePreview.classList.add('has-image');
        } else {
            bgImagePreview.innerHTML = `<span class="bg-image-placeholder" data-i18n="bgImageNoImage">${getMessage('bgImageNoImage') || '画像が選択されていません'}</span>`;
            bgImagePreview.classList.remove('has-image');
        }
    }

    // 保存された背景画像設定を復元
    chrome.storage.sync.get({
        enableBgImage: false,
        bgOpacity: 30,
        bgBlur: 0
    }, (syncResult) => {
        enableBgImage.checked = syncResult.enableBgImage;
        bgOpacity.value = syncResult.bgOpacity;
        bgOpacityValue.textContent = syncResult.bgOpacity + '%';
        bgBlur.value = syncResult.bgBlur;
        bgBlurValue.textContent = syncResult.bgBlur + 'px';
        toggleBgControls(syncResult.enableBgImage);
    });

    // local storageから画像データを復元
    chrome.storage.local.get({ bgImageData: null }, (localResult) => {
        if (localResult.bgImageData) {
            showBgPreview(localResult.bgImageData);
        }
    });

    // トグル変更
    enableBgImage.addEventListener('change', () => {
        const enabled = enableBgImage.checked;
        toggleBgControls(enabled);
        chrome.storage.sync.set({ enableBgImage: enabled });
    });

    // ファイル選択
    bgImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // サイズチェック
        if (file.size > MAX_IMAGE_SIZE) {
            showToast(getMessage('toastBgImageTooLarge'));
            bgImageFile.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            showBgPreview(dataUrl);
            chrome.storage.local.set({ bgImageData: dataUrl }, () => {
                showToast(getMessage('toastBgImageSet'));
            });
        };
        reader.readAsDataURL(file);
    });

    // 画像クリア
    bgImageClear.addEventListener('click', () => {
        showBgPreview(null);
        bgImageFile.value = '';
        chrome.storage.local.remove('bgImageData', () => {
            showToast(getMessage('toastBgImageCleared'));
        });
    });

    // 透過率スライダー
    bgOpacity.addEventListener('input', () => {
        bgOpacityValue.textContent = bgOpacity.value + '%';
    });
    bgOpacity.addEventListener('change', () => {
        chrome.storage.sync.set({ bgOpacity: parseInt(bgOpacity.value) });
    });

    // ぼかしスライダー
    bgBlur.addEventListener('input', () => {
        bgBlurValue.textContent = bgBlur.value + 'px';
    });
    bgBlur.addEventListener('change', () => {
        chrome.storage.sync.set({ bgBlur: parseInt(bgBlur.value) });
    });

    // 初期状態を設定
    updatePreview();
});
