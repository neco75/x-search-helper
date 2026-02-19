/**
 * X Search Helper - Popup Logic
 * 検索オプションからクエリ文字列を構築し、Xで検索を実行する
 */

document.addEventListener('DOMContentLoaded', () => {
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
    // ヘルプリファレンスデータ
    // =============================================
    const helpData = {
        keywords: {
            title: 'キーワード検索（AND）',
            syntax: 'word1 word2',
            desc: '複数のキーワードを<strong>全て含む</strong>ポストを検索します。スペースで区切ります。',
            example: '例: <strong>プログラミング AI</strong> → 「プログラミング」と「AI」の両方を含むポスト'
        },
        exact: {
            title: '完全一致検索',
            syntax: '"exact phrase"',
            desc: '指定したフレーズに<strong>完全一致</strong>するポストを検索します。語順も一致する必要があります。',
            example: '例: <strong>"機械学習 入門"</strong> → 「機械学習 入門」という並びを含むポスト'
        },
        or: {
            title: 'OR検索',
            syntax: 'word1 OR word2',
            desc: '指定したキーワードの<strong>いずれか</strong>を含むポストを検索します。カンマで区切って入力してください。',
            example: '例: <strong>Python,JavaScript</strong> → 「Python OR JavaScript」に変換'
        },
        exclude: {
            title: '除外検索',
            syntax: '-word',
            desc: '指定したキーワードを<strong>含まない</strong>ポストに絞り込みます。カンマで区切って複数指定可能。',
            example: '例: <strong>広告,PR</strong> → 「-広告 -PR」に変換'
        },
        hashtag: {
            title: 'ハッシュタグ検索',
            syntax: '#hashtag',
            desc: '特定の<strong>ハッシュタグ</strong>を含むポストを検索します。#は自動的に付与されます。',
            example: '例: <strong>AI</strong> → 「#AI」を含むポスト'
        },
        cashtag: {
            title: 'キャッシュタグ検索',
            syntax: '$SYMBOL',
            desc: '<strong>株式ティッカーシンボル</strong>など、$記号で始まるタグを検索します。$は自動付与。',
            example: '例: <strong>TSLA</strong> → 「$TSLA」を含むポスト'
        },
        from: {
            title: '投稿者検索',
            syntax: 'from:username',
            desc: '特定のユーザーが<strong>投稿した</strong>ポストのみを検索します。@は不要です。',
            example: '例: <strong>elonmusk</strong> → @elonmuskのポストのみ'
        },
        to: {
            title: '宛先検索',
            syntax: 'to:username',
            desc: '特定のユーザーに<strong>返信した</strong>ポストを検索します。',
            example: '例: <strong>elonmusk</strong> → @elonmusk宛てのリプライ'
        },
        mention: {
            title: 'メンション検索',
            syntax: '@username',
            desc: '特定のユーザーが<strong>言及された</strong>ポストを検索します。',
            example: '例: <strong>NASA</strong> → @NASAが言及されたポスト'
        },
        follows: {
            title: 'フォロー中のみ',
            syntax: 'filter:follows',
            desc: '自分が<strong>フォローしている</strong>アカウントのポストのみに絞り込みます。',
            example: '※ ログイン中のアカウントのフォロー対象が反映されます'
        },
        filterImages: {
            title: '画像フィルター',
            syntax: 'filter:images',
            desc: '<strong>画像を含む</strong>ポストのみを表示します。',
            example: '写真やイラストが含まれるポストを検索したい時に便利'
        },
        filterVideos: {
            title: '動画フィルター',
            syntax: 'filter:videos',
            desc: '<strong>動画を含む</strong>ポストのみを表示します。YouTubeリンクを含むポストも対象。',
            example: '動画コンテンツを探したい時に使用'
        },
        filterMedia: {
            title: 'メディアフィルター',
            syntax: 'filter:media',
            desc: '画像・動画・GIFなど<strong>何らかのメディア</strong>を含むポストを表示します。',
            example: 'テキストのみのポストを除外したい時に便利'
        },
        filterLinks: {
            title: 'リンクフィルター',
            syntax: 'filter:links',
            desc: '<strong>URLを含む</strong>ポストのみを表示します。',
            example: '外部リンクが共有されているポストを検索'
        },
        filterVerified: {
            title: '認証済みフィルター',
            syntax: 'filter:verified',
            desc: '<strong>認証バッジ付き</strong>アカウントのポストのみを表示します。',
            example: '公式・認証アカウントの投稿に絞りたい時に'
        },
        excludeReplies: {
            title: 'リプライ除外',
            syntax: '-filter:replies',
            desc: 'リプライ（返信）を<strong>除外</strong>して、元のポストのみを表示します。',
            example: '会話ではなく独立したポストだけを見たい時に'
        },
        excludeRetweets: {
            title: 'リツイート除外',
            syntax: '-filter:retweets',
            desc: 'リツイート（リポスト）を<strong>除外</strong>して、オリジナルのポストのみを表示します。',
            example: '重複を減らしてオリジナルの投稿だけを見たい時に'
        },
        filterQuote: {
            title: '引用ツイートのみ',
            syntax: 'filter:quote',
            desc: '<strong>引用ツイート</strong>（引用リポスト）のみを表示します。',
            example: '他の人のポストに対するコメント付きリポストを検索'
        },
        url: {
            title: 'URL指定検索',
            syntax: 'url:keyword',
            desc: '特定の<strong>URLを含む</strong>ポストを検索します。ドメイン名やURLの一部を入力。',
            example: '例: <strong>example.com</strong> → example.comへのリンクを含むポスト'
        },
        since: {
            title: '開始日指定',
            syntax: 'since:YYYY-MM-DD',
            desc: '指定した日付<strong>以降</strong>のポストを検索します。',
            example: '例: 2025-01-01 → 2025年1月1日以降のポスト'
        },
        until: {
            title: '終了日指定',
            syntax: 'until:YYYY-MM-DD',
            desc: '指定した日付<strong>以前</strong>のポストを検索します。since:と組み合わせて期間指定が可能。',
            example: '例: since:2025-01-01 + until:2025-12-31 → 2025年のポスト'
        },
        minFaves: {
            title: '最小いいね数',
            syntax: 'min_faves:N',
            desc: '指定した数<strong>以上のいいね</strong>があるポストのみを表示します。',
            example: '例: <strong>100</strong> → 100いいね以上のポスト（バズったポストを探すのに便利）'
        },
        minRetweets: {
            title: '最小リツイート数',
            syntax: 'min_retweets:N',
            desc: '指定した数<strong>以上のリツイート</strong>があるポストのみを表示します。',
            example: '例: <strong>50</strong> → 50RT以上の拡散されたポスト'
        },
        minReplies: {
            title: '最小リプライ数',
            syntax: 'min_replies:N',
            desc: '指定した数<strong>以上のリプライ</strong>があるポストのみを表示します。',
            example: '例: <strong>10</strong> → 10件以上の返信がある議論の盛り上がったポスト'
        },
        lang: {
            title: '言語指定',
            syntax: 'lang:code',
            desc: '指定した<strong>言語</strong>のポストのみを表示します。ISO 639-1言語コードを使用。',
            example: '例: <strong>ja</strong> → 日本語のポストのみ'
        },
        near: {
            title: '場所指定',
            syntax: 'near:city',
            desc: '指定した<strong>都市・場所の近く</strong>から投稿されたポストを検索します。',
            example: '例: <strong>Tokyo</strong> → 東京付近からの投稿（※精度は限定的）'
        },
        within: {
            title: '範囲指定',
            syntax: 'within:distance',
            desc: '<strong>near:と組み合わせて</strong>、検索範囲の半径を指定します。kmまたはmiが使用可能。',
            example: '例: <strong>10km</strong> → near:で指定した場所から半径10km以内'
        }
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
        const data = helpData[key];
        if (!data) return;

        helpTitle.textContent = data.title;
        helpBody.innerHTML = `
            <div class="help-desc">${data.desc}</div>
            <code class="help-syntax">${data.syntax}</code>
            <div class="help-example">${data.example}</div>
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

        queryPreview.textContent = hasQuery ? query : '検索オプションを入力してください...';
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
            showToast('クエリをコピーしました');
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
            showToast('クエリをコピーしました');
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
        showToast('リセットしました');
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

    // 初期状態を設定
    updatePreview();
});
