---
title: "Alphafold3のインストールの仕方"
description: "Article: 20251107-issue-29.md"
pubDate: new Date( + date + )
---

```
# リポジトリをClone
git clone https://github.com/google-deepmind/alphafold3.git

# ディレクトリに移動
cd alphafold3

# fetch_databases.shに実行権限を与える
chmod +x ./fetch_databases.sh

# データベースをダウンロード。結構時間がかかる（数時間ぐらい）
./fetch_databases.sh 

# パラメーターを解凍。パラメーターはFormでGoogleからもらう
unzstd af3.bin.zst

# af3_modelsというディレクトリを作る
mkdir af3_models

# 移動
mv af3.bin af3_models/

# dockerをBuild
cd alphafold3/
docker build -t alphafold3 -f docker/Dockerfile .

```
