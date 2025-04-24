---
title: 'Reactive Programming : How I see it ?'
description: 'Ledgers for your service'
pubDate: 'Apr 24 2025'
heroImage: '/reactive-progamming/heroimage.jpeg'
heroImageTitle: Stranded by <a style='color:#ed6bc4' href='https://www.instagram.com/akshatsonic'>Me</a>
tags: ["spring", "backend", "java"]
readTime: '6 min'
---

So I was exposed to reactive framework when i was given a project to be migrate an existing service (home page) to the new reactive paradigm. I was introduced to Spring WebFlux along with Netty (the reactive server). I was overwhelmed by the amount of information I was consuming. So here’s my experience on how i got a small grasp 🤝 of spring webflux and shifted my mind to reactive paradigm.

## Non Reactive Programming (blocking)

If you are a software developer or have ever built web applications in your life, you might have used blocking / non-reactive paradigm of programming. I would be taking Spring framework as an example here. In Spring Web , one-thread-per-request model is used to serve server requests. You send a request to the server, the server assigns a thread to your request (this thread is called as ***main thread***) and this thread is responsible for sending result back to you. 

Now what happens when you do an IO/DB call in this request? Your main thread is blocked and is waiting for the IO/DB call to finish, hence it is a blocking call. There is a workaround to this when using CompletableFutures in Java, where you assign a new thread to an IO call and make the call asynchronous in nature, while you use main thread to proceed ahead with next tasks. Here the future threads are the one that are waiting for the result and the main thread is free. 
But this also leads to problems at scale when your service is handling many requests per second. Since the application has limited threads, we see an increase in blocked threads and higher latencies as all the threads are blocked. To solve this issue reactive paradigm was introduced.

## Reactive Programming (non blocking)

Reactive paradigm of programming might seem confusing at first, but can turn out to be very handy if one understands how it works. The core essence of reactive programming states that **“any blocking call will be executed when it is needed”** (hence ***reacting*** to the need). Here every result of IO/DB operations are “data streams” that can be observed and reacted to. Adopting the reactive programming paradigm helps to **free up threads of execution from this waiting** and provides a mechanism to return to a task once results are available, leading to **much better resource utilisation**. 

Here the data structures used for reactive paradigm in Spring are Mono & Flux. These are the publishers of data streams and the subscribers subscribe to these structures whenever needed. As discussed earlier, CompletableFuture also provide similar asynchronous activity, just they are executed right away, however here the `subscribe()` method actually calls the IO/DB tasks.
Now one must think that these are also blocking right? How is `subscribe()` in reactive paradigm different from `get()` in `CompletableFuture`?

The fundamental difference lies in their blocking behavior:

-- **`get()` is a blocking call** that makes the calling thread wait until the CompletableFuture operation is complete.

-- **`subscribe()` initiates a non-blocking execution** of the `Mono` pipeline. The thread that calls `subscribe()` does not wait for the Mono to complete. Instead, the operations within the `Mono` are typically executed on different threads managed by schedulers (like Schedulers.boundedElastic()), and the results are delivered asynchronously to the subscriber.

Therefore, calling `subscribe()` makes the `Mono` part execute, but it does not make it a blocking call in the same way that `CompletableFuture.get()` does. `subscribe()` hooks up the logic for handling the eventual result (or error) without pausing the current thread, which is a core principle of reactive programming. The blocking equivalent in the reactive world is the explicit block() method.