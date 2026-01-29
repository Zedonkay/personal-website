---
layout: page
title: "Minimal-Downtime Visual Inspection"
description: "Bridging CAD and Computer Vision for Smart Manufacturing at Siemens (Summer 2025)"
img: assets/img/siemens.png
importance: 3
category: experience
toc: false
---

## Project Overview

During my Summer 2025 internship at the **Siemens Detroit Experience Center**, I identified a gap in the automated inspection processes of a mock automotive manufacturing line. The center serves as a "living lab" designed to demonstrate how Siemens technologies empower startups and enterprise manufacturers alike.

My focus was an EV component manufacturing line ("The Electric Box") where an existing computer vision setup had been abandoned due to its limited scope as it could only detect specific black screws. I architected and implemented a modern, scalable computer vision pipeline that utilizes **synthetic data generation** to train models without requiring expensive manufacturing downtime.



---

## The Challenge: The Cost of Data

In high-volume automotive manufacturing, every minute of downtime translates to significant financial loss. Training traditional Computer Vision (CV) models requires:
1.  Stopping the line to capture images of defects.
2.  Manually annotating thousands of images.
3.  Retraining and redeploying.

The existing legacy project at the Experience Center was rigid and unable to adapt to new parts without this costly cycle.

## The Solution: A Digital Twin Pipeline

Leveraging Siemens' dominance in the Product Lifecycle Management (PLM) and CAD ecosystem, I developed a pipeline that uses the "Digital Twin" (CAD data) to train the "Physical Twin" (the robot), effectively bypassing the need for initial real-world data collection.

### 1. Synthetic Data Generation
I utilized the existing CAD files of the EV parts to generate a massive, randomized synthetic dataset.
* **Tools:** NVIDIA IsaacSim, Blender.
* **Technique:** I simulated infinite variations of camera angles, lighting conditions, and object velocities to account for motion blur and occlusions. This ensured the model was robust against environmental variability before it ever saw a real part.



### 2. Hybrid Data & Semiautomatic Annotation
To refine the model for the physical world, I combined the synthetic data with a smaller set of real-world images.
* **Automation:** I wrote custom scripts for the manufacturing robot and cameras to automatically capture images during production runs.
* **Annotation:** I utilized **SAM3 (Segment Anything Model)** to semi-automatically annotate this real-world data, drastically reducing the manual labor required for labeling instance segmentation masks.

### 3. Model Training & Edge Deployment
* **Architecture:** The combined dataset was used to train a **YOLO Instance Segmentation** model.
* **Deployment:** The model was optimized for deployment on a Siemens Edge box (Industrial Edge Device).
* **Integration:** The inference outputs were architected to sync directly with IT/OT systems, closing the loop between the factory floor and the management dashboard.

---

## Impact & Scalability

While the previous iteration of the project was single-use, the pipeline I built was designed for **scalability**.
* **Zero-Downtime Training:** Manufacturers can generate part of the training data for new parts before the physical manufacturing line is even built.
* **Cross-Center Utility:** This architecture was identified as a standard that could be deployed across other Siemens Experience Centers or utilized when major product updates occur, ensuring the inspection systems update instantly alongside the physical product.

I successfully brought the project from the ideation phase through to the deployment stage, handing off the project as my contract came to an end.

---

## Technical Stack

* **Simulation:** NVIDIA IsaacSim, Blender
* **Computer Vision:** YOLO (Instance Segmentation), SAM3 (Annotation)
* **Hardware:** Siemens Industrial Edge, Industrial Robot Arms
* **Languages:** Python (Data pipeline & scripting)