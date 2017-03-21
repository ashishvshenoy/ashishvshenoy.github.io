---
layout: post
published: true
title: Recommender Systems and Collaborative Filtering - Walkthrough
---
Summary
=======

Every user on the internet today is faced with an overwhelming set of
choices on almost every website he/she visits. Be it Facebook, Spotify,
Amazon or Google, there is a need to filter, rank and deliver relevant
information quickly in order to alleviate the problem of information
overload. Recommender systems are used in almost every major website
these days to solve this problem by searching through a large volume of
dynamically generated information to provide users with personalized
content and services. See [Figure 1]((https://www.ischool.utexas.edu/~i385q/readings/Balabanovic_Shoham-1997-Fab.pdf)){:target="_blank"}.  

![RecommenderSystem.png]({{site.baseurl}}/img/RecommenderSystem.png)


After completing this walkthrough you should be able to :

-   Understand what Recommender Systems do.

-   Get a high level overview of different approaches used in
    Recommender Systems.

-   Understand the concept of collaborative filtering.

-   Learn how to implement collaborative filtering using low dimensional
    matrix factorization method.

-   Get a hands on experience on building a collaborative filtering
    recommender system for a real-life dataset.
    
Background {#sec:examples}
==========

Recommender systems have become extremely popular in recent years. They
are a subclass of information filtering systems that seek to predict the
“rating” or “preference” that a user would give to an item. Applications
of recommender systems include: movies, music, news, books, research
articles, search queries, social tags, and products. For example,
recommending news articles to on-line newspaper readers.\
**Basic Concepts :**[@cmu_slides]\
**User:** any individual who provides ratings to a system. User who
provides provides ratings ratings and user who receive receive
recommendations recommendations.\
**Item:** anything for which a human can provide a rating. Eg. art,
books, CDs, journal articles, music, movie, or vacation destinations\
**Ratings:** vote from a user for an item by means of some value.
Scalar/ordinal ratings (5 points Likert scale), binary ratings ( )
like/dislike), unary rating (observed/abase of rating).\
Recommender systems typically produce a list of recommendations in one of two ways – through collaborative and content-based filtering.
