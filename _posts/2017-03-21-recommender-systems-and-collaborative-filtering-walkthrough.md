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
content and services. See Figure 1 [1]((https://www.ischool.utexas.edu/~i385q/readings/Balabanovic_Shoham-1997-Fab.pdf)).  

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
recommending news articles to on-line newspaper readers.  
**Basic Concepts :**  
**User:** any individual who provides ratings to a system. User who
provides provides ratings ratings and user who receive receive
recommendations recommendations.  
**Item:** anything for which a human can provide a rating. Eg. art,
books, CDs, journal articles, music, movie, or vacation destinations  
**Ratings:** vote from a user for an item by means of some value.
Scalar/ordinal ratings (5 points Likert scale), binary ratings
like/dislike), unary rating (observed/abase of rating).
Recommender systems typically produce a list of recommendations in one of two ways – through collaborative and content-based filtering.  
-   **Collaborative filtering**: This approach is used to build a model
    from user’s past behaviour i.e. items previously purchased or
    selected and/or numerical ratings given to those items as well as
    similar decisions made by other users. This model is then used to
    predict items (or ratings for items) that the user may have an
    interest in.

-   **Content-based filtering**: This approach uses features of an item
    in order to recommend additional items with similar
    features/properties.  
    
    Sometimes the above two approaches are often combined and termed as
    Hybrid Recommender Systems.

The differences between collaborative and content-based filtering can be
demonstrated by comparing two popular music recommender systems –
Last.fm and Pandora Radio.  
Last.fm creates a “station” of recommended songs by observing what bands
and individual tracks the user has listened to on a regular basis and
comparing those against the listening behavior of other users. Last.fm
will play tracks that do not appear in the user’s library, but are often
played by other users with similar interests. As this approach leverages
the behavior of users, it is an example of a collaborative filtering
technique.  
Pandora uses the properties of a song or artist (a subset of the 400
attributes provided by the Music Genome Project) in order to seed a
“station” that plays music with similar properties. User feedback is
used to refine the station’s results, deemphasizing certain attributes
when a user “dislikes” a particular song and emphasizing other
attributes when a user “likes” a song. This is an example of a
content-based approach.  
Each type of system has its own strengths and weaknesses. In the above
example, Last.fm requires a large amount of information on a user in
order to make accurate recommendations. This is an example of the cold
start problem, and is common in collaborative filtering systems. While
Pandora needs very little information to get started, it is far more
limited in scope (for example, it can only make recommendations that are
similar to the original seed).  

Recommender systems are a useful alternative to search algorithms since
they help users discover items they might not have found by themselves.
Interestingly enough, recommender systems are often implemented using
search engines indexing non-traditional data.

In this tutorial we will be exploring an implementation of Collaborative
Filtering using matrix factorization.
