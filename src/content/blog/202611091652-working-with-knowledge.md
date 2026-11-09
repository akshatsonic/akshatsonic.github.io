---
title: "working with knowledge"
description: "basics of knowledge building for AI harness"
pubDate: "Nov 09 2026"
tags: ["ai","llm","database"]
heroImage: "/blog-images/1794245201894-pexels-elizabethcoded-36257180.jpg"
heroImageTitle: "Photo by <a href=\"https://www.pexels.com/@elizabethcoded/\">Elizabeth Celestino</a>"
---

> "You are only as good as your record collection" - DJ Spooky

I was reading a book today called *Show your work* by Austin Kleon. In chapter 4 there is this great quote that says "All of us who do creative work, we get into it because we have good taste". The author also states that "whats inside your scrapbook?" is what gives you inspiration for your craft. This got me thinking about my scrapbook/taste and I came to realize that all the creations that I am producing is somehow linked or inspired from my curations. All the photos that I capture or compositions I find in specific moments somehow linked back to what I observed or learnt from people I follow , to put simply "my taste".

That got me thinking, how would AI models actually build "taste". I got into research mode and started learning about some standards that folks in the industry are following to give their AI agents the taste and improving the knowledge or "record collection" of their agents. I came across 2 major terms : ***Ontology*** and ***Knowledge Graphs***

Ontology, similar to what class is in OOPs, a blueprint of what your data looks like and what are the entities and their relationships with them. Given my example, my team has these entities : microservice, ADRs, engineer, product, business. So `product`-> depends_on -> `business`, `product` -> drives -> `engineer`, `engineer`-> owns ->`ADRs`, `ADRs` -> derive -> `microservices`, etc. Here the main challenge is understanding your domain to create vocabularies specific to the domain you are solving for. You can't just give all your documents, slack messages, PRDs and ADRs and expect LLMs to spit out ontology for you, it can speed up the process but **knowledge modelling**, **identity resolution**, **data integration**, and **governance** requires human in the loop. Will add later on how to create ontologies for your team (i am also learning this :) )

Knowledge graphs is what objects are to classes, it is gathering all those information and unstructured data and organizing them in a structured database (usually graph databases) that when referenced by an LLM gives better relationship and knowledge about the related entities. These knowledge graphs are usually fetched in LLM using GraphRAG, will add this later too.

Stay tuned...
