---
layout: page
title: Robustifying Robot Learning via Adaptive Uncertainty Sets
description: 16-831 Final Project exploring Robust RL and Adaptive Uncertainty Sets
img: assets/img/USPS.png
importance: 2
category: experience
related_publications: true
---

<div class="project-links d-flex justify-content-center flex-wrap mb-4">
  <a href="https://github.com/Zedonkay/USPS" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="fa-brands fa-github"></i> View code
  </a>
  <a href="https://drive.google.com/file/d/1iUQmVxT3T5zffPKwK7S0PveEIJ9G6UpV/view?usp=drive_link" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="fa-solid fa-file-pdf"></i> Read report (PDF)
  </a>
  <a href="https://docs.google.com/presentation/d/1JNTVwLrP13maFzSrtwKe6byPTWaZF-nNuB91YlcTaC8/edit?usp=sharing" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="fa-solid fa-display"></i> View slides
  </a>
</div>

## Overview

Modern robot policies often look great in simulation, but fail when the real world deviates from the training distribution (different masses, friction, contacts, or dynamics). This project tackles that gap using **robust reinforcement learning (RRL)**: instead of optimizing a policy for one “best guess” set of dynamics, we optimize it to perform well under a _set_ of plausible dynamics, so it is less brittle when conditions shift.

Concretely, we build on an approach that defines an **uncertainty set** around the nominal transition model and trains the policy against the _worst-case_ dynamics in that set. The benefit is improved resilience to out-of-distribution changes, but the trade-off is that robustness can become overly conservative: if the uncertainty set is too large, training can slow down or the policy can sacrifice too much nominal performance.

We built on this in two directions. First, we added an **adaptive scaling rule** for the uncertainty-set size (parameterized by \(\alpha\)). Instead of picking a single \(\alpha\) by hand and hoping it works across tasks and training phases, we adjust it over time based on learning progress, aiming to stay robust without “over-regularizing” when the agent is already learning stably.

Second, we extended the evaluation beyond standard benchmarks to a harder **in-hand manipulation** environment, where contact-rich dynamics and compounding errors make robustness and training stability especially important. We reproduced baseline results and ran sensitivity experiments to understand when robustness helps, when it hurts, and how adaptive scaling changes the stability/performance trade-off. If you want the full math, experimental setup, and ablations, the report and slides above contain the complete details.

<!-- ## Quick visuals

<div class="row justify-content-sm-center">
  <div class="col-sm-6 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/fig8_curves.jpg" title="Training curves" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm-6 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/fig5_results.jpg" title="Robustness results" class="img-fluid rounded z-depth-1" %}
  </div>
</div>
<div class="caption">
  A couple highlight plots; the full report has all experiments, ablations, and setup details.
</div> -->
