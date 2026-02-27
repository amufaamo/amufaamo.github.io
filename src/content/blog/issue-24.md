---
title: "loupeRのインストール"
description: "No description provided."
pubDate: new Date( + date + )
---

```R
remotes::install_github("10XGenomics/loupeR")
```

エラーが起きた。
```
2: In i.p(...) :
  installation of package ‘leidenbase’ had non-zero exit status
3: In i.p(...) : installation of package ‘httpuv’ had non-zero exit status
```

個別に入れる。
```bash
mamba install conda-forge::igraph -y
mamba install conda-forge::r-leidenbase -y
mamba install conda-forge::r-httpuv -y
```

これでLoupeRを起動

```R
library(loupeR)
```
そのあと、setupする
```R
loupeR::setup()
```
