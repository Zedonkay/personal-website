---
layout: page
permalink: /library/
title: library
description: Books, films, shows, articles, videos, and podcasts I keep returning to.
nav: true
nav_order: 4
---

<div class="library">
{% assign library_items = site.data.library.items %}
{% if library_items == nil %}
  {% assign library_items = "" | split: "" %}
{% endif %}
{% assign type_order = "book,film,show,article,video,podcast" | split: "," %}
{% if library_items.size > 0 %}
  <div class="tag-category-list library-filters">
    <ul class="p-0 m-0">
      {% assign filter_index = 0 %}
      {% for type in type_order %}
        {% assign typed_items = library_items | where: "type", type %}
        {% if typed_items.size > 0 %}
          {% case type %}
            {% when "book" %}
              {% assign type_label = "books" %}
              {% assign type_icon = "fa-book" %}
            {% when "film" %}
              {% assign type_label = "films" %}
              {% assign type_icon = "fa-clapperboard" %}
            {% when "show" %}
              {% assign type_label = "shows" %}
              {% assign type_icon = "fa-tv" %}
            {% when "article" %}
              {% assign type_label = "articles" %}
              {% assign type_icon = "fa-newspaper" %}
            {% when "video" %}
              {% assign type_label = "videos" %}
              {% assign type_icon = "fa-film" %}
            {% when "podcast" %}
              {% assign type_label = "podcasts" %}
              {% assign type_icon = "fa-podcast" %}
          {% endcase %}
          {% if filter_index > 0 %}
            <p>&bull;</p>
          {% endif %}
          <li>
            <i class="fa-solid {{ type_icon }} fa-sm"></i>
            <a href="#{{ type_label }}">{{ type_label }}</a>
          </li>
          {% assign filter_index = filter_index | plus: 1 %}
        {% endif %}
      {% endfor %}
    </ul>
  </div>
  {% for type in type_order %}
    {% assign typed_items = library_items | where: "type", type %}
    {% unless type == "film" or type == "show" %}
      {% assign typed_items = typed_items | sort: "date" | reverse %}
    {% endunless %}
    {% if typed_items.size > 0 %}
      {% case type %}
        {% when "book" %}
          {% assign type_label = "books" %}
        {% when "film" %}
          {% assign type_label = "films" %}
        {% when "show" %}
          {% assign type_label = "shows" %}
        {% when "article" %}
          {% assign type_label = "articles" %}
        {% when "video" %}
          {% assign type_label = "videos" %}
        {% when "podcast" %}
          {% assign type_label = "podcasts" %}
      {% endcase %}
      <h2 class="library-section-title" id="{{ type_label }}">{{ type_label }}</h2>
      <ul class="library-gallery">
        {% for item in typed_items %}
          <li class="library-card">
            {% if item.image %}
              <a class="library-card-thumb" href="{{ item.url }}" target="_blank" rel="noopener">
                {%
                  include figure.liquid
                  path=item.image
                  alt=item.title
                  class="library-card-image"
                  sizes="(min-width: 768px) 30vw, 90vw"
                %}
              </a>
            {% endif %}
            <div class="library-card-body">
              <h3>
                <a class="post-title" href="{{ item.url }}" target="_blank" rel="noopener">{{ item.title }}</a>
                {% if item.companion.title and item.companion.url %}
                  <span class="library-cofeature" aria-hidden="true">/</span>
                  <a class="post-title" href="{{ item.companion.url }}" target="_blank" rel="noopener">{{ item.companion.title }}</a>
                {% endif %}
                <i class="fa-solid fa-arrow-up-right-from-square fa-xs library-external" aria-hidden="true"></i>
              </h3>
              {% if item.note %}
                <div class="library-note">{{ item.note | markdownify }}</div>
              {% endif %}
              <p class="post-meta">
                {% if item.creator %}{{ item.creator }}{% endif %}
                {% if item.creator and item.source %}&nbsp;&middot;&nbsp;{% endif %}
                {% if item.source %}{{ item.source }}{% endif %}
                {% if item.date %}
                  {% if item.creator or item.source %}&nbsp;&middot;&nbsp;{% endif %}
                  {{ item.date | date: "%B %d, %Y" }}
                {% endif %}
              </p>
            </div>
          </li>
        {% endfor %}
      </ul>
    {% endif %}
  {% endfor %}
{% else %}
  <p class="library-empty">Nothing here yet. This is where I'll keep books, films, shows, articles, videos, and conversations worth returning to.</p>
{% endif %}
</div>
