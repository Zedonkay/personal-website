---
layout: page
title: projects
permalink: /projects/
description: research, industry, and personal projects.
nav: true
nav_order: 1
display_categories: [research, experience, personal]
---

<!-- pages/projects.md -->
<div class="projects">
{% if site.enable_project_categories and page.display_categories %}
  {% for category in page.display_categories %}
    <h2 class="category" id="{{ category }}">{{ category }}</h2>
    {% assign categorized_projects = site.projects | where: "category", category %}
    {% assign sorted_projects = categorized_projects | sort: "importance" %}
    <ul class="bibliography">
      {% for project in sorted_projects %}
        <li>
          <a class="project-card-link" href="{{ project.url | relative_url }}" aria-label="{{ project.title | strip_html | escape }}"></a>
          {% include project.liquid %}
        </li>
      {% endfor %}
    </ul>
  {% endfor %}
{% else %}
  {% assign sorted_projects = site.projects | sort: "importance" %}
  <ul class="bibliography">
    {% for project in sorted_projects %}
      <li>
        <a class="project-card-link" href="{{ project.url | relative_url }}" aria-label="{{ project.title | strip_html | escape }}"></a>
        {% include project.liquid %}
      </li>
    {% endfor %}
  </ul>
{% endif %}
</div>
