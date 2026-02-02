---
layout: page
title: Eigenbot
description: Research with biorobotics laboratory
img: assets/img/CMR.png
importance: 3
category: research
related_publications: true
---

<div class="project-links d-flex justify-content-center flex-wrap mb-4">
  <a href="https://eigenbot-dnlc.github.io" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="fa-solid fa-globe"></i> Project Website
  </a>
</div>

## Early Research: MedSnake

My first exposure to research was at the **Biorobotics Laboratory**. When I first joined, I was put onto the **MedSnake** project, where the goal was to develop a robotic snake for cardiovascular surgery. The basic idea was that the snake could articulate itself into unique positions; when a surgical implement or tool was passed through the snake, it could utilize all of the snake's degrees of freedom (DOF) to operate on the patient from complex angles.

This was my first exposure to robotics, and since I was only on the project for a month, I spent most of it learning **ROS**, **C++**, and how to work with simulation tools like **Gazebo**. I was hoping to continue doing robotics research the summer after my freshman year to learn more, but I quickly learned that the MedSnake project was being put on hold while waiting for FDA approval.

---

## Eigenbot: Modular Robotics

As a result, I was put onto a different project called **Eigenbot**. The core concept was a modular "many robots in one box" system. You would receive a box of parts with various modules, each containing a microprocessor, sensors, and potentially a motor. These modules were shaped differently, allowing you to configure a hexapod, a quadruped, a wheeled robot, or a system with grippers. The project had already established a communication platform that allowed upstream and downstream communication between the "central brain" and the individual modules.

### Bio-Inspired Locomotion & ICRA Publication

The team realized that this distributed platform was remarkably similar to a **ganglia structure**, which is what allows certain insects to have such robust motion. We specifically studied stick insects, which are easy to keep in captivity and possess very robust locomotion. We used this distributed platform to see if a few laws of stick insect motion from biology papers could make the robot robust on unseen terrain or during limb amputation.

Our findings on this distributed approach were **published at ICRA** (International Conference on Robotics and Automation), proving that these biological laws significantly enhanced locomotion resilience.

---

## Research & Analysis

My role involved a diverse range of tasks across the robotics stack, from low-level implementation to high-level mathematical analysis:

- **Algorithmic Development:** Worked on everything from **Embedded C** to algorithm tuning, sim-to-real deployment, and improving curve-walking algorithms in simulation.
- **Success Metrics & Chaos Theory:** I explored various analytical methods to determine how successful the robot's locomotion actually was. This included diving into **Chaos Theory-based analysis** to study the stability and non-linear dynamics of the distributed gait patterns.

> Through experiments on unseen terrain and simulated amputation, we demonstrated that decentralized, bio-inspired control laws allow for a level of adaptability that traditional centralized systems struggle to match.
