---
layout: page
permalink: /patents/
title: patents
description: patents in reversed chronological order.
years: [2025, 2023]
nav: true
nav_order: 1
---
<!-- _pages/patents.md -->
<div class="publications">

{%- for y in page.years %}
  <h2 class="year">{{y}}</h2>
  {% bibliography -f patents -q @*[year={{y}}]* %}
{% endfor %}

</div>
