---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 3
pagination:
  enabled: false
  collection: posts
  permalink: /page/:num/
  per_page: 5
  sort_field: date
  sort_reverse: true
  trail:
    before: 1 # The number of links before the current page
    after: 3 # The number of links after the current page
---

<div class="post blog-index">

{% assign blog_name_size = site.blog_name | size %}
{% assign blog_description_size = site.blog_description | size %}

{% if blog_name_size > 0 or blog_description_size > 0 %}

  <div class="header-bar">
    <h1>{{ site.blog_name }}</h1>
    <p class="post-description">{{ site.blog_description }}</p>
  </div>
  {% endif %}

{% assign shown_filters = 0 %}
{% for tag in site.display_tags %}
{% if site.tags[tag] and site.tags[tag].size > 0 %}
{% assign shown_filters = shown_filters | plus: 1 %}
{% endif %}
{% endfor %}
{% for category in site.display_categories %}
{% if site.categories[category] and site.categories[category].size > 0 %}
{% assign shown_filters = shown_filters | plus: 1 %}
{% endif %}
{% endfor %}

{% if shown_filters > 0 %}

  <div class="tag-category-list blog-filters">
    <ul class="p-0 m-0">
      {% assign filter_index = 0 %}
      {% for tag in site.display_tags %}
        {% if site.tags[tag] and site.tags[tag].size > 0 %}
        {% if filter_index > 0 %}
          <p>&bull;</p>
        {% endif %}
        <li>
          <a href="#tag-{{ tag | slugify }}" data-blog-filter="tag-{{ tag | slugify }}">
            <i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}
          </a>
        </li>
        {% assign filter_index = filter_index | plus: 1 %}
        {% endif %}
      {% endfor %}
      {% for category in site.display_categories %}
        {% if site.categories[category] and site.categories[category].size > 0 %}
        {% if filter_index > 0 %}
          <p>&bull;</p>
        {% endif %}
        <li>
          <a href="#category-{{ category | slugify }}" data-blog-filter="category-{{ category | slugify }}">
            <i class="fa-solid fa-tag fa-sm"></i> {{ category }}
          </a>
        </li>
        {% assign filter_index = filter_index | plus: 1 %}
        {% endif %}
      {% endfor %}
    </ul>
  </div>
  {% endif %}

{% assign featured_posts = site.posts | where: "featured", "true" %}
{% if featured_posts.size > 0 %}
<br>

<div class="container featured-posts">
{% assign is_even = featured_posts.size | modulo: 2 %}
<div class="row row-cols-{% if featured_posts.size <= 2 or is_even == 0 %}2{% else %}3{% endif %}">
{% for post in featured_posts %}
<div class="col mb-4">
<a href="{{ post.url | relative_url }}">
<div class="card hoverable">
<div class="row g-0">
<div class="col-md-12">
<div class="card-body">
<div class="float-right">
<i class="fa-solid fa-thumbtack fa-xs"></i>
</div>
<h3 class="card-title text-lowercase">{{ post.title }}</h3>
<p class="card-text">{{ post.description }}</p>

                    {% if post.external_source == blank %}
                      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
                    {% else %}
                      {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
                    {% endif %}
                    {% assign year = post.date | date: "%Y" %}

                    <p class="post-meta">
                      {{ read_time }} min read &nbsp; &middot; &nbsp;
                      <i class="fa-solid fa-calendar fa-sm"></i> {{ year }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      {% endfor %}
      </div>
    </div>
    <hr>

{% endif %}

  <ul class="post-list">

    {% assign postlist = site.posts %}

    {% for post in postlist %}

    {% if post.external_source == blank %}
      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
    {% else %}
      {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
    {% endif %}
    {% assign year = post.date | date: "%Y" %}
    {% assign tags = post.tags | join: "" %}
    {% assign categories = post.categories | join: "" %}

    <li
      data-blog-tags="{% for tag in post.tags %}{{ tag | slugify }}{% unless forloop.last %} {% endunless %}{% endfor %}"
      data-blog-categories="{% for category in post.categories %}{{ category | slugify }}{% unless forloop.last %} {% endunless %}{% endfor %}"
      data-blog-year="{{ year }}"
    >

{% if post.thumbnail %}

<div class="row">
          <div class="col-sm-9">
{% endif %}
        <h3>
        {% if post.redirect == blank %}
          <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        {% elsif post.redirect contains '://' %}
          <a class="post-title" href="{{ post.redirect }}" target="_blank">{{ post.title }}</a>
          <svg width="2rem" height="2rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        {% else %}
          <a class="post-title" href="{{ post.redirect | relative_url }}">{{ post.title }}</a>
        {% endif %}
      </h3>
      <p>{{ post.description }}</p>
      <p class="post-meta">
        {{ read_time }} min read &nbsp; &middot; &nbsp;
        {{ post.date | date: '%B %d, %Y' }}
        {% if post.external_source %}
        &nbsp; &middot; &nbsp; {{ post.external_source }}
        {% endif %}
      </p>
      <p class="post-tags">
        <a href="#year-{{ year }}" data-blog-filter="year-{{ year }}">
          <i class="fa-solid fa-calendar fa-sm"></i> {{ year }} </a>

          {% if tags != "" %}
          &nbsp; &middot; &nbsp;
            {% for tag in post.tags %}
            <a href="#tag-{{ tag | slugify }}" data-blog-filter="tag-{{ tag | slugify }}">
              <i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}</a>
              {% unless forloop.last %}
                &nbsp;
              {% endunless %}
              {% endfor %}
          {% endif %}

          {% if categories != "" %}
          &nbsp; &middot; &nbsp;
            {% for category in post.categories %}
            <a href="#category-{{ category | slugify }}" data-blog-filter="category-{{ category | slugify }}">
              <i class="fa-solid fa-tag fa-sm"></i> {{ category }}</a>
              {% unless forloop.last %}
                &nbsp;
              {% endunless %}
              {% endfor %}
          {% endif %}
    </p>

{% if post.thumbnail %}

</div>

  <div class="col-sm-3">
    <img class="card-img" src="{{ post.thumbnail | relative_url }}" style="object-fit: cover; height: 90%" alt="image">
  </div>
</div>
{% endif %}
    </li>

    {% endfor %}

  </ul>

  <p class="blog-filter-empty" hidden>No posts match this filter.</p>

</div>
