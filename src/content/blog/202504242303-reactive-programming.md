---
title: 'Reactive Programming : How I see it ?'
description: 'Free your threads from waiting'
pubDate: 'Apr 24 2025'
heroImage: '/reactive-progamming/heroimage.jpeg'
heroImageTitle: Stranded by <a href='https://www.instagram.com/akshatsonic'>Me</a>
tags: ["spring", "backend", "java"]
readTime: '6 min'
---

So I was exposed to reactive framework when i was given a project to be migrate an existing service (home page) to the new reactive paradigm. I was introduced to Spring WebFlux along with Netty (the reactive server). I was overwhelmed by the amount of information I was consuming. So here’s my experience on how i got a small grasp 🤝 of spring webflux and shifted my mind to reactive paradigm.

# Non-Reactive Programming (a.k.a. The Blocking Life)

If you’ve ever built a web application (or just suffered through one), chances are you’ve encountered the good ol’ **blocking** model — a.k.a. **non-reactive programming**. Let’s use the Spring Framework as our guinea pig here.

In **Spring Web**, we follow a classic pattern:  
> One request = One thread (a.k.a. the *main thread*).  

When you hit the server with a request, it grabs a thread and says,  
> “Alright buddy, your job is to handle this request till the end. Don’t mess it up.”

Now imagine this thread needs to call a database or an external service. It has to wait... and wait... and wait.  
That’s what we call **blocking** — the thread literally just sits there twiddling its thumbs until the IO or DB responds.

You can try to be clever and offload this waiting to another thread using `CompletableFuture`, which does help — kind of like saying:  
> “Hey FutureThread, you wait here. I’ll go do something useful.”

But at scale, this becomes chaos. Threads are precious. You can’t just go spawning new ones like it’s a thread party — eventually, you run out, and boom — latency spikes, performance tanks, and your service goes from blazing fast to molasses slow.

## Enter: Reactive Programming

Reactive programming might sound fancy and mysterious at first, but it’s basically the cool, efficient friend who says:  
> “Don’t block me, bro. I’ll react when I’m needed.”

The big idea? **Stop wasting threads by making them wait.**  
Instead, treat everything (yes, even DB responses) as **data streams** you can *subscribe to*. When the data’s ready, you react. Until then — carry on, nothing to see here.

In Spring's reactive world, you’ll meet two new data types:  
- `Mono`: emits 0 or 1 item  
- `Flux`: emits 0... n items (basically `Mono`, but with an appetite)

These are like the Netflix of data: you *subscribe* to them and get notified when something new is out.

Now you might ask —  
> “Wait, doesn’t `subscribe()` sound kinda like `CompletableFuture.get()`?”  

Great question! Let’s clear that up:

| Method                   | What it does                                        |
|-------------------------|-----------------------------------------------------|
| `CompletableFuture.get()` | Blocks the thread until the result is ready (classic!) |
| `Mono.subscribe()`       | Non-blocking — just sets up what to do *when* the result arrives |

So while `get()` makes your thread sit and wait (with a cup of coffee and existential dread), `subscribe()` says:  
> “Here’s what to do when it’s ready — until then, I’ve got other stuff to do.”

Want to block in reactive world? You still can — just use `block()`. But if you're going reactive, that’s kind of defeating the point, don’t you think?