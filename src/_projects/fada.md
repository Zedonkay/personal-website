---
layout: page
title: FADA
description: Few-shot domain adaptation for humanoid control via dynamics alignment
img: assets/img/fada/teaser-fig.png
importance: 1
category: research
published: true
website: https://lecar-lab.github.io/FADA-humanoid/
pdf: https://arxiv.org/pdf/2606.28476
related_publications: true
---

<div class="project-links d-flex justify-content-center flex-wrap mb-4">
  <a href="https://lecar-lab.github.io/FADA-humanoid/" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="fa-solid fa-globe"></i> Project Website
  </a>
  <a href="https://arxiv.org/abs/2606.28476" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="ai ai-arxiv"></i> arXiv
  </a>
  <a href="https://arxiv.org/pdf/2606.28476" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="fa-solid fa-file-pdf"></i> Paper
  </a>
</div>

<div class="text-center mb-4 project-demo-video">
  <video class="preview" controls playsinline preload="metadata" width="100%" poster="{{ '/assets/img/fada/teaser-fig.png' | relative_url }}">
    <source src="https://lecar-lab.github.io/FADA-humanoid/videos/fada-overview.mp4" type="video/mp4">
  </video>
</div>

## Overview

At the **[LeCAR Lab](https://lecar-lab.github.io/)**, advised by [Prof. Guanya Shi](https://www.gshi.me/), I worked on few-shot domain adaptation for humanoid locomotion and whole-body tracking. The question we started from was simple: if a robot already knows _what_ motion to produce, can a few minutes of its own deployment rollouts teach it _how_ to produce that motion under new physics?

**FADA** (Few-Shot Domain Adaptation via Dynamics Alignment) is our answer. We split the controller into a **planner** that predicts short-horizon motion intent and an **inverse dynamics model (IDM)** that turns that intent into actions. At deployment we freeze the planner and finetune only the IDM from roughly **two minutes** of onboard rollouts — no rewards, no mocap, no labeling, and no simulator refitting.

After that update, a Unitree G1 can track a line up a narrow slope, dance with a 3.2 kg front load, and run Kung Fu on soft mats; a Booster T1 can pull a 6 kg laundry basket and circle-walk with an asymmetric arm payload. Zero-shot transfer fails at these tasks.

This is joint work with [Angchen Xie](https://angchenxie.github.io/), [Nikhil Sobanbabu](https://nike353.github.io/), [Alan Wang](https://www.linkedin.com/in/alanwang137825/), [Max Simchowitz](https://msimchowitz.github.io/), and [Guanya Shi](https://www.gshi.me/). The paper is in submission to CoRL 2026 and was accepted at the RSS 2026 Sim2Real Workshop.
{% nocite fada2026 %}

---

## The Challenge: Dynamics Mismatch

Humanoid policies are trained in simulation, where you can fall, collide, and randomize physics at scale. On hardware, the same command no longer produces the same body motion. Terrain, payload, actuator response, and contact all shift the dynamics, and on a tightly coupled whole-body system a few centimeters of foot-placement error is enough to walk off a ramp or stall a pull.

The usual responses sit at two extremes:

- **Zero-shot robustness** (domain randomization, history-conditioned in-context adapters) never updates weights on the target robot, so the policy stays conservative under the actual deployment condition.
- **Heavy target-domain learning** (system ID, residual dynamics, real-world RL, full-policy finetuning) can specialize, but it wants a model to fit, a reward to optimize, or expert demonstrations to imitate.

We wanted the middle: use the robot's own imperfect rollouts, and update only the part of the policy that actually depends on the new physics.

---

## The Solution: Freeze Intent, Realign Execution

Under a dynamics shift, the _task intent_ is often still right. Walking up the ramp still means placing feet on the plank; pulling the basket still means leaning back and driving contact. What changes is the action required to realize that intent.

FADA makes that split explicit. A **planner** maps the command and recent observations to a short-horizon proprioceptive future — the motion the robot should produce. An **IDM** maps that future, plus recent execution history, to an action chunk. At deployment we freeze the planner and finetune only the IDM, so the robot keeps the same command-to-intent interface and learns a new plan-to-action map.

{%
  include figure.liquid
  path="assets/img/fada/architecture.png"
  class="img-fluid rounded z-depth-1"
  zoomable=true
  alt="Planner–IDM architecture. The planner predicts a short-horizon proprioceptive future; the IDM maps that future and recent history to an action chunk."
  caption="The planner predicts a K-step proprioceptive future. The IDM attends to that future and to recent observation–action history, then emits an action chunk. Only the first action is executed in a receding-horizon loop."
%}

A fixed-base arm experiment makes the split concrete. The arm tracks the same Cartesian targets while the wrist payload jumps from 0 kg to 5 kg. The planner's predicted joint configuration barely moves (~7%), because the kinematics did not change. Finetuning only the IDM cuts tracking error by ~24%: the required correction is a structured, configuration-dependent inverse-dynamics update, not a constant action offset.

{%
  include figure.liquid
  path="assets/img/fada/framework.png"
  class="img-fluid rounded z-depth-1"
  zoomable=true
  alt="FADA three-stage pipeline from oracle training through few-shot IDM adaptation to hardware deployment."
  caption="Source training happens in IsaacSim. Target adaptation uses a few ordinary rollouts on hardware or in a held-out simulator, with LoRA adapters on the IDM."
%}

### 1. Privileged Oracle

We train a teacher in IsaacSim with task rewards and privileged state (contacts, terrain, actuator parameters, sampled randomization). This policy is not deployable; it exists to label good behavior.

### 2. Planner–IDM Distillation

A student that sees only proprioception is trained with DAgger. Two losses matter. The IDM is supervised on the _executed_ first action associated with a realized future — including suboptimal student rollouts — so the same objective later applies to imperfect target data. The planner is trained _through_ a stop-gradient IDM, so it has to emit futures that actually produce oracle-consistent actions, not futures that merely look like oracle observations.

### 3. Few-Shot IDM Adaptation

We roll out the source student in the target domain, freeze the planner and the pretrained IDM, and train LoRA adapters with the same first-action inverse-dynamics loss. Locomotion uses ~2 minutes at 50 Hz; whole-body tracking uses six repetitions of a ~20 s motion. Full IDM finetuning overfits this budget; LoRA does not.

Both modules are small transformers. The IDM decoder uses full attention over the predicted future, so later tokens can shape the deployed first action even though only that first action is supervised.

---

## Results

We evaluated on a **Unitree G1** (29 DoF) and a **Booster T1** (23 DoF), in IsaacSim-to-MuJoCo transfer and on hardware. Baselines share the same privileged oracle: a transformer DAgger student with no target update, and a co-prediction world-model-style student that we also finetune on target rollouts.

On hardware, few-shot IDM adaptation improves all five quantitative tasks:

- **Completion.** Average success on slope traversal and basket pulling goes from **20%** zero-shot to **90%**. The transformer DAgger baseline finishes neither.
- **Tracking.** Normalized velocity / MPJPE error drops **27%** versus our own zero-shot student and **16%** versus transformer DAgger, across grocery carrying, Kung Fu on soft mats, and T1 payload circling.

The same pattern holds in sim-to-sim. Averaged across five G1/T1 tasks, FADA reduces normalized error **25%** versus zero-shot and **27%** versus transformer DAgger. The largest gain is on T1 Falcon, a force-adaptive locomotion task where a persistent 30 N pull has to be compensated — exactly the setting where a mismatched action map hurts. Finetuning the co-prediction baseline on a future-observation loss _worsens_ transfer: better next-state prediction is not the same as a better action generator.

Two things we learned from ablations: the training objective has to match receding-horizon execution (supervising the full action chunk instead of the first action drops tracking success from 10/10 to 4/10), and the ~2 minute budget is already on the plateau. A few hundred steps is not enough; more data after that does not keep helping.

A lot of humanoid sim-to-real failure is not a failure of task intent. The robot still tries to walk the ramp, pull the basket, or hit the Kung Fu keyframes; the actions no longer induce the intended motion. If you freeze intent and realign execution from the robot's own paired observations and actions, a few minutes of data is enough to recover high-precision whole-body skills.

Hardware videos, charts, and an interactive arm demo are on the [project website](https://lecar-lab.github.io/FADA-humanoid/). If you want the full experimental setup and ablations, the [paper](https://arxiv.org/abs/2606.28476) has the complete details.
