---
layout: page
title: Firefighting Drones
description: A year at AirLab that taught me I don't know how to do research yet.
importance: 3
category: research
published: true
related_publications: false
---

I believe that living truthfully has to include the parts of my work that did not go the way I hoped. This page is about my time at **[The AirLab](https://theairlab.org)**, under [Prof. Sebastian Scherer](https://www.ri.cmu.edu/ri-faculty/sebastian-scherer/), working on uncertainty and semantics-aware navigation for quadrotors in wildfire environments. It is also about realizing I had been treating research like something I could just dive into, and that this was a mistake.

I spent about a year on this. I did not leave with a paper, a deployed policy, or a result I would stand behind as finished. What I left with was a much more honest picture of myself.

## The problem I wanted to work on

Wildfire is a genuinely hard robotics environment. The world is visually degraded, constantly changing, and full of objects that look similar while meaning very different things. Smoke is not a tree. A firefighter is not an obstacle in the same way a rock is. Geometry alone does not tell you what is safe to fly near, and a policy that cannot represent its own uncertainty is a dangerous thing to put in the air.

That is the work I wanted to be part of. The lab already had an ongoing project on this and a lot of people who understood the domain far better than I did. I showed up excited.

## Diving in

The first semester I worked with some other students to build a safety layer out of **neural control barrier functions** and **Hamilton-Jacobi reachability**, sitting on top of differentiable simulation. The belief was that if we could combine these tools we would get something that was learnable and formally safer. We worked through this and realized that it was not meaningfully beneficial, and continuing didn't really make sense.

That was a negative result. I had understood, in the abstract, that negative results are part of research, and I continued on with spirits high.

After that I pivoted toward uncertainty and semantics-aware reinforcement learning for reach-avoid tasks. I spent four days writing out a formulation from first principles. Those four days were some of the most fulfilling of my life in terms of work. I felt like I was finally doing research instead of following a recipe. Some labmates were incredibly generous in helping me through ideas that were new to me, and I am still grateful for that.

Looking back, even that high was part of the same pattern. I wrote the formulation quickly because I was excited, not because I had earned a deep understanding of the problem. I built a lot around it. A perceptual oracle. An attention-based architecture. A scene generator. A belief reach-avoid environment with multiple semantic classes. A custom loss. A curriculum over uncertainty and semantic structure.

I was moving and producing artifacts. My spirits were incredibly high, and I was excited.

## The thing I should have noticed sooner

In the second semester I kept going. I hit the milestones I had written down for myself. Then, while trying to finish the comparisons and the hardware story I had promised, I ran into a much more basic problem.

The project had grown larger than I could realistically execute. More importantly, the findings would only have been valid if the simulator itself was incredibly high fidelity. It was not. I had been building methods whose conclusions depended on a world model I could not actually trust. That is not a small implementation issue. That is the ground giving out under the work.

I should have seen this earlier. I didn't, because I had been optimizing for making progress instead of asking whether the question was well posed. I kept adding more and more things to the proposal instead of thoroughly evaluating the groundwork upon which my entire project was built.

I realized close to the end that I needed to completely tear this project down and start from scratch. A labmate had suggested at some point that I look at expanding **[SALON](https://theairlab.org/SALON/)** into a drone setting. SALON is a self-supervised method the lab developed for off-road ground robots, where the system adapts its traversability estimates online from its own experience. I was interested in that, and in bringing uncertainty-awareness into it. I refactored the codebase into pure functions orchestrated through **ROS2**, spent a long time learning the foundational ideas I had skipped over (self-supervised learning among them), and finished formulating how the scheme could extend into 3D so a drone could operate with it.

That took longer than I expected, but I finally felt like I was making progress. I was still catching up on the theory while trying to invent an extension of it. I did not get this to a place where I would call it a result.

The last month or so was the most rewarding. I was finally building the project from the ground up instead of drafting a large proposal and trying to get it all to work at once.

## What I actually learned

I used to think research was mostly about having an idea and then working very hard to implement it. That is how I had succeeded at a lot of other things. It is not how this works.

Halfway through the second semester I started to feel how much faster things go after you take the time to understand every little detail before you try something. I also learned that scope is not a managerial afterthought. If you do not decide what the project is, the project will decide for you, and it will decide to become too large and too unfocused to answer anything.

I need to learn how to do research. Not how to be busy in a lab. Not how to generate formulations and code. How to pick a question that can actually be answered, how to know what would count as evidence, how to notice when the experimental substrate cannot support the claim, and how to stop myself from diving in because diving in feels like progress.

This was a humbling year. I am trying to live more truthfully, and part of that is saying this in public instead of writing a project page that makes the work sound cleaner than it was. I failed at the version of this project I had imagined. I do believe, in many ways, that this was the best thing this project could have taught me. Research is hard. I am just beginning, and I need to be humble and learn more about how to do research from those around me.
