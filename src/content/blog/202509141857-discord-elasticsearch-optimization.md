---
title: 'Notes | How Discord Indexes Trillions of Messages'
description: 'Elasticsearch infra improvements'
pubDate: 'Sep 14 2025'
heroImage: 'https://images.pexels.com/photos/28469559/pexels-photo-28469559.jpeg'
heroImageTitle: Photo by <a href='https://www.pexels.com/@bruna-fossile-183845208/'>Bruna Fossile</a>
tags: ["backend", "elasticsearch", "system-design"]
readTime: '6 min'
---

>[How Discord Indexes Trillions of Messages](https://discord.com/blog/how-discord-indexes-trillions-of-messages)

## Early Architecture
- Used **Elasticsearch** with messages sharded over indices across two clusters.  
- Messages were **lazily indexed**: only when needed for search.  
- Workers pulled messages in batches for **bulk indexing**.  
- **Redis** backed the real-time indexing queue.  

## Issues with Redis & Bulk Indexing
- Redis queues started dropping messages once CPU maxed out.  
- Bulk indexing problems:
  - A batch of 50 messages could fan out to 50 Elasticsearch nodes.  
  - If one failed → **entire batch retried**, adding load.  
- Larger clusters → indexing slowdown & higher failure rates.  

## Cluster Growth Problems
- Clusters grew to **200+ nodes** with terabytes of data.  
- Bulk ops spread across many nodes → performance bottlenecks.  
- Hard to perform **software upgrades**:
  - Draining nodes took too long.  
  - Forced to keep **legacy OS/Elasticsearch versions**.  
- Critical patches (e.g., **log4shell**) required **full downtime**.  

## Lucene Limitations
- Each Elasticsearch index = a **Lucene index**.  
- **MAX_DOC limit** ≈ 2B docs per index.  
- Once hit → **all indexing operations fail**.  
- Large guilds = very large indices → hit limit quickly.  

## Kubernetes & Cells
- Initially avoided stateful workloads on **Kubernetes**.  
- **Elastic Operator** looked promising for orchestration.  
- Problems:
  - Clusters had 200+ nodes → high coordination overhead.  
  - **Cluster states don’t scale** well.  
  - Master nodes often went **OOM**, causing failures.  
- Solution: introduce **logical “cells”** (multiple clusters grouped).  

## Improved Reliability & Scaling
- Adopted **dedicated node roles**:
  - **Master nodes** → cluster coordination.  
  - **Ingest nodes** → stateless, handle preprocessing.  
  - **Data nodes** → indexing & queries.  
- Switched **Redis → PubSub** for indexing:
  - Guaranteed delivery.  
  - Could tolerate large backlogs.  
  - Elasticsearch failures = slowdown, not message loss.  
- Built **PubSub router**:
  - Streams & batches messages.  
  - Routes to correct cluster/index.  

## Direct Messages (DMs)
- Sharded by **user instead of channel**.  
- Stores all of a user’s DMs together → efficient search.  

## Scaling Guilds
- Growing guilds hit the **Lucene MAX_DOC limit**.  
- Needed strategies to **split data across shards** without performance loss.  

## Query Optimization
- Indices typically use a **single primary shard**.  
- Ensures all data is co-located → avoids cross-shard queries.  
