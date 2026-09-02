---
layout: page
title: Rigging Magic
description: 15-418 Final Project exploring GPU-accelerated SPH fluid simulation with rigid-body coupling
img: assets/video/midpoint_demo.webm
importance: 2
category: experience
github: https://github.com/Zedonkay/8-ball-sim
website: https://zedonkay.github.io/rigging-magic/
pdf: https://zedonkay.github.io/rigging-magic/final-report.html
related_publications: false
---

<div class="project-links d-flex justify-content-center flex-wrap mb-4">
  <a href="https://github.com/Zedonkay/8-ball-sim" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="fa-brands fa-github"></i> View code
  </a>
  <a href="https://zedonkay.github.io/rigging-magic/final-report.html" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="fa-solid fa-file-lines"></i> Read report
  </a>
  <a href="https://zedonkay.github.io/rigging-magic/" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="fa-solid fa-lightbulb"></i> View proposal
  </a>
  <a href="https://zedonkay.github.io/rigging-magic/updates.html" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="fa-solid fa-clock-rotate-left"></i> Project updates
  </a>
</div>

<div class="text-center mb-4 project-demo-video">
  <video class="preview" controls playsinline preload="metadata" width="100%">
    <source src="{{ '/assets/video/midpoint_demo.webm' | relative_url }}" type="video/webm">
  </video>
</div>

## Overview

A Magic 8 Ball is a deceptively simple object: a die suspended in fluid inside a sealed sphere. Shake it, and the fluid sloshes, the die tumbles, and eventually one face settles against the viewing window. Reproducing that motion faithfully is a coupled physics problem—thousands of fluid particles interacting with each other, the rigid die, and the spherical container—at a scale where brute-force simulation is far too slow for real-time use.

This project, with **Aidan Vogt**, builds that simulator using **smoothed particle hydrodynamics (SPH)** on the CPU first, then ports the full timestep pipeline to **CUDA** so each particle update can run in parallel on the GPU. The fluid uses Poly6, spiky, and viscosity kernels for density, pressure, and viscous forces; wall **ghost particles** provide boundary support near the sphere; and a neutrally buoyant rigid cube die is coupled two-way through contact and drag, with adaptive time stepping driven by acoustic, force, and viscous CFL limits.

The hard part is not the physics formulas—it is making neighbor search and force accumulation fast enough to matter. Naive all-pairs search is \(O(N^2)\); we use uniform spatial hashing (later geometric binning on GPU) so each particle only checks nearby cells. On the GPU, die reaction forces require reductions across threads, and early versions paid heavily for host–device transfers every step. Keeping state on the device, switching from Thrust to pre-allocated CUB sorts, fusing kernels, and eliminating redundant checks in neighbor-list construction were the main levers that took us from modest speedups to a **~96×** steady-state improvement over the serial CPU baseline at our target problem size (~3,500 particles in a realistic 8-ball geometry).

We hit our real-time goal: the GPU simulator sustains **60 Hz** physics stepping. Rendering was the next bottleneck—the matplotlib visualizer could not keep up—so we added a lightweight **C++ OpenGL fast viewer** that streams `SIM2` frames for live remote preview. The CPU and GPU builds share the same binary frame format, so behavior can be compared and debugged offline.

If you want the full pipeline breakdown, profiling tables, and optimization ablation, the [final report](https://zedonkay.github.io/rigging-magic/final-report.html) has the complete details. The [proposal](https://zedonkay.github.io/rigging-magic/) and [mid-project update](https://zedonkay.github.io/rigging-magic/updates.html) trace how the plan evolved from a CPU-first schedule to a CUDA-focused finish.
