---
title: "【Blogger】全記事を一覧表示する「アーカイブページ」の作り方（無限スクロール対応）"
description: "No description provided."
pubDate: new Date( + date + )
---

Bloggerを使っていると、「過去の記事をタイトルだけでズラッと一覧で見たい」と思うことはありませんか？
標準の「アーカイブ」ガジェットだと、月ごとにフォルダが開閉したりして、ちょっと探しにくいことがありますよね。

そこで、\*\*「ブログの全記事をリスト表示するページ」\*\*を簡単に作るためのコードを作ってみました。

難しい設定は一切不要です。
以下のコードをコピペするだけで、あなたのブログにも「記事一覧ページ」があっという間に完成します。

### このコードの特徴

  * **コピペだけで動く:** ブログのURLなどを書き換える必要はありません（自動で判別します）。
  * **無限スクロール対応:** 記事数が多くても、スクロールすると自動で次の記事を読み込むので動作が軽いです。
  * **スマホでも押しやすい:** 記事タイトルだけでなく、行全体をクリックできるようにしているので、スマホでの操作も快適です。
  * **シンプル:** 日付とタイトルだけのスッキリしたデザインです。

### 手順：一覧ページの作り方

作業は1分で終わります！

1.  Bloggerの管理画面を開き、左メニューの\*\*「ページ」\*\*をクリックします。
2.  \*\*「新しいページ」\*\*をクリックします。
3.  ページのタイトルを「記事一覧」や「Archive」など、好きな名前にします。
4.  記事編集画面の左上にある鉛筆アイコン（または `< >` アイコン）をクリックして、\*\*「HTMLビュー」\*\*に切り替えます。
5.  もともと入っているコードがあれば全て消して、以下のコードをそのまま貼り付けます。

<!-- end list -->

```html
<style>
  /* === デザイン設定エリア === */
  #archive-container {
    font-family: sans-serif;
    line-height: 1.8;
  }
  #archive-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  /* 記事リンク全体の設定 */
  .archive-link {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    text-decoration: none;
    color: #333; /* 文字色 */
    border-bottom: 1px dashed #ddd; /* 下線の色 */
    padding: 10px 5px;
    transition: background-color 0.2s;
  }
  .archive-link:hover {
    background-color: #f5f5f5; /* マウスを乗せたときの色 */
    color: #007bff; /* マウスを乗せたときの文字色 */
  }
  /* 日付の設定 */
  .archive-date {
    font-size: 0.85em;
    color: #888;
    margin-right: 15px;
    font-family: monospace;
    min-width: 90px;
    flex-shrink: 0;
  }
  /* タイトルの設定 */
  .archive-title {
    font-weight: 500;
  }
  /* 読み込みメッセージ */
  #loading-msg {
    text-align: center;
    color: #888;
    padding: 20px;
    font-size: 0.9em;
  }
</style>

<div id="archive-container">
  <ul id="archive-list">
    </ul>
  <div id="loading-msg">読み込み中...</div>
</div>

<script>
(function() {
  // === 設定エリア ===
  var config = {
    // 自動で現在のブログのドメインを取得します
    blogDomain: window.location.hostname, 
    postsPerPage: 50 // 一度に読み込む記事数
  };
  // ================

  var startIndex = 1;
  var isLoading = false;
  var isFinished = false;

  // 日付のフォーマット (YYYY/MM/DD)
  function formatDate(isoString) {
    var d = new Date(isoString);
    var year = d.getFullYear();
    var month = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return year + '/' + month + '/' + day;
  }

  // 記事データの処理
  window.handleArchivePosts = function(json) {
    var posts = json.feed.entry;
    var list = document.getElementById('archive-list');
    var msg = document.getElementById('loading-msg');

    if (!posts || posts.length === 0) {
      isFinished = true;
      msg.innerText = "すべての記事を表示しました";
      return;
    }

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var title = post.title.$t;
      var date = formatDate(post.published.$t);
      var url = "";

      for (var j = 0; j < post.link.length; j++) {
        if (post.link[j].rel == 'alternate') {
          url = post.link[j].href;
          break;
        }
      }

      var li = document.createElement('li');
      li.innerHTML = '<a href="' + url + '" class="archive-link">' +
                     '<span class="archive-date">' + date + '</span>' +
                     '<span class="archive-title">' + title + '</span>' +
                     '</a>';
      list.appendChild(li);
    }

    startIndex += config.postsPerPage;
    isLoading = false;
    
    // 画面が埋まるまで次を読み込む
    if (document.body.scrollHeight <= window.innerHeight) {
       loadNextBatch();
    } else {
       msg.innerText = "スクロールでさらに読み込み";
    }
  };

  // 次の記事セットを取得
  function loadNextBatch() {
    if (isLoading || isFinished) return;
    isLoading = true;
    document.getElementById('loading-msg').innerText = "読み込み中...";

    var script = document.createElement('script');
    var url = 'https://' + config.blogDomain + '/feeds/posts/summary?alt=json-in-script&start-index=' + startIndex + '&max-results=' + config.postsPerPage + '&callback=handleArchivePosts';
    script.src = url;
    document.body.appendChild(script);
  }

  // 初期実行
  loadNextBatch();

  // スクロールイベント
  window.addEventListener('scroll', function() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
      loadNextBatch();
    }
  });
})();
</script>
```

6.  貼り付けたら、\*\*「公開」\*\*ボタンを押します。

これで完了です！
作成したページを表示して、下にスクロールしていくと過去の記事がどんどん読み込まれるのを確認してみてください。

Bloggerでサイトマップや過去ログの見せ方に困っていた方は、ぜひ使ってみてくださいね。
