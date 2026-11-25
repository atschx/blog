---
layout: archive
title: 全部文章
permalink: /archive/
exclude_from_nav: true
---
{% include post-ymd.html dated=site.posts.first %}
{% assign latest_ymd = post_ymd %}
{% include post-ymd.html dated=site.posts.last %}
{% assign earliest_ymd = post_ymd %}
{% assign post_count = site.posts | size %}

{% assign archive_years = "" %}
{% for post in site.posts %}
  {% include post-ymd.html dated=post %}
  {% assign y = post_ymd | slice: 0, 4 %}
  {% assign ytok = "," | append: y | append: "," %}
  {% assign yhay = "," | append: archive_years | append: "," %}
  {% unless yhay contains ytok %}
    {% if archive_years == "" %}
      {% assign archive_years = y %}
    {% else %}
      {% assign archive_years = archive_years | append: "," | append: y %}
    {% endif %}
  {% endunless %}
{% endfor %}
{% assign archive_year_list = archive_years | split: "," %}

<p class="archive-kicker">按时间浏览</p>
<h1 class="archive-title">全部文章</h1>
<p class="archive-lead">{{ post_count }} 篇 · {{ earliest_ymd }} 至 {{ latest_ymd }}</p>

<div class="archive-loc">
  <ul class="archive-years" aria-label="有文章的年份">
    {% for year in archive_year_list %}
      {% assign year_count = 0 %}
      {% for post in site.posts %}
        {% include post-ymd.html dated=post %}
        {% assign y = post_ymd | slice: 0, 4 %}
        {% if y == year %}
          {% assign year_count = year_count | plus: 1 %}
        {% endif %}
      {% endfor %}
    <li>
      <a href="#y{{ year }}"{% if forloop.first %} aria-current="location" data-default="true"{% endif %}>{{ year }} <span>{{ year_count }}</span></a>
    </li>
    {% endfor %}
  </ul>
</div>

{% for year in archive_year_list %}
  {% assign month_keys = "" %}
  {% assign year_count = 0 %}
  {% for post in site.posts %}
    {% include post-ymd.html dated=post %}
    {% assign y = post_ymd | slice: 0, 4 %}
    {% if y == year %}
      {% assign year_count = year_count | plus: 1 %}
      {% assign m = post_ymd | slice: 5, 2 %}
      {% assign mtok = "," | append: m | append: "," %}
      {% assign mhay = "," | append: month_keys | append: "," %}
      {% unless mhay contains mtok %}
        {% if month_keys == "" %}
          {% assign month_keys = m %}
        {% else %}
          {% assign month_keys = month_keys | append: "," | append: m %}
        {% endif %}
      {% endunless %}
    {% endif %}
  {% endfor %}
  {% assign month_list = month_keys | split: "," %}
  {% assign month_count = month_list | size %}

<section class="archive-year-block" id="y{{ year }}">
  <h2 class="archive-year-block__title">{{ year }} 年</h2>
  {% if month_count >= 3 %}
  <nav class="archive-month-index" aria-label="{{ year }}年有文章的月份">
    <span class="archive-month-index__label">跳至</span>
    <ol>
      {% for m in month_list %}
        {% assign month_num = m | plus: 0 %}
      <li><a href="#y{{ year }}-{{ m }}">{{ month_num }}月</a></li>
      {% endfor %}
    </ol>
  </nav>
  {% endif %}

  {% for m in month_list %}
    {% assign month_num = m | plus: 0 %}
    {% assign ym = year | append: "-" | append: m %}
    {% assign month_post_count = 0 %}
    {% assign day_keys = "" %}
    {% for post in site.posts %}
      {% include post-ymd.html dated=post %}
      {% assign post_ym = post_ymd | slice: 0, 7 %}
      {% if post_ym == ym %}
        {% assign month_post_count = month_post_count | plus: 1 %}
        {% assign d = post_ymd | slice: 8, 2 %}
        {% assign dtok = "," | append: d | append: "," %}
        {% assign dhay = "," | append: day_keys | append: "," %}
        {% unless dhay contains dtok %}
          {% if day_keys == "" %}
            {% assign day_keys = d %}
          {% else %}
            {% assign day_keys = day_keys | append: "," | append: d %}
          {% endif %}
        {% endunless %}
      {% endif %}
    {% endfor %}
    {% assign day_list = day_keys | split: "," %}
    {% assign day_count = day_list | size %}

  <div class="archive-month-block" id="y{{ year }}-{{ m }}">
    <div class="archive-month-block__head">
      <h3 class="archive-month-block__title">{{ year }}年{{ month_num }}月</h3>
      <span class="archive-month-block__count">{{ month_post_count }} 篇</span>
    </div>
    {% if day_count >= 2 %}
    <details class="archive-dates">
      <summary>该月有文的 {{ day_count }} 天</summary>
      <ul class="archive-date-chips">
        {% for d in day_list %}
        <li><a href="#d{{ year }}-{{ m }}-{{ d }}">{{ d }}</a></li>
        {% endfor %}
      </ul>
    </details>
    {% endif %}
    <ul class="archive-list">
      {% assign prev_day = "" %}
      {% for post in site.posts %}
        {% include post-ymd.html dated=post %}
        {% assign post_ym = post_ymd | slice: 0, 7 %}
        {% if post_ym == ym %}
          {% assign row_label = post.categories.first | default: post.tags.first %}
      <li{% if post_ymd != prev_day %} id="d{{ post_ymd }}"{% endif %}>
        <a class="post-row" href="{{ post.url | relative_url }}">
          <span class="post-row__date"><time datetime="{{ post_ymd }}">{{ post_ymd }}</time></span>
          <span class="post-row__title">{{ post.title }}</span>
          {% if row_label %}<span class="post-row__tag">{{ row_label }}</span>{% endif %}
        </a>
      </li>
          {% assign prev_day = post_ymd %}
        {% endif %}
      {% endfor %}
    </ul>
  </div>
  {% endfor %}
</section>
{% endfor %}
