---
title: "【保存版】CellphoneDB v5が動かない？インストールから解析実行まで完全攻略！"
description: "No description provided."
pubDate: new Date( + date + )
---

### はじめに

シングルセル解析で細胞間コミュニケーション（リガンド-受容体相互作用）を調べたい時、**CellphoneDB**は欠かせないツールですよね。
でも、最新版（v5系）をインストールしてみると…
「あれ？ `command not found` って言われる？」
「データベースがダウンロードできない？」
なんてトラブルに見舞われることがよくあります。

実は最新版では内部構造が変わっていて、公式の手順通りだと上手くいかないことがあるんです。
そこで今回は、\*\*確実にCellphoneDB v5を動かすための「最強の回避策」\*\*をまとめました！

-----

### ステップ1：環境構築（ここは基本通り！）

まずはPython 3.8の環境を作ります。推奨されているバージョンを守るのが成功の鍵です。

```bash
# 環境を作成（名前は cpdb にします）
conda create -n cpdb python=3.8

# 環境に入る
conda activate cpdb

# インストール
pip install cellphonedb
```

通常ならこれで `cellphonedb` コマンドが使えるはずですが、v5.0.1以降などでは\*\*コマンドが見つからない（command not found）\*\*という現象が起きることがあります。
でも焦らなくて大丈夫！Python経由で動かす方法で解決します。

-----

### ステップ2：データベースのダウンロード

次に必要な辞書データ（データベース）をダウンロードします。
ここにも罠があり、単にダウンロードしようとすると `404 Not Found` になることがあります。バージョンを明示的に指定してあげましょう。

ターミナルで以下のコマンドを実行するだけでOKです！

```bash
# v5.0.0を指定してダウンロードする魔法のコマンド
python -c "from cellphonedb.utils import db_utils; db_utils.download_database('.', 'v5.0.0')"
```

これで現在のフォルダに `cellphonedb.zip` が保存されます。

-----

### ステップ3：解析実行用の「特製スクリプト」を作る

ここが最大のポイントです！
`cellphonedb method statistical_analysis ...` というコマンドが動かない代わりに、**Pythonスクリプトから直接解析エンジンを呼び出す**方法を使います。

以下のコードをコピーして、`run_cpdb.py` という名前で保存してください。

```python
import os
from cellphonedb.src.core.methods import cpdb_statistical_analysis_method

# ================================
#   CellphoneDB 解析実行スクリプト
# ================================

# --- 1. ファイル名の設定（ここを自分のファイル名に変える！）---
cpdb_file_path = os.path.abspath('cellphonedb.zip') # データベース
meta_file_path = 'my_meta.txt'      # 細胞定義ファイル
counts_file_path = 'my_counts.txt'  # 発現量マトリックス
output_path = 'out_cpdb'            # 出力先フォルダ

# --- 2. パラメータ設定 ---
iterations = 1000        # 計算回数（本番は1000推奨）
threshold = 0.1          # 足切りライン
threads = 4              # スレッド数
gene_id_type = 'hgnc_symbol' # 遺伝子名がシンボルならこれ

# ================================

def run_analysis():
    # フォルダ作成
    if not os.path.exists(output_path):
        os.makedirs(output_path)

    print(">>> 解析を開始します...")
    
    try:
        # 解析メソッドを直接呼び出し
        cpdb_statistical_analysis_method.call(
            cpdb_file_path = cpdb_file_path,
            meta_file_path = meta_file_path,
            counts_file_path = counts_file_path,
            counts_data = gene_id_type,
            output_path = output_path,
            iterations = iterations,
            threshold = threshold,
            threads = threads,
            debug_seed = -1,
            result_precision = 3,
            pvalue = 0.05,
            subsampling = False
        )
        print(">>> 解析完了！成功です！🎉")
        
    except Exception as e:
        print(f">>> エラーが発生しました: {e}")

if __name__ == "__main__":
    run_analysis()
```

-----

### ステップ4：いざ実行！

あとは、解析したい2つのファイル（`my_meta.txt` と `my_counts.txt`）を同じフォルダに置いて、スクリプトを実行するだけです。

```bash
python run_cpdb.py
```

これで、`out_cpdb` フォルダに p-value や mean などの解析結果が出力されます。
コマンドがなくて困っていた方も、この方法なら確実に動きますよ！ぜひ試してみてくださいね。
