---
layout: page
title: RoboDSL
description: A Domain-Specific Language for GPU-accelerated robotics applications with ROS2 and CUDA
img: assets/img/Robodsl.png
importance: 3
category: personal
github: https://github.com/Zedonkay/robodsl
related_publications: false
---

<div class="project-links d-flex justify-content-center flex-wrap mb-4">
  <a href="https://github.com/Zedonkay/robodsl" target="_blank" rel="noopener" class="btn btn-outline-secondary m-1">
    <i class="fab fa-github"></i> GitHub
  </a>
</div>

## Overview

**RoboDSL** is a Domain-Specific Language (DSL) that simplifies the development of GPU-accelerated robotics applications. It provides a high-level abstraction that automatically generates optimized C++/CUDA code with ROS2 integration, allowing developers to focus on algorithm design rather than low-level boilerplate.

The core idea is straightforward: you write declarative `.robodsl` files that describe your robotics pipelines—CUDA kernels, ONNX models, ROS2 nodes, and multi-stage processing workflows—and RoboDSL generates the production-ready C++/CUDA infrastructure for you.

---

## Key Features

- **GPU Acceleration**: Native CUDA kernel generation with type-safe wrappers and memory management
- **ROS2 Integration**: Automatic ROS2 node generation with QoS configuration, lifecycle management, and topic pub/sub
- **ML Model Support**: ONNX Runtime integration with optional TensorRT optimization for inference
- **Pipeline Orchestration**: Multi-stage processing pipelines that chain preprocessing, CUDA kernels, and ML models
- **Template-Driven Generation**: Jinja2-based code generation for maintainability and extensibility

---

## Architecture & Implementation

RoboDSL is built around a modular, AST-first architecture:

- **Lark Parser**: Robust grammar parsing with the `.robodsl` syntax, producing an Abstract Syntax Tree
- **Semantic Analysis**: Validation and type-checking before code generation
- **Code Generators**: Template-based generation for C++, CUDA, CMake, Python nodes, and ROS2 launch files
- **CLI Tooling**: `robodsl` command-line interface for building projects from `.robodsl` specs

The project also includes a VS Code extension for syntax highlighting and language support, plus comprehensive tests and documentation.

---

## Example

A minimal RoboDSL pipeline might define a CUDA preprocessing kernel, an ONNX detection model, and a ROS2 node—all in a single declarative file. Running `colcon build` (or the equivalent RoboDSL build command) generates the full C++/CUDA package, CMake configuration, and launch files.

---

## Tech Stack

- **Languages**: Python 3.8+, C++, CUDA
- **Parsing**: Lark
- **Code Generation**: Jinja2
- **Robotics**: ROS2
- **ML / Vision**: ONNX Runtime, OpenCV

---

## Links

- **Repository**: [https://github.com/Zedonkay/robodsl](https://github.com/Zedonkay/robodsl)
- **Documentation**: [https://robodsl.readthedocs.io](https://robodsl.readthedocs.io)
