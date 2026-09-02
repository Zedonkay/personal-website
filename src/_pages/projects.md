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
  {% assign shown_filters = 0 %}
  {% for category in page.display_categories %}
    {% assign categorized_projects = site.projects | where: "category", category | where_exp: "project", "project.published != false" %}
    {% if categorized_projects.size > 0 %}
      {% assign shown_filters = shown_filters | plus: 1 %}
    {% endif %}
  {% endfor %}
  {% if shown_filters > 0 %}
    <div class="tag-category-list project-filters">
      <ul class="p-0 m-0">
        {% assign filter_index = 0 %}
        {% for category in page.display_categories %}
          {% assign categorized_projects = site.projects | where: "category", category | where_exp: "project", "project.published != false" %}
          {% if categorized_projects.size > 0 %}
            {% case category %}
              {% when "research" %}
                {% assign category_icon = "fa-flask" %}
              {% when "experience" %}
                {% assign category_icon = "fa-briefcase" %}
              {% when "personal" %}
                {% assign category_icon = "fa-star" %}
              {% else %}
                {% assign category_icon = "fa-tag" %}
            {% endcase %}
            {% if filter_index > 0 %}
              <p>&bull;</p>
            {% endif %}
            <li>
              <a href="#{{ category | slugify }}" data-project-filter="{{ category | slugify }}">
                <i class="fa-solid {{ category_icon }} fa-sm"></i>
                {{ category }}
              </a>
            </li>
            {% assign filter_index = filter_index | plus: 1 %}
          {% endif %}
        {% endfor %}
      </ul>
    </div>
  {% endif %}
  {% for category in page.display_categories %}
    {% assign categorized_projects = site.projects | where: "category", category | where_exp: "project", "project.published != false" %}
    {% if categorized_projects.size > 0 %}
      {% assign sorted_projects = categorized_projects | sort: "importance" %}
      <section class="project-group" id="{{ category | slugify }}" data-group="{{ category | slugify }}">
        <h2 class="category">{{ category }}</h2>
        <ul class="bibliography">
          {% for project in sorted_projects %}
            <li>
              <a class="project-card-link" href="{{ project.url | relative_url }}" aria-label="{{ project.title | strip_html | escape }}"></a>
              {% include project.liquid %}
            </li>
          {% endfor %}
        </ul>
      </section>
    {% endif %}
  {% endfor %}
{% else %}
  {% assign sorted_projects = site.projects | where_exp: "project", "project.published != false" | sort: "importance" %}
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
