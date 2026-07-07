---
title: 'Notes on Embeddings'
description: 'Understanding embeddings, vector representations, contextual vs static embeddings, and how they power modern RAG systems'
pubDate: 'Jul 07 2026'
tags: ["ai", "machine-learning", "embeddings", "rag"]
---

[Beautiful read](https://huggingface.co/spaces/hesamation/primer-llm-embedding?section=what_are_embeddings?)

Example of food recommendation app (if you like `x` here is `y`)

<p align="center">
<img src="/notes-7-embeddings/screenshot-3-59-34.png">
</p>

- **one-hot encoding** - encoding something in a vector where one dimension is `1` and all other are `0`
- when we create one-hot encodings, we have several problems
	- if you have `N` nodes and `M` entries, each layer will be trained `NxM` times in a neural network
	- more data is needed to train as more weights are present
	- more computation
	- more memory
	- unable to support on device machine learning (ODML)
- Embeddings helps to lower dimensions of sparse data like above and address the above problems

### Definition

- Embedding is a vector representation in embedding space

> embedding space is a d-dimensional vector space that features from a higher-dimensional vector space are mapped to. Embedding space is trained to capture structure that is meaningful for the intended application.
> The [dot product](https://wikipedia.org/wiki/Dot_product) of two embeddings is a measure of their similarity.

- Sometimes, the relative positions of items in embedding space have some semantic relationship, but very hard for humans to identify them, hence hard to understand

Examples :-

consider one dimension of how "sandwichy" a dish is

<p align="center">
<img src="/notes-7-embeddings/screenshot-4-22-19.png">
</p>

apple pie lies somewhere between hotdog and shwarma, now add another dimension called "dessertness"

<p align="center">
<img src="/notes-7-embeddings/screenshot-4-23-20.png">
</p>

now lets add "liquidness" as another dimension

<p align="center">
<img src="/notes-7-embeddings/screenshot-4-24-07.png">
</p>

see how more dimensions help me better decide which 2 meals are inter-related

> **Real World Word Embedding**
> in real world dimensions are much higher than 3, in word embeddings people usually chose 256, 512 or 1024 dimensions. ML engineer usually trains on the data to minimize the losses by tuning dimensions as well

Embeddings are usually specific to a task, as they define separate dimensions. *embedding models that classify veg and non veg will be completely different from models that suggest meals based on the time of day (breakfast, lunch, etc)*

### Static Embeddings

embeddings differ from task to task, one specific task has general applicability: **predicting context of the word**

Models trained for context assume words appearing in same context are semantically related. e.g. "They rode a burro down into the Grand Canyon" and "They rode a horse down into the canyon", here models suggest that horse ~= burro

### word2vec - an old library

`word2vec` trains on a corpus of documents to obtain a single global embedding per word. When each word or data point has a single embedding vector, this is called a **static embedding**.

Some read [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781)

### Obtaining Embeddings

- many mathematical techniques to reduce higher dimension into lower dimension
	- E.g. [principal component analysis](https://wikipedia.org/wiki/Principal_component_analysis) (PCA) has been used to create word embeddings. Given a set of instances like [**bag of words**](https://developers.google.com/machine-learning/glossary#bag-of-words) vectors, PCA tries to find highly correlated dimensions that can be collapsed into a single dimension.
- we can add a hidden layer when training a neural network of *d* nodes (embedding dimension), this way your embedding layer will be trained along side with your neural network, but takes a bit of time

### Contextual Embedding

- `word2vec` provides static embedding, here the word `orange` will be only be closed to the colors and not fruits
- contextual embedding solves this by having vector embedding of the word based on the words surrounding it, Some methods for creating contextual embeddings, like [ELMo](https://wikipedia.org/wiki/ELMo)

> Transformer models use a [self-attention](https://developers.google.com/machine-learning/glossary#self-attention-also-called-self-attention-layer) layer to weight the relevance of the other words in a sequence to each individual word. They also add the relevant column from a **positional embedding matrix** (see [positional encoding](https://developers.google.com/machine-learning/glossary#positional-encoding)) to each previously learned token embedding, element by element, to produce the input embedding that is fed into the rest of the model for inference. This **input embedding**, unique to each distinct textual sequence, is a contextual embedding.

# FAQs

**Q:** Since LLMs are trained and embeddings are generated for the data LLMs are being trained on, what does it mean when I say that I used this model to embed my documents?

**A:** When you "embed a document," you are not retrieving something the model memorized during training. You are asking the model to read your new text, apply its deeply trained understanding of language to it, and spit out a highly compressed, mathematical summary (a vector) of what your specific document means. You can then use that mathematical summary to power search engines, find similar documents, or feed into a Retrieval-Augmented Generation (RAG) system!

**Q:** Is cosine similarity always used in RAG to find similar documents?

**A:** No, cosine similarity is **not always** used in Retrieval-Augmented Generation (RAG) to find similar documents, although it is arguably the most common default. While it is extremely popular for measuring the similarity between text embeddings, the choice of distance metric depends entirely on how the embedding model was trained and the specific requirements of your vector database.

Here is a breakdown of why cosine similarity is popular, along with the other common metrics used in RAG systems:

### Why Cosine Similarity is the Default for RAG

Cosine similarity measures the cosine of the angle between two vectors in a multi-dimensional space, ignoring their magnitude (length).

$$\text{Cosine Similarity} = \frac{A \cdot B}{\|A\| \|B\|}$$

In NLP and RAG, vector magnitude often correlates with document length or word frequency. Because cosine similarity only looks at the *direction* of the vectors, a short query can highly match a long document if their semantic meanings align, making it ideal for text retrieval.

### Common Alternatives to Cosine Similarity in RAG

**1. Dot Product (Inner Product)**

The dot product multiplies the corresponding dimensions of two vectors and sums them up.

- **Formula:** $A \cdot B = \sum_{i=1}^{n} A_i B_i$
- **When it's used:** If your embeddings are already **normalized** to a length of 1 (which is the case for OpenAI's `text-embedding-ada-002` and `text-embedding-3` models), the Dot Product mathematically yields the exact same ranking as Cosine Similarity. However, Dot Product is computationally much faster, making it the preferred metric for large-scale vector databases when embeddings are normalized.

**2. Euclidean Distance (L2 Distance)**

This measures the straight-line distance between the endpoints of two vectors.

- **When it's used:** Euclidean distance cares about magnitude. It is used when the absolute differences in vector values matter just as much as their semantic direction. If the embedding model was specifically optimized using L2 distance during training, this should be your retrieval metric.

**3. BM25 (Keyword Search)**

While not a vector similarity metric, BM25 is a sparse retrieval algorithm based on exact keyword matching (TF-IDF).

- **When it's used:** Modern RAG systems almost always use **Hybrid Search**, which combines dense vector search (like Cosine/Dot Product) with sparse search (BM25). This ensures the system catches semantic meaning *and* exact keyword matches (like specific IDs, acronyms, or names).

### How to Choose?

The golden rule in RAG is to **use the metric your embedding model was trained on.** If you use **OpenAI embeddings**, they are normalized to length 1. You can use Dot Product for maximum performance.

- If you use an open-source model from HuggingFace (like a `sentence-transformer`), check the model card. The authors will explicitly state whether it performs best using Cosine Similarity, Dot Product, or Euclidean Distance.

**Q:** In production RAG system, does the user query gets similarity checks done against all documents? it would be very difficult to scale right?

**A:** You hit the nail on the head. If a production system had to calculate the similarity between a query vector and *every single document vector* in the database, it would be an absolute nightmare to scale.

Comparing a query against the entire dataset is known as **Exact Nearest Neighbor (k-NN)** search. Because it requires a brute-force scan, the time complexity is $O(N)$. If you have millions of document chunks, doing millions of dot products for every single user request would destroy your system's latency and compute budget.

To solve this, production RAG systems use **Approximate Nearest Neighbor (ANN)** search.

### The Shift to Approximate Nearest Neighbor (ANN)

Instead of finding the *absolute perfect* match by scanning everything, ANN algorithms trade a tiny, almost unnoticeable amount of accuracy for massive gains in speed and scalability. They bring the search complexity down from $O(N)$ to roughly $O(\log N)$.

This is exactly why we use specialized **Vector Databases** (like Pinecone, Qdrant, Milvus, or Postgres with `pgvector`). Under the hood, they build specialized indexes to avoid full table scans.

Here are the two most common ways they index vectors to avoid checking every document:

### 1. HNSW (Hierarchical Navigable Small World)

This is currently the industry standard for vector search. It works similarly to a skip list but for multi-dimensional graphs.

- **How it works:** It builds a multi-layered graph. The top layers only have a few sparsely connected nodes (vectors). The bottom layers contain all the vectors.
- **The Search:** When a query comes in, the search starts at the top layer, taking large "jumps" to get into the general neighborhood of the query vector. It then drops down layer by layer, narrowing the search space until it finds the closest nodes at the bottom.
- **The Result:** It only calculates similarity against a very small fraction of the database—just the nodes in the local neighborhood of the graph.

### 2. IVF (Inverted File Index)

IVF uses clustering to partition your vector space into distinct zones (Voronoi cells).

- **How it works:** During indexing, the database groups similar vectors together into clusters and calculates a "centroid" (the center point) for each cluster.
- **The Search:** When a query arrives, the system first compares the query to the *centroids*. Once it finds the closest centroid, it only does similarity checks against the vectors living inside that specific cluster.
- **The Result:** If you have 1,000 clusters, you immediately eliminate 99.9% of the database from the search space.

### Summary for Production

When a user asks a question in a production RAG app, the system embeds the query, traverses a pre-computed index (like HNSW), and only performs similarity math against a small, highly relevant subset of documents.
