---
title: "EggNOG-mapper (CLI) で遺伝子に機能情報を付与する手順"
description: "No description provided."
pubDate: new Date( + date + )
---

RNA-seq解析などで得られた「遺伝子リスト」や「発現変動遺伝子（DEGs）」。
でも、`Gene_12345` のようなIDだけでは「結局、菌の中で何が起きているの？」という生物学的な解釈ができません。

そこで必要になるのが**機能アノテーション（Functional Annotation）**です。
今回は、世界標準ツールである **EggNOG-mapper (v2)** をローカル環境（CLI）で動かし、遺伝子にGO termやGene Nameなどの情報を付与する手順をまとめました。

ディレクトリ管理のルール（`ref` や `data` の使い分け）も含めて記録しておきます。

## 1. 前提と環境

データ解析用のディレクトリ構成は以下のルールで運用しています。データベースなどの巨大ファイルはプロジェクトごとにコピーせず、`ref` ディレクトリで一元管理します。

```text
/home/user/
 ├── software/     # ツール本体置き場
 ├── ref/          # 【重要】巨大なDBファイルはここに置く
 │   └── eggnog_db/
 └── data/         # 解析プロジェクトごとのデータ
     └── Project_A/

```

## 2. インストール (Conda/Mamba)

環境汚染を防ぐため、専用の仮想環境を作成します。

```bash
# 環境作成
conda create -n eggnog -c bioconda -c conda-forge eggnog-mapper

# 環境のアクティベート
conda activate eggnog

```

## 3. データベースのダウンロード

ここが最大の難所（時間がかかるポイント）です。
EggNOG-mapperは数十GBのデータベースを使用します。これをプロジェクトごとのフォルダに置くとストレージが死ぬので、**`~/ref/`（参照データ用ディレクトリ）** に保存します。

```bash
# 保存用ディレクトリの作成
mkdir -p ~/ref/eggnog_db

# データベースのダウンロード（-y は全ての質問にYesと答えるオプション）
# ※回線速度によりますが、数十分〜数時間かかります
download_eggnog_data.py --data_dir ~/ref/eggnog_db -y

```

> **Memo:** この作業は初回のみでOK。次回からはこのパスを指定するだけで使い回せます。

### 失敗した場合

通常は download_eggnog_data.py というコマンドを使いますが、サーバーの移転等により 「404 Not Found」エラーが出て止まる ことがよくあります。

そのため、新しいサーバー（eggnog5）から直接ファイルをダウンロードする 手動手順 が最も確実です。 ※合計で数十GBあるので、安定した回線で行ってください。

```bash

# 1. 保存用ディレクトリの作成と移動
mkdir -p ~/ref/eggnog_db
cd ~/ref/eggnog_db

# 2. メインデータベースの取得と解凍 (eggnog.db)
wget http://eggnog5.embl.de/download/emapperdb-5.0.2/eggnog.db.gz
gunzip eggnog.db.gz

# 3. 分類情報の取得と解凍 (eggnog.taxa.db)
wget http://eggnog5.embl.de/download/emapperdb-5.0.2/eggnog.taxa.tar.gz
tar -zxf eggnog.taxa.tar.gz
rm eggnog.taxa.tar.gz

# 4. タンパク質検索用DBの取得と解凍 (DIAMOND DB)
wget http://eggnog5.embl.de/download/emapperdb-5.0.2/eggnog_proteins.dmnd.gz
gunzip eggnog_proteins.dmnd.gz
```

Check: 完了後、ls -lh で確認し、eggnog.db (約30GB) や eggnog_proteins.dmnd (約9GB) があれば成功です。

## 4. 解析の実行

いよいよ解析です。
入力ファイルには、アミノ酸配列（Protein FASTA: `.faa`）を使用します。

```bash
# 解析用ディレクトリへ移動
cd ~/data/My_Project/

# 実行コマンド
# -i : 入力ファイル
# --output : 出力ファイルの接頭辞
# -m diamond : 高速なDIAMONDモードを使用（推奨）
# --cpu : 使用するスレッド数
# --data_dir : ★ここが重要！先ほどDLした場所を指定

emapper.py -i input_protein.faa \
           --output result_prefix \
           -m diamond \
           --cpu 8 \
           --data_dir ~/ref/eggnog_db

```

## 5. 結果の確認

解析が終わるといくつかのファイルが生成されますが、最も重要なのは **`.emapper.annotations`** というファイルです。

```bash
head result_prefix.emapper.annotations

```

このファイルはタブ区切りのテキストファイル（TSV）なので、Excelでそのまま開くことができます。
中には以下のような情報が網羅されています。

* **Preferred_name**: 遺伝子名（例: p53, gapdh）
* **GOs**: Gene Ontology（機能分類）
* **KEGG_ko**: KEGGパスウェイ解析に使うID
* **Description**: 遺伝子の機能説明

あとはこの表を、ExcelやR/Pythonを使って元の発現量データ（TPMなど）と「遺伝子ID」をキーにして結合（Merge）すれば、解析完了です！

## 6. 【注意】IDの食い違いについて

NCBIからダウンロードしたゲノムデータ（RefSeqなど）を使う場合、FASTAヘッダーのID（例: `>GAM12345.1`）と、GFFファイル等にあるLocus Tag（例: `TCE0_xxxx`）が異なることがあります。

EggNOG-mapperは「FASTAヘッダーの最初の単語」をIDとして結果を出力します。
もしTPMの表と結合できない場合は、解析前にFASTAヘッダーを置換するか、解析後にID変換テーブルを使って対応付けを行う必要があります。

---

### まとめ

一度データベースを `ref` に構築してしまえば、あとはコマンド一発で高精度なアノテーションが得られます。
謎のIDの羅列だったデータが、「細胞壁分解酵素」や「毒素産生遺伝子」といった意味のあるリストに変わる瞬間は、バイオインフォマティクスの醍醐味ですね。

---
