---
title: "Thinking Evals"
description: "Demystifying evals and breaking myths"
pubDate: "Nov 04 2026"
tags: ["llm","ai"]
heroImage: "/blog-images/1793791709150-pexels-satoshi-7526819.jpg"
heroImageTitle: "Photo by <a href=\"https://www.pexels.com/@satoshi/\">Satoshi Hirayama</a>"
---

Recently I created my own coding agent that fits my workflows and was armed with curated skills and system prompts. I had proper guardrails in place in the prompt and was ready to fire the skill for my day to day implementation tasks. I had so much trust in the agent that I  started doing AFKs.
<div style="border: 1px solid #333; padding: 15px; font-size: 0.8em;">
  <small><strong>AFK</strong> (Away from Keyboard) is a term that is now getting popular in agentic style coding (apart from gaming) where you let your coding agent do the work for you autonomously till the requirement is met and with high trust you do a high level review of the PR </small>
</div>

But soon ran into a problem, the same problem that all probabilistic systems have, that is *Non-determinism*. I realized that the guardrails that i put in place as prompts worked flawlessly, but sometimes, it does not seem to work. And then after some reading I came across the term **"evals"**

Now before reading, i had a misconception that evals are supposed to grade the output of your task done by LLM, instead, It actually is a test case for your agent. To put it simply:
> ***Evals*** are the used for evaluating and testing your agents and not your agent's "output"

Yes, it confused me at first too, but if you really think about it, you should be able to actually trust your agent first before actually letting it touch your codebase. And in order to trust your agent you should be able to write tests for your agent that it should pass not once, not twice but most of the times. This is where you change your mindset from deterministic outcome to **"near determinism"**. The agent should be designed to move near determinism, because due to the nature of this technology (LLM), we can not guarantee 100% deterministic output.

## Judges
Given a piece of codebase / jira ticket , i expect my agent to do a certain task, the output should be correct according to me. Hence we need **judges** for evals as well. Judges are the evaluators that evaluate output of your agent. There are 2 types of judges :
- **LLM Judge** : a separate LLM that works as a judge to the output of the code. these type of judges are used when the outcome cannot be deterministically evaluated. E.g. Code quality, using constants instead of raw strings etc.
- **Script Judge** : these are deterministic judges. E.g.: Creation of PR file in knowledge base post raising the PR, updating the changelog of a library when publishing, etc.
<div style="border: 1px solid #333; padding: 15px; font-size: 0.8em;">
  <small>LLM judges also needs to be evaluated, the evals should be similar to unit tests, very small and modular so that it can be evaluated easily. You can also use classifier models like Jev or <a href="https://huggingface.co/convaiinnovations/laya">laya</a> for classifying and passing / non passing your agent's output</small>
</div>

## How I create my evals
I usually create evals backwards of my PR. Whenever I review the PR, I have code snippets where the output of my agent is not as expected as was intended. I use that snippet and intent for creating evals, also adding the expected output (using judges). And for each evals i run 2-3 runs. 

## Improving your agent
Once evals are in place, run them weekly to check where the agent is failing, your failures can then be reduced by improving your harness and skills, either by changing prompts or using better language altogether. Over time your agent's output becomes much better in quality and will move towards deterministic behavior, making it easier to tune.
