---
layout: about
title: biography
permalink: /about/
---

<p class="about-kicker">biography</p>
<div class="about-layout">
  <div class="about-portrait">
    <a class="about-photo" href="https://github.com/atschx">
      <img src="https://avatars3.githubusercontent.com/u/4844245?v=3&s=400" alt="atschx" width="400" height="400">
    </a>
  </div>
  <div class="about-main">
    <h1 class="about-name">atschx</h1>
    <p class="about-statement">Not only a <em class="about-word">Programmer</em>.</p>
    <p class="about-links">
      <a class="about-ext-link" href="https://github.com/atschx">GitHub ↗</a>
    </p>

    <section class="about-block" aria-labelledby="jobs-label">
      <p class="about-block__label" id="jobs-label">Steve Jobs</p>
      <div class="about-pairs">
        {% for pair in site.data.about_quotes.jobs %}
        {% include about-pair.html en=pair.en zh=pair.zh %}
        {% endfor %}
      </div>
      <p class="about-attr"><span lang="en">— Steve Jobs</span> · <span lang="zh-Hans">史蒂夫·乔布斯</span></p>
    </section>

    <div class="about-bridge" role="note">
      <p class="about-bridge__en" lang="en">So I choose to move forward first, and only then can I look back.</p>
      <p class="about-bridge__zh" lang="zh-Hans">所以我选择先往前，然后才有回头看的资格。</p>
    </div>

    <figure class="about-block" aria-labelledby="benjamin-label">
      <p class="about-block__label" id="benjamin-label">Benjamin Button</p>
      <div class="about-pairs">
        {% for pair in site.data.about_quotes.benjamin %}
        {% include about-pair.html en=pair.en zh=pair.zh tight=pair.tight %}
        {% endfor %}
      </div>
      <figcaption class="about-source">
        电影《本杰明·巴顿奇事》（<cite lang="en">The Curious Case of Benjamin Button</cite>，2008）剧本，编剧 Eric Roth。中文为自译。<a class="about-source__ref" href="https://www.falmouthpubliclibrary.org/blog/the-curious-case-of-misquotation/">出处考证</a>
      </figcaption>
    </figure>

    <section class="about-block about-works" aria-labelledby="about-works-label">
      <h2 id="about-works-label" class="about-block__label">
        <span lang="en">Selected work</span>
        <span lang="zh-Hans">代表作品</span>
      </h2>
      <ul class="about-works__list">
        <li class="about-works__item">
          <a class="about-works__name" href="https://github.com/atschx/fs-monitor">FS-Monitor ↗</a>
          <p class="about-works__en" lang="en">A team-made macOS tool that explains how a chosen folder grows. It is a test prerelease.</p>
          <p class="about-works__zh" lang="zh-Hans">与团队一起做的 macOS 目录增长说明工具，目前是测试预发布。</p>
        </li>
        <li class="about-works__item">
          <a class="about-works__name" href="https://github.com/atschx/cosmic-elements-exhibit">Cosmic Elements Exhibit ↗</a>
          <p class="about-works__en" lang="en">A web recreation of the Shanghai Astronomy Museum's "Cosmic Nucleosynthesis" exhibit.</p>
          <p class="about-works__zh" lang="zh-Hans">上海天文馆「宇宙元素起源表」互动展陈的网页复刻。</p>
          <p class="about-works__demo">
            <a class="about-works__demo-link" href="https://atschx.me/cosmic-elements-exhibit/" lang="en">Live demo ↗</a>
            <a class="about-works__demo-link" href="https://atschx.me/cosmic-elements-exhibit/" lang="zh-Hans">演示 ↗</a>
          </p>
        </li>
        <li class="about-works__item">
          <a class="about-works__name" href="https://github.com/atschx/site-cia-im">cia.im ↗</a>
          <p class="about-works__en" lang="en">A personal blog and photography site, built with Gatsby.</p>
          <p class="about-works__zh" lang="zh-Hans">用 Gatsby 做的个人博客与摄影网站。</p>
        </li>
      </ul>
      <p class="about-works__note">摄影 — 尚未开放</p>
    </section>
  </div>
</div>
