---
layout: page
title: Autonomous Racing: RL Control
description: Research at Carnegie Mellon Racing (CMR) condensing the autonomous navigation pipeline using Model-Free RL.
img: assets/img/CMR.png
importance: 1
category: experience
related_publications: true
---

## Overview

At Carnegie Mellon Racing (CMR), we build a new electric racecar annually to compete in Formula SAE events. While traditional competitions focus on human-driven performance, Formula SAE is transitioning toward driverless competitions—a shift our team has spearheaded for several years.

I joined the team during my sophomore year, initially focusing on optimizing the **Model Predictive Path Integral (MPPI)** control algorithm. I subsequently took on a leadership position, directing a team of 4-6 engineers to develop a reinforcement learning (RL) based controller to overcome the specific constraints of our hardware and competition rules.

## The Challenge: Trackdrive

The core challenge of the driverless event is "Trackdrive." The vehicle must navigate a track defined solely by cones—blue cones on the left, yellow on the right, and orange indicating the start—for 10 laps. The standard strategy involves two phases:

1.  **Mapping:** Cautiously driving the first few laps to construct a map of the environment (SLAM).
2.  **Racing:** Utilizing the generated map to drive as aggressively as possible.

However, our specific constraints made the traditional **Perception $\rightarrow$ SLAM $\rightarrow$ Planning $\rightarrow$ Control** pipeline difficult to execute effectively.

### Key Constraints

- **Hardware Limitations:** We migrated our compute stack to a **Jetson Orin**. Running full SLAM and a race-line optimization algorithm simultaneously introduced unacceptable latency.
- **Data Scarcity:** As we use a single vehicle for both driver and driverless events, testing time is severely limited. Furthermore, logistical issues (such as local track closures requiring travel to West Virginia) make real-world data collection sparse.
- **System Variance:** As a student-built prototype, the vehicle is subject to manufacturing tolerances and mechanical changes up until race day, making accurate system identification difficult.

## The Solution: Model-Free RL & Real2Sim2Real

To address these latency and data constraints, I led the initiative to "condense the pipeline" by developing a **Model-Free RL Controller + Planner** supported by a **Real2Sim2Real** dynamics module.

### 1. End-to-End Control Policy

Instead of relying on heavy online computation for trajectory optimization (like MPPI), we shift the computational burden to the training phase. Our architecture is designed to sit immediately downstream of the perception module (and potentially SLAM), outputting control actions directly to the vehicle.

- **Architecture:** We utilize custom state and action spaces with a specialized reward function designed for time-optimal racing (details to be released with the codebase).
- **Validation:** We are currently sanity-checking our implementation on an **F1Tenth** scale vehicle before full-scale deployment.

### 2. Real2Sim2Real Dynamics Module

Since RL allows for offline training, we can leverage high-fidelity simulations to solve the data scarcity problem.

- **Simulation:** We utilize **CarMaker**, which provides a high-fidelity physics engine. We possess models of previous and current vehicles, allowing us to parameterize vehicle dynamics extensively.
- **Domain Randomization:** By varying physical parameters in simulation, we create a diverse dataset of vehicle behaviors. This enables us to train a robust policy that can adapt to the "real" vehicle despite mechanical variances.
- **Few-Shot Adaptation:** We are developing a pipeline to fine-tune the dynamics module using limited real-world data once the physical car is operational.

## Future Work

We are currently exploring methods for online adaptation to allow the policy to adjust to track conditions on race day (Sim2Real deployment). Full methodology, citations, and specific architectural details will be included in our upcoming code release.
