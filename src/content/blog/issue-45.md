---
title: "PIPseekerでNCBI (RefSeq) のGTFを使って解析する方法"
description: "No description provided."
pubDate: new Date( + date + )
---

#### 1. はじめに

Fluent BioSciencesのシングルセル解析ソリューション「PIPseq」、手軽で便利ですよね。
でも、公式サイトで配布されているリファレンス（STAR index）はヒトやマウスが中心。「私の研究対象（ラット、ゼブラフィッシュ、植物etc...）のリファレンスがない！」と困ったことはありませんか？

PIPseekerには自分でリファレンスを作成する `buildmapref` コマンドがありますが、**NCBI (RefSeq)** からダウンロードしてきたデータを「デフォルト設定」のまま使うと、うまく遺伝子が認識されないことがあります。

今回は、**NCBIのデータを使って、あらゆる生物種のカスタムリファレンスを確実に作成する方法**をシェアします。

#### 2. なぜデフォルト設定ではうまくいかないの？

PIPseekerのデフォルト設定は、主に**GENCODE**形式のデータを想定しています。
GENCODEとNCBI (RefSeq) では、GTFファイル（アノテーションファイル）の中の「言葉の定義」が少し違うのです。

* **GENCODE (デフォルト想定):**
* 遺伝子の種類のタグ名： `gene_type`
* タンパク質コード遺伝子の値： `protein_coding`


* **NCBI (RefSeq):**
* 遺伝子の種類のタグ名： **`transcript_biotype`** など
* タンパク質コード遺伝子の値： **`mRNA`** など



この「言葉の違い」をPIPseekerに教えてあげないと、「遺伝子が見つかりません」となってしまうんですね。

#### 3. 解決策：オプションで「言葉の違い」を教えよう

解決策はとてもシンプルです。`buildmapref` コマンドを実行する際に、以下の2つのオプションを追加するだけです。

1. **`--biotype-tag`**: どのタグを見るか指定する
2. **`--include-types`**: どの種類の遺伝子を取り込むか指定する

#### 4. 実践！汎用コマンドテンプレート

NCBIから「ゲノム配列 (.fna)」と「アノテーション (.gtf)」をダウンロードしたら、以下のコマンドを実行します。

```bash
# NCBIデータ用 PIPseeker リファレンス作成コマンド
# < > の部分は自分のファイル名に書き換えてください

./pipseeker buildmapref \
  --fasta <ゲノムファイル名>.fna \
  --gtf <アノテーションファイル名>.gtf \
  --biotype-tag transcript_biotype \
  --include-types mRNA \
  --output-path <出力先ディレクトリ名>

```

**ポイント解説：**

* `--biotype-tag transcript_biotype`： デフォルトの `gene_type` を上書きします。
* `--include-types mRNA`： デフォルトの `protein_coding` を上書きします。

※もし `lncRNA` なども含めたい場合は、カンマ区切りで `--include-types mRNA,lncRNA` のように追加してください。

#### 5. 念のための確認方法（上級編）

「本当にこの設定でいいの？」と不安な場合や、さらに特殊なデータを使う場合は、GTFファイルの中身を覗いて確認するのが確実です。

Linux/Macのターミナルで以下のコマンドを打つと、そのGTFファイル内で使われているタグの種類一覧が見られます。

```bash
# GTFファイル内の transcript_biotype の種類を確認する
grep "transcript_biotype" <ファイル名>.gtf | sed 's/.*transcript_biotype "\([^"]*\)".*/\1/' | sort | uniq

```

ここで出てきたリスト（例：`mRNA`, `tRNA`, `pseudogene`...）の中から、解析に含めたいものを選んで `--include-types` に指定すれば完璧です！

#### 6. まとめ

* PIPseekerでカスタムリファレンスを作るなら、データの「出処（GENCODEかNCBIか）」に注意！
* NCBIデータを使う場合は、`--biotype-tag transcript_biotype` と `--include-types mRNA` が鉄板設定。

この設定さえ押さえておけば、どんなマイナーな生物種でもPIPseqでガンガン解析できます。ぜひ試してみてくださいね！
