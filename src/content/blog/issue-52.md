---
title: "# 【Root権限なし・sudo不可】一般ユーザーでPodman環境を完全自力で構築する手順"
description: "No description provided."
pubDate: new Date( + date + )
---


リモートサーバーでコンテナ（Dockerなど）を使いたい！でも「管理者権限がない」「sudoコマンドが使えない」…と諦めていませんか？

この記事では、Root権限が一切ない環境で、Podmanの「Staticバイナリ（必要な部品の全部入りパック）」を使い、完全な一般ユーザー権限（Rootless）でコンテナ環境を自力構築・実行するまでの全手順を解説します！

## Step 1: Podman Staticバイナリのダウンロードと配置

まずは、有志がビルドしてくれている全部入りのバイナリをダウンロードし、自分のホームディレクトリ（`~/.local/`）配下に展開します。

```bash
# 1. 全部入りのファイルをダウンロード
wget https://github.com/mgoltzsche/podman-static/releases/latest/download/podman-linux-amd64.tar.gz

# 2. ファイルを解凍
tar -xzf podman-linux-amd64.tar.gz

# 3. 自分のホームディレクトリ配下にコピーするためのフォルダを作成
mkdir -p ~/.local/bin

# 4. 正しい場所（usr/local/ の中身）から ~/.local/ にコピー
cp -r podman-linux-amd64/usr/local/* ~/.local/

# 5. パスを通す（~/.bashrc などに追記しておくと便利です）
export PATH=$HOME/.local/bin:$PATH

# バージョンが表示されればOK！
podman --version

```

## Step 2: 設定ファイルの準備と「罠」の回避

次に、コンテナの動作に必要な設定ファイルを準備します。ここで**パーミッションエラーを防ぐ重要なポイント**があります！

```bash
# 1. ユーザー用の設定フォルダを作成
mkdir -p ~/.config/containers

# 2. 設定ファイルをコピー
cp -r podman-linux-amd64/etc/containers/* ~/.config/containers/

# 3. 【超重要】Root用のストレージ設定を無効化する
mv ~/.config/containers/storage.conf ~/.config/containers/storage.conf.bak

```

**💡 ポイント:**
`storage.conf` がそのまま存在すると、システム全体用の保存場所（`/var/lib/containers`）を見に行ってしまい「Permission denied」エラーになります。ファイル名を変更して脇にどけることで、Podmanが自動的にユーザー専用の保存場所（`~/.local/share/`）を使ってくれるようになります。

## Step 3: 足りない裏方プログラムの場所を教える

このままコンテナを動かそうとすると、`conmon`（コンテナの監視役）や `netavark`（ネットワーク管理役）が見つからないというエラーが出ます。
設定ファイル（`containers.conf`）に、これらのプログラムの正しい場所を追記してあげましょう。

```bash
# containers.conf の [engine] セクションのすぐ下に、2つのパス設定を追加します
sed -i '/^\[engine\]/a conmon_path = ["/home/masakazu/.local/lib/podman/conmon"]' ~/.config/containers/containers.conf
sed -i '/^\[engine\]/a helper_binaries_dir = ["/home/masakazu/.local/libexec/podman", "/home/masakazu/.local/lib/podman", "/home/masakazu/.local/bin"]' ~/.config/containers/containers.conf

```

※コマンド内の `masakazu` の部分は、ご自身のユーザー名に適宜変更してください。

## Step 4: いざ、コンテナ起動！

これで準備はすべて整いました！世界で一番有名なテストコンテナ「Hello World」を動かしてみましょう。

```bash
podman run docker.io/library/hello-world

```

画面に **`Hello from Docker!`** という歓迎メッセージが表示されれば、完全自力での環境構築は大成功です！🎉

### （おまけ）WARNメッセージについて

実行時に `WARN... Network file system detected...` というような警告が出ることがありますが、これはNFS（ネットワークファイルシステム）環境特有の軽いお知らせです。コンテナの動作自体には問題ないので、ひとまずはそのまま進めて大丈夫です。
